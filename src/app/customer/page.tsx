'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, ArrowUpRight, QrCode, ChevronRight, TrendingUp, PartyPopper, Store, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/loanUtils';

export default function CustomerHome() {
    const router = useRouter();
    const [balance, setBalance] = useState('...');
    const [user, setUser] = useState<any>(null);
    const [kycLoan, setKycLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                setUser(u);
                const w = await apiFetch('/wallet/balance');
                setBalance(w.balance);

                if (u.role === 'CUSTOMER') {
                    // Check for KYC pending loans only for customers
                    const loans = await apiFetch('/loans');
                    const pendingKyc = loans.find((l: any) => l.status === 'KYC_SENT');
                    if (pendingKyc) setKycLoan(pendingKyc);
                }
            } catch (e) { } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const isMerchant = user?.role === 'MERCHANT';

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <div className={cn(
                "p-6 pt-12 pb-16 rounded-b-[2.5rem] shadow-xl shadow-blue-900/10 relative overflow-hidden",
                isMerchant ? "bg-slate-900 text-white" : "bg-blue-600 text-white"
            )}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="flex justify-between items-center relative z-10 mb-8">
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            isMerchant ? "text-emerald-400" : "text-blue-100"
                        )}>
                            {isMerchant ? 'Merchant Portal' : 'Premium Banking'}
                        </p>
                        <h1 className="text-2xl font-black tracking-tight mt-1">
                            {isMerchant ? (user?.business_name || 'My Store') : (user?.name || 'Customer')}
                        </h1>
                    </div>
                    <Link href="/customer/profile">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border",
                            isMerchant ? "bg-emerald-500 border-emerald-400 text-white" : "bg-blue-500 border-blue-400 text-white"
                        )}>
                            {user?.name?.[0] || 'U'}
                        </div>
                    </Link>
                </div>

                {/* Balance Card - Small but Premium */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                            isMerchant ? "bg-emerald-500 text-white" : "bg-white text-blue-600"
                        )}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Available Balance</p>
                            <p className="text-3xl font-black text-white tracking-tighter">₹ {balance}</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/20 transition-colors">
                        <ChevronRight className="text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Merchant Quick Actions Banner */}
            {isMerchant && (
                <div className="px-6 -mt-8 mb-8 relative z-20">
                    <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-900/5 border border-slate-100 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/customer/qr')}
                            className="flex flex-col items-center gap-3 p-6 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 group"
                        >
                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:rotate-6 transition-transform">
                                <QrCode size={32} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Show My QR</span>
                        </button>
                        <button
                            onClick={() => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'SCAN_QR' }))}
                            className="flex flex-col items-center gap-3 p-6 bg-blue-50 text-blue-700 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all active:scale-95 group"
                        >
                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:rotate-6 transition-transform">
                                <ScanBarcode size={32} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Scan & Pay</span>
                        </button>
                    </div>
                </div>
            )}

            {/* KYC High-Impact Banner (Customer Only) */}
            {!isMerchant && kycLoan && (
                <div className="px-6 -mt-8 mb-6 relative z-20">
                    <Link href={`/customer/loan/status/${kycLoan.id}`}>
                        <div className="bg-yellow-400 p-6 rounded-[2.5rem] shadow-2xl shadow-yellow-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-yellow-400 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                    <ShieldCheck size={36} />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-black text-xl leading-tight uppercase tracking-tight">Complete KYC Now</h3>
                                    <p className="text-slate-800 text-[10px] font-black leading-tight mt-1 opacity-60 uppercase tracking-widest">Required for Loan #{kycLoan.id}</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-900/10 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                                <ChevronRight className="text-slate-900 w-8 h-8" />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Action Grid */}
            <div className={cn("px-6 mb-10", !isMerchant && !kycLoan && "-mt-8 relative z-20")}>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 border border-slate-50 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { label: 'Pay ID', icon: <Send size={24} />, href: '/customer/pay', color: 'text-blue-600' },
                        { label: 'History', icon: <History size={24} />, href: '/customer/transactions', color: 'text-indigo-600' },
                        { label: 'Rewards', icon: <PartyPopper size={24} />, href: '#', color: 'text-rose-500' },
                        { label: 'Analytics', icon: <TrendingUp size={24} />, href: '#', color: 'text-emerald-500' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="flex flex-col items-center gap-3 p-3 min-w-[72px] hover:bg-slate-50 rounded-2xl transition-colors">
                            <div className={cn("w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm", item.color)}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Contextual Section */}
            <div className="px-6 mb-10">
                <div className="flex justify-between items-end mb-6 px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {isMerchant ? 'Merchant Benefits' : 'Special Offers'}
                    </h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {isMerchant ? (
                        <>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                                            <TrendingUp size={20} className="text-emerald-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Growth Bonus</span>
                                    </div>
                                    <h3 className="text-2xl font-black leading-none mb-4 tracking-tighter">Increase Sales,<br />Earn Cashback</h3>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[200px]">Get up to ₹5,000 monthly cashback on your business transaction volume.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Store size={28} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">Grow Your Business</h4>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Apply for MSME Loans up to ₹50L</p>
                                </div>
                                <div className="ml-auto p-2 bg-slate-50 rounded-xl text-slate-300">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={() => window.location.href = '/customer/loan/apply'}
                                className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden group cursor-pointer shadow-2xl shadow-blue-900/20"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-600/40 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-600/20 rounded-xl backdrop-blur-md">
                                                <Zap size={24} className="text-blue-400 fill-blue-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Instant Credit</span>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                            0% Interest
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter leading-tight mb-2">₹5,00,000</h3>
                                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest opacity-80">Ready for Disbursal</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                                    <CreditCard className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">Offer of the day</p>
                                    <h4 className="font-black text-base leading-tight">Instant Cashback<br />on EMI Payments</h4>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                                    <ArrowUpRight className="absolute right-4 top-4 text-slate-200" size={24} />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Investment</p>
                                    <h4 className="font-black text-slate-900 text-base leading-tight">Buy Digital<br />Gold from ₹10</h4>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Utility Grid */}
            <div className="px-6 mb-24">
                <div className="flex justify-between items-end mb-6 px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isMerchant ? 'Business Utilities' : 'Quick Utilities'}</h3>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">View All</span>
                </div>
                <div className="grid grid-cols-4 gap-6">
                    {(isMerchant ? [
                        { label: 'Settlement', icon: <Landmark size={20} /> },
                        { label: 'Staff Pay', icon: <Users size={20} /> },
                        { label: 'Invoices', icon: <History size={20} /> },
                        { label: 'Settings', icon: <ShieldCheck size={20} /> },
                    ] : [
                        { label: 'Electricity', icon: <Zap size={20} className="text-yellow-500 fill-yellow-500" /> },
                        { label: 'Mobile', icon: <Smartphone size={20} className="text-blue-500" /> },
                        { label: 'DTH', icon: <TvIcon /> },
                        { label: 'Water', icon: <DropletIcon /> },
                    ]).map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm relative group cursor-not-allowed overflow-hidden">
                                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative transition-transform group-hover:scale-110">
                                    {item.icon}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Icons
const TvIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
);
const DropletIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
);

