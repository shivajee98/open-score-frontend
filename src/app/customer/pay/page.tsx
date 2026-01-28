'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import PinModal from '@/components/PinModal';
import { Scan, X, ArrowRight, Smartphone, Search, Home, QrCode, Receipt, Lock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { useRouter } from 'next/navigation';

export default function CustomerPay() {
    const router = useRouter(); // Instantiated router
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [lockedBalance, setLockedBalance] = useState(0);
    const [payees, setPayees] = useState([]);
    const [payee, setPayee] = useState<any>(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scannerInstance, setScannerInstance] = useState<any>(null);
    const [successData, setSuccessData] = useState<any>(null);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    useEffect(() => {
        apiFetch('/wallet/balance').then(data => {
            setBalance(data.balance);
            setLockedBalance(data.locked_balance || 0);
        });
    }, []);

    const startScanner = async () => {
        setScanning(true);
        setError('');

        // Dynamic import to avoid SSR issues
        const { Html5Qrcode } = await import('html5-qrcode');

        setTimeout(async () => {
            try {
                if (!document.getElementById("reader")) {
                    throw new Error("Scanner element not found");
                }
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
                const errorMessage = err?.name === 'NotAllowedError'
                    ? "Camera permission denied"
                    : (err?.message || "Failed to start camera");

                toast.error(errorMessage);
                setError(errorMessage);
                setScanning(false);
                setScannerInstance(null);
            }
        }, 300);
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
            if (scannerInstance?.isScanning) {
                scannerInstance.stop().catch(() => { });
            }
        }
    }, [scannerInstance]);

    function onScanSuccess(decodedText: string) {
        stopScanner();
        // Identify if it is a VPA or UUID
        console.log("Scanned QR:", decodedText);
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
            console.error("Payee fetch error:", err);
            setError('Invalid QR or User Not Found');
            toast.error('Invalid QR or User Not Found');
        } finally {
            setLoading(false);
        }
    }

    const [pinModalOpen, setPinModalOpen] = useState(false);

    const handleInitiatePay = () => {
        if (!amount || parseFloat(amount) <= 0) return;

        const payAmount = parseFloat(amount);

        if (payAmount > balance) {
            if (payAmount <= (balance + lockedBalance)) {
                setError('Insufficient available balance. This amount is currently in LOCKED state – Please Contact Agent for release.');
            } else {
                setError('Insufficient wallet balance');
            }
            return;
        }
        setPinModalOpen(true);
    };

    const handlePay = async (pin: string) => {
        setPinModalOpen(false);
        setLoading(true);
        setError('');

        try {
            // Artificial delay to prevent button flickering and provide feedback
            const [res] = await Promise.all([
                apiFetch('/payment/pay', {
                    method: 'POST',
                    body: JSON.stringify({
                        payee_wallet_uuid: payee.payee_wallet_uuid,
                        amount: parseFloat(amount),
                        pin: pin
                    })
                }),
                new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5s loading
            ]);

            setSuccessData({
                amount: amount,
                payeeName: payee.name,
                ref: res.ref
            });
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Scan & Pay" navItems={navItems}>
            <div className="max-w-xl mx-auto">
                <PaymentSuccessModal
                    isOpen={!!successData}
                    amount={successData?.amount || '0'}
                    payeeName={successData?.payeeName || ''}
                    transactionRef={successData?.ref || ''}
                    onClose={() => router.push('/customer')}
                />

                <PinModal
                    isOpen={pinModalOpen}
                    title={`Pay ₹${amount}`}
                    onComplete={handlePay}
                    onClose={() => setPinModalOpen(false)}
                />

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">{error}</div>}

                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <div className="mb-8 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                                    <Search className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Pay Anyone</h3>
                                <p className="text-slate-500 font-medium">Enter mobile number or Open Score ID</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="relative">
                                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="Enter mobile number or Open Score ID"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                fetchPayeeDetails(e.currentTarget.value.trim());
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={(e) => {
                                        const input = ((e.target as HTMLElement).previousElementSibling as HTMLInputElement);
                                        if (input?.value.trim()) {
                                            fetchPayeeDetails(input.value.trim());
                                        }
                                    }}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">Or</span>
                                </div>
                            </div>

                            <button
                                onClick={startScanner}
                                className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <Scan className="w-5 h-5" /> Scan QR Code
                            </button>
                        </div>

                        {scanning && (
                            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                                <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white/20"></div>
                                <button
                                    onClick={stopScanner}
                                    className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" /> Cancel Scan
                                </button>
                                <p className="text-white/50 text-xs mt-4 uppercase tracking-widest font-bold">Align QR code within frame</p>
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
                            <p className="text-blue-600 font-bold text-sm bg-blue-50 inline-block px-3 py-1 rounded-full mt-2">{payee?.vpa || 'Verified Merchant'}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-300">₹</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-50 rounded-3xl p-8 pl-16 text-5xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200 transition-all text-center"
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex flex-col gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-slate-400">Available Balance</span>
                                    <span className="text-sm font-black text-slate-900">₹{balance.toLocaleString('en-IN')}</span>
                                </div>
                                {lockedBalance > 0 && (
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                        <span className="text-xs font-bold uppercase text-amber-500 flex items-center gap-1">
                                            <Lock size={12} /> Locked Balance
                                        </span>
                                        <span className="text-sm font-black text-slate-400">₹{lockedBalance.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleInitiatePay}
                                disabled={loading || !amount}
                                className="w-full h-[4.5rem] bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Proceed to Pay'}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Cancel Transaction</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
