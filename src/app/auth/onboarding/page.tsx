'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User as UserIcon, Store, Mail, ArrowRight, User } from 'lucide-react';

export default function Onboarding() {
    // Steps: 1 = Role selection, 2 = Detail entry
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
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
                    return;
                }
                // If they have a role already, check if they should be in the merchant flow
                if (user.role) {
                    if (user.role === 'MERCHANT') {
                        router.push('/auth/merchant-onboarding');
                        return;
                    }
                    setRole(user.role);
                }
            } else {
                router.push('/');
                return;
            }
            setCheckingAuth(false);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            setErrors({ api: 'Please select an account type.' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // 1. Update role if needed (call verify again)
            // Note: The backend AuthController.verifyOtp now updates the role if provided for existing users.
            const mobile = JSON.parse(localStorage.getItem('user') || '{}').mobile_number;
            await apiFetch('/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ mobile_number: mobile, otp: 'BYPASS', role })
            });

            // 2. Complete onboarding (details)
            const res = await apiFetch('/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    business_name: role === 'MERCHANT' ? businessName : undefined
                })
            });

            // On success, update stored user and redirect
            const updatedUser = { ...res.user, is_onboarded: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=2592000; SameSite=Lax`;

            // Update cookies for middleware
            const token = localStorage.getItem('token');
            if (token) {
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
                document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400; SameSite=Lax`;
            }

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-8 duration-300">
                            <div className="mb-10 text-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 text-2xl font-black">
                                    O
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Account Type</h2>
                                <p className="text-slate-500 font-medium">How will you use OpenScore?</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-8">
                                {[
                                    { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon className="w-6 h-6" /> },
                                    { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store className="w-6 h-6" /> },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setRole(item.id as any);
                                            setStep(2);
                                        }}
                                        className={`w-full p-6 rounded-3xl border transition-all group relative text-left active:scale-[0.98] ${role === item.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200'}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-100 text-slate-400 group-hover:text-blue-600'}`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg">{item.label}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{item.sub}</p>
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
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Profile Details</h2>
                                <p className="text-slate-500 font-medium">Final step to unlock your wallet.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.api && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
                                        {errors.api}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Full Name (As per Aadhaar)</label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
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
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                                placeholder="rahul@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {role === 'MERCHANT' && (
                                        <div className="animate-in fade-in slide-in-from-top-4">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Business Name</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <input
                                                    type="text"
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                                    placeholder="e.g. Sharma Kirana Store"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 group"
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

// Additional icons
const Briefcase = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
