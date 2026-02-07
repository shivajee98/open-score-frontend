'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuthState } from '@/lib/api';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const navigate = useNavigate();
    const location = useLocation(); const pathname = location.pathname;
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const userStr = localStorage.getItem('user');

            if (!userStr) {
                navigate('/');
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
                        navigate(user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding');
                        return;
                    }
                }

                // Prevent access to wrong roles
                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    navigate(user.role === 'ADMIN' ? '/admin' : '/customer');
                    return;
                }

                if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
                    navigate('/customer');
                    return;
                }

                // Both Customer and Merchant now use /customer unified path
                // so no need to redirect away from it for merchants.

                setAuthorized(true);
            } catch (e) {
                console.error("AuthGuard parse error:", e);
                navigate('/');
            }
        };

        checkAuth();
    }, [pathname, navigate]);

    if (!authorized) {
        let themeColor = 'blue';
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'MERCHANT') themeColor = 'emerald';
            }
        } catch (e) { }

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className={`w-10 h-10 border-4 border-${themeColor}-600 border-t-transparent rounded-full animate-spin`}></div>
            </div>
        );
    }

    return <>{children}</>;
}
