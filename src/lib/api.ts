// Static Export: Always talk directly to backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api'
        : 'https://api.msmeloan.sbs/api');

export const getStorageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('blob:')) return path;
    if (path.startsWith('data:')) return path;

    // Normalize API_BASE_URL by removing trailing slashes and the /api suffix
    const apiHost = API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');

    // Remove 'storage/' prefix if it exists to avoid duplication
    const cleanPath = path.replace(/^storage\//, '').replace(/^\//, '');

    return `${apiHost}/storage/${cleanPath}`;
};


import { getDeviceHeaders } from './device';

// Loop Prevention
let isRedirecting = false;
let authFailureCount = 0;
const MAX_AUTH_FAILURES = 5; // Increased to be less trigger-happy

export const clearAuthState = async () => {
    if (typeof window !== 'undefined') {
        console.warn('[Auth] Clearing all authentication state');
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Reset failure count
        authFailureCount = 0;

        // Dispatch events to notify other components
        window.dispatchEvent(new Event('auth-logout'));
        window.dispatchEvent(new Event('userStateUpdate'));

        // Notify Native WebView
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'LOGOUT'
            }));
        }
    }
};

export const handleUnauthorized = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('temp_reset_token');
        
        // If there's no token to begin with, a 401 is just a "not logged in" signal, 
        // not an "auth failure" that requires clearing state or redirecting.
        if (!token) {
            console.log('[Auth] 401 received but no token found - ignoring');
            return;
        }

        const isHomePage = window.location.pathname === '/' ||
            window.location.pathname.startsWith('/auth') ||
            window.location.pathname.startsWith('/privacy-policy');

        // Prevent infinite loops if multiple APIs fail simultaneously
        if (isRedirecting) return;

        // Count failures to avoid trigger-happy logouts on transient network glitches
        authFailureCount++;
        if (authFailureCount < MAX_AUTH_FAILURES) {
            console.warn(`Auth failure detected (${authFailureCount}/${MAX_AUTH_FAILURES}). Retrying...`);
            return;
        }

        console.warn('Handling unauthorized response - clearing state');
        clearAuthState();

        if (!isHomePage) {
            isRedirecting = true;
            window.location.replace('/');

            // Reset redirect lock after 5 seconds to allow recovery if user navigates back
            setTimeout(() => {
                isRedirecting = false;
            }, 5000);
        }
    }
};


interface ApiOptions extends RequestInit {
    skipAuthCheck?: boolean;
}

// Request Deduplication Store
const pendingRequests = new Map<string, Promise<any>>();

export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { skipAuthCheck, ...fetchOptions } = options;

    const isFormData = fetchOptions.body instanceof FormData;
    const isExternal = endpoint.startsWith('http');
    const method = fetchOptions.method || 'GET';

    const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...fetchOptions.headers,
    };

    // Block mutations in Admin Preview mode
    if (typeof window !== 'undefined' && localStorage.getItem('admin_preview') === 'true') {
        const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (mutationMethods.includes(method.toUpperCase())) {
            console.warn(`[Blocked] Mutation ${method} on ${endpoint} prohibited in Admin Preview.`);
            // toast might not be imported yet or might cause circular dependency if used here directly, 
            // but we'll try to use a standard event or just throw.
            // Actually, we can dispatch a custom event that UI can listen to.
            window.dispatchEvent(new CustomEvent('mutation-blocked'));
            throw new Error('Action prohibited in read-only Admin Preview mode');
        }
    }

    // Always Inject Auth Token for Static Export
    // Only inject if a custom Authorization header was NOT already provided in options
    if (typeof window !== 'undefined') {
        const customHeaders = fetchOptions.headers || {};
        const hasCustomAuth = Object.keys(customHeaders).some(k => k.toLowerCase() === 'authorization');
        
        if (!hasCustomAuth) {
            const token = localStorage.getItem('token') || localStorage.getItem('temp_reset_token');
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }
        }
        
        // Inject Device Headers
        try {
            const deviceHeaders = await getDeviceHeaders();
            Object.assign(headers, deviceHeaders);
        } catch (e) {
            // Ignore if Capacitor plugins fail (e.g. on pure web without polyfills)
            console.warn('Device identification headers injection failed:', e);
        }
    }

    // Construct URL
    const url = isExternal
        ? endpoint
        : (endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`);

    // Request Deduplication for GET requests
    const cacheKey = `${method}:${url}`;
    if (method === 'GET' && pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            if (response.status === 401 && !skipAuthCheck) {
                handleUnauthorized();
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle Global Suspension
                if (response.status === 403 && errorData.code === 'ACCOUNT_SUSPENDED') {
                    if (typeof window !== 'undefined') {
                        const cachedUserStr = localStorage.getItem('user');
                        if (cachedUserStr) {
                            try {
                                const cachedUser = JSON.parse(cachedUserStr);
                                cachedUser.status = 'SUSPENDED';
                                localStorage.setItem('user', JSON.stringify(cachedUser));
                                window.dispatchEvent(new Event('userStateUpdate'));
                            } catch (e) { }
                        }
                    }
                }

                const error: any = new Error(errorData.error || errorData.message || (response.status === 401 ? 'Unauthorized' : `API request failed with status ${response.status}`));
                error.status = response.status;
                error.code = errorData.code;
                throw error;
            }

            return response.json();
        } catch (error: any) {
            if (error?.message === 'Failed to fetch' || error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
                const browserContext = typeof window !== 'undefined' ? ` on ${window.location.hostname}` : '';
                const detailedMsg = `Network error (${error.name}: ${error.message})${browserContext}. Please check your connection.`;
                console.error('[apiFetch Failure]', {
                    url,
                    method,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                throw new Error(detailedMsg);
            }
            throw error;
        } finally {
            // Remove from pending once settled
            if (method === 'GET') {
                pendingRequests.delete(cacheKey);
            }
        }
    })();

    if (method === 'GET') {
        pendingRequests.set(cacheKey, fetchPromise);
    }

    return fetchPromise;
};
