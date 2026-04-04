// Static Export: Always talk directly to backend
// Static Export: Always talk directly to backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api'
        : 'https://api.msmeloan.sbs/api');

// Loop Prevention
let isRedirecting = false;
let authFailureCount = 0;
const MAX_AUTH_FAILURES = 3;

export const clearAuthState = async () => {
    if (typeof window !== 'undefined') {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

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

    // Always Inject Auth Token for Static Export
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            (headers as any)['Authorization'] = `Bearer ${token}`;
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
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                throw new Error('Network error. Please check your connection.');
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
