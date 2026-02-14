'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, clearAuthState } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import {
    Store,
    Briefcase,
    Users,
    TrendingUp,
    MapPin,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    PartyPopper,
    Mail,
    User,
    ChevronDown,
    Lock,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/loanUtils';

function MerchantOnboardingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);

    useEffect(() => {
        const s = searchParams.get('step');
        if (s) setStep(parseInt(s));
    }, [searchParams]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.is_onboarded) {
                router.replace(user.role === 'ADMIN' ? '/admin' : '/customer');
                return;
            }
            // Pre-fill form if data exists
            if (user.name) setFormData(prev => ({ ...prev, name: user.name }));
            if (user.email) setFormData(prev => ({ ...prev, email: user.email }));
        } else {
            router.replace('/');
            return;
        }
        setCheckingAuth(false);
    }, [router]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        business_name: '',
        business_nature: '',
        customer_segment: '',
        daily_turnover: '',
        business_address: '',
        pin: '',
        confirm_pin: '',
        app_pin: '',
        app_pin_confirmation: ''
    });

    // Image Upload State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('Image is too large. Max 10MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Ensure the filename has a .jpg extension for the server
                            const fileName = `profile_${Date.now()}.jpg`;
                            const newFile = new File([blob], fileName, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            setImageFile(newFile);
                            setImagePreview(URL.createObjectURL(newFile));
                        }
                    }, 'image/jpeg', 0.8);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const turnoverOptions = [
        { label: "₹1,00,000 - ₹5,00,000", sub: "Cashback: ₹500 - ₹2,000", value: "1l-5l" },
        { label: "₹5,00,000 - ₹10,00,000", sub: "Cashback: ₹2,000 - ₹5,000", value: "5l-10l" },
        { label: "₹10,00,000 - ₹20,00,000", sub: "Cashback: ₹5,000 - ₹10,000", value: "10l-20l" },
        { label: "₹20,00,000 - ₹50,00,000", sub: "Cashback: ₹10,000 - ₹25,000", value: "20l-50l" },
        { label: "₹50,00,000+", sub: "Cashback: ₹25,000+", value: "50l+" },
    ];

    const handleStep1Submit = () => {
        // Update local storage for persistence across reloads (optional)
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        u.name = formData.name;
        u.email = formData.email;
        localStorage.setItem('user', JSON.stringify(u));

        // Proceed to next step
        setStep(2);
    };



    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('email', formData.email);
            formDataObj.append('business_name', formData.business_name);

            if (imageFile) {
                formDataObj.append('profile_image', imageFile, imageFile.name);
            }

            formDataObj.append('app_pin', formData.app_pin);
            formDataObj.append('app_pin_confirmation', formData.app_pin_confirmation);

            // Complete Onboarding (Basic Info)
            await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: formDataObj
            });

            // Sync user in local storage
            const updatedUser = await apiFetch('/auth/me');
            const user = { ...updatedUser, is_onboarded: true };
            localStorage.setItem('user', JSON.stringify(user));

            router.push('/customer');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) return null; // Redirecting...

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-4 text-slate-900 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden border border-slate-100">

                {/* Header Section */}
                <div className="text-center mb-10 relative">
                    {/* Back Button - Persistent */}
                    <button
                        onClick={async () => { await clearAuthState(); router.replace('/'); }}
                        className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-10"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl mb-4 shadow-xl shadow-emerald-600/20">
                        <Store size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Merchant Connect</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Onboarding Protocol</p>
                </div>

                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 mb-8 text-center">{error}</div>}

                {/* Step 1: Personal Info Only */}
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-black text-slate-900">Store Identification</h3>
                        <p className="text-slate-400 text-xs font-medium">Verify your business presence</p>
                    </div>
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Shop / Business Name"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                value={formData.business_name}
                                onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="relative">
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${imagePreview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                {imagePreview ? (
                                    <div className="relative w-full h-full p-2">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                            <p className="text-white text-[10px] font-black uppercase">Change Photo</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-10 h-10 mb-3 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                                            <Upload size={20} />
                                        </div>
                                        <p className="mb-1 text-xs font-black text-slate-700 uppercase tracking-tight">Upload Shop Image</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* Security Sections */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">App Lock (4-Digits)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="password"
                                        maxLength={4}
                                        inputMode="numeric"
                                        placeholder="Set PIN"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-center text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                        value={formData.app_pin}
                                        onChange={e => setFormData({ ...formData, app_pin: e.target.value.replace(/\D/g, '') })}
                                    />
                                    <input
                                        type="password"
                                        maxLength={4}
                                        inputMode="numeric"
                                        placeholder="Confirm"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-center text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                        value={formData.app_pin_confirmation}
                                        onChange={e => setFormData({ ...formData, app_pin_confirmation: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-emerald-600">Payment PIN (6-Digits)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="password"
                                        maxLength={6}
                                        inputMode="numeric"
                                        placeholder="Set PIN"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-center text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                        value={formData.pin}
                                        onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                                    />
                                    <input
                                        type="password"
                                        maxLength={6}
                                        inputMode="numeric"
                                        placeholder="Confirm"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-center text-sm focus:border-emerald-600 focus:bg-white transition-all outline-none"
                                        value={formData.confirm_pin}
                                        onChange={e => setFormData({ ...formData, confirm_pin: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={!formData.name || !formData.email.includes('@') || !formData.business_name || formData.app_pin.length !== 4 || formData.pin.length !== 6 || loading}
                        onClick={handleSubmit}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Initializing Store...' : <>Complete Merchant Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </div>

            </div>
            <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest text-center">Merchant Protocol Verified</p>
        </div>
    );
}

export default function MerchantOnboarding() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MerchantOnboardingForm />
        </Suspense>
    );
}
