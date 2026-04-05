'use client';

/**
 * ============================================================
 * ADD MONEY PAGE - MULTI-STEP FLOW
 * 1. Amount & Payment Selection -> Pay
 * 2. Purpose Selection
 * 3. Screenshot/Verification -> Create Support Ticket
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Wallet, QrCode as QrIcon, Smartphone,
    CheckCircle, IndianRupee, X, Upload, Camera,
    FileText, ChevronRight, Sparkles, ShieldCheck,
    Coins, ReceiptText, RefreshCcw
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import QRCode from 'react-qr-code';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

const PAYMENT_PURPOSES = [
    { value: 'emi_payment', label: 'EMI Payment', icon: <ReceiptText className="w-5 h-5" />, desc: 'Pay your virtual credit installments' },
    { value: 'wallet_topup', label: 'Wallet Top-up', icon: <Coins className="w-5 h-5" />, desc: 'Add balance to your wallet' },
    { value: 'services', label: 'Services', icon: <Sparkles className="w-5 h-5" />, desc: 'Payment for other services' },
];

export default function AddMoneyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1 State
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'qr'>('upi');
    const [showQR, setShowQR] = useState(false);

    // Step 2 State (Verification)
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 3 State (Purpose)
    const [paymentPurpose, setPaymentPurpose] = useState('emi_payment');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const getUpiUrl = () => {
        const transactionNote = paymentPurpose === 'emi_payment' ? "EMI Payment" : "Wallet Topup";
        return `upi://pay?pa=9161168840@uboi&pn=Flip%20Flops&mc=0000&mode=02&purpose=00&am=${amount}&tn=${encodeURIComponent(transactionNote)}`;
    };

    const handleStep1Submit = () => {
        if (!amount || Number(amount) < 1) {
            toast.error('Minimum amount is 1');
            return;
        }

        if (paymentMethod === 'qr') {
            setShowQR(true);
        } else {
            // UPI Intent
            const upiUrl = getUpiUrl();
            const link = document.createElement('a');
            link.href = upiUrl;
            link.click();
            toast.info("Opening UPI App...");
        }
    };

    const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setScreenshot(file);
        const reader = new FileReader();
        reader.onload = () => setScreenshotPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleFinalSubmit = async () => {
        if (!screenshot) {
            toast.error('Please upload your payment screenshot');
            setStep(2);
            return;
        }

        setUploading(true);
        try {
            const purposeLabel = PAYMENT_PURPOSES.find(p => p.value === paymentPurpose)?.label || paymentPurpose;
            const ticketSubject = `Payment Done - ${purposeLabel} - ${Number(amount).toLocaleString()}`;
            const ticketMessage = [
                `Payment Confirmation`,
                ``,
                `Amount: ${Number(amount).toLocaleString()}`,
                `Purpose: ${purposeLabel}`,
                transactionId ? `Transaction ID: ${transactionId}` : '',
                ``,
                `I have completed the payment. Please verify and process.`
            ].filter(Boolean).join('\n');

            const formData = new FormData();
            formData.append('subject', ticketSubject);
            formData.append('issue_type', paymentPurpose); // Use the selected purpose as issue_type
            formData.append('message', ticketMessage);
            formData.append('priority', 'high');
            formData.append('payment_amount', amount);
            formData.append('attachment', screenshot);

            await apiFetch('/support/tickets', {
                method: 'POST',
                body: formData
            });

            setUploadSuccess(true);
            toast.success('Submitted successfully!');

            // Auto redirect to support after success
            setTimeout(() => {
                router.push('/customer/support');
            }, 2000);

        } catch (error: any) {
            console.error('Submission failed:', error);
            toast.error(error.message || 'Failed to submit confirmation');
        } finally {
            setUploading(false);
        }
    };

    const renderProgress = () => (
        <div className="flex items-center justify-between gap-2 px-1 mb-8">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                    <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`} />
                    {s < 3 && <div className={`w-1 h-1 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-slate-300'}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 overflow-x-hidden">
            <title>Add Money | OpenScore</title>

            {/* Header */}
            <div className="bg-[#0f172a] p-6 pt-10 pb-20 rounded-b-[3rem] shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="flex items-center gap-2 text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all mb-8 relative z-10"
                >
                    <ArrowLeft className="w-3 h-3" /> {step > 1 ? 'Go Back' : 'Cancel'}
                </button>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3">
                            <Wallet className="w-7 h-7 text-white -rotate-3" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Add Money</h1>
                            <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" /> Secure UPI Transaction
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Step</span>
                        <span className="text-white text-2xl font-black">{step}<span className="text-white/20">/3</span></span>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20">
                {renderProgress()}

                {/* STEP 1: AMOUNT & METHOD */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">How much will you pay?</label>

                            <div className="relative mb-6">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-3xl"></span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full p-6 pl-14 text-4xl font-black text-slate-900 bg-slate-50/50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-200"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {QUICK_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(amt.toString())}
                                        className={`py-3 rounded-xl font-black text-[11px] uppercase transition-all border-2 ${amount === amt.toString()
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        {amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`p-5 rounded-[1.5rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'upi'
                                        ? 'border-emerald-500 bg-emerald-50/50'
                                        : 'border-slate-100 bg-slate-50/30'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'upi' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'upi' ? 'text-emerald-700' : 'text-slate-500'}`}>UPI App</span>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('qr')}
                                    className={`p-5 rounded-[1.5rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'qr'
                                        ? 'border-emerald-500 bg-emerald-50/50'
                                        : 'border-slate-100 bg-slate-50/30'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'qr' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <QrIcon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'qr' ? 'text-emerald-700' : 'text-slate-500'}`}>QR Code</span>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleStep1Submit}
                            disabled={!amount}
                            className="w-full py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            <IndianRupee className="w-4 h-4 text-emerald-400" />
                            {paymentMethod === 'upi' ? 'Pay Now' : 'Show QR Code'}
                            <ChevronRight className="w-4 h-4 text-white/40" />
                        </button>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!amount}
                            className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] hover:bg-indigo-50 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            Update Payment Status
                            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </button>
                    </div>
                )}

                {/* STEP 2: VERIFICATION (Screenshot) */}
                {step === 2 && !uploadSuccess && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 border border-slate-100 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Transaction ID (UTR)</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter UTR from payment app"
                                        className="w-full pl-12 pr-4 py-4 text-sm font-black text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 text-center">Proof of Payment</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScreenshotSelect}
                                    className="hidden"
                                />

                                {screenshotPreview ? (
                                    <div className="relative rounded-[1.5rem] overflow-hidden border-2 border-emerald-500 bg-slate-900 group">
                                        <img
                                            src={screenshotPreview}
                                            alt="Payment screenshot"
                                            className="w-full max-h-64 object-contain opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <button
                                            onClick={() => {
                                                setScreenshot(null);
                                                setScreenshotPreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-4 right-4 w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all active:scale-90"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                            <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Screenshot Selected
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50/50 flex flex-col items-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all active:scale-[0.98] group"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                            <Upload className="w-7 h-7 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-slate-800 uppercase tracking-widest">Upload Screenshot</span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Required to proceed</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            disabled={!screenshot}
                            className="w-full py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                )}

                {/* STEP 3: PURPOSE SELECTION */}
                {step === 3 && !uploadSuccess && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 text-center">Payment Purpose</label>

                            <div className="space-y-3">
                                {PAYMENT_PURPOSES.map((purpose) => (
                                    <button
                                        key={purpose.value}
                                        onClick={() => setPaymentPurpose(purpose.value)}
                                        className={`w-full p-5 rounded-[1.5rem] border-2 flex items-center gap-4 transition-all text-left ${paymentPurpose === purpose.value
                                            ? 'border-emerald-500 bg-emerald-50/50'
                                            : 'border-slate-100 bg-slate-50/30'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentPurpose === purpose.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {purpose.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-black text-sm tracking-tight ${paymentPurpose === purpose.value ? 'text-emerald-900' : 'text-slate-700'}`}>{purpose.label}</h4>
                                            <p className={`text-[10px] font-bold ${paymentPurpose === purpose.value ? 'text-emerald-600' : 'text-slate-400'}`}>{purpose.desc}</p>
                                        </div>
                                        {paymentPurpose === purpose.value && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-600/5 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                <IndianRupee className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mt-0.5">Payment for {Number(amount).toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-emerald-600/60 leading-relaxed mt-0.5">Please select the correct purpose so we can process it correctly.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleFinalSubmit}
                            disabled={uploading}
                            className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${uploading
                                ? 'bg-slate-200 text-slate-400'
                                : 'bg-emerald-600 text-white shadow-emerald-600/30 active:scale-95'
                                }`}
                        >
                            {uploading ? (
                                <div className="w-5 h-5 border-3 border-white rounded-full animate-spin border-t-transparent" />
                            ) : (
                                <>
                                    Update Payment Status
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {uploadSuccess && (
                    <div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl p-8 py-12 flex flex-col items-center text-center gap-6 border border-emerald-500/20 animate-in zoom-in-95 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-3 uppercase">Verification Sent!</h3>
                            <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                We've created a support ticket and attached your screenshot. Redirecting you to chat...
                            </p>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]" />
                        </div>
                    </div>
                )}

                {/* SECURITY FOOTER */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Bank-Grade 256-bit Security</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center px-8 leading-relaxed">
                        By adding money, you agree to our <br />
                        <span className="text-slate-600 underline">Terms of Service</span> and <span className="text-slate-600 underline">Privacy Policy</span>
                    </p>
                </div>
            </div>

            {/* QR MODAL */}
            {showQR && (
                <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
                        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <button
                                onClick={() => {
                                    setShowQR(false);
                                }}
                                className="absolute right-6 top-6 w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                            <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl rotate-6">
                                <QrIcon className="text-emerald-600 w-10 h-10 -rotate-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Pay with QR</h3>
                            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80">Scanning for {Number(amount).toLocaleString()}</p>
                        </div>

                        <div className="p-10 flex flex-col items-center bg-white">
                            <div className="bg-white p-2 rounded-[2.5rem] border-8 border-slate-50 shadow-inner mb-8 transition-all hover:scale-105 duration-700">
                                <QRCode value={getUpiUrl()} size={200} className="w-[200px] h-auto rounded-[1.5rem]" />
                            </div>

                            <div className="space-y-6 w-full text-center">
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative">
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] mb-1">Payee VPA</p>
                                    <p className="text-slate-900 font-black text-base tracking-tight uppercase">9161168840@uboi</p>
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] font-black p-1.5 px-3 rounded-lg uppercase tracking-tighter shadow-lg shadow-blue-500/30">Verified</div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowQR(false);
                                    }}
                                    className="w-full py-4 bg-[#0f172a] text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed After Paying
                                    <ChevronRight className="w-3 h-3 text-white/40" />
                                </button>

                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.1em] leading-relaxed max-w-[200px] mx-auto">
                                    Open any UPI app like PhonePe or GPay and <span className="text-slate-900">Scan this code</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
