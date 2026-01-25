'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function MerchantQR() {
    const [qrData, setQrData] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        apiFetch('/merchant/qr').then(data => setQrData(data.qr_data));
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const navItems = [
        { label: 'Sales Overview', href: '/merchant', icon: '📊' },
        { label: 'My QR Code', href: '/merchant/qr', icon: '📱' },
        { label: 'Withdrawal', href: '/merchant/withdraw', icon: '🏦' },
        { label: 'History', href: '/merchant/history', icon: '🕒' },
    ];

    return (
        <DashboardLayout title="Store Payment Terminal" navItems={navItems}>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden group">
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{user?.name || 'Store'}</h3>
                    <p className="text-slate-500 font-medium mb-12 uppercase tracking-tighter">Accept ₹ with CreditLoop</p>

                    <div className="relative mx-auto w-64 h-64 bg-slate-50 rounded-3xl p-6 border-8 border-slate-50 shadow-inner mb-12">
                        <div className="absolute inset-0 border-2 border-dashed border-sky-500/30 rounded-3xl animate-pulse"></div>
                        <div className="w-full h-full relative opacity-90 transition-opacity group-hover:opacity-100">
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 49 }).map((_, i) => (
                                    <div key={i} className={`aspect-square ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'} rounded-sm`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-3xl inline-block border border-slate-100 max-w-full overflow-hidden">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Merchant Wallet UUID</p>
                            <p className="text-sm font-bold text-slate-900 tracking-wider truncate">{qrData}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/40 hover:scale-[1.02] transition-transform">Download PNG</button>
                            <button className="py-4 border-2 border-slate-100 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-colors">Print Poster</button>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                    <h4 className="font-bold mb-4">Payment Tips</h4>
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { t: 'Instant Settlement', d: 'Funds are credited to your merchant wallet immediately.' },
                            { t: 'Secure & Encrypted', d: 'All customer data is protected via dynamic QR hashing.' }
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-sky-400 text-xs font-black uppercase mb-1">{item.t}</p>
                                <p className="text-slate-400 text-[10px] leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
