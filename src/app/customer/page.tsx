'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, QrCode, Flame, Droplets, Wifi, LayoutGrid, Tv, TrendingUp, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [activeBanner, setActiveBanner] = useState(0);

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
            {/* Header Redesign - Tech/Circuit Theme */}
            <div className="bg-[#1a73e8] px-6 pt-14 pb-28 relative overflow-hidden shadow-2xl">
                {/* Main Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2979FF] via-[#2962FF] to-[#6200EA] z-0"></div>

                {/* Circuit Board Pattern Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M10 10 h 20 v 20 h 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="50" cy="30" r="2.5" fill="white" />
                            <path d="M70 10 v 40 h -20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="2.5" fill="white" />
                            <path d="M10 80 h 30 v -10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="40" cy="70" r="2.5" fill="white" />
                            <path d="M90 90 h -20 v -20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="70" cy="70" r="2.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>

                {/* Random Glowing Circuit Lines */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="absolute top-[20%] left-[10%] w-[1px] h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform rotate-45 animate-pulse"></div>
                    <div className="absolute top-[30%] right-[10%] w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[pulse_3s_infinite]"></div>
                    <div className="absolute bottom-[20%] left-[30%] w-[1px] h-16 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform -rotate-45 animate-[pulse_2s_infinite]"></div>
                </div>

                <div className="flex justify-between items-start text-white mb-10 relative z-10">
                    <div>
                        <p className="text-blue-100/90 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-80">Welcome Back</p>
                        <h1 className="text-4xl font-black tracking-tighter drop-shadow-sm">{isMerchant ? (user?.business_name || 'My Store') : (user?.name || 'Customer')}</h1>
                    </div>
                    <Link href="/customer/profile">
                        <div className="w-11 h-11 rounded-1xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-sm shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </Link>
                </div>

                {/* Balance Card - Neon Tech Style */}
                <div className="relative group z-10 mx-2">
                    {/* Outer Neon Glow */}
                    <div className="absolute -inset-[2px] rounded-[1.4rem] bg-cyan-400/50 blur-md animate-pulse"></div>

                    {/* Card Container */}
                    <div className="relative bg-gradient-to-r from-[#2979FF]/40 to-[#7C4DFF]/40 backdrop-blur-xl rounded-[1.3rem] py-4 px-5 flex items-center justify-between border-[1.5px] border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3),inset_0_0_20px_rgba(34,211,238,0.1)] overflow-hidden">

                        {/* Internal Shine Effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-11 h-11 rounded-[12px] bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                                <Wallet size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-cyan-50 text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5 opacity-90 drop-shadow-sm">Elite Credit Value</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-[28px] font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">₹ {balance}</p>
                                    {Number(lockedBalance) > 0 && (
                                        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                                            <Lock size={10} className="text-yellow-400" />
                                            <span className="text-[10px] font-black text-white tracking-tight">₹{lockedBalance}</span>
                                        </div>
                                    )}
                                </div>
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

            {/* Banners - Controlled Carousel with Arrows */}
            <div className="px-6 mb-10 relative group">
                <div className="relative h-44 w-full overflow-hidden rounded-[2rem]">
                    {banners.map((banner, i) => (
                        <div
                            key={i}
                            onClick={() => router.push('/customer/loan/apply')}
                            className={`absolute inset-0 w-full h-full ${banner.color} p-6 flex flex-col justify-center shadow-xl shadow-slate-900/10 cursor-pointer border border-white/5 transition-all duration-500 ease-in-out transform ${i === activeBanner ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (i < activeBanner ? '-translate-x-full' : 'translate-x-full')
                                }`}
                        >
                            <div className={`absolute top-0 right-0 w-48 h-48 ${banner.accent}/20 rounded-full blur-3xl -mr-10 -mt-10 transition-colors`}></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-white font-black text-lg tracking-tight leading-tight max-w-[200px]">
                                            {banner.title}
                                        </h3>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{banner.sub}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                                        <Zap className="text-yellow-400 fill-yellow-400 w-5 h-5 animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 mt-2">
                                    <span className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{banner.label}</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">{banner.amount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Arrows */}
                <button
                    onClick={() => setActiveBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all z-30"
                >
                    <ChevronLeft size={16} strokeWidth={3} />
                </button>
                <button
                    onClick={() => setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all z-30"
                >
                    <ChevronRight size={16} strokeWidth={3} />
                </button>

                {/* Progress Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                    {banners.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-4 bg-white' : 'w-1 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Recharge & Bills Section */}
            <div className="px-6 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        Recharge & Bills
                        <span className="ml-3 text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse border border-rose-100 shadow-sm tracking-widest">Coming Soon</span>
                    </h3>
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

        </div >
    );
}

