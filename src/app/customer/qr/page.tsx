'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import QRCode from 'react-qr-code';
import { Share2, Copy, Check, Home, Smartphone, QrCode, Receipt, Link2, X, Scan } from 'lucide-react';

export default function CustomerQR() {
    const [qrData, setQrData] = useState('');
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    // Mapping State
    const [isMapping, setIsMapping] = useState(false);
    const [mapCode, setMapCode] = useState('');
    const [mapStatus, setMapStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [scanning, setScanning] = useState(false);
    const [scannerInstance, setScannerInstance] = useState<any>(null);

    useEffect(() => {
        apiFetch('/payment/qr').then(data => setQrData(data.qr_data));

        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            // Fallback: Fetch user if not in local storage
            apiFetch('/auth/me').then(u => {
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
            }).catch(e => console.error('Failed to load user', e));
        }
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

    const startScanner = async () => {
        setScanning(true);
        const { Html5Qrcode } = await import('html5-qrcode');
        setTimeout(async () => {
            try {
                if (!document.getElementById("reader")) return;
                const instance = new Html5Qrcode("reader");
                setScannerInstance(instance);
                await instance.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        setMapCode(decodedText);
                        stopScanner();
                    },
                    () => { }
                );
            } catch (err) {
                console.error(err);
                setScanning(false);
            }
        }, 100);
    };

    const stopScanner = async () => {
        setScanning(false);
        if (scannerInstance && scannerInstance.isScanning) {
            await scannerInstance.stop();
            setScannerInstance(null);
        }
    };

    const handleMapQr = async (e: React.FormEvent) => {
        e.preventDefault();
        setMapStatus('loading');
        try {
            await apiFetch('/merchant/link-qr', {
                method: 'POST',
                body: JSON.stringify({ code: mapCode })
            });
            setMapStatus('success');
            // Refresh QR data
            apiFetch('/payment/qr').then(data => setQrData(data.qr_data));
            setTimeout(() => {
                setIsMapping(false);
                setMapStatus('idle');
                setMapCode('');
            }, 2000);
        } catch (err) {
            setMapStatus('error');
            setTimeout(() => setMapStatus('idle'), 3000);
        }
    };

    return (
        <DashboardLayout title="Receive Money" navItems={navItems}>
            <div className="max-w-md mx-auto space-y-6 relative">
                <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                    <div className="w-20 h-20 bg-slate-50 rounded-xl mx-auto mb-6 flex items-center justify-center text-2xl shadow-inner text-slate-900 border border-slate-100">
                        {user?.name?.[0]}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{user?.name}</h3>
                    <div
                        onClick={copyVPA}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 font-bold text-sm mb-10 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        {user?.mobile_number}@openscore
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </div>

                    <div className="relative mx-auto w-48 h-48 bg-white rounded-2xl p-3 border-2 border-slate-100 shadow-lg flex items-center justify-center mb-8 group hover:shadow-2xl hover:scale-105 transition-all duration-500">
                        {qrData ? (
                            <QRCode
                                value={qrData}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                                className="opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="animate-pulse w-full h-full bg-slate-50 rounded-lg"></div>
                        )}
                    </div>

                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Scan with any OpenScore App
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
                        <Share2 className="w-5 h-5" /> Share
                    </button>
                    {user?.role === 'MERCHANT' && (
                        <button
                            onClick={() => setIsMapping(true)}
                            className="flex-1 py-2.5 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                        >
                            <Link2 className="w-5 h-5" /> Map QR
                        </button>
                    )}
                </div>

                {/* Mapping Modal */}
                {isMapping && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900">Map Physical QR</h3>
                                <button onClick={() => { setIsMapping(false); stopScanner(); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                                    <X size={20} />
                                </button>
                            </div>

                            {scanning ? (
                                <div className="space-y-4">
                                    <div id="reader" className="w-full h-64 overflow-hidden rounded-xl border-2 border-slate-200"></div>
                                    <button onClick={stopScanner} className="w-full py-2 bg-slate-100 font-bold rounded-lg text-slate-600">Cancel Scan</button>
                                </div>
                            ) : (
                                <form onSubmit={handleMapQr} className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={startScanner}
                                        className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-100 hover:border-slate-400 transition-all"
                                    >
                                        <Scan size={20} /> Scan QR Code
                                    </button>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-slate-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or Type ID</span>
                                        <div className="flex-grow border-t border-slate-200"></div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">QR Code ID</label>
                                        <input
                                            autoFocus
                                            value={mapCode}
                                            onChange={(e) => setMapCode(e.target.value)}
                                            placeholder="Enter Code ID"
                                            className="w-full p-3 bg-slate-50 rounded-lg font-mono text-center text-lg font-black tracking-widest border-2 border-transparent focus:border-blue-500 outline-none transition-all uppercase"
                                        />
                                    </div>

                                    <button
                                        disabled={mapStatus === 'loading' || !mapCode}
                                        className={`w-full py-2.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${mapStatus === 'success' ? 'bg-emerald-500' :
                                            mapStatus === 'error' ? 'bg-rose-500' :
                                                'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {mapStatus === 'loading' ? 'Linking...' :
                                            mapStatus === 'success' ? <><Check size={20} /> Linked!</> :
                                                mapStatus === 'error' ? 'Invalid Code' : 'Link QR Code'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
