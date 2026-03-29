import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';

interface UseApiOptions {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    refreshInterval?: number;
    shouldRetryOnError?: boolean;
}

export function useApi<T = any>(endpoint: string | null, options: UseApiOptions = {}) {
    const lastSyncedRef = useRef<string | null>(null);
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

    // Sync /auth/me with localStorage and listen for external state updates
    useEffect(() => {
        const handleStateUpdate = () => {
            if (endpoint === '/auth/me') {
                const userStr = localStorage.getItem('user');
                if (userStr && userStr !== lastSyncedRef.current) {
                    try {
                        const user = JSON.parse(userStr);
                        lastSyncedRef.current = userStr;
                        mutate(user as T, false);
                    } catch (e) {}
                }
            }
        };

        const handleWalletUpdate = () => {
            if (endpoint?.includes('wallet') || endpoint?.includes('balance')) {
                mutate(); // Re-fetch from server to get accurate calculated balance
            }
        };

        // Sync local changes to localStorage for legacy components
        if (endpoint === '/auth/me' && data && !error) {
            const dataStr = JSON.stringify(data);
            if (dataStr !== lastSyncedRef.current) {
                console.log('[useApi] Syncing /auth/me to localStorage');
                lastSyncedRef.current = dataStr;
                localStorage.setItem('user', dataStr);
                // SWR handles cross-instance sync automatically
            }
        }

        if (endpoint === '/auth/me') {
            window.addEventListener('userStateUpdate', handleStateUpdate);
        }

        if (endpoint?.includes('wallet') || endpoint?.includes('balance')) {
            window.addEventListener('walletStateUpdate', handleWalletUpdate);
        }

        return () => {
            window.removeEventListener('userStateUpdate', handleStateUpdate);
            window.removeEventListener('walletStateUpdate', handleWalletUpdate);
        };
    }, [data, error, endpoint, mutate]);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    };
}
