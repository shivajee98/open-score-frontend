
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Lightbulb, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api'; // Assuming apiFetch is available from this path

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoan = async () => {
            try {
                // Fetch all loans and find the matching one
                // Future optimization: Backend endpoint getting specific loan /loans/{id}
                const loans = await apiFetch('/loans');
                const found = loans.find((l: any) => l.id == loanId || l.loan_id == loanId);

                if (found) {
                    setLoan(found);
                } else {
                    // Fallback for "L-10293" demo ID if not found in real DB
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
        fetchLoan();
    }, [loanId]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loan not found</div>;

    const principal = Number(loan.amount);
    const processingFee = 1200;
    const loginFee = 200;
    const fieldKycFee = 600;
    const totalFeesBeforeGst = processingFee + loginFee + fieldKycFee;
    const gstRate = 0.18;
    const gst = Math.round(totalFeesBeforeGst * gstRate);

    // Interest calculation if available
    const interestRate = Number(loan.interest_rate || 0);
    const totalInterest = Math.round((principal * interestRate) / 100);

    const totalDeductions = totalFeesBeforeGst + gst;
    const disbursalAmount = principal; // "keep it the actual loan price"
    const netPayableAmount = principal + totalDeductions; // "users have to pay base + extra fee"

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-slate-900 p-6 pt-8 pb-16 rounded-b-xl shadow-xl relative z-10">
                <button onClick={() => router.push('/customer/loan')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Loans
                </button>
                <h1 className="text-2xl font-black text-white mb-2">Application Status</h1>
                <p className="text-slate-400 font-medium text-sm">Track your loan application #{loanId}</p>
            </div>

            <div className="px-6 -mt-10 relative z-20 space-y-6">

                {/* Details Card */}
                <div className="bg-white rounded-lg shadow-xl shadow-blue-900/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Loan Amount</p>
                                <span className={`text-[10px] font-normal px-2 py-0.5 border rounded-full uppercase tracking-wide ${loan.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    loan.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                        'bg-amber-50 border-amber-100 text-amber-600'
                                    }`}>{loan.status}</span>
                            </div>
                            <h2 className="text-2xl font-normal text-slate-900">₹ {Number(loan.amount).toLocaleString()}</h2>
                        </div>

                        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${isDetailsOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Processing Fee</span>
                                <span className="text-slate-900">₹ {processingFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Login Fee</span>
                                <span className="text-slate-900">₹ {loginFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Field KYC Fee</span>
                                <span className="text-slate-900">₹ {fieldKycFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>GST (18%)</span>
                                <span className="text-slate-900">₹ {gst.toLocaleString()}</span>
                            </div>

                            {interestRate > 0 && (
                                <>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Total Interest @ {interestRate}%</span>
                                        <span className="text-slate-900">₹ {totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Annualized Rate</span>
                                        <span className="text-slate-900">{(interestRate * 4).toFixed(2)}% p.a</span>
                                    </div>
                                </>
                            )}

                            <div className="pt-2 border-t border-slate-50 space-y-3">
                                <div className="flex justify-between text-sm text-slate-900">
                                    <span>Disbursal Amount</span>
                                    <span>₹ {disbursalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-900">
                                    <span>Net Payable Amount</span>
                                    <span>₹ {netPayableAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                                <span>Loan ID</span>
                                <span>{loanId}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="w-full bg-slate-50 p-3 flex justify-center items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        {isDetailsOpen ? 'View Less' : 'View More'} <ChevronDown className={`w-4 h-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Timeline Stepper */}
                <div className="bg-white rounded-lg p-6 py-10 shadow-xl shadow-blue-900/5">
                    <div className="flex items-center justify-between relative px-2">
                        {/* Connecting Line - Thinner and Elegant */}
                        <div className="absolute left-6 right-6 top-[20px] h-[2px] bg-slate-50 z-0">
                            <div className={`h-full bg-emerald-500 transition-all duration-1000 ${loan.status === 'DISBURSED' ? 'w-full' :
                                loan.status === 'APPROVED' ? 'w-2/3' :
                                    loan.status === 'PENDING' ? 'w-1/3' : 'w-0'
                                }`} />
                        </div>

                        {/* Steps */}
                        {[
                            { label: 'Submitted', date: new Date(loan.created_at).toLocaleDateString(), status: 'done' },
                            {
                                label: 'Approval',
                                date: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : 'Awaiting',
                                status: loan.status === 'APPROVED' ? 'done' : loan.status === 'REJECTED' ? 'error' : loan.status === 'PENDING' ? 'current' : 'pending'
                            },
                            { label: 'Disbursal', date: '', status: loan.status === 'DISBURSED' ? 'done' : loan.status === 'APPROVED' ? 'current' : 'pending' },
                            { label: 'Repayment', date: '', status: 'pending' },
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-4">
                                <div className={`w-9 h-9 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 ${step.status === 'done' ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/10' :
                                    step.status === 'error' ? 'bg-rose-500 border-white text-white' :
                                        step.status === 'current' ? 'bg-white border-amber-400 text-amber-500 shadow-xl shadow-amber-400/5' :
                                            'bg-slate-50 border-white text-slate-100'
                                    }`}>
                                    {step.status === 'done' ? <Check size={16} strokeWidth={4} /> :
                                        step.status === 'error' ? <Ban size={16} strokeWidth={4} /> :
                                            step.status === 'current' ? <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> :
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] uppercase tracking-widest font-medium ${step.status === 'current' ? 'text-amber-500' : 'text-slate-400'}`}>{step.label}</p>
                                    {step.date && <p className="text-[9px] text-slate-300 mt-1">{step.date}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tip */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-amber-800 font-bold text-sm">Repay your loans on time to avoid penalties and increase your creditworthiness.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
