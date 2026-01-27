'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
                if (!user.is_onboarded && pathname !== '/auth/onboarding') {
                    router.push('/auth/onboarding');
                    return;
                }

                // Prevent access to wrong roles
                if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
                    router.push(user.role === 'MERCHANT' ? '/merchant' : '/customer');
                    return;
                }

                if (pathname.startsWith('/merchant') && user.role !== 'MERCHANT') {
                    router.push(user.role === 'ADMIN' ? '/admin' : '/customer');
                    return;
                }

                setAuthorized(true);
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
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
