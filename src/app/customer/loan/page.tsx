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
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [cooldown, setCooldown] = useState({ active: false, daysRemaining: 0 });

    const fetchLoans = () => {
        apiFetch('/loans').then((loans: any[]) => {
            if (loans && loans.length > 0) {
                const sorted = loans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentLoan(sorted[0]);

                const pendingKyc = loans.find((l: any) => l.status === 'KYC_SENT');
                if (pendingKyc) setKycLoan(pendingKyc);

                const active = loans.find((l: any) => !['REJECTED', 'CANCELLED', 'DISBURSED', 'CLOSED'].includes(l.status));
                setActiveLoan(active);

                // Check for 15-day cooldown from last disbursement
                const lastDisbursed = sorted.find((l: any) => l.disbursed_at);
                if (lastDisbursed) {
                    const disbursedDate = new Date(lastDisbursed.disbursed_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - disbursedDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days elapsed since disbursement

                    // If it's been less than 15 days (e.g. 1 day), we restrict.
                    if (diffDays <= 15) {
                        setCooldown({ active: true, daysRemaining: 16 - diffDays });
                    }
                }
            }
        }).catch(err => {
            console.error("Failed to fetch recent loan activity", err);
        });
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this loan application?")) return;
        try {
            await apiFetch(`/loans/${id}/cancel`, { method: 'POST' });
            alert("Application cancelled successfully.");
            setActiveLoan(null);
            fetchLoans();
        } catch (e) {
            alert("Failed to cancel application.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.push('/customer')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Open Your Loan Score</h1>
                <p className="text-slate-500 font-medium text-sm">Choose Credit As Your Need</p>
            </div>

            {/* Active Loan Alert - RESTRICTION */}
            {activeLoan && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                                    <Clock size={20} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Loan In Progress</span>
                            </div>

                            <h2 className="text-2xl font-black mb-2 leading-none">Application Active</h2>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 max-w-[280px]">
                                You have a loan of <span className="text-white font-bold">₹{activeLoan.amount.toLocaleString()}</span> currently in the <span className="text-emerald-400 font-bold uppercase">{activeLoan.status.replace('_', ' ')}</span> stage.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push(`/customer/loan/status/${activeLoan.id}`)}
                                    className="flex-1 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Track Status
                                </button>
                                <button
                                    onClick={() => handleCancel(activeLoan.id)}
                                    className="px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KYC Alert/Import - Only show if not already showing the primary active loan block above */}
            {kycLoan && !activeLoan && (
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

            {/* Virtual Credit */}
            <div className="mb-10">
                {Object.values(LOAN_PLANS).filter((p: any) => p.amount === 10000).map((plan: any) => (
                    <div
                        key={plan.amount}
                        onClick={() => {
                            if (activeLoan) {
                                alert("Application Under Process: You already have a loan application in progress. Please revoke (cancel) your current application if you wish to apply for a new one.");
                                return;
                            }
                            if (cooldown.active) {
                                alert(`Cool-down Period: You can apply for a new loan in ${cooldown.daysRemaining} days. We require a 15-day interval between loans.`);
                                return;
                            }
                            router.push(`/customer/loan/${plan.amount}`);
                        }}
                        className={cn(
                            "bg-slate-900 rounded-[2.5rem] p-6 relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-900/40 active:scale-[0.98] transition-all",
                            (activeLoan || cooldown.active) && "opacity-75 grayscale-[0.5]"
                        )}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-600/40 transition-colors"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-indigo-500 p-1.5 rounded-lg">
                                        <Zap size={14} className="text-white fill-white" />
                                    </div>
                                    <span className="text-[9px] font-semibold text-indigo-300 uppercase tracking-[0.2em]">Priority Fast-Track</span>
                                </div>
                                <h2 className="text-2xl font-medium text-white mb-0.5 tracking-tight">{plan.title}</h2>
                                <p className="text-indigo-200/60 font-normal text-[11px] max-w-[200px] leading-relaxed mb-3">
                                    {plan.description} • Get funds in seconds.
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-semibold text-white">₹{plan.amount.toLocaleString()}</span>
                                    <div className="h-6 w-[1.5px] bg-white/10 mx-1"></div>
                                    <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                                        <span className="text-[9px] font-medium text-white uppercase tracking-widest">Active Instantly</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                                {cooldown.active ? <Lock size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loan Plans List Section */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Term Loan</h3>
                    <span className="text-[10px] font-bold text-slate-400">Fixed Tenure</span>
                </div>
                <div className="flex flex-col gap-4 mb-8">
                    {Object.values(LOAN_PLANS).filter((p: any) => p.amount > 10000).map((plan: any) => (
                        <div
                            key={plan.amount}
                            onClick={() => {
                                if (activeLoan) {
                                    alert("Application Under Process: You already have a loan application in progress. Please revoke (cancel) your current application if you wish to apply for a new one.");
                                    return;
                                }
                                if (cooldown.active) {
                                    alert(`Cool-down Period: You can apply for a new loan in ${cooldown.daysRemaining} days. We require a 15-day interval between loans.`);
                                    return;
                                }
                                if (plan.isLocked) {
                                    alert(`Eligibility Required: You're currently not eligible for the ${plan.amount >= 100000 ? `${plan.amount / 100000} Lakh` : plan.amount} loan. Please build your eligibility by successfully repaying your current or previous smaller loans.`);
                                    return;
                                }
                                router.push(`/customer/loan/${plan.amount}`);
                            }}
                            className={cn(
                                "bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between",
                                (plan.isLocked || activeLoan || cooldown.active) ? "opacity-75 grayscale-[0.5]" : "hover:border-blue-200"
                            )}
                        >
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${plan.color}`}></div>

                            <div className="flex items-center gap-5 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${plan.isLocked
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
                                    }`}>
                                    {plan.isLocked ? <Lock size={20} /> : <Zap size={20} className="fill-current" />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${plan.color} uppercase tracking-wide flex items-center gap-1 w-fit`}>
                                            {plan.title}
                                        </span>
                                        {(plan.isLocked || activeLoan) && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeLoan ? 'Blocked' : 'Locked'}</span>}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        ₹ {plan.amount.toLocaleString()}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {plan.isLocked ? 'Building Eligibility...' : plan.description}
                                    </p>
                                </div>
                            </div>

                            <div className="ml-4 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                <ChevronRight size={20} />
                            </div>
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
                    <div className="flex flex-col gap-4">
                        {[
                            { title: 'Business Loan', icon: '💼', desc: 'For heavy inventory' },
                            { title: 'Personal Loan', icon: '🏠', desc: 'For personal use' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 opacity-60 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl grayscale">{item.icon}</div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.desc}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Upcoming</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
