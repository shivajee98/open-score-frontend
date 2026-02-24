"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Version Check Logging
        console.log("%c OpenScore App Version: 0.1.3 ", "background: #0f172a; color: #10b981; font-weight: bold; padding: 4px; border-radius: 4px;");
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Normalize path to handle trailing slashes reliably
        const path = (pathname || "").replace(/\/$/, "");

        const isAuthRoute = path === "" || path === "/" || path === "/login" || path.startsWith("/auth");
        const isPublicRoute = path.startsWith("/public") || path.startsWith("/privacy-policy");

        if (token) {
            // User is logged in
            if (isAuthRoute) {
                const userStr = localStorage.getItem("user");
                let user: any = {};
                try {
                    user = userStr ? JSON.parse(userStr) : {};
                } catch (e) {
                    console.error("Failed to parse user data", e);
                    localStorage.removeItem("user");
                }

                let target = user.role === 'ADMIN' ? '/customer' : '/customer';
                if (user.is_onboarded === false || user.is_onboarded === 0 || user.is_onboarded === "0") {
                    target = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
                }

                if (path === target) {
                    setAuthorized(true);
                } else {
                    router.replace(target);
                }
            } else {
                setAuthorized(true);
            }
        } else {
            // User is NOT logged in
            if (!isAuthRoute && !isPublicRoute) {
                // Redirect protected routes to login (Root)
                if (typeof window !== 'undefined') window.location.href = '/';
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
