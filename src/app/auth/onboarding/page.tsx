'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User as UserIcon, Store, Mail, ArrowRight, User, Lock, ArrowLeft, GraduationCap } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function Onboarding() {
    // Steps: 1 = Role selection, 2 = Detail entry
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | 'STUDENT' | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [appPin, setAppPin] = useState('');
    const [appConfirmPin, setAppConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    window.location.href = '/';
                    return;
                }

                const user = JSON.parse(userStr);
                if (user.is_onboarded) {
                    router.push(user.role === 'ADMIN' ? '/admin' : '/customer');
                    return;
                }

                if (user.role === 'MERCHANT') {
                    router.push('/auth/merchant-onboarding');
                    // We don't setCheckingAuth(false) because we are navigating away
                    return;
                }

                if (user.role === 'CUSTOMER' || user.role === 'STUDENT') {
                    setRole(user.role);
                    setStep(2);
                }

                setCheckingAuth(false);
            } catch (err) {
                console.error('Onboarding auth check failed:', err);
                window.location.href = '/';
            }
        };

        checkAuth();
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

        if (appPin.length !== 4) {
            setErrors({ app_pin: 'App Lock PIN must be 4 digits.' });
            return;
        }

        if (appPin !== appConfirmPin) {
            setErrors({ app_pin: 'App Lock PINs do not match.' });
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

            // 2. Complete Onboarding with everything in one call
            const onboardRes = await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    app_pin: appPin,
                    app_pin_confirmation: appConfirmPin,
                    pin: pin,
                    pin_confirmation: confirmPin
                })
            });

            // On success, update stored user and redirect
            const updatedUser = { ...onboardRes.user, is_onboarded: true };
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

                    <BackButton
                        clearAuth={step === 1}
                        fallback="/"
                        onClick={step > 1 ? () => setStep(step - 1) : undefined}
                        className="absolute left-6 top-6 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 z-50"
                    />

                    {step === 1 && (
                        <div className="animate-in slide-in-from-left-8 duration-300">
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 text-xl font-black shadow-inner shadow-blue-200/50">
                                        O
                                    </div>
                                    <h2 className="text-2xl font-black mb-2 tracking-tighter">Account Type</h2>
                                    <p className="text-slate-500 text-sm font-medium italic">How will you use Open Score?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon /> },
                                        { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store /> },
                                        { id: 'STUDENT', label: 'Student Account', sub: 'Learn, achieve, and borrow.', icon: <GraduationCap /> },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setRole(item.id as any);
                                                // Update local storage so persistence works
                                                const u = JSON.parse(localStorage.getItem('user') || '{}');
                                                u.role = item.id;
                                                localStorage.setItem('user', JSON.stringify(u));

                                                if (item.id === 'MERCHANT') {
                                                    router.push('/auth/merchant-onboarding');
                                                } else {
                                                    setStep(2);
                                                }
                                            }}
                                            className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-blue-600/20 text-left transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.label}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-8 duration-300">
                            <div className="mb-10 text-center">
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
                                    {/* App Lock Section */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">App Lock PIN (4 Digits)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={4}
                                                value={appPin}
                                                onChange={(e) => setAppPin(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-lg"
                                                placeholder="Set"
                                                required
                                            />
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={4}
                                                value={appConfirmPin}
                                                onChange={(e) => setAppConfirmPin(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-lg"
                                                placeholder="Confirm"
                                                required
                                            />
                                        </div>
                                        {errors.app_pin && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase text-center">{errors.app_pin}</p>}
                                    </div>

                                    {/* Wallet PIN Section */}
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-3">
                                        <label className="block text-xs font-black uppercase tracking-widest text-blue-600/60 mb-1">Payment PIN (6 Digits)</label>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={pin}
                                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-[0.5em] text-center text-lg"
                                                    placeholder="Set PIN"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={confirmPin}
                                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-[0.5em] text-center text-lg"
                                                    placeholder="Confirm PIN"
                                                    required
                                                />
                                            </div>
                                            {errors.pin && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase text-center">{errors.pin}</p>}
                                        </div>
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


