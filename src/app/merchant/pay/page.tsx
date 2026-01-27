'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { Scan, X, Smartphone, Store, QrCode, History } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function MerchantPay() {
    const router = useRouter(); // Instantiated router
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [payee, setPayee] = useState<any>(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scannerInstance, setScannerInstance] = useState<any>(null);
    const [successData, setSuccessData] = useState<any>(null);

    const navItems = [
        { label: 'Store Overview', href: '/merchant', icon: <Store className="w-5 h-5" /> },
        { label: 'Pay Mobile/QR', href: '/merchant/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'Receive QR', href: '/merchant/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Sales History', href: '/merchant/history', icon: <History className="w-5 h-5" /> },
    ];

    useEffect(() => {
        apiFetch('/wallet/balance').then(data => setBalance(data.balance));
    }, []);

    const startScanner = async () => {
        setScanning(true);
        setError('');
        const { Html5Qrcode } = await import('html5-qrcode');

        setTimeout(async () => {
            try {
                const instance = new Html5Qrcode("reader");
                setScannerInstance(instance);
                await instance.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                );
            } catch (err: any) {
                console.error("Scanner Error:", err);
                setError("Camera access user permission denied.");
                setScanning(false);
                setScannerInstance(null);
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

    useEffect(() => {
        return () => {
            if (scannerInstance?.isScanning) scannerInstance.stop().catch(() => { });
        }
    }, [scannerInstance]);

    function onScanSuccess(decodedText: string) {
        stopScanner();
        fetchPayeeDetails(decodedText);
    }

    function onScanFailure(error: any) { }

    const fetchPayeeDetails = async (id: string) => {
        setLoading(true);
        try {
            const data = await apiFetch(`/payment/payee/${id}`);
            setPayee(data);
            setStep(2);
        } catch (err) {
            setError('User Not Found');
        } finally {
            setLoading(false);
        }
    }

    const handlePay = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch('/payment/pay', {
                method: 'POST',
                body: JSON.stringify({
                    payee_wallet_uuid: payee.payee_wallet_uuid,
                    amount: parseFloat(amount)
                })
            });
            setSuccessData({
                amount: amount,
                payeeName: payee.name,
                ref: res.ref
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Business Payment" navItems={navItems}>
            <div className="max-w-xl mx-auto">
                <PaymentSuccessModal
                    isOpen={!!successData}
                    amount={successData?.amount || '0'}
                    payeeName={successData?.payeeName || ''}
                    transactionRef={successData?.ref || ''}
                    onClose={() => router.push('/merchant')}
                />

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">{error}</div>}

                {step === 1 ? (
                    <div className="space-y-6">
                        {scanning ? (
                            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                                <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white/20"></div>
                                <button onClick={stopScanner} className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2"><X className="w-5 h-5" /> Cancel</button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden group">
                                <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                                <div className="w-24 h-24 mx-auto mb-8 relative">
                                    <button
                                        onClick={startScanner}
                                        className="relative w-full h-full bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Scan className="w-10 h-10" />
                                    </button>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Scan Customer QR</h3>
                                <p className="text-slate-500 font-medium mb-8">Pay suppliers or refund customers instantly.</p>

                                <button
                                    onClick={startScanner}
                                    className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    <Smartphone className="w-5 h-5" /> Start Camera
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200 border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center text-2xl font-black mb-4 uppercase shadow-inner">
                                {payee?.name?.[0]}
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{payee?.name}</h4>
                            <p className="text-emerald-600 font-bold text-sm bg-emerald-50 inline-block px-3 py-1 rounded-full mt-2">{payee?.role}</p>
                        </div>

                        <div className="space-y-6">
                            <input
                                type="number"
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-50 rounded-3xl p-8 text-5xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 border border-slate-200 transition-all text-center"
                                placeholder="₹0"
                            />
                            <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold uppercase text-slate-400">Business Balance</span>
                                <span className="text-sm font-black text-slate-900">₹{balance.toLocaleString('en-IN')}</span>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={loading || !amount}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Confirm Transfer'}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
