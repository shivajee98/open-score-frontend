'use client';
import React from 'react';
import { Home, Zap, QrCode, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, href: '/customer' },
    { name: 'Loans', icon: <Zap size={20} />, href: '/customer/loan' },
    { name: 'Pay / QR', icon: <QrCode size={24} />, href: '/customer/qr-payment', isCenter: true },
    { name: 'Market', icon: <ShoppingBag size={20} />, href: '/customer/marketplace' },
    { name: 'Profile', icon: <User size={20} />, href: '/customer/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#0f1025] border-t border-white/5 rounded-t-[20px] flex justify-between items-center px-4 py-3 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-50">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/customer');
        
        if (item.isCenter) {
          return (
            <Link key={index} href={item.href} className="flex flex-col items-center gap-1 -mt-8 relative">
              <div className="w-14 h-14 rounded-full bg-[#6c30f7] text-white flex items-center justify-center shadow-lg shadow-[#6c30f7]/40 border-4 border-[#050614] transition-transform active:scale-95">
                {item.icon}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        }

        return (
          <Link key={index} href={item.href} className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-[#6c30f7]' : 'text-[#9da0b5] hover:text-white'}`}>
            {item.icon}
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
