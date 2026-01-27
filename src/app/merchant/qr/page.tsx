'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import QRCode from 'react-qr-code';
import { Share2, Copy, Check, Store, Smartphone, History, Printer, QrCode } from 'lucide-react';

export default function MerchantQR() {
    const [qrData, setQrData] = useState('');
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        apiFetch('/merchant/qr').then(data => setQrData(data.qr_data));
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const navItems = [
        { label: 'Store Overview', href: '/merchant', icon: <Store className="w-5 h-5" /> },
        { label: 'Pay Mobile/QR', href: '/merchant/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'Receive QR', href: '/merchant/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Sales History', href: '/merchant/history', icon: <History className="w-5 h-5" /> },
    ];

    return (
        <DashboardLayout title="Store QR Code" navItems={navItems}>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden print:shadow-none print:border-2">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{user?.name}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Official Payment Terminal</p>

                    <div className="relative mx-auto w-72 h-72 bg-white rounded-[2rem] p-6 border-4 border-slate-900 shadow-2xl flex items-center justify-center mb-8">
                        {qrData ? (
                            <QRCode
                                value={qrData}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        ) : (
                            <div className="animate-pulse w-full h-full bg-slate-50 rounded-xl"></div>
                        )}
                    </div>

                    <div className="flex justify-center items-center gap-2 text-slate-900 font-black text-xl bg-slate-50 py-3 rounded-xl max-w-xs mx-auto mb-8 border border-slate-100">
                        {user?.mobile_number}@openscore
                    </div>

                    <div className="grid grid-cols-2 gap-4 print:hidden">
                        <button onClick={() => window.print()} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <Printer className="w-5 h-5" /> Print Standee
                        </button>
                        <button className="py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                            <Share2 className="w-5 h-5" /> Share Link
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
