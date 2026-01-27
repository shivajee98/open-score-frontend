'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import { LayoutDashboard, Smartphone, QrCode, History, ArrowDownLeft, Store } from 'lucide-react';

export default function MerchantDashboard() {
    const [balance, setBalance] = useState(0);
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const balanceData = await apiFetch('/wallet/balance');
                setBalance(balanceData.balance);
                const qr = await apiFetch('/merchant/qr');
                setQrData(qr.qr_data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const navItems = [
        { label: 'Store Overview', href: '/merchant', icon: <Store className="w-5 h-5" /> },
        { label: 'Pay Mobile/QR', href: '/merchant/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'Receive QR', href: '/merchant/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Sales History', href: '/merchant/history', icon: <History className="w-5 h-5" /> },
    ];

    if (loading) return (
        <DashboardLayout title="Overview" navItems={navItems}>
            <div className="flex items-center justify-center p-20">
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Store Data...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="Store Dashboard" navItems={navItems}>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stats */}
                    <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 lg:col-span-2 flex justify-between items-center shadow-xl shadow-slate-900/20">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Business Wallet</p>
                            <h4 className="text-4xl font-black text-white">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                            <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                            </p>
                        </div>
                        <button onClick={() => window.location.href = '/merchant/pay'} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/40">Pay Others</button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Settlement</p>
                        <h4 className="text-lg font-black text-slate-900">Weekly Cycle</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Next: Monday</p>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">KYC Status</p>
                        <h4 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                            ✓ Verified
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Level 2 Limit</p>
                    </div>
                </div>

                {/* QR Section */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <QrCode className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Accept Payments Instantly</h3>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                            Your unified QR code accepts payments from Customers and other Merchants. Funds are settled directly to your business wallet.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => window.location.href = '/merchant/qr'}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <ArrowDownLeft className="w-5 h-5" /> Download QR
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center">
                        <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                            {/* Placeholder for QR Logic, we just show the link button really */}
                            <div className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
                                <p className="text-xs font-bold text-slate-400 uppercase">Interactive QR</p>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">ID: {qrData?.substring(0, 8)}...</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
