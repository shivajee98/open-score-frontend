'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, ArrowUpRight, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function CustomerHome() {
    const [balance, setBalance] = useState('...');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                setUser(u);
                const w = await apiFetch('/wallet/balance');
                setBalance(w.balance);
            } catch (e) { }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-blue-600 p-6 pt-12 pb-16 rounded-b-[2rem] shadow-xl shadow-blue-900/10">
                <div className="flex justify-between items-center text-white mb-6">
                    <div>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Welcome Back</p>
                        <h1 className="text-2xl font-black">{user?.name || 'Customer'}</h1>
                    </div>
                    <Link href="/customer/profile">
                        <div className="w-10 h-10 rounded-full bg-blue-500 border border-blue-400 flex items-center justify-center font-bold text-lg">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </Link>
                </div>

                {/* Balance Card - Small but Premium */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Account Balance</p>
                            <p className="text-xl font-black text-white">₹ {balance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Overlapping Header */}
            <div className="px-6 -mt-8 mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 grid grid-cols-4 gap-2">
                    {[
                        { label: 'Scan QR', icon: <ScanBarcode size={24} />, action: () => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'SCAN_QR' })), href: '/customer/pay' },
                        { label: 'Pay ID', icon: <Send size={24} />, href: '/customer/pay' },
                        { label: 'Show QR', icon: <QrCode size={24} />, href: '/customer/qr' },
                        { label: 'History', icon: <History size={24} />, href: '/customer/transactions' },
                    ].map((item, i) => (
                        <div key={i} onClick={item.action} className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors">
                            <Link href={item.href || '#'} onClick={item.action} className="contents">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center border border-slate-100 shadow-sm">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banners */}
            <div className="px-6 mb-8 overflow-x-auto flex gap-4 no-scrollbar snap-x">
                {/* 0% Loan Banner (Moved here) */}
                <div
                    onClick={() => window.location.href = '/customer/loan/apply'}
                    className="snap-center shrink-0 w-[85%] bg-slate-900 rounded-2xl p-6 relative overflow-hidden h-40 flex flex-col justify-center shadow-lg shadow-blue-900/20 group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/30 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-white font-black text-xl">Get 0% Instant Loan</h3>
                                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">Quick Approval</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                <Zap className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-white/60 text-xs font-bold">Up to</span>
                            <span className="text-3xl font-black text-white">₹5,00,000</span>
                        </div>
                    </div>
                </div>

                <div className="snap-center shrink-0 w-[85%] bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-left relative overflow-hidden h-40 flex flex-col justify-center shadow-lg shadow-purple-900/20">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold bg-white/20 inline-block px-2 py-1 rounded-lg mb-2">LIMITED OFFER</p>
                        <h3 className="font-black text-lg leading-tight">Get Instant Cashback<br />On Daily Emi Upto 50 Rs</h3>
                    </div>
                    <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                </div>

                <div className="snap-center shrink-0 w-[85%] bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-left relative overflow-hidden h-40 flex flex-col justify-center shadow-lg shadow-emerald-900/20">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold bg-white/20 inline-block px-2 py-1 rounded-lg mb-2">NEW FEATURE</p>
                        <h3 className="font-black text-lg leading-tight">Pay Rent<br />via Credit Card</h3>
                    </div>
                    <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                </div>
            </div>

            {/* Services Grid (Recharge & Bills) */}
            <div className="px-6 mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Recharge & Bills</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Mobile', icon: <Smartphone size={20} /> },
                        { label: 'Electricity', icon: <Zap size={20} /> },
                        { label: 'DTH', icon: <TvIcon /> },
                        { label: 'FASTag', icon: <CarIcon /> },
                        { label: 'Broadband', icon: <WifiIcon /> },
                        { label: 'Cylinder', icon: <FlameIcon /> },
                        { label: 'Water', icon: <DropletIcon /> },
                        { label: 'More', icon: <GridIcon /> },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group relative opacity-50">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm relative overflow-hidden">
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600 text-center">{item.label}</span>
                            <div className="absolute top-10 bg-slate-100 px-1 rounded border border-slate-200">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">Soon</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Services */}
            <div className="px-6 mb-24">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Financial Services</h3>
                <div className="bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
                    {[
                        { title: 'Digital Gold', sub: 'Start investing with ₹10', icon: <Landmark className="text-amber-500" /> },
                        { title: 'Insurance', sub: 'Life, Health & Motor', icon: <ShieldCheck className="text-emerald-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-xl relative overflow-hidden group">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                <p className="text-xs text-slate-400 font-medium">{item.sub}</p>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 text-rose-500 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm shadow-rose-100 animate-pulse">
                                Coming Soon
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Icons
const UserTransferIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
);
const TvIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
);
const CarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>
);
const WifiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
);
const FlameIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-5.318-3.093-6.6a4.408 4.408 0 0 1-.303-1.9c0-1.127.8-2.5 2.5-2.5 1.7 0 2.5 1.373 2.5 2.5a5.83 5.83 0 0 0 .303 1.9c.847 1.282 2.02 4.457 3.093 6.6.5 1 1 1.62 1 3a2.5 2.5 0 0 0 2.5 2.5" /><path d="M12 22v-4" /></svg>
);
const DropletIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
);
const GridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
