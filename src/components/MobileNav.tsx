'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, User, Zap, CreditCard, QrCode, History, Landmark } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function MobileNav() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
    const [hasActiveLoan, setHasActiveLoan] = useState(false);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, [pathname]);

    useEffect(() => {
        if (user?.role === 'CUSTOMER') {
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

            apiFetch('/loans').then((data: any) => {
                const loans = Array.isArray(data) ? data : (data?.data || []);
                const activeLoans = loans?.filter((l: any) => {
                    if (l.status !== 'DISBURSED') return false;
                    const principal = Number(l.amount);
                    const processingFee = principal === 10000 ? 0 : 1200;
                    const loginFee = principal === 10000 ? 300 : 200;
                    const fieldKycFee = principal === 10000 ? 500 : 600;
                    const gst = Math.round(principal * 0.18);
                    const totalPayable = principal + processingFee + loginFee + fieldKycFee + gst;
                    return Number(l.paid_amount || 0) < totalPayable;
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

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-1.5 md:hidden z-50 flex justify-around items-center pb-safe ring-1 ring-slate-900/5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <Link href="/customer" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer' ? (isMerchant ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50') : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard size={20} className={pathname === '/customer' ? 'scale-110' : ''} strokeWidth={pathname === '/customer' ? 3 : 2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
            </Link>

            {isMerchant ? (
                <>
                    <Link href="/customer/qr" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/qr' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <QrCode size={20} className={pathname === '/customer/qr' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/qr' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">My QR</span>
                    </Link>
                    <Link href="/customer/transactions" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/transactions' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <Wallet size={20} className={pathname === '/customer/transactions' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/transactions' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Sales</span>
                    </Link>
                    <Link href="/customer/payout" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/payout' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <Landmark size={20} className={pathname === '/customer/payout' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/payout' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cred-out</span>
                    </Link>
                    <Link href="/customer/profile" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/profile' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                        <User size={20} className={pathname === '/customer/profile' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/profile' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Settings</span>
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/customer/loan" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname.includes('/customer/loan') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Zap size={20} className={pathname.includes('/customer/loan') ? 'scale-110' : ''} strokeWidth={pathname.includes('/customer/loan') ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Loans</span>
                    </Link>

                    <Link href="/customer/transactions" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/transactions' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Wallet size={20} className={pathname === '/customer/transactions' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/transactions' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Wallet</span>
                    </Link>
                    <Link href="/customer/payout" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/payout' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <Landmark size={20} className={pathname === '/customer/payout' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/payout' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cred-out</span>
                    </Link>

                    <Link href="/customer/loan/history" prefetch={false} className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname === '/customer/loan/history' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                        <History size={20} className={pathname === '/customer/loan/history' ? 'scale-110' : ''} strokeWidth={pathname === '/customer/loan/history' ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Activity</span>
                    </Link>

                    {hasActiveLoan && (
                        <Link
                            href={activeLoanId ? `/customer/loan/status/${activeLoanId}/repayment` : "/customer/repayments"}
                            prefetch={false}
                            className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-xl transition-all duration-300 ${pathname.includes('/repayment') ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                        >
                            <CreditCard size={20} className={pathname.includes('/repayment') ? 'scale-110' : ''} strokeWidth={pathname.includes('/repayment') ? 3 : 2} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Repay</span>
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
