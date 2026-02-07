import React from 'react';
import ToastContainer from '../components/ui/Toast';
import MobileNav from '../components/MobileNav';
import MobileNavigationHandler from '../components/MobileNavigationHandler';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="antialiased font-sans min-h-screen">
      <MobileNavigationHandler />
      <ToastContainer />
      <main>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
