'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    Smartphone,
    ArrowRight,
    Sparkles,
    Trophy,
    Gift,
    QrCode,
    Copy,
    Zap,
    TrendingUp,
    Shield,
    Camera,
    UploadCloud,
    X
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/loanUtils';
import { QRCodeSVG } from 'qrcode.react';
import BackButton from '@/components/BackButton';

export default function VirtualCardActivationPage() {
    const router = useRouter();
    const { data: user } = useApi('/auth/me');
    const { data: requests, mutate } = useApi('/vault-cards/my-requests');
    
    const [step, setStep] = useState(1);
    const [paymentMode, setPaymentMode] = useState<'WALLET' | 'UPI' | null>(null);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeRequest = requests?.[0];

    useEffect(() => {
        if (requests && requests.length === 0) {
            router.push('/customer');
        }
    }, [requests, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleActivate = async () => {
        if (!paymentMode) return;
        if (paymentMode === 'UPI' && !proofImage) {
            toast.error('Please upload payment screenshot');
            return;
        }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('payment_mode', paymentMode);
            if (proofImage) fd.append('proof_image', proofImage);

            const res = await apiFetch(`/vault-cards/${activeRequest.id}/activate`, {
                method: 'POST',
                body: fd
            });

            toast.success(paymentMode === 'WALLET' ? 'Card activated! Awaiting final approval.' : 'Payment proof uploaded! Awaiting approval.');
            mutate();
            router.push('/customer');
        } catch (err: any) {
            toast.error(err.message || 'Activation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const history = requests || [];
    const hasActiveRequest = activeRequest && ['INITIATED', 'PENDING_CHARGE', 'PENDING_PAYMENT', 'PENDING_APPROVAL'].includes(activeRequest.status);

    if (history.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                    <CreditCard size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Active Cards</h2>
                <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed mb-8">
                    You don't have any virtual card requests yet. Please contact an agent to start your activation.
                </p>
                <button 
                    onClick={() => router.push('/customer')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // If there is no "actionable" request, show history
    if (!hasActiveRequest) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
                <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-50">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm"><ArrowLeft size={20} /></button>
                    <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Card History</h1>
                    <div className="w-10"></div>
                </div>

                <div className="px-6 max-w-md mx-auto space-y-6">
                    <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black tracking-tight mb-1">Vault Status</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-80">Payment & Activation Log</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {history.map((req: any) => (
                            <div key={req.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            req.status === 'ACTIVATED' ? "bg-emerald-50 text-emerald-600" : 
                                            req.status === 'REJECTED' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID</p>
                                            <p className="text-sm font-black text-slate-900">#{req.id}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        req.status === 'ACTIVATED' ? "bg-emerald-500 text-white" : 
                                        req.status === 'REJECTED' ? "bg-rose-500 text-white" : 
                                        req.status === 'PENDING_APPROVAL' ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                    )}>
                                        {req.status.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                                        <p className="text-[10px] font-bold text-slate-900">{new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fee</p>
                                        <p className="text-[10px] font-bold text-slate-900">₹{req.activation_charge || '999'}</p>
                                    </div>
                                </div>
                                {req.rejection_reason && (
                                    <div className="mt-4 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                                        <p className="text-[10px] font-bold text-rose-600 leading-relaxed">{req.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const upiId = "9161168840@uboi";
    const upiUrl = `upi://pay?pa=${upiId}&pn=Flip%20Flops&am=999&tn=Vault%20Card%20Activation`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("UPI ID copied!");
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 overflow-x-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-50">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Virtual Card</h1>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={cn("w-4 h-1 rounded-full transition-all duration-500", step >= s ? "bg-emerald-500" : "bg-slate-200")} />
                        ))}
                    </div>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="px-6 max-w-md mx-auto">
                {step === 1 && (
                    <div className="space-y-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 animate-pulse">
                                <Sparkles size={12} fill="currentColor" /> Ready to Unlock
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-2">
                                YOUR <span className="text-emerald-500">ELITE CARD</span> IS READY
                            </h2>
                            <p className="text-xs font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                                Access seamless payments and exclusive merchant benefits instantly.
                            </p>
                        </div>

                        {/* Card Preview - Redesigned & Centered */}
                        <div className="relative group perspective-[1000px] w-full max-w-[320px]">
                            <div className="absolute -inset-4 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse"></div>
                            
                            <div className="relative aspect-[1.586/1] w-full bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-3xl p-6 text-white shadow-2xl overflow-hidden border border-white/10 [transform:rotateX(10deg)_rotateY(-5deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)] transition-all duration-700">
                                {/* Circuit Texture */}
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                    <svg width="100%" height="100%">
                                        <pattern id="circuit-card" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                            <path d="M0 50 h 40 v 40 h 40" fill="none" stroke="white" strokeWidth="1" />
                                            <circle cx="80" cy="90" r="2" fill="white" />
                                        </pattern>
                                        <rect width="100%" height="100%" fill="url(#circuit-card)" />
                                    </svg>
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                    <Shield size={18} className="text-emerald-300" />
                                                </div>
                                                <span className="text-xs font-black tracking-widest italic">VAULT</span>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Platinum</p>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex gap-3 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="text-lg font-black tracking-[0.2em] opacity-40">••••</div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-bold text-emerald-200/60 uppercase tracking-widest mb-1">Card Holder</p>
                                                <p className="text-sm font-black tracking-tight uppercase">{user?.name || 'VALUED CUSTOMER'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black tracking-tighter opacity-80">DEBIT</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center pt-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                                <Trophy size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Activation Offer</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Limited Period Reward</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-lg font-black text-slate-400">₹</span>
                                    <span className="text-5xl font-black text-slate-900 tracking-tighter">999</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">One-Time Lifetime Fee</p>
                                
                                <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

                                <div className="space-y-4 w-full text-left">
                                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Gift size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Upto ₹300 Cashback</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">On your first transaction</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Boost Credit Limit</p>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Instant limit increment after activation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Activate Now <Zap size={18} fill="currentColor" />
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
                        <div className="text-center pt-4">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Complete Payment</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select your preferred method</p>
                        </div>

                        <div className="space-y-4">
                            {/* Wallet Option */}
                            <div 
                                onClick={() => setPaymentMode('WALLET')}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group",
                                    paymentMode === 'WALLET' ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/5" : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", paymentMode === 'WALLET' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Instant Wallet</h4>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Get ₹100 Extra Cashback</p>
                                        </div>
                                    </div>
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", paymentMode === 'WALLET' ? "border-emerald-500 bg-emerald-500" : "border-slate-200")}>
                                        {paymentMode === 'WALLET' && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                            </div>

                            {/* UPI Option */}
                            <div 
                                onClick={() => setPaymentMode('UPI')}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group",
                                    paymentMode === 'UPI' ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/5" : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", paymentMode === 'UPI' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                            <QrCode size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">UPI / QR Scan</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Instant Verification</p>
                                        </div>
                                    </div>
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", paymentMode === 'UPI' ? "border-emerald-500 bg-emerald-500" : "border-slate-200")}>
                                        {paymentMode === 'UPI' && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>

                                {paymentMode === 'UPI' && (
                                    <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="flex flex-col items-center">
                                            <div className="p-3 bg-white rounded-3xl border border-slate-100 shadow-lg mb-4">
                                                <QRCodeSVG 
                                                    value={upiUrl} 
                                                    size={160}
                                                    level="M"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Scan QR to Pay ₹999</p>
                                            
                                            <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                                <div className="flex flex-col">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Merchant UPI ID</p>
                                                    <p className="text-xs font-black text-slate-900">{upiId}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(upiId); }}
                                                    className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Payment Screenshot</label>
                                            
                                            {previewUrl ? (
                                                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-video shadow-lg">
                                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                                    <button onClick={() => { setProofImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-rose-600 transition-colors">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                                        <Camera className="text-slate-300 group-hover:text-emerald-500 mb-2" size={24} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camera</span>
                                                        <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                                    </label>
                                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                                        <UploadCloud className="text-slate-300 group-hover:text-emerald-500 mb-2" size={24} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gallery</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
                                            <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-medium text-blue-700 leading-relaxed">
                                                Please take a screenshot of your successful payment and upload it above for verification.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleActivate}
                                disabled={!paymentMode || (paymentMode === 'UPI' && !proofImage) || isSubmitting}
                                className={cn(
                                    "w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3",
                                    paymentMode === 'WALLET' ? "bg-slate-900 text-white shadow-slate-900/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Confirm & Activate <ArrowRight size={18} /></>
                                )}
                            </button>
                            <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">
                                <ShieldCheck size={10} className="inline mr-1" /> Secure 256-bit Encrypted Transaction
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
