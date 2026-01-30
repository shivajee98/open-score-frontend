'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
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
    Lock
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
        confirm_pin: ''
    });

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
            // Complete Onboarding (Basic Info)
            await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email
                })
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
                        onClick={() => router.push('/')}
                        className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xl mb-4 shadow-xl shadow-blue-600/20">
                        <Store size={28} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Merchant Setup</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Start your journey</p>
                </div>

                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 mb-8 text-center">{error}</div>}

                {/* Step 1: Personal Info Only */}
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
                        disabled={!formData.name || !formData.email.includes('@') || loading}
                        onClick={handleSubmit}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Setting up...' : <>Complete Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
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
