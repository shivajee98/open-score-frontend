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
            revalidateOnReconnect: options.revalidateOnReconnect ?? false,
            refreshInterval: options.refreshInterval ?? 0,
            shouldRetryOnError: options.shouldRetryOnError ?? false,
            dedupingInterval: 60000, // 1 minute deduping - prevents duplicate requests
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
