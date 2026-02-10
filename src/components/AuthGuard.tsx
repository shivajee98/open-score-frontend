"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Version Check Logging
        console.log("%c OpenScore App Version: 0.1.1 ", "background: #0f172a; color: #10b981; font-weight: bold; padding: 4px; border-radius: 4px;");
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuthRoute = pathname === "/" || pathname?.startsWith("/auth") || pathname === "/login";
        const isPublicRoute = pathname?.startsWith("/public"); // Example public route

        if (token) {
            // User is logged in
            if (isAuthRoute) {
                // Redirect logged-in users away from login pages
                // Determine role from local storage or decode token if needed
                // For now, default to customer, or check user object
                const userStr = localStorage.getItem("user");
                let user: any = {};
                try {
                    user = userStr ? JSON.parse(userStr) : {};
                } catch (e) {
                    console.error("Failed to parse user data", e);
                    localStorage.removeItem("user"); // Clear corrupted data
                }
                let target = user.role === 'ADMIN' ? '/admin' : '/customer';

                if (user.is_onboarded === false || user.is_onboarded === 0 || user.is_onboarded === "0") {
                    target = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
                }

                router.replace(target);
            } else {
                setAuthorized(true);
            }
        } else {
            // User is NOT logged in
            if (!isAuthRoute && !isPublicRoute) {
                // Redirect protected routes to login
                if (typeof window !== 'undefined') window.location.href = '/frontend/';
            } else {
                setAuthorized(true);
            }
        }
    }, [pathname, router]);

    // Prevent flashing of protected content
    if (!authorized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return <>{children}</>;
}
