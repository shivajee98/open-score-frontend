'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Zap, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { LOAN_PLANS, cn } from '@/lib/loanUtils';

export default function LoanList() {
    const router = useRouter();

    const [recentLoan, setRecentLoan] = useState<any>(null);
    const [kycLoan, setKycLoan] = useState<any>(null);

    useEffect(() => {
        apiFetch('/loans').then((loans: any[]) => {
            if (loans && loans.length > 0) {
                const sorted = loans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentLoan(sorted[0]);

                const pendingKyc = loans.find((l: any) => l.status === 'KYC_SENT');
                if (pendingKyc) setKycLoan(pendingKyc);
            }
        }).catch(err => {
            console.error("Failed to fetch recent loan activity", err);
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.push('/customer')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Select Loan Plan</h1>
                <p className="text-slate-500 font-medium text-sm">Choose a plan that fits your business needs.</p>
            </div>

            {/* KYC Alert/Import */}
            {kycLoan && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <Link href={`/customer/loan/status/${kycLoan.id}`}>
                        <div className="p-5 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 flex items-center gap-4 active:scale-[0.98] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-sm uppercase tracking-tight">Important Action Needed</h4>
                                <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest leading-tight mt-0.5 opacity-80">Please complete KYC for your existing Loan #{kycLoan.id} before applying for a new one.</p>
                            </div>
                            <ChevronRight className="ml-auto text-indigo-400" size={20} />
                        </div>
                    </Link>
                </div>
            )}

            {/* Loan Plans Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {Object.values(LOAN_PLANS).map((plan: any) => (
                    <div
                        key={plan.amount}
                        onClick={() => {
                            if (plan.isLocked) {
                                alert(`Eligibility Required: You're currently not eligible for the ${plan.amount >= 100000 ? `${plan.amount / 100000} Lakh` : plan.amount} loan. Please build your eligibility by successfully repaying your current or previous smaller loans.`);
                                return;
                            }
                            router.push(`/customer/loan/${plan.amount}`);
                        }}
                        className={cn(
                            "bg-white rounded-[2rem] p-5 pt-12 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group cursor-pointer transition-all active:scale-[0.95]",
                            plan.isLocked ? "opacity-75 grayscale-[0.5]" : "hover:border-blue-200"
                        )}
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.color}`}></div>
                        <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${plan.isLocked
                            ? "bg-slate-100 text-slate-400"
                            : "bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
                            }`}>
                            {plan.isLocked ? <Lock size={14} /> : <ChevronRight size={16} />}
                        </div>

                        <div className="mb-3">
                            <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full bg-gradient-to-r ${plan.color} uppercase tracking-wide flex items-center gap-1 w-fit`}>
                                {plan.isLocked && <Lock size={8} fill="white" />}
                                {plan.title}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">
                            ₹ {plan.amount >= 100000 ? `${plan.amount / 100000}L` : plan.amount >= 1000 ? `${plan.amount / 1000}k` : plan.amount}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 line-clamp-1">
                            {plan.isLocked ? 'Building Eligibility...' : plan.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Activity / History Highlight */}
            {recentLoan ? (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                        <button onClick={() => router.push('/customer/loan/history')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div
                        onClick={() => router.push('/customer/loan/history')}
                        className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-blue-400 w-4 h-4" />
                                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Last Application</span>
                                </div>
                                <h3 className="text-xl font-black mb-1">₹ {recentLoan.amount.toLocaleString()} Loan</h3>
                                <p className="text-xs font-medium text-slate-400">
                                    Applied on {new Date(recentLoan.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} •
                                    <span className={`ml-1 ${recentLoan.status === 'APPROVED' ? 'text-emerald-400' : recentLoan.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>
                                        {recentLoan.status}
                                    </span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8">
                </div>
            )}

            {/* Other Loans */}
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">More Options</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { title: 'Business Loan', icon: '💼', desc: 'For heavy inventory' },
                        { title: 'Personal Loan', icon: '🏠', desc: 'For personal use' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 opacity-60">
                            <div className="text-2xl mb-3 grayscale">{item.icon}</div>
                            <h4 className="font-black text-slate-900 text-sm mb-1">{item.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">{item.desc}</p>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
