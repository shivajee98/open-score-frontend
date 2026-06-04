'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Zap, User, LayoutDashboard, QrCode, Landmark, History, CreditCard, Home, ShoppingBag } from 'lucide-react';
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-end px-2 py-2 pb-safe md:hidden z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <Link href="/customer" prefetch={false} className={`flex flex-col items-center gap-1 min-w-[56px] transition-colors duration-300 ${isHome ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className="mb-0.5"><Home size={22} strokeWidth={isHome ? 2.5 : 2} className={isHome ? 'fill-violet-600/20' : ''} /></div>
                <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
            </Link>

            <Link href="/customer/loan" prefetch={false} className={`flex flex-col items-center gap-1 min-w-[48px] transition-colors duration-300 ${isLoans ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className="mb-0.5"><Zap size={22} strokeWidth={isLoans ? 2.5 : 2} className={isLoans ? 'fill-violet-600/20' : ''} /></div>
                <span className="text-[9px] font-black uppercase tracking-wider">Loans</span>
            </Link>

            <Link href="/customer/qr-payment" prefetch={false} className="flex flex-col items-center gap-1 min-w-[64px] relative -mt-8 group">
                <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xl shadow-violet-600/30 border-4 border-white transition-transform active:scale-95 group-hover:-translate-y-1">
                    <QrCode size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-violet-600 mt-1">Pay / QR</span>
            </Link>

            <Link href="/customer/marketplace" prefetch={false} className={`flex flex-col items-center gap-1 min-w-[48px] transition-colors duration-300 text-slate-400 hover:text-slate-600`}>
                <div className="mb-0.5"><ShoppingBag size={22} strokeWidth={2} /></div>
                <span className="text-[9px] font-black uppercase tracking-wider">Marketplace</span>
            </Link>

            <Link href="/customer/profile" prefetch={false} className={`flex flex-col items-center gap-1 min-w-[48px] transition-colors duration-300 ${isProfile ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className="mb-0.5"><User size={22} strokeWidth={isProfile ? 2.5 : 2} className={isProfile ? 'fill-violet-600/20' : ''} /></div>
                <span className="text-[9px] font-black uppercase tracking-wider">Profile</span>
            </Link>
        </div>
    );
}
