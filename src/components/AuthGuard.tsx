"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import SuspendedScreen from "@/components/SuspendedScreen";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [suspended, setSuspended] = useState(false);

    useEffect(() => {
        // Version Check Logging
        console.log("%c OpenScore App Version: 0.1.3 ", "background: #0f172a; color: #10b981; font-weight: bold; padding: 4px; border-radius: 4px;");
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        let user: any = {};
        try {
            user = userStr ? JSON.parse(userStr) : {};
        } catch (e) {
            console.error("Failed to parse user data", e);
            localStorage.removeItem("user");
        }

        // Global Suspension Check
        if (user.status === 'SUSPENDED') {
            setSuspended(true);
            setAuthorized(true); // authorized to see the suspended screen
            return;
        } else {
            setSuspended(false);
        }

        // Normalize path to handle trailing slashes reliably
        const path = (pathname || "").replace(/\/$/, "");

        const isAuthRoute = path === "" || path === "/" || path === "/login" || path.startsWith("/auth");
        const isPublicRoute = path.startsWith("/public") || path.startsWith("/privacy-policy") || path.startsWith("/qr-update") || path === "/qr" || path.startsWith("/qr?");


        if (token) {
            // User is logged in
            if (isAuthRoute) {
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

    // Background Verification for Reactivation
    // If we're suspended (cached), keep checking the server occasionally to see if we've been reactivated
    useEffect(() => {
        if (!suspended) return;

        let interval: NodeJS.Timeout;
        const checkStatus = async () => {
            try {
                // We use a raw fetch or apiFetch with skipAuthCheck if available to see the real response
                const res = await apiFetch('/auth/me', { skipAuthCheck: true });
                if (res && res.status !== 'SUSPENDED') {
                    // We are back! Update local storage and state
                    localStorage.setItem('user', JSON.stringify(res));
                    setSuspended(false);
                }
            } catch (e: any) {
                // If 403, we are still suspended. Keep waiting.
                if (e.status !== 403) {
                    console.error("Reactivation check failed", e);
                }
            }
        };

        // Check once on load and every 10 seconds
        checkStatus();
        interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, [suspended]);

    // Listen for manual user state updates (e.g., from apiFetch upon 403)
    useEffect(() => {
        const handleStateUpdate = () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.status === 'SUSPENDED') setSuspended(true);
                } catch (e) {}
            }
        };
        window.addEventListener('userStateUpdate', handleStateUpdate);
        return () => window.removeEventListener('userStateUpdate', handleStateUpdate);
    }, []);

    if (suspended) {
        return <SuspendedScreen />;
    }

    // Prevent flashing of protected content
    if (!authorized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return <>{children}</>;
}
