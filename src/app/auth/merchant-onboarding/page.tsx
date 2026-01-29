'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
    Store,
    Briefcase,
    Users,
    TrendingUp,
    MapPin,
    ArrowRight,
    CheckCircle2,
    PartyPopper,
    Mail,
    User,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/loanUtils';

export default function MerchantOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
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
        business_address: ''
    });

    const turnoverOptions = [
        { label: "₹1,000 - ₹5,000", sub: "Cashback: ₹10 - ₹50", value: "1k-5k" },
        { label: "₹5,000 - ₹10,000", sub: "Cashback: ₹50 - ₹200", value: "5k-10k" },
        { label: "₹10,000 - ₹20,000", sub: "Cashback: ₹200 - ₹400", value: "10k-20k" },
        { label: "₹20,000 - ₹50,000", sub: "Cashback: ₹500 - ₹1,000", value: "20k-50k" },
        { label: "₹50,000 - ₹1,00,000", sub: "Cashback: ₹1,000 - ₹2,000", value: "50k-1l" },
        { label: "₹1,00,000 - ₹2,00,000", sub: "Cashback: ₹2,000 - ₹4,000", value: "1l-2l" },
        { label: "₹2,00,000 - ₹5,00,000", sub: "Cashback: ₹3,000 - ₹5,000", value: "2l-5l" },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            // Sync user in local storage and cookies
            const updatedUser = await apiFetch('/auth/me');
            const user = { ...updatedUser, is_onboarded: true };
            localStorage.setItem('user', JSON.stringify(user));
            document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/10 border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <PartyPopper size={48} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Congratulations!</h1>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Your merchant account is now active. We've credited <span className="text-emerald-600 font-black">₹250</span> to your wallet as a welcome bonus.
                    </p>
                    <button
                        onClick={() => router.push('/customer')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-base uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

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

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xl mb-4 shadow-xl shadow-blue-600/20">
                        <Store size={28} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Merchant Setup</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Step {step} of 3</p>
                </div>

                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 mb-8 text-center">{error}</div>}

                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-base font-black">Basic Information</h3>
                            <p className="text-slate-400 text-xs font-medium">Let's start with who you are</p>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            disabled={!formData.name || !formData.email.includes('@')}
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {/* Step 2: Business Info */}
                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-base font-black">Business Identity</h3>
                            <p className="text-slate-400 text-xs font-medium">Tell us about your shop</p>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Shop Name"
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.business_name}
                                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Nature of Business (e.g. Garment)"
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.business_nature}
                                    onChange={e => setFormData({ ...formData, business_nature: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.customer_segment}
                                    onChange={e => setFormData({ ...formData, customer_segment: e.target.value })}
                                >
                                    <option value="">Select Work Segment</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Super Distributor">Super Distributor</option>
                                    <option value="Manufacturer">Manufacturer</option>
                                    <option value="Supplier">Supplier</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-100">Back</button>
                            <button
                                disabled={!formData.business_name || !formData.business_nature || !formData.customer_segment}
                                onClick={() => setStep(3)}
                                className="flex-[2] py-2.5 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Logistics & Turnover */}
                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-base font-black">Business Scope</h3>
                            <p className="text-slate-400 text-xs font-medium">Finalize your account details</p>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.daily_turnover}
                                    onChange={e => setFormData({ ...formData, daily_turnover: e.target.value })}
                                >
                                    <option value="">Select Daily Turnover</option>
                                    {turnoverOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label} ({opt.sub})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-[1.125rem] text-slate-400" size={18} />
                                <textarea
                                    placeholder="Business Address"
                                    rows={3}
                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none resize-none"
                                    value={formData.business_address}
                                    onChange={e => setFormData({ ...formData, business_address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <TrendingUp size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide leading-relaxed">
                                You will receive ₹250 instant bonus in your wallet after completion.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-100">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.daily_turnover}
                                className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Submit & Claim ₹250 <CheckCircle2 size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}

            </div>
            <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest text-center">Merchant Protocol Verified</p>
        </div>
    );
}
