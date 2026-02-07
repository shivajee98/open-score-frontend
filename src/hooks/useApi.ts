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
            revalidateOnFocus: options.revalidateOnFocus ?? false,
            revalidateOnReconnect: options.revalidateOnReconnect ?? true,
            refreshInterval: options.refreshInterval ?? 0,
            shouldRetryOnError: options.shouldRetryOnError ?? false,
            dedupingInterval: 300000, // 5 minutes deduping - very aggressive for performance
            focusThrottleInterval: 60000,
            errorRetryInterval: 10000,
            ...options
        }
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    };
}
