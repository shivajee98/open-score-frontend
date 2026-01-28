'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
    ArrowLeft,
    CreditCard,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    IndianRupee,
    History,
    Calendar,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/loanUtils';

export default function RepaymentsPage() {
    const router = useRouter();
    const [loans, setLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const data = await apiFetch('/loans');
            const ongoing = data.filter((l: any) => l.status === 'DISBURSED');
            setLoans(ongoing);
            if (ongoing.length > 0) {
                handleSelectLoan(ongoing[0]);
            }
        } catch (e) {
            console.error("Failed to load loans", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLoan = async (loan: any) => {
        setSelectedLoan(loan);
        try {
            const data = await apiFetch(`/loans/${loan.id}/repayments`);
            setRepayments(data.repayments || []);
        } catch (e) {
            console.error("Failed to load repayments", e);
        }
    };

    const handleRepay = async () => {
        if (!selectedLoan) return;

        // Find first pending repayment
        const pending = repayments.find(r => r.status === 'PENDING');
        if (!pending) {
            alert("No pending EMIs found for this loan.");
            return;
        }

        if (!confirm(`Confirm EMI payment of ₹${pending.amount}? Amount will be debited from your wallet.`)) return;

        setActionLoading(true);
        try {
            await apiFetch(`/loans/${selectedLoan.id}/repay`, {
                method: 'POST'
            });
            alert("Repayment successful!");
            handleSelectLoan(selectedLoan); // Refresh repayments
        } catch (e: any) {
            alert(e.message || "Repayment failed. Please check your wallet balance.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading your loans...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900 p-6 pt-12 pb-20 rounded-b-[2.5rem] shadow-xl shadow-slate-900/10">
                <button onClick={() => router.push('/customer')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-6">
                    <ArrowLeft size={16} /> Dashboard
                </button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white leading-tight">Repayments</h1>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Manage your active loans</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <CreditCard className="text-blue-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-10 space-y-6">

                {/* Loan Selector / Summary */}
                {loans.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl shadow-blue-900/5 border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <History className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-2">No Active Loans</h3>
                        <p className="text-slate-500 text-sm max-w-[200px] mx-auto leading-relaxed">You don't have any disbursed loans requiring repayment at this time.</p>
                        <button
                            onClick={() => router.push('/customer/loan')}
                            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            Apply for Loan
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Selected Loan Details */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Loan Amount</p>
                                        <h2 className="text-3xl font-black text-slate-900">₹{parseFloat(selectedLoan?.amount).toLocaleString()}</h2>
                                    </div>
                                    <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ongoing</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <Calendar size={14} className="text-blue-500" />
                                            <span className="font-bold text-sm tracking-tight">{selectedLoan?.tenure} Months</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <Zap size={14} className="text-amber-500" />
                                            <span className="font-bold text-sm tracking-tight">{selectedLoan?.payout_frequency}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRepay}
                                    disabled={actionLoading || !repayments.some(r => r.status === 'PENDING')}
                                    className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Pay Next EMI <ChevronRight size={18} /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Repayment History List */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Repayment Schedule</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
                                {repayments.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {repayments.map((rep, idx) => (
                                            <div key={rep.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors",
                                                        rep.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                                    )}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">₹{parseFloat(rep.amount).toLocaleString()}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            Due: {new Date(rep.due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {rep.status === 'PAID' ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paid</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                                                            <Clock size={12} className="text-slate-400" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center">
                                        <AlertCircle className="text-slate-200 mx-auto mb-2" size={32} />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading schedule...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Multiple Loans Switcher (If many) */}
                {loans.length > 1 && (
                    <div className="space-y-4 pb-10">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Other Loans</h3>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                            {loans.map(loan => (
                                <div
                                    key={loan.id}
                                    onClick={() => handleSelectLoan(loan)}
                                    className={cn(
                                        "snap-center shrink-0 w-64 p-5 rounded-3xl border-2 transition-all cursor-pointer",
                                        selectedLoan?.id === loan.id
                                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                            : "bg-white border-slate-100 text-slate-900 shadow-sm hover:border-blue-200"
                                    )}
                                >
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest mb-1",
                                        selectedLoan?.id === loan.id ? "text-blue-200 opacity-80" : "text-slate-400"
                                    )}>Loan #{loan.id}</p>
                                    <h4 className="text-xl font-black">₹{parseFloat(loan.amount).toLocaleString()}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
