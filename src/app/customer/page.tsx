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
    const [dynamicText, setDynamicText] = useState("Apply Now & Get 0% Interest Credit");

    const banners = [
        {
            title: dynamicText,
            sub: "First Users Only!",
            color: "bg-slate-900",
            accent: "bg-blue-600",
            amount: "₹5,00,000",
            label: "Limit Up to"
        },
        {
            title: "Experience Premium",
            sub: "Upgrade your Status",
            color: "bg-indigo-950",
            accent: "bg-purple-600",
            amount: "Exclusive",
            label: "Benefits"
        },
        {
            title: "Secure Transactions",
            sub: "Bank-Grade Security",
            color: "bg-zinc-950",
            accent: "bg-emerald-600",
            amount: "100% Safe",
            label: "Safety"
        }
    ];

    // Dynamic Text Effect for First Banner
    useEffect(() => {
        const texts = [
            "Apply Now & Get 0% Interest Credit",
            "Zero Cost EMI for New Users",
            "Exclusive Launch Offer: 0% APR"
        ];
        let i = 0;
        const timer = setInterval(() => {
            i = (i + 1) % texts.length;
            setDynamicText(texts[i]);
        }, 2500);
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
            {/* Header Redesign */}
            <div className="bg-[#1a73e8] px-6 pt-12 pb-24 relative overflow-hidden">
                <div className="flex justify-between items-start text-white mb-8 relative z-10">
                    <div>
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Welcome Back</p>
                        <h1 className="text-3xl font-black tracking-tighter">{isMerchant ? (user?.business_name || 'My Store') : (user?.name || 'Customer')}</h1>
                    </div>
                    <Link href="/customer/profile">
                        <div className="w-10 h-10 rounded-xl bg-[#4285f4] border border-[#8ab4f8] flex items-center justify-center font-black text-sm shadow-lg active:scale-90 transition-transform cursor-pointer">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </Link>
                </div>

                {/* Balance Card */}
                <div className="bg-[#4285f4] rounded-[2rem] p-6 flex items-center justify-between border border-[#8ab4f8]/30 shadow-2xl relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white text-[#1a73e8] flex items-center justify-center shadow-lg transform -rotate-6">
                            <Wallet size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Account Balance</p>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-black text-white tracking-tighter">₹ {balance}</p>
                                {Number(lockedBalance) > 0 && (
                                    <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 shadow-inner group cursor-help">
                                        <Lock size={10} className="text-yellow-400" />
                                        <span className="text-[10px] font-black text-white tracking-tight">₹{lockedBalance}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Floating Card */}
            <div className="px-10 -mt-12 relative z-20 mb-8">
                <div className="bg-white py-2 px-3 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            { label: 'Scan QR', icon: <ScanBarcode size={22} strokeWidth={2} />, action: () => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'SCAN_QR' })), href: '#', color: 'text-indigo-600 bg-indigo-50' },
                            { label: 'Pay ID', icon: <Send size={22} strokeWidth={2} />, href: '/customer/pay', color: 'text-violet-600 bg-violet-50' },
                            { label: 'Show QR', icon: <QrCode size={22} strokeWidth={2} />, href: '/customer/qr', color: 'text-emerald-600 bg-emerald-50' },
                        ].map((item, i) => (
                            <div key={i} onClick={item.action} className="flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer">
                                <Link href={item.href || '#'} className="contents">
                                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">{item.label}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
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

            {/* Banners - Static Scroll with Dynamic Text */}
            <div className="px-6 mb-10 overflow-x-auto flex gap-5 no-scrollbar snap-x">
                {banners.map((banner, i) => (
                    <div
                        key={i}
                        onClick={() => router.push('/customer/loan/apply')}
                        className={`snap-center shrink-0 w-[85%] ${banner.color} rounded-[2rem] p-6 relative overflow-hidden h-44 flex flex-col justify-center shadow-xl shadow-slate-900/10 group cursor-pointer border border-white/5`}
                    >
                        <div className={`absolute top-0 right-0 w-48 h-48 ${banner.accent}/20 rounded-full blur-3xl -mr-10 -mt-10 transition-colors`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-white font-black text-lg tracking-tight leading-tight max-w-[200px] transition-all duration-300">
                                        {banner.title}
                                    </h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{banner.sub}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                                    <Zap className="text-yellow-400 fill-yellow-400 w-5 h-5 animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{(banner as any).label || 'Limit Up to'}</span>
                                <span className="text-2xl font-black text-white tracking-tighter">{banner.amount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recharge & Bills Section */}
            <div className="px-6 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recharge & Bills</h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                    {[
                        { label: 'Electricity', icon: <Zap size={24} className="text-amber-500 fill-amber-500 animate-pulse" /> },
                        { label: 'Mobile', icon: <Smartphone size={24} className="text-blue-500 animate-[bounce_2s_infinite]" /> },
                        { label: 'DTH', icon: <Tv size={24} className="text-slate-900" /> },
                        { label: 'Water', icon: <Droplets size={24} className="text-blue-500 animate-bounce delay-100" /> },
                        { label: 'Gas', icon: <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" /> },
                        { label: 'Broadband', icon: <Wifi size={24} className="text-purple-500 animate-pulse" /> },
                        { label: 'Insurance', icon: <ShieldCheck size={24} className="text-emerald-500" /> },
                        { label: 'More', icon: <LayoutGrid size={24} className="text-slate-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-all">
                            <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden transition-all group-hover:shadow-md group-hover:-translate-y-1">
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

