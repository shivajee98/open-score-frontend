'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, QrCode, Flame, Droplets, Wifi, LayoutGrid, Tv, TrendingUp, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerHome() {
    const router = useRouter();
    const [balance, setBalance] = useState('0');
    const [lockedBalance, setLockedBalance] = useState('0');
    const [user, setUser] = useState<any>(null);
    const [kycLoan, setKycLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bannerIndex, setBannerIndex] = useState(0);

    const banners = [
        {
            title: "Apply Now & Get 0% Interest Credit",
            sub: "First Users Only!",
            color: "bg-slate-900",
            accent: "bg-blue-600",
            amount: "₹5,00,000"
        },
        {
            title: "First User Advantage",
            sub: "Apply for Credit at 0% Interest",
            color: "bg-indigo-950",
            accent: "bg-purple-600",
            amount: "₹2,50,000"
        },
        {
            title: "Unlock 0% Interest Credit",
            sub: "First User Offer",
            color: "bg-zinc-950",
            accent: "bg-emerald-600",
            amount: "₹1,00,000"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setBannerIndex((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const w = await apiFetch('/wallet/balance');
                setBalance(w.balance);
                setLockedBalance(w.locked_balance || '0');

                if (user.role === 'CUSTOMER') {
                    const loans = await apiFetch('/loans');
                    const pendingKyc = loans.find((l: any) => l.status === 'KYC_SENT');
                    if (pendingKyc) setKycLoan(pendingKyc);
                }
            } catch (e) { } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    if (!user || loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    );

    const isMerchant = user.role === 'MERCHANT';

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <div className="bg-blue-600 p-6 pt-12 pb-16 rounded-b-[2.5rem] shadow-xl shadow-blue-900/10">
                <div className="flex justify-between items-center text-white mb-6">
                    <div>
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Welcome Back</p>
                        <h1 className="text-2xl font-black tracking-tight">{isMerchant ? (user?.business_name || 'My Store') : (user?.name || 'Customer')}</h1>
                    </div>
                    <Link href="/customer/profile">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 border border-blue-400 flex items-center justify-center font-black text-lg">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </Link>
                </div>

                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Account Balance</p>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-black text-white tracking-tighter">₹ {balance}</p>
                                {Number(lockedBalance) > 0 && (
                                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 shadow-inner group cursor-help">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            <Lock size={12} className="text-yellow-400 relative z-10" />
                                        </div>
                                        <span className="text-[11px] font-black text-white tracking-tight">₹{lockedBalance}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Icons Box */}
            <div className="px-6 -mt-8 mb-8 relative z-20">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-50 grid grid-cols-4 gap-4">
                    {[
                        { label: 'Scan QR', icon: <ScanBarcode size={28} />, action: () => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'SCAN_QR' })), href: '#' },
                        { label: 'Pay ID', icon: <Send size={28} />, href: '/customer/pay' },
                        { label: 'Show QR', icon: <QrCode size={28} />, href: '/customer/qr' },
                        { label: 'History', icon: <History size={28} />, href: '/customer/transactions' },
                    ].map((item, i) => (
                        <div key={i} onClick={item.action} className="flex flex-col items-center gap-3 active:scale-95 transition-all">
                            <Link href={item.href || '#'} className="contents">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center border border-slate-100 shadow-sm">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center leading-tight">{item.label}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* KYC Alert (If any) */}
            {!isMerchant && kycLoan && (
                <div className="px-6 mb-8">
                    <Link href={`/customer/loan/status/${kycLoan.id}`}>
                        <div className="bg-yellow-400 p-6 rounded-[2.5rem] shadow-2xl shadow-yellow-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-yellow-400 flex items-center justify-center shadow-lg">
                                    <ShieldCheck size={36} />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-black text-xl leading-tight uppercase tracking-tight">Complete KYC Now</h3>
                                    <p className="text-slate-800 text-[10px] font-black leading-tight mt-1 opacity-60 uppercase tracking-widest">Required for Loan #{kycLoan.id}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Banners - Animated Slide */}
            <div className="px-6 mb-10 relative overflow-hidden">
                <div
                    className="flex gap-6 transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(calc(-${bannerIndex * 90}% - ${bannerIndex * 24}px))` }}
                >
                    {banners.map((banner, i) => (
                        <div
                            key={i}
                            onClick={() => router.push('/customer/loan/apply')}
                            className={`shrink-0 w-[90%] ${banner.color} rounded-[2.5rem] p-8 relative overflow-hidden h-48 flex flex-col justify-center shadow-2xl shadow-slate-900/20 group cursor-pointer border border-white/5`}
                        >
                            <div className={`absolute top-0 right-0 w-64 h-64 ${banner.accent}/10 rounded-full blur-3xl -mr-16 -mt-16 transition-colors`}></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-white font-black text-xl tracking-tight leading-tight max-w-[200px]">{banner.title}</h3>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white/60 transition-colors">{banner.sub}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                        <Zap className="text-yellow-400 fill-yellow-400 w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Limit Up to</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">{banner.amount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {banners.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Recharge & Bills Section */}
            <div className="px-6 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recharge & Bills</h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                    {[
                        { label: 'Electricity', icon: <Zap size={24} className="text-amber-500 fill-amber-500" /> },
                        { label: 'Mobile', icon: <Smartphone size={24} className="text-blue-500" /> },
                        { label: 'DTH', icon: <Tv size={24} className="text-slate-900" /> },
                        { label: 'Water', icon: <Droplets size={24} className="text-blue-500" /> },
                        { label: 'Gas', icon: <Flame size={24} className="text-orange-500 fill-orange-500" /> },
                        { label: 'Broadband', icon: <Wifi size={24} className="text-purple-500" /> },
                        { label: 'Insurance', icon: <ShieldCheck size={24} className="text-emerald-500" /> },
                        { label: 'More', icon: <LayoutGrid size={24} className="text-slate-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-all">
                            <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden transition-all group-hover:shadow-md">
                                {item.icon}
                                <div className="absolute inset-0 bg-slate-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Services Section */}
            <div className="px-6 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Services</h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { title: 'Digital Gold', sub: 'Secure & Instant Savings', icon: <Landmark size={24} className="text-amber-500" /> },
                        { title: 'Mutual Funds', sub: 'Wealth Management', icon: <TrendingUp size={24} className="text-emerald-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-xl shadow-slate-900/5 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.title}</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

