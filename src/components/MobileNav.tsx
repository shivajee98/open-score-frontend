'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Zap, User, LayoutDashboard, QrCode, Landmark, History, CreditCard } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

export default function MobileNav() {
    const rawPathname = usePathname();
    // Fix: Strip trailing slash so exact comparisons work with trailingSlash: true
    const pathname = rawPathname.endsWith('/') && rawPathname !== '/' ? rawPathname.slice(0, -1) : rawPathname;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isAppPath = ['admin', 'merchant', 'customer'].includes(pathname.split('/')[1]);
    
    const { data: user, mutate: mutateUser } = useApi(token && isAppPath ? '/auth/me' : null);

    const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
    const [hasActiveLoan, setHasActiveLoan] = useState(false);

    useEffect(() => {
        const handleUpdate = () => {
            mutateUser();
        };
        window.addEventListener('userStateUpdate', handleUpdate);
        return () => window.removeEventListener('userStateUpdate', handleUpdate);
    }, [mutateUser]);

    useEffect(() => {
        if (user?.role === 'CUSTOMER' || user?.role === 'STUDENT') {
            // Check cache first
            const cacheKey = `loanStatus_${user.id}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    const now = Date.now();
                    // Cache valid for 5 minutes
                    if (now - timestamp < 5 * 60 * 1000) {
                        setHasActiveLoan(data.hasActiveLoan);
                        setActiveLoanId(data.activeLoanId);
                        return;
                    }
                } catch (e) {
                    console.error('Cache parse error', e);
                }
            }

            apiFetch('/loans', { skipAuthCheck: true } as any).then((data: any) => {
                const loans = Array.isArray(data) ? data : (data?.data || []);
                const activeLoans = loans?.filter((l: any) => {
                    if (l.status !== 'DISBURSED') return false;
                    // Use the API's calculations instead of hardcoding fees
                    const netPayable = l.calculations?.net_payable_amount || Number(l.amount);
                    return Number(l.paid_amount || 0) < netPayable;
                });

                const hasActive = activeLoans?.length > 0;
                const activeId = activeLoans?.length === 1 ? activeLoans[0].id : null;

                setHasActiveLoan(hasActive);
                setActiveLoanId(activeId);

                // Cache the result
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: { hasActiveLoan: hasActive, activeLoanId: activeId },
                    timestamp: Date.now()
                }));
            }).catch(() => { });
        }
    }, [user?.id]); // Only depend on user ID, not pathname

    // Only show on main app routes
    const baseRole = pathname.split('/')[1];
    if (!['admin', 'merchant', 'customer'].includes(baseRole)) return null;

    const isMerchant = user?.role === 'MERCHANT';
    const isRestricted = !!(user?.has_pending_kyc_reupload || user?.has_pending_reupload);

    // Hide bottom nav if email is unverified
    if (user && !user.email_verified_at) return null;

    // Helper: active class
    const activeClass = isMerchant ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';

    const isHome = pathname === '/customer';
    const isLoans = pathname.includes('/customer/loan') && !pathname.includes('/repayment') && !pathname.includes('/customer/loan/history');
    const isHistory = pathname === '/customer/transactions';
    const isQR = pathname === '/customer/qr';
    const isCredOut = pathname === '/customer/payout';
    const isRepay = pathname.includes('/repayment');
    const isProfile = pathname === '/customer/profile';

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f1113] border-t border-white/10 md:hidden z-50 flex justify-around items-center pb-safe ring-1 ring-black/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] h-[70px] px-2 rounded-t-3xl">
            <Link href="/customer" prefetch={false} className={`flex flex-col items-center gap-1 p-1 min-w-[48px] rounded-xl transition-all duration-300 ${isHome ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutDashboard size={20} className={isHome ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} strokeWidth={isHome ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">Home</span>
            </Link>

            <Link href="/customer/loan" prefetch={false} className={`flex flex-col items-center gap-1 p-1 min-w-[48px] rounded-xl transition-all duration-300 ${isLoans ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <Zap size={20} className={isLoans ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} strokeWidth={isLoans ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">Loans</span>
            </Link>

            <Link href="/customer/transactions" prefetch={false} className={`flex flex-col items-center gap-1 p-1 min-w-[48px] rounded-xl transition-all duration-300 ${isHistory ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <History size={20} className={isHistory ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} strokeWidth={isHistory ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">History</span>
            </Link>

            {/* Center Floating Button */}
            <div className="relative -top-6 flex flex-col items-center">
                <Link href="/customer/qr" prefetch={false} className="bg-indigo-600 rounded-full w-14 h-14 flex items-center justify-center shadow-[0_8px_20px_rgba(79,70,229,0.4)] border-[3px] border-[#0f1113] transform hover:scale-105 active:scale-95 transition-all text-white">
                    <QrCode size={24} strokeWidth={2.5} />
                </Link>
                <span className="text-[9px] font-medium tracking-wide text-slate-400 mt-1">My QR</span>
            </div>

            <Link href="/customer/payout" prefetch={false} className={`flex flex-col items-center gap-1 p-1 min-w-[48px] rounded-xl transition-all duration-300 ${isCredOut ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <Landmark size={20} className={isCredOut ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} strokeWidth={isCredOut ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">Cred-Out</span>
            </Link>

            <Link href="/customer/profile" prefetch={false} className={`flex flex-col items-center gap-1 p-1 min-w-[48px] rounded-xl transition-all duration-300 ${isProfile ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <User size={20} className={isProfile ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} strokeWidth={isProfile ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">Profile</span>
            </Link>
        </div>
    );
}
