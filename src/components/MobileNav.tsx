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
    const { data: user, mutate: mutateUser } = useApi('/auth/me');
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-1.5 md:hidden z-50 flex justify-around items-center pb-safe ring-1 ring-slate-900/5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <Link href="/customer" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${isHome ? activeClass : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard size={20} className={isHome ? 'scale-110' : ''} strokeWidth={isHome ? 3 : 2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
            </Link>

            <Link href="/customer/loan" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${isLoans ? activeClass : 'text-slate-400'}`}>
                <Zap size={20} className={isLoans ? 'scale-110' : ''} strokeWidth={3} />
                <span className="text-[8px] font-black uppercase tracking-widest">Loans</span>
            </Link>

            <Link href="/customer/qr" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${isQR ? activeClass : 'text-slate-400'}`}>
                <QrCode size={20} className={isQR ? 'scale-110' : ''} strokeWidth={2} />
                <span className="text-[8px] font-black uppercase tracking-widest">My QR</span>
            </Link>

            <Link href="/customer/payout" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${isCredOut ? activeClass : 'text-slate-400'}`}>
                <Landmark size={20} className={isCredOut ? 'scale-110' : ''} strokeWidth={2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Cred-Out</span>
            </Link>



            <Link href="/customer/vault-card" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${pathname.includes('/vault-card') ? activeClass : 'text-slate-400'}`}>
                <CreditCard size={20} className={pathname.includes('/vault-card') ? 'scale-110' : ''} strokeWidth={2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Vault</span>
            </Link>

            <Link href="/customer/profile" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${isProfile ? activeClass : 'text-slate-400'}`}>
                <User size={20} className={isProfile ? 'scale-110' : ''} strokeWidth={isProfile ? 3 : 2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
            </Link>

            <Link href="/customer/transactions" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[48px] rounded-xl transition-all duration-300 ${isHistory ? activeClass : 'text-slate-400'}`}>
                <History size={20} className={isHistory ? 'scale-110' : ''} strokeWidth={2} />
                <span className="text-[8px] font-black uppercase tracking-widest">{isMerchant ? 'History' : 'History'}</span>
            </Link>
        </div>
    );
}
