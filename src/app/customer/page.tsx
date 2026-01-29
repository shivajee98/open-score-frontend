'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, QrCode, Flame, Droplets, Wifi, LayoutGrid, Tv, TrendingUp, Lock, ChevronLeft, ChevronRight, Bell, Headphones, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerHome() {
    const router = useRouter();
    const [balance, setBalance] = useState('0');
    const [lockedBalance, setLockedBalance] = useState('0');
    const [user, setUser] = useState<any>(null);
    const [kycLoan, setKycLoan] = useState<any>(null);
    const [showBalance, setShowBalance] = useState(true);
    const [loading, setLoading] = useState(true);
    const [dynamicText, setDynamicText] = useState("Apply Now & Get 0% Interest Credit");
    const [activeBanner, setActiveBanner] = useState(0);

    const banners = [
        {
            title: dynamicText,
            sub: "First Users Only!",
            color: "bg-gradient-to-br from-slate-900 to-blue-900",
            accent: "bg-blue-600",
            amount: "₹5,00,000",
            label: "Limit Up to"
        },
        {
            title: "Experience Premium",
            sub: "Upgrade your Status",
            color: "bg-gradient-to-br from-blue-950 to-indigo-950",
            accent: "bg-purple-600",
            amount: "Exclusive",
            label: "Benefits"
        },
        {
            title: "Secure Transactions",
            sub: "Bank-Grade Security",
            color: "bg-gradient-to-br from-slate-900 to-slate-950",
            accent: "bg-emerald-600",
            amount: "100% Safe",
            label: "Safety"
        }
    ];

    // Auto Slide for Banners
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 8000); // Slower speed
        return () => clearInterval(interval);
    }, [banners.length]);

    // Dynamic Text Effect for First Banner
    useEffect(() => {
        const texts = [
            "Apply Now & Get 0% Interest Credit - First Users Only!",
            "First User Advantage: Apply for Credit at 0% Interest",
            "Unlock 0% Interest Credit - First User Offer"
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    );

    const isMerchant = user.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header Redesign - Tech/Circuit Theme */}
            <div className={`px-4 pt-14 pb-16 relative overflow-hidden shadow-2xl ${isMerchant ? 'bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950' : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950'}`}>
                {/* Main Gradient Background Overlay */}
                <div className={`absolute inset-0 z-0 ${isMerchant ? 'bg-gradient-to-br from-emerald-900/50 via-emerald-950/50 to-teal-900/50' : 'opacity-50'}`}></div>

                {/* Circuit Board Pattern Overlay - Reduced Density */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                            <path d="M40 40 h 60 v 60 h 60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="160" cy="100" r="3" fill="white" />
                            <path d="M300 40 v 100 h -60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="240" cy="140" r="3" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>

                {/* Random Glowing Circuit Lines - Sparse */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-[15%] left-[5%] w-[1px] h-40 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform rotate-45 animate-pulse"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-[1px] h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform -rotate-12 animate-[pulse_4s_infinite]"></div>
                </div>

                <div className="flex justify-between items-start text-white mb-6 relative z-10">
                    <div>
                        <p className={`${isMerchant ? 'text-emerald-50' : 'text-indigo-100'}/90 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-80`}>Welcome Back</p>
                        <h1 className="text-3xl font-black tracking-tighter drop-shadow-sm uppercase">
                            {isMerchant ? (user?.business_name || 'MY STORE') : (user?.name || 'CUSTOMER')}
                        </h1>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5">
                            <Link href="/customer/notifications">
                                <button className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20 relative">
                                    <Bell size={16} strokeWidth={2.5} />
                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
                                </button>
                            </Link>
                            <Link href="/customer/profile">
                                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-sm shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20 overflow-hidden">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            </Link>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20" title="Help & Support">
                            <Headphones size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Balance Card - Navy/Violet Theme */}
                <div className="relative group z-10 mx-auto max-w-sm">
                    {/* Outer Neon Glow */}
                    <div className={`absolute -inset-[2px] rounded-[1.4rem] ${isMerchant ? 'bg-emerald-400/50' : 'bg-indigo-500/30'} blur-md animate-pulse`}></div>

                    {/* Card Container */}
                    <div className={`relative ${isMerchant ? 'bg-emerald-500/40' : 'bg-white/5'} backdrop-blur-xl rounded-[1.3rem] py-1.5 px-4 flex items-center justify-between border-[1.5px] ${isMerchant ? 'border-emerald-300' : 'border-white/10'} shadow-[0_0_20px_rgba(var(--theme-glow),0.2),inset_0_0_20px_rgba(var(--theme-glow),0.1)] overflow-hidden`}>
                        <style jsx>{`
                            div {
                                --theme-glow: ${isMerchant ? '16, 185, 129' : '99, 102, 241'};
                            }
                        `}</style>
                        {/* Internal Shine Effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        <div className="flex items-center gap-3 relative z-10 w-full">
                            <div className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg">
                                <Wallet size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className={`${isMerchant ? 'text-emerald-50' : 'text-indigo-100'} text-[9px] font-bold uppercase tracking-[0.15em] opacity-90`}>Elite Credit Value</p>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="p-1 rounded-md hover:bg-white/10 transition-colors text-white/60"
                                    >
                                        {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[24px] font-black text-white tracking-tighter drop-shadow-sm">
                                        ₹ {showBalance ? balance : '••••••'}
                                    </p>
                                    {Number(lockedBalance) > 0 && showBalance && (
                                        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                                            <Lock size={8} className="text-yellow-400" />
                                            <span className="text-[9px] font-black text-white tracking-tight">₹{lockedBalance}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Floating Card */}
            <div className="px-6 -mt-12 relative z-20 mb-8">
                <div className="bg-white py-2 px-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            { label: 'Scan QR', icon: <ScanBarcode size={22} strokeWidth={2} />, href: '/customer/pay?scan=true', color: 'text-indigo-600 bg-indigo-50' },
                            { label: 'Pay ID', icon: <Send size={22} strokeWidth={2} />, href: '/customer/pay', color: 'text-violet-600 bg-violet-50' },
                            { label: 'Show QR', icon: <QrCode size={22} strokeWidth={2} />, href: '/customer/qr', color: 'text-emerald-600 bg-emerald-50' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer">
                                <Link href={item.href || '#'} className="contents">
                                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">{item.label}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Smaller Arrows - Always Visible */}
                <button
                    onClick={() => setActiveBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-slate-500 hover:text-slate-900 z-40 transition-all hover:bg-white shadow-lg"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-slate-500 hover:text-slate-900 z-40 transition-all hover:bg-white shadow-lg"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Progress Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                    {banners.map((_, i) => (
                        <div
                            key={i}
                            className={`h-0.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-3 bg-white' : 'w-1 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>

            {/* KYC Alert (If any) */}
            {!isMerchant && kycLoan && (
                <div className="px-4 mb-8">
                    <Link href={`/customer/loan/status/${kycLoan.id}`}>
                        <div className="bg-yellow-400 p-4 rounded-3xl shadow-2xl shadow-yellow-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-yellow-400 flex items-center justify-center shadow-lg">
                                    <ShieldCheck size={36} />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-black text-lg leading-tight uppercase tracking-tight">Complete KYC Now</h3>
                                    <p className="text-slate-800 text-[10px] font-black leading-tight mt-1 opacity-60 uppercase tracking-widest">Required for Loan #{kycLoan.id}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {isMerchant && !user.is_onboarded && (
                <div className="px-4 mb-8">
                    <Link href={`/auth/merchant-onboarding?step=2`}>
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-3xl shadow-2xl shadow-purple-900/30 border-4 border-white/20 flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                                    <Zap size={30} className="fill-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">Claim ₹250 Cashback</h3>
                                    <p className="text-white/80 text-[10px] font-black leading-tight mt-1 opacity-80 uppercase tracking-widest">Complete Setup Now</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Banners - Full Width Carousel */}
            <div className="relative mt-4 z-30 mb-10 group">
                <div className="overflow-hidden mx-4">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(calc(-${activeBanner} * (88% + 0.75rem)))` }}
                    >
                        {banners.map((banner, i) => (
                            <div
                                key={i}
                                onClick={() => router.push('/customer/loan/apply')}
                                className={`w-[88%] h-28 mr-3 ${banner.color} rounded-2xl p-4 flex-shrink-0 flex flex-col justify-center shadow-2xl shadow-slate-900/40 cursor-pointer border border-white/10 relative overflow-hidden transition-all duration-300 ${i === activeBanner ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${banner.accent}/10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-white font-black text-[13px] tracking-tight leading-tight">
                                            {banner.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex flex-col">
                                                <span className={`text-white/40 ${i === 0 ? 'text-[9px]' : 'text-[7px]'} font-black uppercase tracking-widest`}>{banner.label}</span>
                                                <span className={`font-black tracking-tighter inline-block ${i === 0 ? 'text-2xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' : 'text-sm text-white'}`}>
                                                    {banner.amount}
                                                </span>
                                            </div>
                                            {i === 0 && (
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Apply Now</span>
                                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-lg border border-white/10 ml-2">
                                        <Zap className="text-yellow-400 fill-yellow-400 w-3 h-3 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Smaller Arrows - Inside Full Width Carousel */}
                    <button
                        onClick={() => setActiveBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white z-40 transition-all hover:bg-white/40 shadow-lg"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white z-40 transition-all hover:bg-white/40 shadow-lg"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Progress Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                        {banners.map((_, i) => (
                            <div
                                key={i}
                                className={`h-0.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-3 bg-white' : 'w-1 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recharge & Bills Section */}
            <div className="px-4 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        Recharge & Bills
                        <span className="ml-3 text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse border border-rose-100 shadow-sm tracking-widest">Coming Soon</span>
                    </h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                    {[
                        { label: 'Electricity', icon: <Zap size={20} className="text-amber-500 fill-amber-500 animate-pulse" /> },
                        { label: 'Mobile', icon: <Smartphone size={20} className="text-blue-500 animate-[bounce_2s_infinite]" /> },
                        { label: 'DTH', icon: <Tv size={20} className="text-slate-900" /> },
                        { label: 'Water', icon: <Droplets size={20} className="text-blue-500 animate-bounce delay-100" /> },
                        { label: 'Gas', icon: <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" /> },
                        { label: 'Broadband', icon: <Wifi size={20} className="text-purple-500 animate-pulse" /> },
                        { label: 'Insurance', icon: <ShieldCheck size={20} className="text-emerald-500" /> },
                        { label: 'More', icon: <LayoutGrid size={20} className="text-slate-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-all">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden transition-all group-hover:shadow-md group-hover:-translate-y-1">
                                {item.icon}
                                <div className="absolute inset-0 bg-slate-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Services Section */}
            <div className="px-4 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Services</h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { title: 'Digital Gold', sub: 'Secure & Instant Savings', icon: <Landmark size={24} className="text-amber-500" /> },
                        { title: 'Mutual Funds', sub: 'Wealth Management', icon: <TrendingUp size={24} className="text-emerald-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-50 shadow-xl shadow-slate-900/5 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
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

