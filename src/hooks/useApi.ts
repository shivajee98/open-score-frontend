import { useEffect } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';

interface UseApiOptions {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    refreshInterval?: number;
    shouldRetryOnError?: boolean;
}

export function useApi<T = any>(endpoint: string | null, options: UseApiOptions = {}) {
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    } = useSWR<T>(
        endpoint,
        (url: string) => apiFetch(url),
        {
            revalidateOnFocus: options.revalidateOnFocus ?? true,
            revalidateOnReconnect: options.revalidateOnReconnect ?? true,
            refreshInterval: options.refreshInterval ?? 0,
            shouldRetryOnError: options.shouldRetryOnError ?? false,
            dedupingInterval: 2000,
            focusThrottleInterval: 5000,
            errorRetryInterval: 5000,
            ...options
        }
    );

    // Sync /auth/me with localStorage
    useEffect(() => {
        if (endpoint === '/auth/me' && data && !error) {
            console.log('[useApi] Syncing /auth/me with localStorage');
            localStorage.setItem('user', JSON.stringify(data));
            // Trigger storage event for other components in same tab (custom event)
            window.dispatchEvent(new Event('userStateUpdate'));
        }
    }, [data, error, endpoint]);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    };
}
