import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/ui/Toast";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "OpenScore | Premium Digital Payments",
  description: "Modern, secure, and transparent digital wallet for the next generation.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import MobileNavigationHandler from "@/components/MobileNavigationHandler";
import NotificationHandler from "@/components/NotificationHandler";
import IncomingCallModal from "@/components/IncomingCallModal";
import AppLockGuard from "@/components/AppLockGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AppLockGuard>
            {children}
          </AppLockGuard>
          <MobileNav />
        </AuthGuard>
      </body>
    </html>
  );
}
