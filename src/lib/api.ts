// Static Export: Always talk directly to backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.msmeloan.sbs/api';

// Loop Prevention
let isRedirecting = false;
let authFailureCount = 0;
const MAX_AUTH_FAILURES = 3;

export const clearAuthState = async () => {
    if (typeof window !== 'undefined') {
        // Clear all local storage auth-related items
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token'); // Legacy
        localStorage.removeItem('token');      // Standard
        localStorage.removeItem('access_token'); // Legacy

        // Reset failure count
        authFailureCount = 0;

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
        const isHomePage = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');

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
            window.location.replace('/frontend/');

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

export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { skipAuthCheck, ...fetchOptions } = options;

    const isFormData = fetchOptions.body instanceof FormData;
    const isExternal = endpoint.startsWith('http');

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
        : (endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        // Handle unauthorized/forbidden
        if ((response.status === 401 || response.status === 403) && !skipAuthCheck) {
            handleUnauthorized();
            throw new Error('Session expired. Please login again.');
        } else if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
        }

        return response.json();
    } catch (error: any) {
        if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};
