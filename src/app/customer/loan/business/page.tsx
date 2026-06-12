'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, Building, ChevronRight, Lock, Bell, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export default function BusinessLoansDirectory() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [notified, setNotified] = useState(false);
    const [loadingNotify, setLoadingNotify] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
        
        apiFetch('/auth/me')
            .then(res => {
                if (res) setUser(res.user || res);
            })
            .catch(() => {});
    }, []);

    const handleNotifyMe = async () => {
        setLoadingNotify(true);
        try {
            // Mocking notify action or hit real endpoint if exists
            await new Promise(resolve => setTimeout(resolve, 800));
            setNotified(true);
            toast.success("We'll notify you as soon as Business Loans are live!");
        } catch {
            toast.error("Failed to set notification reminder. Please try again.");
        } finally {
            setLoadingNotify(false);
        }
    };

    const isMerchant = user?.role === 'MERCHANT';

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-950">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-8 pb-14 px-4 relative overflow-hidden shadow-2xl`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <button onClick={() => router.push('/customer/loan')} className="mb-4 flex items-center gap-2 text-white/50 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Business Capital</h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Enterprise & Development Credit</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
                
                {/* Construction Loan Option (Live) */}
                <div 
                    onClick={() => router.push('/customer/loan/construction')}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden group cursor-pointer transition-all hover:border-emerald-300 hover:shadow-2xl active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-emerald-100/50 transition-colors"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                            <Building size={24} />
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Live & Active</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Instant Approval</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Construction Loan</h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                On Collateral (Girvi par ye loan hai). Build your dream project, add floors, or renovate commercial properties.
                            </p>
                            <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-slate-900">
                                <span>Limit Upto</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-950 font-black">₹1,00,00,000</span>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all shrink-0">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>

                {/* Business Loan Option (Coming Soon) */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-150">
                            <Briefcase size={24} />
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <Lock size={10} /> Coming Soon
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Business Loan</h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                Bank Transfer Loan (Low Cibil). Direct capital for scaling inventory, paying vendors, or daily business cashflows.
                            </p>
                            
                            <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-slate-900">
                                <span>Limit:</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-950 font-black">₹50,000 to ₹1,00,000</span>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={handleNotifyMe}
                                    disabled={notified || loadingNotify}
                                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loadingNotify ? (
                                        "Setting reminder..."
                                    ) : notified ? (
                                        <>Reminder Set</>
                                    ) : (
                                        <>
                                            <Bell size={14} />
                                            Notify Me When Live
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info / Trust Section */}
                <div className="bg-slate-100/60 rounded-3xl p-6 border border-slate-200/40 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Sparkles size={16} className="text-amber-500" />
                        <h4 className="font-black text-xs uppercase tracking-widest">Enterprise Trust Protocol</h4>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                        All business loans require basic business registrations or verification of collateral. Ensure your documents are valid to fast-track your applications.
                    </p>
                </div>
            </div>
        </div>
    );
}
