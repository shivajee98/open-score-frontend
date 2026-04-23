import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Wraps dynamic imports to handle ChunkLoadErrors (common after deployments).
 * If a chunk fails to load, it forces a page refresh to get the latest version.
 */
export async function safeImport<T>(importFn: () => Promise<T>): Promise<T> {
    try {
        return await importFn();
    } catch (error: any) {
        // Check for common chunk load error signatures
        if (
            error.name === 'ChunkLoadError' || 
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Failed to fetch dynamically imported module')
        ) {
            console.error('Critical: Chunk load failed. New version likely available. Reloading...', error);
            
            // Only reload if we are in a browser environment
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
        throw error;
    }
}
