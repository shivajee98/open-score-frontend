'use client';

import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    ChevronDown,
    Check,
    Lightbulb,
    Ban,
    IndianRupee,
    TrendingUp,
    ShieldCheck,
    Clock,
    CreditCard,
    Info,
    Lock,
    Scale,
    Activity,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/loanUtils';

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchLoan = async () => {
        try {
            const loans = await apiFetch('/loans');
            const found = loans.find((l: any) => l.id == loanId || l.loan_id == loanId);

            if (found) {
                setLoan(found);
            } else {
                if (loanId === 'L-10293') {
                    setLoan({
                        id: 'L-10293',
                        amount: 30000,
                        status: 'PENDING',
                        tenure: 3,
                        created_at: new Date().toISOString()
                    });
                }
            }
        } catch (e) {
            console.error("Failed to fetch status", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoan();
    }, [loanId]);

    const handleFinalConfirm = async () => {
        setSubmitting(true);
        try {
            await apiFetch(`/loans/${loan.id}/confirm`, {
                method: 'POST'
            });
            fetchLoan();
        } catch (e) {
            alert('Confirmation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKycSubmit = async (formData: any) => {
        setSubmitting(true);
        try {
            await apiFetch(`/loans/${loan.id}/submit-form`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            alert('Form Submitted Successfully!');
            fetchLoan();
        } catch (e) {
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    );

    if (!loan) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Info size={32} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
            <p className="text-slate-500 text-sm mt-2">We couldn't retrieve the details for this loan ID.</p>
            <button onClick={() => router.push('/customer/loan')} className="mt-6 text-blue-600 font-bold uppercase tracking-widest text-xs hover:underline">Go Back</button>
        </div>
    );

    const principal = Number(loan.amount);
    const processingFee = principal === 10000 ? 0 : 1200;
    const loginFee = principal === 10000 ? 300 : 200;
    const fieldKycFee = principal === 10000 ? 300 : 600; // Updated: 300 for 10k
    const totalFeesBeforeGst = processingFee + loginFee + fieldKycFee;
    const gstRate = 0.18;
    const gst = principal === 10000 ? 0 : Math.round(principal * gstRate); // Updated: 0 GST for 10k

    // Interest calculation if available
    const interestRate = Number(loan.interest_rate || 0);
    const totalInterest = Math.round((principal * interestRate) / 100);

    const totalDeductions = totalFeesBeforeGst + gst;
    const disbursalAmount = principal;
    const netPayableAmount = principal + totalDeductions;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Premium Banking Header */}
            <div className="bg-white border-b border-slate-100 px-6 pt-12 pb-8 sticky top-0 z-30">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.push('/customer/loan')} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            Application Status
                        </h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">Application #{loanId}</p>
                    </div>
                </div>

                <div className="flex items-end justify-between px-2">
                    <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Approved Limit</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{Number(loan.amount).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className={cn(
                        "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-1 shadow-sm",
                        loan.status === 'DISBURSED' || loan.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            loan.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                loan.status === 'KYC_SENT' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                    loan.status === 'FORM_SUBMITTED' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                        'bg-slate-50 border-slate-100 text-slate-400'
                    )}>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse",
                            loan.status === 'REJECTED' ? 'bg-rose-500' :
                                loan.status === 'DISBURSED' || loan.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                        )} />
                        {loan.status.replace('_', ' ')}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">

                {/* Repayment Active Prompt (Enhanced) */}
                {loan.status === 'DISBURSED' && (
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <TrendingUp size={20} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Account Ready</span>
                            </div>
                            <h3 className="text-xl font-black leading-tight">Repayment Active</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed max-w-[240px]">Manage your EMI payments and track your loan history from the dashboard.</p>
                            <button
                                onClick={() => router.push(`/customer/repayments`)}
                                className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                Track Repayments <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Final Confirmation (Enhanced) */}
                {loan.status === 'PREVIEW' && (
                    <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <CreditCard size={20} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Action Required</span>
                            </div>
                            <h3 className="text-xl font-black leading-tight">Confirm Your Loan</h3>
                            <p className="text-blue-100 text-xs font-medium mt-1 leading-relaxed">Review the fee & charges below to finalize your application.</p>
                            <button
                                onClick={handleFinalConfirm}
                                disabled={submitting}
                                className="w-full mt-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : 'Confirm Application'}
                            </button>
                        </div>
                    </div>
                )}

                {/* KYC Section (Enhanced) */}
                {loan.status === 'KYC_SENT' && (
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Complete KYC</h3>
                        <p className="text-indigo-100 text-xs font-medium mt-1 mb-6">We need a few more details to finalize your application.</p>
                        <button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_KYC_URL || 'https://openscorekyc.galobyte.site'}/form/${loan.kyc_token}`, '_blank')}
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            Open Application Form
                        </button>
                    </div>
                )}

                {/* Breakdown Section (Premium Banking UI) */}
                <section>
                    <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loan Breakdown</h3>
                        <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                            {isDetailsOpen ? 'Simplify' : 'Detailed View'} <ChevronDown className={cn("w-3 h-3 transition-transform", isDetailsOpen && "rotate-180")} />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100 space-y-6">
                        <div className="flex justify-between items-center group">
                            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">Principal Amount</span>
                            <span className="text-sm font-black text-slate-900 tracking-tight">₹{principal.toLocaleString()}</span>
                        </div>

                        {isDetailsOpen && (
                            <div className="space-y-4 pt-4 border-t border-slate-50 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-2"><Activity size={14} className="text-slate-300" /> Processing Fee</span>
                                    <span className="font-bold text-slate-900">₹{processingFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-2"><Lock size={14} className="text-slate-300" /> Login Fee</span>
                                    <span className="font-bold text-slate-900">₹{loginFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-slate-300" /> Field KYC Fee</span>
                                    <span className="font-bold text-slate-900">₹{fieldKycFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-2"><Scale size={14} className="text-slate-300" /> GST (18%)</span>
                                    <span className="font-bold text-slate-900">₹{gst.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-2xl mt-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fee & Charges</span>
                                    <span className="text-sm font-black text-slate-900 tracking-tight">₹{totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Net Payable</span>
                                <span className="text-lg font-black text-slate-900 tracking-tighter">₹{netPayableAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-blue-50/50 rounded-2xl border border-blue-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <IndianRupee size={18} />
                                    </div>
                                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Disbursal</span>
                                </div>
                                <span className="text-xl font-black text-blue-900 tracking-tighter">₹{disbursalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline Section (Minimalist Redesign) */}
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Timeline</h3>
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                        <div className="space-y-8">
                            {[
                                { label: 'Submitted', date: new Date(loan.created_at).toLocaleDateString(), active: true, done: true },
                                { label: 'Verification', date: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED') ? 'Complete' : 'Pending', active: true, done: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED') },
                                { label: 'Approval', date: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : 'Awaiting', active: (loan.status === 'FORM_SUBMITTED'), done: (loan.status === 'APPROVED' || loan.status === 'DISBURSED') },
                                { label: 'Disbursal', date: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : '', active: (loan.status === 'APPROVED' || loan.status === 'DISBURSED'), done: loan.status === 'DISBURSED' }
                            ].map((step, i, arr) => (
                                <div key={i} className="flex gap-6 items-start relative">
                                    {i !== arr.length - 1 && (
                                        <div className={cn(
                                            "absolute left-[13px] top-[26px] bottom-[-34px] w-[2px] z-0",
                                            step.done ? "bg-emerald-500" : "bg-slate-100"
                                        )} />
                                    )}
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                                        step.done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                            step.active && loan.status !== 'REJECTED' ? "bg-white border-2 border-amber-400 text-amber-500" :
                                                "bg-slate-50 border border-slate-200 text-slate-200"
                                    )}>
                                        {step.done ? <Check size={14} strokeWidth={4} /> : <div className={cn("w-1.5 h-1.5 rounded-full", step.active ? "bg-amber-400 animate-pulse" : "bg-slate-200")} />}
                                    </div>
                                    <div className="pt-0.5">
                                        <h4 className={cn("text-xs font-black uppercase tracking-widest", step.done ? "text-slate-900" : step.active ? "text-slate-900" : "text-slate-300")}>{step.label}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Secure Tip Footnote */}
                <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-4 border border-slate-100">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <Lightbulb size={16} className="text-amber-600 fill-amber-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic opacity-80 uppercase tracking-wide">
                        Pro tip: Timely repayments enhance your eligibility for higher loan limits in the future.
                    </p>
                </div>
            </div>
        </div>
    );
}
