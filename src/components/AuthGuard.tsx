"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { createEcho } from "@/lib/echo";
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
        // Handle Bridge Token / Admin Preview from URL
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const bridgeToken = urlParams?.get('token');
        const isAdminPreview = urlParams?.get('admin_preview') === 'true';

        if (bridgeToken && typeof window !== 'undefined') {
            console.log('[AuthGuard] Capturing bridge token from URL');
            localStorage.setItem('token', bridgeToken);
            if (isAdminPreview) {
                localStorage.setItem('admin_preview', 'true');
                sessionStorage.setItem('app_unlocked', 'true');
            }
            // Trigger a re-evaluation after state is set
            window.dispatchEvent(new Event('auth-login'));
        }

        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        const isCurrentlyAdminPreview = localStorage.getItem('admin_preview') === 'true';
        let user: any = {};
        try {
            user = userStr ? JSON.parse(userStr) : {};
        } catch (e) {
            console.error("Failed to parse user data", e);
            localStorage.removeItem("user");
        }

        // Bypass onboarding for Admin Preview
        if (isCurrentlyAdminPreview) {
            user.is_onboarded = true;
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

    // Real-time Reactivation & Profile Sync
    // Connect to WebSocket channel for instant status/profile updates
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (!token || !userStr) return;

        let user: any;
        try {
            user = JSON.parse(userStr);
        } catch (e) { return; }

        if (!user.id) return;

        const echo = createEcho(token);
        const channel = echo.private(`App.Models.User.${user.id}`);

        channel.listen('UserUpdated', (data: any) => {
            console.log("[AuthGuard] User updated via WebSocket:", data.user);
            const updatedUser = data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setSuspended(updatedUser.status === 'SUSPENDED');
            window.dispatchEvent(new Event('userStateUpdate'));
        });

        channel.listen('WalletUpdated', (data: any) => {
            console.log("[AuthGuard] Wallet updated via WebSocket:", data.wallet);
            window.dispatchEvent(new CustomEvent('walletStateUpdate', { detail: data.wallet }));
        });

        channel.listen('LoanUpdated', (data: any) => {
            console.log("[AuthGuard] Loan updated via WebSocket:", data.loan);
            window.dispatchEvent(new CustomEvent('loanStateUpdate', { detail: data.loan }));
        });

        return () => {
            channel.stopListening('UserUpdated');
            channel.stopListening('WalletUpdated');
            channel.stopListening('LoanUpdated');
            echo.disconnect();
        };
    }, []);

    // Listen for manual user state updates (e.g., from apiFetch upon 403)
    useEffect(() => {
        const handleStateUpdate = () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.status === 'SUSPENDED') {
                        setSuspended(true);
                    } else {
                        setSuspended(false);
                    }
                } catch (e) {}
            }
        };
        handleStateUpdate(); // Initial check
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
