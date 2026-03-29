"use client";

import { useEffect } from "react";
import ToastContainer, { toast } from "@/components/ui/Toast";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";
import MobileNavigationHandler from "@/components/MobileNavigationHandler";
import NotificationHandler from "@/components/NotificationHandler";
import IncomingCallModal from "@/components/IncomingCallModal";
import AppLockGuard from "@/components/AppLockGuard";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import ReferralHandler from "@/components/ReferralHandler";
import { Suspense } from "react";
import OfflineOverlay from "@/components/OfflineOverlay";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const handleError = (e: ErrorEvent) => {
            console.error('[GlobalError]', e.error);
            toast.error(`App Error: ${e.message || 'Unknown code error'}`);
        };
        const handleRejection = (e: PromiseRejectionEvent) => {
            console.error('[UnhandledPromise]', e.reason);
            toast.error(`System Error: ${e.reason?.message || 'Check connection'}`);
        };
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    return (
        <MaintenanceGuard>
            <AuthGuard>
                <NotificationHandler />
                <IncomingCallModal />
                <MobileNavigationHandler />
                <ToastContainer />
                <OfflineOverlay />
                <AppLockGuard>
                    <Suspense fallback={null}>
                        <ReferralHandler />
                    </Suspense>
                    {children}
                </AppLockGuard>
                <MobileNav />
            </AuthGuard>
        </MaintenanceGuard>
    );
}
