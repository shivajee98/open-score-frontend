'use client';

/**
 * ============================================================
 * BOOK QR PAYMENT PAGE
 * Handles QR Security Deposit Payment & Address for Sub-Users
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Wallet, QrCode as QrIcon, Smartphone,
    CheckCircle, IndianRupee, X, Upload, Camera,
    FileText, ChevronRight, Sparkles, ShieldCheck,
    MapPin, Truck, Package, HelpCircle,
    CheckCircle2,
    XCircle,
    UploadCloud
} from 'lucide-react';

import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { useStore } from '@/store/useStore';

const SECURITY_AMOUNTS = [
    { value: '1000', label: 'Basic', desc: '10 QR Cards' },
    { value: '2000', label: 'Standard', desc: '25 QR Cards' },
    { value: '5000', label: 'Premium', desc: '75 QR Cards' },
];

export default function QrPaymentPage() {
    const router = useRouter();
    const { user } = useStore();
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        address: '',
        pincode: '',
        landmark: '',
        security_amount: '1000'
    });

    // Verification State
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setForm(prev => ({ ...prev, name: user.name, mobile: user.mobile }));
        }
    }, [user]);

    const handleNext = () => {
        if (!form.name || !form.mobile || !form.address || !form.pincode) {
            toast.error('Please fill all required fields');
            return;
        }
        if (form.mobile.length !== 10) {
            toast.error('Invalid mobile number');
            return;
        }
        if (form.pincode.length !== 6) {
            toast.error('Invalid pincode');
            return;
        }
        setStep(2);
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
            formData.append('name', form.name);
            formData.append('mobile', form.mobile);
            formData.append('address', `${form.address}, ${form.landmark}`.trim());
            formData.append('pincode', form.pincode);
            formData.append('amount', form.security_amount);
            formData.append('image', screenshot);

            await apiFetch('/auth/team/qr-book', {
                method: 'POST',
                body: formData
            });

            setSuccess(true);
            toast.success('QR Booking request submitted!');
            setTimeout(() => {
                router.push('/customer/my-work');
            }, 3000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setUploading(false);
        }
    };

    const upiUrl = `upi://pay?pa=6204342466@indianbk&pn=RISEX%20PAY&tr=TXN${Date.now()}&tn=QR%20Security%20Deposit&am=${form.security_amount}&cu=INR`;

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Request Sent!</h2>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed">
                        Your QR booking request for ₹{form.security_amount} has been received. Our team will verify the payment and ship your cards soon.
                    </p>
                    <div className="pt-4">
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[loading_3s_ease-in-out_infinite]" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-4 tracking-widest">Redirecting to Dashboard...</p>
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
            <title>Book QR Payment | OpenScore</title>

            {/* Header */}
            <div className="bg-[#4f46e5] p-6 pt-10 pb-20 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full blur-3xl -ml-24 -mb-24" />

                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="flex items-center gap-2 text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all mb-8 relative z-10"
                >
                    <ArrowLeft className="w-3 h-3" /> {step > 1 ? 'Go Back' : 'Cancel'}
                </button>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg rotate-3 text-indigo-600">
                            <QrIcon className="w-7 h-7 -rotate-3" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Book Physical QR</h1>
                            <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                <Truck className="w-3 h-3" /> Doorstep Delivery
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Step</span>
                        <span className="text-white text-2xl font-black">{step}<span className="text-white/20">/2</span></span>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20">
                {/* Progress Indicators */}
                <div className="flex items-center justify-between gap-2 px-1 mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-slate-200/50'}`} />
                        </div>
                    ))}
                </div>

                {step === 1 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100 space-y-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipping Details</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1.5 ml-1">Receiver Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1.5 ml-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Mobile Number"
                                        className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1.5 ml-1">Full Address</label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Flat, Street, Area..."
                                        rows={3}
                                        className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1.5 ml-1">Pincode</label>
                                        <input
                                            type="tel"
                                            maxLength={6}
                                            value={form.pincode}
                                            onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                                            placeholder="6 Digit PIN"
                                            className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1.5 ml-1">Landmark</label>
                                        <input
                                            type="text"
                                            value={form.landmark}
                                            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                                            placeholder="Optional"
                                            className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Proceed To Payment
                            <ChevronRight className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        {/* Amount Selection */}
                        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100">
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-4 text-center">Select Security Deposit Amount</label>
                            <div className="grid grid-cols-1 gap-3">
                                {SECURITY_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, security_amount: amt.value })}
                                        className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${form.security_amount === amt.value ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                    >
                                        <div className="text-left">
                                            <p className={`text-sm font-black ${form.security_amount === amt.value ? 'text-indigo-900' : 'text-slate-700'}`}>₹{Number(amt.value).toLocaleString()}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${form.security_amount === amt.value ? 'text-indigo-400' : 'text-slate-400'}`}>{amt.desc}</p>
                                        </div>
                                        {form.security_amount === amt.value && <CheckCircle2 size={18} className="text-indigo-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Hub */}
                        <div className="bg-[#0f172a] rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-black uppercase tracking-tight">Pay via UPI</h4>
                                    <p className="text-indigo-300 text-[9px] font-bold uppercase tracking-[0.15em]">Step 1: Make Payment</p>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Payee VPA</span>
                                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[7px] font-black px-2 py-0.5 rounded-full uppercase">
                                        <ShieldCheck size={8} /> Verified
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-lg font-mono font-black tracking-wider truncate">6204342466@indianbk</p>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText('6204342466@indianbk');
                                            toast.info('Copied!');
                                        }}
                                        className="shrink-0 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                                    >
                                        <FileText size={16} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = upiUrl;
                                    link.click();
                                    toast.info('Opening UPI Apps...');
                                }}
                                className="w-full py-4 bg-white text-indigo-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-white/10 active:scale-95 transition-all flex items-center justify-center gap-3 mb-4"
                            >
                                <QrIcon size={16} /> Open UPI App & Pay ₹{form.security_amount}
                            </button>

                            <p className="text-[9px] text-indigo-200/60 font-medium text-center italic">
                                Once payment is successful, please take a screenshot of the success screen and upload below.
                            </p>
                        </div>

                        {/* Upload Zone */}
                        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Step 2: Upload Screenshot</h4>
                            
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
                                         <input
                                             type="file"
                                             className="hidden"
                                             accept="image/*"
                                             capture="environment"
                                             onChange={handleScreenshotSelect}
                                         />
                                     </label>
                                     <label className="border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group">
                                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                             <UploadCloud size={20} />
                                         </div>
                                         <span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Gallery</span>
                                         <input
                                             type="file"
                                             className="hidden"
                                             accept="image/*"
                                             onChange={handleScreenshotSelect}
                                         />
                                     </label>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!screenshot || uploading}
                            className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                                !screenshot || uploading
                                    ? 'bg-slate-200 text-slate-400'
                                    : 'bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
                            }`}
                        >
                            {uploading ? (
                                <div className="w-5 h-5 border-3 border-white rounded-full animate-spin border-t-transparent" />
                            ) : (
                                <>
                                    Complete Booking
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 px-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-emerald-500" /> Secure Processing
                </div>
                <p className="text-[7px] font-bold text-slate-300 uppercase leading-relaxed tracking-tighter">
                    Orders are typically processed within 24-48 hours after payment verification. Delivery times may vary by location.
                </p>
            </div>
        </div>
    );
}
