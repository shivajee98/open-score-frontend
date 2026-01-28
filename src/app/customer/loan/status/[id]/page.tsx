
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Lightbulb, Ban, IndianRupee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import KycForm from '@/components/loan/KycForm';

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showKycForm, setShowKycForm] = useState(false);
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
            setShowKycForm(false);
            fetchLoan();
        } catch (e) {
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loan not found</div>;

    const principal = Number(loan.amount);
    const processingFee = principal === 10000 ? 0 : 1200;
    const loginFee = principal === 10000 ? 300 : 200;
    const fieldKycFee = principal === 10000 ? 500 : 600;
    const totalFeesBeforeGst = processingFee + loginFee + fieldKycFee;
    const gstRate = 0.18;
    const gst = Math.round(principal * gstRate);

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
                                <span className={`text-[10px] font-normal px-2 py-0.5 border rounded-full uppercase tracking-wide ${loan.status === 'DISBURSED' || loan.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    loan.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                        loan.status === 'KYC_SENT' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                            loan.status === 'FORM_SUBMITTED' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                'bg-slate-50 border-slate-100 text-slate-600'
                                    }`}>{loan.status.replace('_', ' ')}</span>
                            </div>
                            <h2 className="text-2xl font-normal text-slate-900">₹ {Number(loan.amount).toLocaleString()}</h2>
                        </div>

                        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${isDetailsOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                            {/* Additional Charges Group */}
                            <div className="space-y-3 pt-2 border-t border-slate-50">
                                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-1">Additional Amount Pay</p>
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
                                <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-50/50">
                                    <span>Total Additional Amount</span>
                                    <span>₹ {totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>

                            {interestRate > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Total Interest @ {interestRate}%</span>
                                        <span className="text-slate-900">₹ {totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Annualized Rate</span>
                                        <span className="text-slate-900">{(interestRate * 4).toFixed(2)}% p.a</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm text-slate-900">
                                    <span>Net Payable Amount</span>
                                    <span>₹ {netPayableAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900">
                                    <span>Disbursal Amount</span>
                                    <span>₹ {disbursalAmount.toLocaleString()}</span>
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
                        <div className="absolute left-6 right-6 top-[20px] h-[2px] bg-slate-50 z-0 text-center">
                            <div className={`h-full bg-emerald-500 transition-all duration-1000 ${loan.status === 'DISBURSED' ? 'w-full' :
                                loan.status === 'APPROVED' ? 'w-[75%]' :
                                    loan.status === 'FORM_SUBMITTED' ? 'w-[50%]' :
                                        loan.status === 'KYC_SENT' || loan.status === 'PROCEEDED' ? 'w-[25%]' :
                                            'w-0'
                                }`} />
                        </div>

                        {/* Steps */}
                        {[
                            {
                                label: 'Submitted',
                                date: new Date(loan.created_at).toLocaleDateString(),
                                status: 'done'
                            },
                            {
                                label: 'Verification',
                                date: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED') ? 'Verified' : 'In Progress',
                                status: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED') ? 'done' :
                                    (loan.status === 'KYC_SENT' || loan.status === 'PROCEEDED') ? 'current' : 'pending'
                            },
                            {
                                label: 'Approval',
                                date: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : 'Awaiting',
                                status: (loan.status === 'APPROVED' || loan.status === 'DISBURSED') ? 'done' :
                                    (loan.status === 'FORM_SUBMITTED') ? 'current' : 'pending'
                            },
                            {
                                label: 'Disbursal',
                                date: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : '',
                                status: loan.status === 'DISBURSED' ? 'done' :
                                    loan.status === 'APPROVED' ? 'current' : 'pending'
                            },
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

                {/* Action: Final Confirmation (PREVIEW STATE) */}
                {loan.status === 'PREVIEW' && (
                    <div className="bg-slate-900 rounded-lg p-6 text-white shadow-xl shadow-slate-900/20 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Confirm Your Loan</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Please review the fee breakdown above before final confirmation.</p>
                        </div>
                        <button
                            onClick={handleFinalConfirm}
                            disabled={submitting}
                            className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-slate-900 rounded-full animate-spin border-t-transparent"></div>
                            ) : `Confirm Application`}
                        </button>
                    </div>
                )}

                {/* Special Action: Complete KYC */}
                {loan.status === 'KYC_SENT' && (
                    <div className="bg-blue-600 rounded-lg p-6 text-white shadow-xl shadow-blue-600/20 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Complete Your KYC</h3>
                            <p className="text-blue-100 text-xs font-medium mt-1">We need a few more details to finalize your application.</p>
                        </div>
                        <button
                            onClick={() => setShowKycForm(true)}
                            className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-sm hover:bg-blue-50 transition-all uppercase tracking-widest shadow-lg"
                        >
                            Open Application Form
                        </button>
                    </div>
                )}

                {/* Special Info: Contact Supervisor */}
                {loan.status === 'APPROVED' && (
                    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 text-emerald-800 shadow-xl shadow-emerald-900/5 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Loan Approved!</h3>
                            <p className="font-medium text-xs mt-1">Please contact your supervisor for amount transfer and final disbursement.</p>
                        </div>
                    </div>
                )}

                {/* Tip */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-amber-800 font-bold text-sm">Pay your EMIs on time to avoid penalties and increase your creditworthiness.</p>
                    </div>
                </div>
            </div>

            {/* KYC Form Modal */}
            {showKycForm && (
                <div className="fixed inset-0 z-[100] bg-white overflow-y-auto pt-safe">
                    <div className="p-6">
                        <button onClick={() => setShowKycForm(false)} className="mb-8 p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <KycForm
                            loanAmount={loan.amount}
                            onSubmit={handleKycSubmit}
                            loading={submitting}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
