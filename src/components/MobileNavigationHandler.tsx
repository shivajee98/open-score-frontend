'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/Toast';

export default function MobileNavigationHandler() {
    const navigate = useNavigate();
    const location = useLocation(); const pathname = location.pathname;

    useEffect(() => {
        let lastBackPress = 0;

        const setupListener = async () => {
            // Check if running on native
            const info = await App.getInfo().catch(() => null);
            if (!info) return; // Not native device

            const backListener = await App.addListener('backButton', ({ canGoBack }) => {
                if (pathname === '/' || pathname === '/customer' || pathname === '/login') {
                    // On root pages, handle exit logic
                    const now = Date.now();
                    if (now - lastBackPress < 2000) {
                        App.exitApp();
                    } else {
                        lastBackPress = now;
                        toast.info('Press back again to exit');
                    }
                } else {
                    // Navigate back manually if possible
                    window.history.back();
                }
            });

            return () => {
                backListener.remove();
            };
        };

        setupListener();
    }, [pathname, navigate]);

    return null;
}
