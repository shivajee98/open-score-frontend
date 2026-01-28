'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, User, Zap, CreditCard } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();
    const role = pathname.split('/')[1]; // 'admin', 'merchant', 'customer'

    if (!['admin', 'merchant', 'customer'].includes(role)) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 md:hidden z-50 flex justify-around items-center pb-safe">
            <Link href={`/${role}`} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === `/${role}` ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                <LayoutDashboard size={24} strokeWidth={pathname === `/${role}` ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
            </Link>

            {role === 'customer' && (
                <>
                    <Link href="/customer/loan" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname.includes('/customer/loan') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Zap size={24} strokeWidth={pathname.includes('/customer/loan') ? 3 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Loans</span>
                    </Link>

                    <Link href={`/${role}/transactions`} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname.includes('transactions') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Wallet size={24} strokeWidth={pathname.includes('transactions') ? 3 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Wallet</span>
                    </Link>

                    <Link href={`/${role}/repayments`} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname.includes('repayments') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <CreditCard size={24} strokeWidth={pathname.includes('repayments') ? 3 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Repay</span>
                    </Link>
                </>
            )}

            {/* Profile button removed as requested */}
        </div>
    );
}
