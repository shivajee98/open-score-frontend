'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

import { useStore } from '@/store/useStore';

export default function MobileNavigationHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const { navigationStack, pushToStack } = useStore();

    useEffect(() => {
        if (pathname) {
            pushToStack(pathname);
        }
    }, [pathname, pushToStack]);

    useEffect(() => {
        let lastBackPress = 0;

        const setupListener = async () => {
            // Check if running on native
            const info = await App.getInfo().catch(() => null);
            if (!info) return; // Not native device

            const backListener = await App.addListener('backButton', async ({ canGoBack }) => {
                // If we are on a root page, handle exit
                const isRoot = pathname === '/' || pathname === '/customer' || pathname === '/login' || pathname === '/admin';

                if (isRoot) {
                    const now = Date.now();
                    if (now - lastBackPress < 2000) {
                        App.exitApp();
                    } else {
                        lastBackPress = now;
                        toast.info('Press back again to exit');
                    }
                } else {
                    // Try to go back in standard history first
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        // Intelligent fallback: check our custom stack
                        const stack = useStore.getState().navigationStack;
                        if (stack.length > 1) {
                            const prevPage = stack[stack.length - 2];
                            useStore.getState().popFromStack();
                            router.replace(prevPage);
                        } else {
                            // Ultimate fallback
                            router.replace('/customer');
                        }
                    }
                }
            });

            return () => {
                backListener.remove();
            };
        };

        setupListener();
    }, [pathname, router]);

    return null;
}
