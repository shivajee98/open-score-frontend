"use client";

import { useEffect } from "react";
import type { Metadata } from "next";
import "./globals.css";
import ToastContainer, { toast } from "@/components/ui/Toast";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";



import MobileNavigationHandler from "@/components/MobileNavigationHandler";
import NotificationHandler from "@/components/NotificationHandler";
import IncomingCallModal from "@/components/IncomingCallModal";
import AppLockGuard from "@/components/AppLockGuard";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";

export function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en">
      <body
        className={`antialiased font-sans`}
      >
        <AuthGuard>
          <NotificationHandler />
          <IncomingCallModal />
          <MobileNavigationHandler />
          <ToastContainer />
          <AdminPreviewBanner />
          <AppLockGuard>
            {children}
          </AppLockGuard>
          <MobileNav />
        </AuthGuard>
      </body>
    </html>
  );
}
