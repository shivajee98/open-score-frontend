'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, CreditCard, CheckCircle, Smartphone, Wallet, QrCode, ArrowRight, Camera, UploadCloud, Zap, Gift, ShieldCheck, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import BackButton from '@/components/BackButton';

export default function VirtualCardActivationPage() {
    const router = useRouter();
    const { data: user } = useApi('/auth/me');
    const { data: requests, mutate } = useApi('/vault-cards/my-requests');
    
    const [step, setStep] = useState(1); // 1: Preview, 2: Offer, 3: Payment
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

    if (!activeRequest) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center animate-pulse">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Checking available cards...</p>
                </div>
            </div>
        );
    }

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

            if (res.error) throw new Error(res.error);

            toast.success(paymentMode === 'WALLET' ? 'Card activated! Awaiting final approval.' : 'Payment proof uploaded! Awaiting approval.');
            mutate();
            router.push('/customer');
        } catch (err: any) {
            toast.error(err.message || 'Activation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            {/* Header */}
            <div className="bg-white px-6 py-8 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
                <BackButton className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={24} />
                </BackButton>
                <div className="text-right">
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Virtual Card</h1>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Step {step} of 3</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 mt-8">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-[950] text-slate-900 tracking-tight uppercase leading-none">Your Card is Ready</h2>
                            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">A sleek digital asset for your finances</p>
                        </div>

                        {/* Card Animation Preview */}
                        <div className="relative perspective-[1000px] mb-12 h-52 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden transform group-hover:rotate-x-12 transition-transform duration-700 ease-out">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Zap className="text-amber-400 fill-amber-400" size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Registered by</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{activeRequest.agent?.name || 'Authorized Agent'}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="font-mono text-lg tracking-[0.3em] text-white/90">•••• •••• •••• 4032</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[7px] font-black uppercase tracking-widest opacity-40">Card Holder</p>
                                            <p className="text-xs font-black uppercase tracking-wider">{user?.name}</p>
                                        </div>
                                        <div className="w-10 h-6 bg-white/5 rounded-md border border-white/10 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-orange-500 rounded-full -mr-1"></div>
                                            <div className="w-4 h-4 bg-red-600/80 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Activation <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-[950] text-slate-900 tracking-tight uppercase leading-none">Special Activation Offer</h2>
                            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Choose your benefit</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden mb-10">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                                    <Gift size={32} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Activation Fee: ₹999</h3>
                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1">Get guaranteed cashback on payment</p>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Wallet size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Instant Cashback</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Get ₹100 flat cashback if you pay via your Open Score Wallet.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                        <QrCode size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Mega UPI Cashback</h4>
                                        <p className="text-xs font-bold text-slate-600 mt-1">Get ₹500 flat cashback if you pay via UPI/QR code and upload screenshot.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Activate My Card Now <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-[950] text-slate-900 tracking-tight uppercase leading-none">Select Payment Method</h2>
                            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Choose how you want to pay</p>
                        </div>

                        <div className="space-y-4 mb-10">
                            {/* Wallet Option */}
                            <div 
                                onClick={() => setPaymentMode('WALLET')}
                                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${paymentMode === 'WALLET' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${paymentMode === 'WALLET' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black uppercase tracking-tight ${paymentMode === 'WALLET' ? 'text-white' : 'text-slate-900'}`}>Pay via Wallet</h4>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${paymentMode === 'WALLET' ? 'text-indigo-200' : 'text-emerald-600'}`}>₹100 Cashback</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMode === 'WALLET' ? 'border-white bg-white' : 'border-slate-200'}`}>
                                    {paymentMode === 'WALLET' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                                </div>
                            </div>

                            {/* UPI Option */}
                            <div 
                                onClick={() => setPaymentMode('UPI')}
                                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${paymentMode === 'UPI' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${paymentMode === 'UPI' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black uppercase tracking-tight ${paymentMode === 'UPI' ? 'text-white' : 'text-slate-900'}`}>Pay via UPI / QR</h4>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${paymentMode === 'UPI' ? 'text-indigo-200' : 'text-emerald-600'}`}>₹500 Cashback</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMode === 'UPI' ? 'border-white bg-white' : 'border-slate-200'}`}>
                                    {paymentMode === 'UPI' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                                </div>
                            </div>
                        </div>

                        {paymentMode === 'UPI' && (
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl mb-10 animate-in zoom-in-95 duration-500">
                                <div className="text-center mb-8">
                                    <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100 mb-4">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay-openscore@upi" className="w-32 h-32" alt="Payment QR" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">UPI ID: pay-openscore@upi</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Payment Screenshot</label>
                                    
                                    {previewUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-600 aspect-video">
                                            <img src={previewUrl} className="w-full h-full object-cover" />
                                            <button onClick={() => { setProofImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-lg">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                                <Camera className="text-slate-300 group-hover:text-indigo-500 mb-2" size={24} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camera</span>
                                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                            </label>
                                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                                <UploadCloud className="text-slate-300 group-hover:text-indigo-500 mb-2" size={24} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gallery</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleActivate}
                            disabled={!paymentMode || (paymentMode === 'UPI' && !proofImage) || isSubmitting}
                            className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Confirm & Activate Card <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                )}

                {/* Secure Trust Badge */}
                <div className="mt-12 flex items-center justify-center gap-6 opacity-30 grayscale">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Verified Activation</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
