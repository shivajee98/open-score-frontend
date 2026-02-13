'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Lightbulb, Ban, IndianRupee, History, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import KycForm from '@/components/loan/KycForm';
import { toast } from '@/components/ui/Toast';

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const loanId = (params?.id || searchParams.get('id')) as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // KYC Form State
    const [showKycForm, setShowKycForm] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [existingKycData, setExistingKycData] = useState<any>(null);

    const fetchLoan = async () => {
        try {
            const data = await apiFetch('/loans');
            const loans = Array.isArray(data) ? data : (data?.data || []);
            const found = loans.find((l: any) => l.id == loanId || l.loan_id == loanId);

            if (found) {
                setLoan(found);
                // If loan has form_data, use it as existing KYC data
                if (found.form_data) {
                    setExistingKycData(found.form_data);
                }
            } else {
                if (loanId === 'L-10293') {
                    setLoan({
                        id: 'L-10293',
                        amount: 30000,
                        status: 'PENDING',
                        tenure: 3,
                        created_at: new Date().toISOString(),
                        calculations: {
                            principal: 30000,
                            gst: 270, // 18% of 1500 (processing fee)
                            gst_rate: 18,
                            processing_fee: 1500,
                            login_fee: 250,
                            field_kyc_fee: 500,
                            other_fees: 0,
                            interest_rate: 2.5,
                            total_interest: 2250,
                            total_deductions: 2520, // 270+1500+250+500
                            disbursal_amount: 30000,
                            net_payable_amount: 34770 // 30000+2250+2520
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Failed to fetch status", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const user = await apiFetch('/auth/me');
            setUserData(user);
        } catch (e) {
            console.error("Failed to fetch user data", e);
        }
    };

    useEffect(() => {
        fetchLoan();
        fetchUserData();
    }, [loanId]);

    // Prepare initial KYC data from user profile and existing form data
    const getInitialKycData = () => {
        const data: any = {};

        // From existing form_data (if user edited before)
        if (existingKycData) {
            Object.assign(data, existingKycData);
        }

        // From user profile (pre-populate if not already in form_data)
        if (userData) {
            if (!data.first_name && userData.name) {
                const nameParts = userData.name.split(' ');
                data.first_name = nameParts[0] || '';
                data.last_name = nameParts.slice(1).join(' ') || '';
            }
            if (!data.email) data.email = userData.email || '';
            if (!data.phone) data.phone = userData.mobile_number || '';
            if (!data.street_address) data.street_address = userData.business_address || '';
            if (!data.city) data.city = userData.city || '';
            if (!data.postal_code) data.postal_code = userData.pincode || '';
            if (!data.employer) data.employer = userData.business_name || '';
            if (!data.aadhar_number) data.aadhar_number = userData.aadhar_number || '';
            if (!data.pan_number) data.pan_number = userData.pan_number || '';
        }

        return data;
    };

    const handleConfirmClick = () => {
        // Always show KYC form before confirmation
        setShowKycForm(true);
    };

    const handleKycSubmit = async (kycData: any) => {
        setSubmitting(true);
        try {
            // First, save the KYC data to the loan
            await apiFetch(`/loans/${loan.id}/kyc-data`, {
                method: 'POST',
                body: JSON.stringify({
                    ...kycData,
                    referral_code: kycData.referral_code || localStorage.getItem('referral_code') || localStorage.getItem('loan_referral_code')
                })
            });

            // Then confirm the application
            await apiFetch(`/loans/${loan.id}/confirm`, {
                method: 'POST'
            });

            toast.success('Application confirmed successfully!');
            setShowKycForm(false);
            fetchLoan();
        } catch (e: any) {
            toast.error(e.message || 'Confirmation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKycCancel = () => {
        setShowKycForm(false);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loan not found</div>;

    const {
        principal = Number(loan.amount),
        gst = 0,
        processing_fee: processingFee = 0,
        login_fee: loginFee = 0,
        field_kyc_fee: fieldKycFee = 0,
        other_fees: otherFees = 0,
        interest_rate: interestRate = 0,
        total_interest: totalInterest = 0,
        total_deductions: totalDeductions = 0,
        disbursal_amount: disbursalAmount = Number(loan.amount),
        net_payable_amount: netPayableAmount = 0
    } = loan.calculations || {};

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-slate-900 p-4 pt-8 pb-16 rounded-b-xl shadow-xl relative z-10">
                <button onClick={() => router.push('/customer/loan')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Loans
                </button>
                <h1 className="text-xl font-black text-white mb-2">Application Status</h1>
                <p className="text-slate-400 font-medium text-sm">Track your loan application #{loanId}</p>
            </div>

            <div className="px-4 -mt-10 relative z-20 space-y-4">

                {/* Details Card */}
                <div className="bg-white rounded-lg shadow-xl shadow-blue-900/5 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Loan ID</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 border rounded-full uppercase tracking-widest ${(loan.status === 'CLOSED' || (loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= netPayableAmount)) ? 'bg-slate-50 border-slate-200 text-slate-700' :
                                    (loan.status === 'DISBURSED' || loan.status === 'APPROVED') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                        loan.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                            loan.status === 'KYC_SENT' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                loan.status === 'FORM_SUBMITTED' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                    'bg-slate-50 border-slate-100 text-slate-600'
                                    }`}>{(loan.status === 'CLOSED' || (loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= netPayableAmount)) ? 'COMPLETED' : loan.status.replace('_', ' ')}</span>
                            </div>
                            <h2 className="text-xl font-normal text-slate-900 tracking-tight">#{loanId}</h2>
                        </div>

                        <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isDetailsOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                            {/* Additional Charges Group */}
                            <div className="space-y-3 pt-2 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sanction summary</p>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Loan Amount</span>
                                    <span className="text-slate-900 font-bold">₹ {principal.toLocaleString()}</span>
                                </div>
                                {loan.calculations?.fee_structure && loan.calculations.fee_structure.length > 0 ? (
                                    loan.calculations.fee_structure.map((fee: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-500">
                                            <span>{fee.name}</span>
                                            <span className="text-slate-900 font-medium">₹ {Number(fee.amount).toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Processing Fee</span>
                                            <span className="text-slate-900 font-medium">₹ {processingFee.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Login Fee</span>
                                            <span className="text-slate-900 font-medium">₹ {loginFee.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Field KYC Fee</span>
                                            <span className="text-slate-900 font-medium">₹ {fieldKycFee.toLocaleString()}</span>
                                        </div>
                                        {otherFees > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Other Fees</span>
                                                <span className="text-slate-900 font-medium">₹ {otherFees.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>GST ({loan.calculations?.gst_rate ?? 18}%)</span>
                                    <span className="text-slate-900 font-medium">₹ {gst.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Interest ({interestRate}%)</span>
                                    <span className="text-slate-900 font-medium">₹ {totalInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-100">
                                    <span>Total fee and charges</span>
                                    <span>₹ {totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm font-bold text-slate-900">
                                    <span>Disbursal Amount</span>
                                    <span>₹ {disbursalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-900">
                                    <span>Net Payable Amount</span>
                                    <span>₹ {netPayableAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="w-full bg-slate-50 p-3 flex justify-center items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        {isDetailsOpen ? 'View Less' : 'View More'} <ChevronDown className={`w-4 h-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Fast Disbursal CTA */}
                    {/* Fast Disbursal CTA */}
                    {!['DISBURSED', 'CLOSED', 'REJECTED', 'CANCELLED', 'PREVIEW'].includes(loan.status) && (
                        <button
                            onClick={async () => {
                                try {
                                    setSubmitting(true);
                                    await apiFetch('/support/tickets', {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            subject: `Fast Disbursal Request - Loan #${loan.id}`,
                                            message: `Hello,\n\nI would like to request a fast disbursal for my loan application #${loan.id} for ₹${Number(loan.amount).toLocaleString()}.\n\nPlease process it at the earliest.\n\nThank you.`,
                                            priority: 'high',
                                            issue_type: 'loan_kyc_other'
                                        })
                                    });
                                    toast.success('Fast disbursal request sent successfully!');
                                } catch (e: any) {
                                    toast.error(e.message || 'Failed to send request');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            disabled={submitting}
                            className="w-full py-3 bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all rounded-b-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <MessageSquare className="w-3.5 h-3.5" />
                            )}
                            Click here for fast disbursal
                        </button>
                    )}
                </div>

                {/* Timeline Stepper */}
                <div className="bg-white rounded-lg p-4 py-6 shadow-xl shadow-blue-900/5">
                    <div className="flex items-center justify-between relative px-2">
                        {/* Connecting Line - Thinner and Elegant */}
                        <div className="absolute left-6 right-6 top-[20px] h-[2px] bg-slate-50 z-0 text-center">
                            <div className={`h-full bg-emerald-500 transition-all duration-1000 ${loan.status === 'CLOSED' || loan.status === 'DISBURSED' ? 'w-full' :
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
                                date: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') ? 'Verified' : 'In Progress',
                                status: (loan.status === 'FORM_SUBMITTED' || loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') ? 'done' :
                                    (loan.status === 'KYC_SENT' || loan.status === 'PROCEEDED') ? 'current' : 'pending'
                            },
                            {
                                label: 'Approval',
                                date: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : 'Awaiting',
                                status: (loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') ? 'done' :
                                    (loan.status === 'FORM_SUBMITTED') ? 'current' : 'pending'
                            },
                            {
                                label: loan.status === 'CLOSED' ? 'Closed' : 'Disbursal',
                                date: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : '',
                                status: (loan.status === 'DISBURSED' || loan.status === 'CLOSED') ? 'done' :
                                    loan.status === 'APPROVED' ? 'current' : 'pending'
                            },
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
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
                    <div className="bg-slate-900 rounded-lg p-4 text-white shadow-xl shadow-slate-900/20 flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Complete Application</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Fill your KYC details to confirm and submit your application.</p>
                        </div>
                        <button
                            onClick={handleConfirmClick}
                            disabled={submitting}
                            className="w-full py-3 bg-white text-slate-900 rounded-lg font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-slate-900 rounded-full animate-spin border-t-transparent"></div>
                            ) : `Fill KYC & Confirm`}
                        </button>
                    </div>
                )}

                {/* Special Action: Complete KYC */}
                {loan.status === 'KYC_SENT' && (
                    <div className="bg-blue-600 rounded-lg p-4 text-white shadow-xl shadow-blue-600/20 flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Complete Your KYC</h3>
                            <p className="text-blue-100 text-xs font-medium mt-1">We need a few more details to finalize your application.</p>
                        </div>
                        <button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_KYC_URL || 'https://kyc.msmeloan.sbs'}/form?token=${loan.kyc_token}`, '_blank')}
                            className="w-full py-3 bg-white text-blue-600 rounded-lg font-black text-sm hover:bg-blue-50 transition-all uppercase tracking-widest shadow-lg"
                        >
                            Open Application Form
                        </button>
                    </div>
                )}

                {/* Special Info: Contact Supervisor - Clickable to raise support ticket */}
                {loan.status === 'APPROVED' && (
                    <div
                        onClick={() => {
                            // Navigate to support page with pre-filled ticket data
                            const ticketData = encodeURIComponent(JSON.stringify({
                                prefill: true,
                                subject: `Fund Release Request - Loan #${loan.id}`,
                                message: `Hello,\n\nMy loan application #${loan.id} for ₹${Number(loan.amount).toLocaleString()} has been approved, but the funds have not been released to my account yet.\n\nPlease release the approved amount to my wallet at the earliest.\n\nThank you.`,
                                category: 'loan_kyc_other',
                                loanId: loan.id
                            }));
                            router.push(`/customer/support?ticket=${ticketData}`);
                        }}
                        className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-emerald-800 shadow-xl shadow-emerald-900/5 flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer hover:bg-emerald-100 transition-colors active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Loan Approved!</h3>
                            <p className="font-medium text-xs mt-1">Tap here to contact support and request fund release to your account.</p>
                        </div>
                        <div className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest">
                            Contact Support for Release
                        </div>
                    </div>
                )}

                {/* Repayment Option - Logic: Only show if disbursed AND NOT fully paid */}
                {loan.status === 'DISBURSED' && (Number(loan.paid_amount || 0) < netPayableAmount) && (
                    <div className="bg-slate-900 rounded-lg p-4 text-white shadow-xl shadow-slate-900/20 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Repayment Option</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Manage your loan repayments and EMIs.</p>
                        </div>
                        <button
                            onClick={() => router.push(`/customer/loan/status/repayment?id=${loanId}`)}
                            className="w-full py-3 bg-white text-slate-900 rounded-lg font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                            Repay Now
                        </button>
                    </div>
                )}

                {/* Loan History Option - Logic: Show if CLOSED OR Fully Paid */}
                {(loan.status === 'CLOSED' || (loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= netPayableAmount)) && (
                    <div className="bg-emerald-50 rounded-lg p-4 text-emerald-900 shadow-xl shadow-emerald-900/10 flex flex-col items-center text-center gap-3 border border-emerald-100">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <History className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Loan History</h3>
                            <p className="text-emerald-600/80 text-xs font-medium mt-1">View the repayment timeline for this loan.</p>
                        </div>
                        <button
                            onClick={() => router.push(`/customer/loan/status/repayment?id=${loanId}`)}
                            className="w-full py-3 bg-white text-emerald-600 border border-emerald-200 rounded-lg font-black text-sm hover:bg-emerald-50 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                            View History
                        </button>
                    </div>
                )}

                {/* Tip */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-start gap-3">
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
                <KycForm
                    isModal={true}
                    loanAmount={Number(loan.amount)}
                    onSubmit={handleKycSubmit}
                    onCancel={handleKycCancel}
                    loading={submitting}
                    initialData={getInitialKycData()}
                />
            )}
        </div>
    );
}
