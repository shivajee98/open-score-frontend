'use client';
const BASE_URL = '/api/proxy';

let isRedirecting = false;

export const clearAuthState = async () => {
    if (typeof window !== 'undefined') {
        // Clear all local storage auth-related items
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');

        // Clear server-side session
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.warn('Logout request failed', e);
        }

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
        const isHomePage = window.location.pathname === '/';

        console.warn('Handling unauthorized response - clearing state');
        clearAuthState();

        if (!isHomePage && !isRedirecting) {
            isRedirecting = true;
            window.location.replace('/');
        }
    }
};

interface ApiOptions extends RequestInit {
    skipAuthCheck?: boolean;
}

export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { skipAuthCheck, ...fetchOptions } = options;

    const isFormData = fetchOptions.body instanceof FormData;

    const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...fetchOptions.headers,
    };

    // If it's a login or absolute auth request, handle separately or allow absolute URLs
    const isExternal = endpoint.startsWith('http');
    const url = isExternal ? endpoint : (endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`);

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
            // Just throw error without redirecting if skipAuthCheck is on
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
        }

        return response.json();
    } catch (error: any) {
        // Network errors or fetch failures
        if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};
