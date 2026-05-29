'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Lightbulb, Ban, IndianRupee, History, MessageSquare, Copy, ExternalLink } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import KycForm from '@/components/loan/KycForm';
import KycVerificationLoading from '@/components/loan/KycVerificationLoading';
import { toast } from '@/components/ui/Toast';

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const loanId = (params?.id || searchParams.get('id')) as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [loan, setLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // KYC Form State
    const [showKycForm, setShowKycForm] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [existingKycData, setExistingKycData] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [showVerificationLoading, setShowVerificationLoading] = useState(false);
    const [animationDuration, setAnimationDuration] = useState(30000);
    const resolveSubmissionRef = useRef<(() => void) | null>(null);

    const fetchLoan = async () => {
        try {
            const data = await apiFetch('/loans?history=1');
            const loans = Array.isArray(data) ? data : (data?.data || []);
            const found = loans.find((l: any) => l.id == loanId || l.loan_id == loanId);

            if (found) {
                setLoan(found);
                // If loan has form_data, use it as existing KYC data
                if (found.form_data) {
                    setExistingKycData(found.form_data);
                }

                // Fetch repayments for this specific loan
                try {
                    const repayData = await apiFetch(`/loans/${found.id || found.loan_id}/repayments`);
                    if (repayData && repayData.repayments) {
                        setRepayments(repayData.repayments);
                    }
                } catch (repayErr) {
                    console.error("Failed to fetch repayments for loan", repayErr);
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
                            other_fees: 270, // 18% of 1500 (processing fee)
                            other_fees_rate: 18,
                            processing_fee: 1500,
                            login_fee: 250,
                            field_kyc_fee: 500,
                            misc_fees: 0,
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

    const fetchTickets = async () => {
        try {
            const data = await apiFetch('/support/tickets');
            setTickets(Array.isArray(data) ? data : (data?.data || []));
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        }
    };

    // Auto Pilot Timer Logic
    const [timerInfo, setTimerInfo] = useState<{ total: number, remaining: number } | null>(null);

    useEffect(() => {
        if (!loan?.auto_pilot_next_step_at || !loan?.auto_pilot_enabled) {
            setTimerInfo(null);
            return;
        }

        const start = new Date(loan.updated_at).getTime();
        const target = new Date(loan.auto_pilot_next_step_at).getTime();
        const total = Math.max(1, Math.floor((target - start) / 1000));

        const updateTimer = () => {
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((target - now) / 1000));
            setTimerInfo({ total, remaining });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [loan?.auto_pilot_next_step_at, loan?.auto_pilot_enabled, loan?.updated_at]);

    const formatTimerLabel = (seconds: number) => {
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }
        if (seconds >= 60) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}m ${secs}s`;
        }
        return `${seconds}s`;
    };

    useEffect(() => {
        fetchLoan();
        fetchUserData();
        fetchTickets();

        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !showKycForm && !showVerificationLoading && !submitting) {
                fetchLoan();
                fetchUserData();
                fetchTickets();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [loanId, showKycForm, showVerificationLoading, submitting]);

    useEffect(() => {
        const handleLoanUpdate = (e: any) => {
            const updatedLoan = e.detail;
            if (updatedLoan && (updatedLoan.id == loanId || updatedLoan.display_id == loanId)) {
                console.log("[StatusClient] Real-time loan update received:", updatedLoan.status);
                // We always fetch loan data to ensure consistency, but skip if form is open to avoid flash
                if (!showKycForm) {
                    fetchLoan();
                    fetchUserData();
                }
            }
        };

        const handleUserUpdate = () => {
            console.log("[StatusClient] Real-time user update received");
            if (!showKycForm) fetchUserData();
        };

        window.addEventListener('loanStateUpdate', handleLoanUpdate);
        window.addEventListener('userStateUpdate', handleUserUpdate);
        window.addEventListener('walletStateUpdate', handleLoanUpdate); // Re-use loan update for wallet as they often go together

        return () => {
            window.removeEventListener('loanStateUpdate', handleLoanUpdate);
            window.removeEventListener('userStateUpdate', handleUserUpdate);
            window.removeEventListener('walletStateUpdate', handleLoanUpdate);
        };
    }, [loanId, showKycForm]);

    // Multi-stage Animation Trigger Logic - Ensure it only reflects ONE TIME per loan
    useEffect(() => {
        if (!loan || showKycForm || showVerificationLoading || submitting) return;

        const status = loan.status;
        const storageKey = `loan_${loan.id}_anim_shown`;
        const shownStages = JSON.parse(localStorage.getItem(storageKey) || '{}');

        // Check if ANY animation has already been shown for this loan
        const hasShownAny = Object.values(shownStages).some(val => val === true);
        if (hasShownAny) return;

        // Step 1: Proceed (VETTING/PROCEEDED)
        if (['VETTING', 'PROCEEDED'].includes(status) && !shownStages.proceed) {
            const duration = (loan.auto_pilot_enabled && timerInfo?.remaining) ? timerInfo.remaining * 1000 : 30000;
            setAnimationDuration(duration);
            setShowVerificationLoading(true);

            shownStages.proceed = true;
            localStorage.setItem(storageKey, JSON.stringify(shownStages));

            resolveSubmissionRef.current = () => {
                setShowVerificationLoading(false);
                window.location.reload();
            };
            return; // Exit after triggering once
        }

        // Step 2: KYC Link (KYC_SENT)
        if (status === 'KYC_SENT' && !shownStages.kyc_link) {
            const duration = (loan.auto_pilot_enabled && timerInfo?.remaining) ? timerInfo.remaining * 1000 : 30000;
            setAnimationDuration(duration);
            setShowVerificationLoading(true);

            shownStages.kyc_link = true;
            localStorage.setItem(storageKey, JSON.stringify(shownStages));

            resolveSubmissionRef.current = () => {
                setShowVerificationLoading(false);
                window.location.reload();
            };
            return; // Exit after triggering once
        }

        // Step 3: Approval / Approve (KYC_SUBMITTED / APPROVED)
        if ((status === 'APPROVED' || (loan.auto_pilot_enabled && status === 'KYC_SUBMITTED')) && !shownStages.approve) {
            const duration = (loan.auto_pilot_enabled && timerInfo?.remaining) ? timerInfo.remaining * 1000 : 15000;
            setAnimationDuration(duration);
            setShowVerificationLoading(true);

            shownStages.approve = true;
            localStorage.setItem(storageKey, JSON.stringify(shownStages));

            resolveSubmissionRef.current = () => {
                setShowVerificationLoading(false);
                window.location.reload();
            };
            return; // Exit after triggering once
        }
    }, [loan?.status, timerInfo?.remaining, showKycForm, loan?.auto_pilot_enabled, loan?.id]);

    // Prepare initial KYC data from user profile and existing form data
    const initialKycData = useMemo(() => {
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
            if (!data.state) data.state = userData.state || '';
            if (!data.postal_code) data.postal_code = userData.pincode || '';
            if (!data.employer) data.employer = userData.business_name || '';
            if (!data.aadhar_number) data.aadhar_number = userData.aadhar_number || '';
            if (!data.pan_number) data.pan_number = userData.pan_number || '';
            data.is_aadhar_verified = !!userData.is_aadhar_verified;
            data.is_pan_verified = !!userData.is_pan_verified;
        }

        // Cleanup: If state accidentally contains an email (known legacy mapping bug)
        if (data.state && data.state.includes('@')) {
            data.state = '';
        }

        if (loan) {
            data.reupload_fields = loan.reupload_fields || [];
            data.reupload_remarks = loan.reupload_remarks || {};
            data.reupload_summary = loan.remarks || ''; // General remarks
        }

        return data;
    }, [userData, existingKycData, loan]);

    const handleConfirmClick = () => {
        // Always show KYC form before confirmation
        setShowKycForm(true);
    };

    const handleKycSubmit = async (kycData: any) => {
        console.log("StatusClient: handleKycSubmit triggered with data", kycData);
        setSubmitting(true);
        try {
            // First, start the Sci-Fi loading animation (Stage 1)
            console.log("StatusClient: Showing verification loading animation...");
            setAnimationDuration(30000);
            setShowVerificationLoading(true);

            // Mark stage 1 as shown in localStorage
            const storageKey = `loan_${loan.id}_anim_shown`;
            const shownStages = JSON.parse(localStorage.getItem(storageKey) || '{}');
            shownStages.stage1 = true;
            localStorage.setItem(storageKey, JSON.stringify(shownStages));

            // This Promise will be resolved when the user clicks "Get Money Now" in the loading component
            await new Promise<void>((resolve) => {
                resolveSubmissionRef.current = resolve;
            });

            // First, save the KYC data to the loan
            await apiFetch(`/loans/${loan.id}/kyc-data`, {
                method: 'POST',
                body: JSON.stringify({
                    ...kycData,
                    referral_code: kycData.referral_code || localStorage.getItem('referral_code') || localStorage.getItem('loan_referral_code')
                })
            });

            // Mark stage as shown BEFORE confirm/fetch to prevent useEffect re-trigger
            if (loan.auto_pilot_enabled) {
                const storageKey = `loan_${loan.id}_anim_shown`;
                const shownStages = JSON.parse(localStorage.getItem(storageKey) || '{}');
                shownStages.approve = true; // Prevents the auto-pilot trigger for KYC_SUBMITTED
                localStorage.setItem(storageKey, JSON.stringify(shownStages));
            }

            // Then confirm the application
            await apiFetch(`/loans/${loan.id}/confirm`, {
                method: 'POST'
            });

            toast.success('Application confirmed successfully!');
            setShowKycForm(false);
            fetchLoan();
        } catch (e: any) {
            console.error("Submission failed in StatusClient:", e);
            // We re-throw so KycForm can catch it and show its internal "Re-upload" error state
            throw e;
        } finally {
            setSubmitting(false);
            setShowVerificationLoading(false);
        }
    };

    const handleKycCancel = () => {
        setShowKycForm(false);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Virtual Credit not found</div>;

    const {
        principal = Number(loan.amount),
        other_fees: otherFeesCalc = 0,
        gst = 0, // Legacy support
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
                    <ArrowLeft className="w-4 h-4" /> Back to Virtual Credit
                </button>
                <h1 className="text-xl font-black text-white mb-2">Status Overview</h1>
                <p className="text-slate-400 font-medium text-sm">Track your virtual credit application #{loan.display_id || loanId}</p>
            </div>

            <div className="px-4 -mt-10 relative z-20 space-y-4">

                {/* Details Card */}
                <div className="bg-white rounded-lg shadow-xl shadow-blue-900/5 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Virtual Credit ID</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 border rounded-full uppercase tracking-widest ${(loan.status === 'CLOSED' || (loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= netPayableAmount)) ? 'bg-slate-50 border-slate-200 text-slate-700' :
                                    (loan.status === 'DISBURSED' || loan.status === 'APPROVED') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                        loan.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                            (loan.status === 'KYC_SENT' || loan.status === 'PROCEEDED' || loan.status === 'VETTING') ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                (loan.status === 'FORM_SUBMITTED' || loan.status === 'KYC_SUBMITTED') ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                    (loan.status === 'APPLIED' || loan.status === 'PENDING' || loan.status === 'PREVIEW') ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                        'bg-slate-50 border-slate-100 text-slate-600'
                                    }`}>{(loan.status === 'CLOSED' || (loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= netPayableAmount)) ? 'COMPLETED' : loan.status.replace('_', ' ')}</span>

                                {loan.status === 'REJECTED' && loan.reason && (
                                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                                                <Ban size={12} className="text-rose-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Application Rejected</span>
                                        </div>
                                        <p className="text-sm text-rose-600 font-medium leading-relaxed pl-8">{loan.reason}</p>
                                    </div>
                                )}

                                {loan.status === 'CANCELLED' && (
                                    <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                                <Ban size={12} className="text-slate-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Application Cancelled</span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed pl-8">{loan.remarks || 'This application has been cancelled by the administration.'}</p>
                                    </div>
                                )}

                            </div>
                            <h2 className="text-xl font-normal text-slate-900 tracking-tight">#{loan.display_id || loanId}</h2>
                        </div>

                        <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isDetailsOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                            {/* Additional Charges Group */}
                            <div className="space-y-3 pt-2 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sanction summary</p>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Virtual Credit Amount</span>
                                    <span className="text-slate-900 font-bold"> {principal.toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t border-dashed border-slate-100 space-y-3">
                                    {loan.calculations?.fee_structure && loan.calculations.fee_structure.length > 0 ? (
                                        loan.calculations.fee_structure.map((fee: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs text-slate-500">
                                                <span>{fee.name === 'Login Fee' ? 'Membership Open Score' : fee.name}</span>
                                                <span className="text-slate-900 font-medium"> {Number(fee.amount).toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Membership Open Score</span>
                                                <span className="text-slate-900 font-medium"> {loginFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Processing Fee</span>
                                                <span className="text-slate-900 font-medium"> {processingFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Field KYC Fee</span>
                                                <span className="text-slate-900 font-medium"> {fieldKycFee.toLocaleString()}</span>
                                            </div>
                                            {otherFees > 0 && (
                                                <div className="flex justify-between text-xs text-slate-500">
                                                    <span>Other Fees</span>
                                                    <span className="text-slate-900 font-medium"> {otherFees.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Other Fees</span>
                                        <span className="text-slate-900 font-medium"> {(otherFeesCalc || gst).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black text-slate-900 pt-1 border-t border-slate-100">
                                        <span>Total fee & Charges pay</span>
                                        <span> {totalDeductions.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-900">
                                    <span>Disbursal Amount</span>
                                    <span className="text-blue-600"> {disbursalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Interest ({interestRate}%)</span>
                                    <span className="text-slate-900 font-medium"> {totalInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-100">
                                    <span>Total Net Pay</span>
                                    <span className="text-indigo-700"> {(disbursalAmount + totalInterest).toLocaleString()}</span>
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

                    {!['DISBURSED', 'CLOSED', 'REJECTED', 'CANCELLED', 'PREVIEW', 'DISBURSAL'].includes(loan.status) &&
                        !tickets.some(t => t.subject?.includes('Fast Disbursal Request') && t.status !== 'CLOSED') && (
                            <button
                                onClick={() => {
                                    // Direct redirect with prefill data - no background API call here
                                    const ticketData = encodeURIComponent(JSON.stringify({
                                        prefill: true,
                                        autoSubmit: true,
                                        subject: `Fast Disbursal Request - Loan #${loan.display_id || loan.id}`,
                                        message: `I have applied for Loan #${loan.display_id || loan.id} for ${Number(loan.amount).toLocaleString()} and my current status is ${loan.status}. Please proceed with my fast disbursal.`,
                                        category: 'loan_kyc_other'
                                    }));
                                    router.push(`/customer/support?ticket=${ticketData}`);
                                }}
                                className="w-full py-3 bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all rounded-b-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Click here for fast disbursal
                            </button>
                        )}
                </div>

                {/* Timeline Stepper */}
                <div className="bg-white rounded-lg p-4 py-6 shadow-xl shadow-blue-900/5">
                    {loan?.auto_pilot_enabled && loan?.auto_pilot_next_step_at && (
                        <div className="mb-8 flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] animate-in fade-in zoom-in duration-500 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                {timerInfo && timerInfo.remaining > 0 ? (
                                    <CountdownCircleTimer
                                        key={`${loan.status}-${loan.auto_pilot_next_step_at}`}
                                        isPlaying
                                        duration={timerInfo.total}
                                        initialRemainingTime={timerInfo.remaining}
                                        colors={['#3b82f6', '#2563eb', '#1d4ed8', '#1e3a8a']}
                                        colorsTime={[timerInfo.total, timerInfo.total * 0.6, timerInfo.total * 0.3, 0]}
                                        size={120}
                                        strokeWidth={6}
                                        trailColor="#f1f5f9"
                                        onComplete={() => {
                                            fetchLoan();
                                            fetchUserData();
                                            window.location.reload();
                                        }}
                                    >
                                        {({ remainingTime }) => (
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Remaining</span>
                                                <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                                                    {formatTimerLabel(remainingTime)}
                                                </span>
                                                <span className="text-[9px] font-bold text-blue-500 mt-1 uppercase tracking-widest animate-pulse">Syncing</span>
                                            </div>
                                        )}
                                    </CountdownCircleTimer>
                                ) : (
                                    <div className="w-[120px] h-[120px] rounded-full border-6 border-slate-100 flex flex-col items-center justify-center text-center bg-white shadow-sm relative">
                                        <div className="absolute inset-0 rounded-full border-6 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest animate-pulse leading-none">
                                            PROCESSING
                                        </span>
                                        <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest animate-pulse">Syncing</span>
                                    </div>
                                )}

                                <div className="text-center">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">
                                        Under Processing: {loan.auto_pilot_next_step_name?.replace('_', ' ')}
                                    </h4>
                                    <p className="text-[9px] font-medium text-slate-400 italic">
                                        Under Process
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between relative px-2">
                        {/* Connecting Line - Thinner and Elegant */}
                        <div className="absolute left-6 right-6 top-[20px] h-[2px] bg-slate-50 z-0">
                            <div className={`h-full bg-emerald-500 transition-all duration-1000 ${loan.status === 'CLOSED' || loan.status === 'DISBURSED' ? 'w-full' :
                                loan.status === 'APPROVED' ? 'w-[75%]' :
                                    (['FORM_SUBMITTED', 'KYC_SUBMITTED'].includes(loan.status)) ? 'w-[50%]' :
                                        (['KYC_SENT', 'PROCEEDED', 'VETTING'].includes(loan.status)) ? 'w-[25%]' :
                                            'w-0'
                                }`} />
                        </div>


                        {/* Steps */}
                        {[
                            {
                                label: 'Submitted',
                                date: new Date(loan.created_at).toLocaleDateString(),
                                status: (['VETTING', 'PROCEEDED', 'KYC_SENT', 'FORM_SUBMITTED', 'KYC_SUBMITTED', 'APPROVED', 'DISBURSED', 'CLOSED'].includes(loan.status)) ? 'done' : 'current'
                            },
                            {
                                label: 'Verification',
                                date: (['FORM_SUBMITTED', 'KYC_SUBMITTED', 'APPROVED', 'DISBURSED', 'CLOSED'].includes(loan.status)) ? 'Verified' : 'In Progress',
                                status: (['FORM_SUBMITTED', 'KYC_SUBMITTED', 'APPROVED', 'DISBURSED', 'CLOSED'].includes(loan.status)) ? 'done' :
                                    (['KYC_SENT', 'PROCEEDED', 'VETTING'].includes(loan.status)) ? 'current' : 'pending'
                            },
                            {
                                label: 'Approval',
                                date: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : 'Awaiting',
                                status: (['APPROVED', 'DISBURSED', 'CLOSED'].includes(loan.status)) ? 'done' :
                                    (['FORM_SUBMITTED', 'KYC_SUBMITTED'].includes(loan.status)) ? 'current' : 'pending'
                            },
                            {
                                label: loan.status === 'CLOSED' ? 'Closed' : 'Disbursal',
                                date: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : '',
                                status: (loan.status === 'DISBURSED' || loan.status === 'CLOSED') ? 'done' :
                                    loan.status === 'APPROVED' ? 'current' : 'pending'
                            },
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-9 h-9 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 relative ${step.status === 'done' ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/10' :
                                    step.status === 'error' ? 'bg-rose-500 border-white text-white' :
                                        step.status === 'current' ? 'bg-white border-amber-400 text-amber-500 shadow-xl shadow-amber-400/5' :
                                            'bg-slate-50 border-white text-slate-100'
                                    }`}>
                                    {step.status === 'done' ? <Check size={16} strokeWidth={4} /> :
                                        step.status === 'error' ? <Ban size={16} strokeWidth={4} /> :
                                            (step.status === 'current' && loan?.auto_pilot_enabled && timerInfo && i < 3) ? (
                                                <div className="scale-[0.25]">
                                                    <CountdownCircleTimer
                                                        key={`${loan.status}-${loan.auto_pilot_next_step_at}-mini`}
                                                        isPlaying
                                                        duration={timerInfo.total}
                                                        initialRemainingTime={timerInfo.remaining}
                                                        colors="#fbbf24"
                                                        size={120}
                                                        strokeWidth={12}
                                                        trailColor="#ffffff"
                                                    />
                                                </div>
                                            ) :
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

                {/* Special Action: Complete KYC / Correction */}
                {(loan.status === 'KYC_SENT' || loan.reupload_fields?.length > 0) && (
                    <div className="bg-blue-600 rounded-lg p-4 text-white shadow-xl shadow-blue-600/20 flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">
                                {loan.reupload_fields?.length > 0 ? 'Document Correction Required' : 'Complete Your KYC'}
                            </h3>
                            <p className="text-blue-100 text-xs font-medium mt-1">
                                {loan.reupload_fields?.length > 0
                                    ? 'Your loan is processed, all you need is to re-upload these fields required by admin.'
                                    : 'We need a few more details to finalize your application.'}
                            </p>

                            {loan.reupload_fields?.length > 0 && (
                                <div className="mt-4 text-left space-y-2 border-t border-white/10 pt-4">
                                    {loan.reupload_fields.map((field: string, i: number) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">
                                                    {field.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            {loan.reupload_remarks?.[field] && (
                                                <p className="text-[10px] text-blue-100 font-medium italic pl-3.5 opacity-80">
                                                    "{loan.reupload_remarks[field]}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex w-full gap-2">
                            <button
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_KYC_URL || 'https://kyc.msmeloan.sbs'}/form?token=${loan.kyc_token}`, '_blank')}
                                className="flex-1 py-3 bg-white text-blue-600 rounded-lg font-black text-sm hover:bg-blue-50 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={14} /> Open Form
                            </button>
                            <button
                                onClick={() => {
                                    const url = `${process.env.NEXT_PUBLIC_KYC_URL || 'https://kyc.msmeloan.sbs'}/form?token=${loan.kyc_token}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Application link copied!');
                                }}
                                className="px-4 py-3 bg-blue-700/50 text-white rounded-lg font-black text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center"
                                title="Copy Link"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Special Action: Pay Platform Fee - ONLY if APPROVED and EMI #0 is pending */}
                {loan.status === 'APPROVED' && (!loan.reupload_fields || loan.reupload_fields.length === 0) && repayments.some(r => Number(r.emi_number) === 0 && r.status === 'PENDING') && (
                    <div className="bg-slate-900 rounded-lg p-5 text-white shadow-xl shadow-slate-900/20 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                            <IndianRupee className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-yellow-400 uppercase tracking-tight">Congratulations!</h2>
                            <p className="text-slate-400 text-[11px] font-medium mt-1 px-4 leading-relaxed">
                                Your loan is approved!
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/customer/loan/status/repayment?id=${loanId}`)}
                            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Track My Virtual Credit
                        </button>
                    </div>
                )}

                {/* Special Info: Contact Supervisor - Only if APPROVED and NO pending platform fee (or already paid) */}
                {loan.status === 'APPROVED' && !repayments.some(r => Number(r.emi_number) === 0 && r.status === 'PENDING') && (
                    <div
                        onClick={() => {
                            // Navigate to support page with pre-filled ticket data
                            const ticketData = encodeURIComponent(JSON.stringify({
                                prefill: true,
                                subject: `unable to transfer`,
                                message: `I have completed 3 stage of verification and loan disbursal spending kindly check and disburse my loan.`,
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
                            <h3 className="text-base font-black uppercase tracking-tight">Virtual Credit Approved!</h3>
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
                            <p className="text-slate-400 text-xs font-medium mt-1">Manage your virtual credit repayments and EMIs.</p>
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
                            <h3 className="text-base font-black uppercase tracking-tight">Virtual Credit History</h3>
                            <p className="text-emerald-600/80 text-xs font-medium mt-1">View the repayment timeline for this virtual credit.</p>
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
            {
                showKycForm && (
                    <KycForm
                        isModal={true}
                        loanAmount={Number(loan.amount)}
                        onSubmit={handleKycSubmit}
                        onCancel={handleKycCancel}
                        loading={submitting}
                        initialData={initialKycData}
                        user={userData}
                        loanId={loan.id}
                    />
                )
            }

            {/* Sci-Fi Loading Overlay */}
            {showVerificationLoading && (
                <KycVerificationLoading
                    loanAmount={Number(loan.amount)}
                    duration={animationDuration}
                    onComplete={() => {
                        if (resolveSubmissionRef.current) {
                            resolveSubmissionRef.current();
                            resolveSubmissionRef.current = null;
                        } else {
                            setShowVerificationLoading(false);
                        }
                    }}
                />
            )}
        </div >
    );
}
