'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, User, Zap, CreditCard, QrCode, History } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, [pathname]);

    // Only show on main app routes
    const baseRole = pathname.split('/')[1];
    if (!['admin', 'merchant', 'customer'].includes(baseRole)) return null;

    const isMerchant = user?.role === 'MERCHANT';

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-2 md:hidden z-50 flex justify-around items-center pb-safe ring-1 ring-slate-900/5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <Link href="/customer" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer' ? (isMerchant ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50') : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard size={22} className={pathname === '/customer' ? 'scale-110' : ''} strokeWidth={pathname === '/customer' ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
            </Link>

            {isMerchant ? (
                <>
                    <Link href="/customer/qr" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer/qr' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <QrCode size={22} className={pathname === '/customer/qr' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/qr' ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">My QR</span>
                    </Link>
                    <Link href="/customer/transactions" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer/transactions' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <Wallet size={22} className={pathname === '/customer/transactions' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/transactions' ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Sales</span>
                    </Link>
                    <Link href="/customer/profile" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer/profile' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <User size={22} className={pathname === '/customer/profile' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/profile' ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/customer/loan" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname.includes('/customer/loan') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Zap size={22} className={pathname.includes('/customer/loan') ? 'scale-110' : ''} strokeWidth={pathname.includes('/customer/loan') ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Loans</span>
                    </Link>

                    <Link href="/customer/transactions" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer/transactions' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Wallet size={22} className={pathname === '/customer/transactions' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/transactions' ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Wallet</span>
                    </Link>

                    <Link href="/customer/repayments" className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${pathname === '/customer/repayments' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <History size={22} className={pathname === '/customer/repayments' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/repayments' ? 3 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Repay</span>
                    </Link>
                </>
            )}
        </div>
    );
}
