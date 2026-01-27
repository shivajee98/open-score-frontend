'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import QRCode from 'react-qr-code';
import { Share2, Copy, Check, Home, Smartphone, QrCode, Receipt } from 'lucide-react';

export default function CustomerQR() {
    const [qrData, setQrData] = useState('');
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        apiFetch('/payment/qr').then(data => setQrData(data.qr_data));
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    const copyVPA = () => {
        const vpa = `${user?.mobile_number}@openscore`;
        navigator.clipboard.writeText(vpa);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <DashboardLayout title="Receive Money" navItems={navItems}>
            <div className="max-w-md mx-auto space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                    <div className="w-20 h-20 bg-slate-50 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-inner text-slate-900 border border-slate-100">
                        {user?.name?.[0]}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{user?.name}</h3>
                    <div
                        onClick={copyVPA}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 font-bold text-sm mb-10 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        {user?.mobile_number}@openscore
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </div>

                    <div className="relative mx-auto w-64 h-64 bg-white rounded-[2rem] p-4 border-2 border-slate-100 shadow-lg flex items-center justify-center mb-8 group hover:shadow-2xl hover:scale-105 transition-all duration-500">
                        {qrData ? (
                            <QRCode
                                value={qrData}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                                className="opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="animate-pulse w-full h-full bg-slate-50 rounded-xl"></div>
                        )}
                    </div>

                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Scan with any OpenScore App
                    </p>
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
                    <Share2 className="w-5 h-5" /> Share Payment Link
                </button>
            </div>
        </DashboardLayout>
    );
}
