import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/ui/Toast";
import MobileNav from "@/components/MobileNav";

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
        <NotificationHandler />
        <MobileNavigationHandler />
        <ToastContainer />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
