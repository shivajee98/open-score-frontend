'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User, Briefcase, Mail, ArrowRight } from 'lucide-react';

export default function Onboarding() {
    const [role, setRole] = useState('CUSTOMER');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const router = useRouter();

    useState(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setRole(user.role || 'CUSTOMER');
                if (user.is_onboarded) {
                    if (user.role === 'CUSTOMER') router.push('/customer');
                    else if (user.role === 'MERCHANT') router.push('/merchant');
                    else router.push('/admin');
                }
            } else {
                router.push('/');
            }
            setCheckingAuth(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
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

            // Update cookies for middleware
            const token = localStorage.getItem('token');
            if (token) {
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
                document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400; SameSite=Lax`;
            }

            if (role === 'CUSTOMER') router.push('/customer');
            else if (role === 'MERCHANT') router.push('/merchant');
            else router.push('/admin');

        } catch (err: any) {
            setErrors({ api: err.message });
            setLoading(false);
        }
    };

    if (checkingAuth) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Complete Profile</h2>
                        <p className="text-slate-500 font-medium">Tell us a bit about yourself to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.api && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
                                {errors.api}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="John Doe"
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
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {role === 'MERCHANT' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-4">Business Name</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                            placeholder="Joes Cafe"
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
                                    Complete Setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-xs font-bold mt-8 uppercase tracking-widest">
                    Secured by OpenScore Financial
                </p>
            </div>
        </div>
    );
}
