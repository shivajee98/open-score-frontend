'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User as UserIcon, Store, Mail, ArrowRight, User, Lock } from 'lucide-react';

export default function Onboarding() {
    // Steps: 1 = Role selection, 2 = Detail entry
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);

                if (user.is_onboarded) {
                    if (user.role === 'ADMIN') router.push('/admin');
                    else router.push('/customer');
                } else {
                    // If they have a role already, check if they should be in the merchant flow
                    if (user.role === 'MERCHANT') {
                        router.push('/auth/merchant-onboarding');
                    } else if (user.role === 'CUSTOMER') {
                        setRole('CUSTOMER');
                        setStep(2);
                        setCheckingAuth(false);
                    } else {
                        setCheckingAuth(false);
                    }
                }
            } else {
                if (typeof window !== 'undefined') window.location.href = '/';
            }
        }
    }, [router]);

    const handleMerchantSelection = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await apiFetch('/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ mobile_number: user.mobile_number, otp: 'BYPASS', role: 'MERCHANT' })
            });

            // Update local state
            const updatedUser = { ...res.user, role: 'MERCHANT' };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            router.push('/auth/merchant-onboarding');
        } catch (err: any) {
            setErrors({ api: err.message });
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pin.length !== 6) {
            setErrors({ pin: 'PIN must be exactly 6 digits.' });
            return;
        }
        if (pin !== confirmPin) {
            setErrors({ pin: 'PINs do not match.' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const userLocalStorage = JSON.parse(localStorage.getItem('user') || '{}');
            const mobile = userLocalStorage.mobile_number;

            // 1. Update role if needed
            await apiFetch('/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ mobile_number: mobile, otp: 'BYPASS', role })
            });

            // 2. Set PIN
            await apiFetch('/wallet/set-pin', {
                method: 'POST',
                body: JSON.stringify({
                    pin: pin,
                    pin_confirmation: confirmPin
                })
            });

            // 3. Complete onboarding
            const res = await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email
                })
            });

            // On success, update stored user and redirect
            const updatedUser = { ...res.user, is_onboarded: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            if (role === 'CUSTOMER') router.push('/customer');
            else if (role === 'MERCHANT') router.push('/auth/merchant-onboarding');
            else router.push('/admin');

        } catch (err: any) {
            setErrors({ api: err.message });
            setLoading(false);
        }
    };

    if (checkingAuth) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-8 duration-300">
                            <div className="mb-10 text-center">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mx-auto flex items-center justify-center mb-6 text-xl font-black">
                                    O
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Account Type</h2>
                                <p className="text-slate-500 font-medium">How will you use OpenScore?</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {[
                                    { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon className="w-6 h-6" /> },
                                    { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store className="w-6 h-6" /> },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.id === 'MERCHANT') {
                                                handleMerchantSelection();
                                            } else {
                                                setRole('CUSTOMER');
                                                setStep(2);
                                            }
                                        }}
                                        className={`w-full p-6 rounded-3xl border transition-all group relative text-left active:scale-[0.98] ${role === item.id ? (item.id === 'MERCHANT' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20' : 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20') : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${role === item.id ? (item.id === 'MERCHANT' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20') : 'bg-white border border-slate-100 text-slate-400 group-hover:scale-110'}`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg tracking-tight">{item.label}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.sub}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-8 duration-300">
                            <div className="mb-10 text-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 hover:underline"
                                >
                                    ← Back to Account Type
                                </button>
                                <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Profile Details</h2>
                                <p className="text-slate-500 font-medium">Almost there. Let's get to know you.</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
                                {errors.api && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">
                                        {errors.api}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Full Name (As per Aadhaar)</label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                                placeholder="e.g. Rahul Sharma"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                                placeholder="rahul@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    Continue to PIN Setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-8 duration-300">
                            <div className="mb-10 text-center">
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 hover:underline"
                                >
                                    ← Back to Profile
                                </button>
                                <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Set Wallet PIN</h2>
                                <p className="text-slate-500 font-medium">Create a secure 6-digit PIN for transactions.</p>
                            </div>

                            <form onSubmit={handleFinalSubmit} className="space-y-6">
                                {errors.api && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">
                                        {errors.api}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-center gap-2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center font-black text-xl text-blue-600 shadow-inner">
                                                {pin[i] ? '•' : ''}
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Wallet PIN (6 Digits)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                value={pin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 6) setPin(val);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-[0.5em] text-center"
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Confirm PIN</label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                value={confirmPin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 6) setConfirmPin(val);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-[0.5em] text-center"
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                        {errors.pin && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 uppercase">{errors.pin}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || pin.length !== 6 || confirmPin.length !== 6}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            Complete Onboarding <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-400 text-xs font-bold mt-8 uppercase tracking-widest">
                    Secured by OpenScore Financial Protocol
                </p>
            </div>
        </div>
    );
}


