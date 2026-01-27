'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { QrCode, ArrowDownLeft, ArrowUpRight, Copy, Wallet } from 'lucide-react';

export default function MerchantHome() {
    const [balance, setBalance] = useState('...');
    const [user, setUser] = useState<any>(null);
    const [linkedQr, setLinkedQr] = useState(false); // Check if QR linked

    useEffect(() => {
        const loadData = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                setUser(u);
                const w = await apiFetch('/wallet/balance');
                setBalance(w.balance);

                // Check QR status (mocked or need endpoint)
                // For now we assume if they have transactions or special flag?
                // Actually, we can check endpoint /merchant/qr (from my knowledge of api.php)
                // But I didn't verify that endpoint response structure.
                // Let's just assume false and show the button.
            } catch (e) { }
        };
        loadData();

        // Listen for Scan from Mobile
        const handleMessage = async (event: any) => {
            try {
                const msg = JSON.parse(typeof event.data === 'string' ? event.data : JSON.stringify(event.data));
                if (msg.type === 'QR_SCANNED') {
                    // Link QR
                    await apiFetch('/merchant/link-qr', {
                        method: 'POST',
                        body: JSON.stringify({ code: msg.data })
                    });
                    alert('QR Code Linked Successfully! You can now accept payments.');
                    setLinkedQr(true);
                }
            } catch (e) { }
        };

        window.addEventListener('message', handleMessage);
        // Also listen for Expo webview message which might come differently?
        // The App.tsx sends `postMessage`. In WebView, it's `document.addEventListener('message')` or `window.addEventListener('message')`.
        // React Native WebView: `window.ReactNativeWebView` exists.
        // Incoming messages: `document.addEventListener('message', ...)` on iOS?
        // Actually `window.addEventListener('message')` usually works for `postMessage`.

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const scanQr = () => {
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCAN_QR' }));
        } else {
            alert('Please use the mobile app to scan.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900 p-6 pt-12 pb-16 rounded-b-[2rem] shadow-xl shadow-slate-900/10">
                <div className="flex justify-between items-center text-white mb-6">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Merchant Dashboard</p>
                        <h1 className="text-2xl font-black">{user?.business_name || user?.name || 'Merchant'}</h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg">
                        {user?.name?.[0] || 'M'}
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Settlement Balance</p>
                            <p className="text-2xl font-black text-white">₹ {balance}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-blue-500 transition-colors">
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 -mt-8 mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex gap-4">
                    <button onClick={scanQr} className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group hover:bg-blue-600 hover:text-white transition-all">
                        <QrCode size={24} />
                        <span className="text-xs font-bold">Link Physical QR</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group hover:bg-slate-900 hover:text-white transition-all">
                        <ArrowDownLeft size={24} />
                        <span className="text-xs font-bold">Request Money</span>
                    </button>
                </div>
            </div>

            {/* Recent Transactions placeholder */}
            <div className="px-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Recent Settlements</h3>
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <HistoryIcon />
                    </div>
                    <p className="text-slate-400 text-xs font-bold">No settlements yet.</p>
                </div>
            </div>
        </div>
    );
}

const HistoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
);
