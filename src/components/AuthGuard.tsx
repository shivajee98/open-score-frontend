'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearAuthState } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                router.push('/');
                return;
            }

            try {
                const user = JSON.parse(userStr);

                // Enforce onboarding
                const isOnboardingPath = pathname === '/auth/onboarding' || pathname === '/auth/merchant-onboarding';
                if (!user.is_onboarded && !isOnboardingPath) {
                    // Allow Merchants to access dashboard to claim cashback
                    if (user.role === 'MERCHANT' && pathname.startsWith('/customer')) {
                        // proceed
                    } else {
                        router.push(user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding');
                        return;
                    }
                }

                // Prevent access to wrong roles
                if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
                    router.push('/customer');
                    return;
                }

                // Both Customer and Merchant now use /customer unified path
                // so no need to redirect away from it for merchants.

                setAuthorized(true);
            } catch (e) {
                console.error("AuthGuard parse error:", e);
                router.push('/');
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
