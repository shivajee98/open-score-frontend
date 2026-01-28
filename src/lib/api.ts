'use client';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

let isRedirecting = false;

export const clearAuthState = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        // Notify Native WebView
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'LOGOUT'
            }));
        }
    }
};

export const handleUnauthorized = () => {
    if (typeof window !== 'undefined' && !isRedirecting) {
        isRedirecting = true;
        clearAuthState();

        // Use setTimeout to avoid race conditions
        setTimeout(() => {
            window.location.href = '/';
            // Reset flag after redirect completes
            setTimeout(() => {
                isRedirecting = false;
            }, 1000);
        }, 100);
    }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle unauthorized/forbidden
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Session expired. Please login again.');
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
