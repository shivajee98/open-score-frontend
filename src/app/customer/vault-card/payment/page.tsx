'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Smartphone, CheckCircle, IndianRupee, X, Upload, Camera,
    FileText, ChevronRight, Sparkles, ShieldCheck, Headphones,
    CheckCircle2, UploadCloud, QrCode as QrIcon
} from 'lucide-react';

import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { QRCodeSVG } from 'qrcode.react';

function VaultCardPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user } = useStore();

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            router.push('/customer/earnings');
            return;
        }
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const res = await apiFetch('/vault-cards');
            const requests = res.data || [];
            const req = requests.find((r: any) => r.id.toString() === id);
            if (!req) {
                toast.error("Request not found");
                router.push('/customer/earnings');
                return;
            }
            setRequest(req);
        } catch (e) {
            toast.error("Failed to fetch request details");
        } finally {
            setLoading(false);
        }
    };

    const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setScreenshot(file);
        const reader = new FileReader();
        reader.onload = () => setScreenshotPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!screenshot) {
            toast.error('Please upload payment screenshot');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('proof_image', screenshot);
            formData.append('payment_mode', 'UPI');

            await apiFetch(`/vault-cards/${id}/activate`, {
                method: 'POST',
                body: formData
            });

            setSuccess(true);
            toast.success('Payment proof uploaded successfully!');
            setTimeout(() => {
                router.push('/customer/support');
            }, 3000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to subit payment proof');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const upiId = "flipflops@upi"; // Provided by user as existing UPI id
    const amount = request?.activation_charge || 0;
    const upiUrl = `upi://pay?pa=${upiId}&pn=Flip%20Flops&mc=0000&mode=02&purpose=00&am=${amount}&tn=VaultCard_${id}`;

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Payment Received!</h2>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed">
                        Your payment for Vault Card activation is being verified. You are being redirected to our Chat Support for further assistance.
                    </p>
                    <div className="pt-4">
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[loading_3s_ease-in-out_infinite]" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-4 tracking-widest">Opening Support Chat...</p>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes loading {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 overflow-x-hidden">
            <title>Card Activation Payment | OpenScore</title>

            <div className="bg-indigo-600 p-6 pt-10 pb-20 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all mb-8 relative z-10"
                >
                    <ArrowLeft className="w-3 h-3" /> Go Back
                </button>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg rotate-3 text-indigo-600">
                            <Sparkles className="w-7 h-7 -rotate-3" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Activate Card</h1>
                            <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Secure Activation
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20 space-y-6">
                <div className="bg-[#0f172a] rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h4 className="text-base font-black uppercase tracking-tight">Pay via UPI</h4>
                            <p className="text-indigo-300 text-[9px] font-bold uppercase tracking-[0.15em]">Step 1: Make Payment of ₹{amount}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-5 border border-white/10 mb-6 group transition-all hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between mb-4 text-left">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.15em] block text-left">Merchant ID</span>
                                <p className="text-lg font-mono font-black tracking-wider text-white">{upiId}</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(upiId);
                                    toast.info('Copied!');
                                }}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-xl transition-all active:scale-90"
                            >
                                <FileText size={18} className="text-indigo-300" />
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden group/qr">
                            <div className="relative p-2 bg-white rounded-2xl shadow-inner border border-slate-100">
                                <QRCodeSVG 
                                    value={upiUrl} 
                                    size={180} 
                                    level="H" 
                                    includeMargin={false}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activation Charge</p>
                                <p className="text-2xl font-black text-slate-900">₹{amount}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = upiUrl;
                            link.click();
                            toast.info('Opening UPI Apps...');
                        }}
                        className="w-full py-4 bg-white text-indigo-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 mb-4"
                    >
                        <QrIcon size={16} /> Pay ₹{amount} with UPI
                    </button>

                    <p className="text-[9px] text-indigo-200/60 font-medium text-center italic leading-relaxed">
                        After successful payment, take a screenshot of the transaction and upload it below.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Step 2: Upload Payment Proof</h4>

                    {screenshotPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 bg-slate-50 group">
                            <img src={screenshotPreview} alt="Screenshot" className="w-full max-h-64 object-contain" />
                            <button
                                onClick={() => {
                                    setScreenshot(null);
                                    setScreenshotPreview(null);
                                }}
                                className="absolute top-3 right-3 w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Camera size={20} />
                                </div>
                                <span className="font-black text-[9px] uppercase tracking-widest text-indigo-600">Camera</span>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleScreenshotSelect} />
                            </label>
                            <label className="border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={20} />
                                </div>
                                <span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Gallery</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotSelect} />
                            </label>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!screenshot || uploading}
                    className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${!screenshot || uploading
                            ? 'bg-slate-200 text-slate-400'
                            : 'bg-emerald-600 text-white active:scale-95'
                        }`}
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-3 border-white rounded-full animate-spin border-t-transparent" />
                    ) : (
                        <>
                            Verify & Submit
                            <ChevronRight className="w-4 h-4 text-white/40" />
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest pt-4">
                    <Headphones size={12} className="text-indigo-500" /> Need help? Contact Support
                </div>
            </div>
        </div>
    );
}

export default function VaultCardPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <VaultCardPaymentContent />
        </Suspense>
    );
}
