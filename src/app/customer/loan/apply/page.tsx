'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Zap, CreditCard, Calendar, FileText, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/loanUtils';

export default function LoanApplication() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // UI States
    const [loadingParams, setLoadingParams] = useState(true);
    const [entryMode, setEntryMode] = useState(false); // Default to FALSE to show offers directly
    const [loanPlans, setLoanPlans] = useState([]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [showExcitement, setShowExcitement] = useState(false);

    // Data States
    const [user, setUser] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [cooldown, setCooldown] = useState({ active: false, daysRemaining: 0 });

    // Selection States for V2
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [selectedTenureConfig, setSelectedTenureConfig] = useState<any>(null);
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
    const [emiPreviews, setEmiPreviews] = useState<Record<string, any>>({});  // Store EMI calculations from backend
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Fetch User Profile
                const profileData = await apiFetch('/auth/me');
                if (profileData) {
                    setUser(profileData);
                    setStep(2);
                }

                const loansResponse = await apiFetch('/loans');
                const loansData = Array.isArray(loansResponse) ? loansResponse : (loansResponse?.data || []);
                setLoans(loansData);

                // Identify Active Loan (Not closed/rejected/cancelled)
                const active = loansData.find((l: any) => {
                    const statusMatch = ['PENDING', 'PROCEEDED', 'KYC_SENT', 'FORM_SUBMITTED', 'APPROVED', 'PREVIEW'].includes(l.status);
                    const isUnpaidDisbursed = l.status === 'DISBURSED' && Number(l.paid_amount || 0) < Number(l.amount);
                    return statusMatch || isUnpaidDisbursed;
                });
                setActiveLoan(active);

                // Check Cooldown
                const sorted = [...loansData].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const lastDisbursed = sorted.find((l: any) => {
                    if (!l.disbursed_at) return false;
                    if (l.status === 'CLOSED') return false;
                    if (l.status === 'DISBURSED' && Number(l.paid_amount || 0) >= Number(l.amount)) return false;
                    return true;
                });

                if (lastDisbursed) {
                    const disbursedDate = new Date(lastDisbursed.disbursed_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - disbursedDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 15) {
                        setCooldown({ active: true, daysRemaining: 16 - diffDays });
                    }
                }

            } catch (e) {
                console.error(e);
            } finally {
                setCheckingEligibility(false);
            }
        };
        checkStatus();
    }, []);

    // NEW: Fetch EMI previews from backend whenever tenure config changes
    useEffect(() => {
        if (!selectedTenureConfig || !selectedOffer) return;

        const fetchPreviews = async () => {
            setIsLoadingPreview(true);
            const previews: Record<string, any> = {};

            try {
                // Fetch calculations for each allowed frequency
                const frequencies = selectedTenureConfig.allowed_frequencies || [];
                await Promise.all(
                    frequencies.map(async (freq: string) => {
                        try {
                            console.log(`Calling calculate-preview for ${freq}`, {
                                amount: selectedOffer.rawAmount,
                                tenure_days: selectedTenureConfig.tenure_days,
                                frequency: freq
                            });
                            const response = await apiFetch('/loans/calculate-preview', {
                                method: 'POST',
                                body: JSON.stringify({
                                    amount: selectedOffer.rawAmount,
                                    tenure_days: selectedTenureConfig.tenure_days,
                                    frequency: freq,
                                    loan_plan_id: selectedOffer.id
                                })
                            });
                            console.log(`Response for ${freq}:`, response);
                            previews[freq] = response;
                        } catch (error) {
                            console.error(`Failed to calculate preview for ${freq}:`, error);
                            // Set fallback values on error
                            previews[freq] = { emi_amount: 0, num_emis: 0 };
                        }
                    })
                );

                setEmiPreviews(previews);
            } catch (error) {
                console.error('Failed to fetch EMI previews:', error);
            } finally {
                setIsLoadingPreview(false);
            }
        };

        fetchPreviews();
    }, [selectedTenureConfig, selectedOffer]);

    const handleNewLoanClick = () => {
        if (activeLoan) {
            toast.error("You already have an active loan application. Please verify your status.");
            return;
        }
        if (cooldown.active) {
            toast.error(`Please wait ${cooldown.daysRemaining} days before applying for a new loan.`);
            return;
        }
        setEntryMode(false);
    };

    // Data fetching for EMI previews ...

    // States for Plans
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch('/loan-plans', { cache: 'no-store' });
                // Map V2 plans to UI
                const mappedPlans = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    rawAmount: Number(p.amount),
                    amount: `${parseFloat(p.amount).toLocaleString('en-IN')}`,
                    type: 'Credit',
                    // V2 Configuration Data
                    configurations: p.configurations || [],
                    // Visual summaries
                    tenureSummary: p.configurations?.map((c: any) => c.tenure_days < 30 ? `${c.tenure_days}d` : `${Math.round(c.tenure_days / 30)}m`).join(' / ') || 'N/A',
                    bestFor: p.tag_text || 'Standard',
                    // Extract base color name
                    colorName: (() => {
                        const sourceColor = p.plan_color || '';
                        const match = sourceColor.match(/(?:bg|from|text)-([a-z]+)-/);
                        return match ? match[1] : 'blue';
                    })()
                }));

                mappedPlans.sort((a: any, b: any) => a.rawAmount - b.rawAmount);
                setPlans(mappedPlans);

                // Handle pre-selected plan
                const planId = searchParams.get('planId');
                if (planId) {
                    const target = mappedPlans.find((p: any) => p.id == planId);
                    if (target) {
                        setSelectedOffer(target);
                        if (target.configurations && target.configurations.length > 0) {
                            setSelectedTenureConfig(target.configurations[0]);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load plans", e);
                toast.error("Could not load loan offers.");
            }
        };

        if (step === 2 || searchParams.get('planId')) {
            fetchPlans();
        }
    }, [step, searchParams]);

    // Effect to handle entry mode bypass if planId is provided
    useEffect(() => {
        const planId = searchParams.get('planId');
        const applyFlag = searchParams.get('apply');
        if ((planId || applyFlag === 'true') && entryMode) {
            setEntryMode(false);
        }
    }, [searchParams, entryMode]);

    const handleApply = async () => {
        if (!selectedOffer || !selectedTenureConfig) return;

        if (!user?.is_debug && !user?.has_verified_alternate_number) {
            toast.error("Mandatory: Please verify an alternate mobile number in your profile before applying for a loan.");
            router.push('/customer/profile');
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/loans/apply', {
                method: 'POST',
                body: JSON.stringify({
                    amount: selectedOffer.rawAmount,
                    // Pass EXACT days. Backend heuristic will detect > 6 as days.
                    tenure: selectedTenureConfig.tenure_days,
                    payout_frequency: selectedFrequency,
                    payout_option_id: 'standard',
                    loan_plan_id: selectedOffer.id,
                    referral_code: localStorage.getItem('referral_code') || localStorage.getItem('loan_referral_code') || localStorage.getItem('referral code')
                })
            });

            toast.success(response.message || "Application Submitted!");

            if (response.auto_approved) {
                const ticketData = {
                    prefill: true,
                    autoSubmit: true,
                    subject: "Instant Disbursal: 10,000 Loan",
                    message: "I have just applied for a 10,000 instant loan and it is pre-approved. Please release the funds to my account.",
                    category: "Loan Disbursal"
                };
                router.push(`/customer/support?ticket=${encodeURIComponent(JSON.stringify(ticketData))}`);
            } else {
                router.push('/customer/loan');
            }
        } catch (e: any) {
            toast.error(e.message || "Application Failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading || checkingEligibility) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-12 pb-24 px-4 relative overflow-hidden shadow-2xl`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10 max-w-md mx-auto">
                    <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-white/50 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Credit Request</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Allocation Protocol</p>
                        </div>
                        <div className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white`}>
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-12 relative z-20">
                {!user?.is_debug && !user?.has_verified_alternate_number && !checkingEligibility && (
                    <div className="mb-6 bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2 duration-500 shadow-xl shadow-rose-100/50">
                        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Verification Required</p>
                            <p className="text-[11px] font-bold text-slate-700 leading-tight">Please verify your alternate number to unlock credit services.</p>
                        </div>
                        <button
                            onClick={() => router.push('/customer/profile')}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                            Verify
                        </button>
                    </div>
                )}
                {entryMode ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
                        {/* Persistent Back Button - Mode 1 */}
                        <button
                            onClick={() => router.back()}
                            className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-20"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div className="mb-4 text-center">
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">What would you like to do?</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Select an option to proceed.</p>
                        </div>

                        {/* Apply New Loan Button */}
                        <div
                            onClick={handleNewLoanClick}
                            className={`relative overflow-hidden bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-slate-900/20 cursor-pointer group transition-all active:scale-[0.98] ${activeLoan || cooldown.active ? 'opacity-90' : ''}`}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-600/30 transition-colors"></div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4 border border-white/10">
                                    <Zap size={24} className="fill-current" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-1">Apply for New Loan</h3>
                                <p className="text-slate-400 text-sm font-medium mb-4">Get instant approval in minutes.</p>

                                {(activeLoan || cooldown.active) && (
                                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 backdrop-blur-md">
                                        <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-200 font-medium leading-relaxed">
                                            {activeLoan ? "Active loan in progress." : `Wait ${cooldown.daysRemaining} days to apply.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Existing Loans Button */}
                        <div
                            onClick={() => router.push('/customer/loan/history')}
                            className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 cursor-pointer group transition-all active:scale-[0.98] hover:border-slate-200"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10"></div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">Existing Loans</h3>
                                    <p className="text-slate-500 text-sm font-medium">View ongoing and past loans.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-transform">
                                    <ArrowLeft size={20} className="rotate-180" />
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className={cn(
                        "bg-white rounded-3xl p-6 shadow-xl relative overflow-hidden animate-in slide-in-from-right-8 duration-300",
                        user?.role === 'MERCHANT' ? "shadow-emerald-900/5 border border-emerald-100" : "shadow-blue-900/5 border border-slate-100"
                    )}>
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-2 transition-all",
                            user?.role === 'MERCHANT' ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        )}></div>

                        {/* Persistent Back Button - Mode 2 */}
                        <button
                            onClick={() => {
                                setEntryMode(true);
                            }}
                            className="absolute left-6 top-6 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-20"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div className="mb-8 text-center mt-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Apply for Loan</h1>
                            <p className="text-slate-500 text-sm font-medium">Get instant approval in minutes.</p>
                        </div>

                        {/* Step 1 Removed - Users go straight to Step 2 (Offers) */}

                        {step === 2 && (
                            <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                                {/* Offers List */}
                                {plans.map((offer, index) => {
                                    let solidColorClass = 'bg-blue-600';
                                    let badgeClasses = 'bg-blue-600 text-white';

                                    switch (offer.colorName) {
                                        case 'slate': solidColorClass = 'bg-slate-600'; badgeClasses = 'bg-slate-600 text-white'; break;
                                        case 'gray': solidColorClass = 'bg-gray-600'; badgeClasses = 'bg-gray-600 text-white'; break;
                                        case 'zinc': solidColorClass = 'bg-zinc-600'; badgeClasses = 'bg-zinc-600 text-white'; break;
                                        case 'neutral': solidColorClass = 'bg-neutral-600'; badgeClasses = 'bg-neutral-600 text-white'; break;
                                        case 'stone': solidColorClass = 'bg-stone-600'; badgeClasses = 'bg-stone-600 text-white'; break;
                                        case 'red': solidColorClass = 'bg-red-600'; badgeClasses = 'bg-red-600 text-white'; break;
                                        case 'orange': solidColorClass = 'bg-orange-600'; badgeClasses = 'bg-orange-600 text-white'; break;
                                        case 'amber': solidColorClass = 'bg-amber-600'; badgeClasses = 'bg-amber-600 text-white'; break;
                                        case 'yellow': solidColorClass = 'bg-yellow-600'; badgeClasses = 'bg-yellow-600 text-white'; break;
                                        case 'lime': solidColorClass = 'bg-lime-600'; badgeClasses = 'bg-lime-600 text-white'; break;
                                        case 'green': solidColorClass = 'bg-green-600'; badgeClasses = 'bg-green-600 text-white'; break;
                                        case 'emerald': solidColorClass = 'bg-emerald-600'; badgeClasses = 'bg-emerald-600 text-white'; break;
                                        case 'teal': solidColorClass = 'bg-teal-600'; badgeClasses = 'bg-teal-600 text-white'; break;
                                        case 'cyan': solidColorClass = 'bg-cyan-600'; badgeClasses = 'bg-cyan-600 text-white'; break;
                                        case 'sky': solidColorClass = 'bg-sky-600'; badgeClasses = 'bg-sky-600 text-white'; break;
                                        case 'blue': solidColorClass = 'bg-blue-600'; badgeClasses = 'bg-blue-600 text-white'; break;
                                        case 'indigo': solidColorClass = 'bg-indigo-600'; badgeClasses = 'bg-indigo-600 text-white'; break;
                                        case 'violet': solidColorClass = 'bg-violet-600'; badgeClasses = 'bg-violet-600 text-white'; break;
                                        case 'purple': solidColorClass = 'bg-purple-600'; badgeClasses = 'bg-purple-600 text-white'; break;
                                        case 'fuchsia': solidColorClass = 'bg-fuchsia-600'; badgeClasses = 'bg-fuchsia-600 text-white'; break;
                                        case 'pink': solidColorClass = 'bg-pink-600'; badgeClasses = 'bg-pink-600 text-white'; break;
                                        case 'rose': solidColorClass = 'bg-rose-600'; badgeClasses = 'bg-rose-600 text-white'; break;
                                    }

                                    return (
                                        <div onClick={() => {
                                            setSelectedOffer(offer);
                                            // Auto-select first tenure config if available
                                            if (offer.configurations && offer.configurations.length > 0) {
                                                setSelectedTenureConfig(offer.configurations[0]);
                                                setSelectedFrequency('');
                                            } else {
                                                setSelectedTenureConfig(null);
                                            }
                                        }} key={index} className={`cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-3 relative group overflow-hidden transition-all hover:border-slate-300 active:scale-[0.98]`}>
                                            <div className={`absolute top-0 left-0 w-1 h-full ${solidColorClass}`}></div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{offer.type}</p>
                                                    <h3 className="text-xl font-black text-slate-900">{offer.amount}</h3>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={cn(
                                                        "block text-xs font-bold px-2 py-1 rounded shadow-sm mb-1",
                                                        badgeClasses
                                                    )}>
                                                        {offer.bestFor}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 block">{offer.tenureSummary}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-medium text-xs mb-4">{offer.configurations.length} Tenure Options</p>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedOffer(offer); }} className="py-2.5 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-300 transition-colors">
                                                    View Options
                                                </button>
                                                <button className={cn(
                                                    "py-2.5 rounded-lg font-bold text-xs shadow-lg shadow-[var(--tw-shadow-color)] transition-all active:scale-95 flex items-center justify-center gap-1",
                                                    badgeClasses
                                                )} style={{ '--tw-shadow-color': 'rgba(0,0,0,0.1)' } as any}>
                                                    Apply Now <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {!entryMode && (
                    <div className="text-center mt-8">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                            <CreditCard className="w-3 h-3" /> 100% Digital Process
                        </p>
                    </div>
                )}
            </div>

            {/* Excitement Modal */}
            {showExcitement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="relative w-full max-w-sm mx-auto p-4 text-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 animate-pulse delay-75"></div>

                        <div className="relative z-10 animate-in zoom-in-50 duration-500 slide-in-from-bottom-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40 animate-bounce">
                                <Check className="w-10 h-10 text-white stroke-[4]" />
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Approved!</h2>
                            <p className="text-emerald-200 font-medium text-base mb-8">You are eligible for special offers.</p>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-8">
                                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">Credit Limit Unlocked</p>
                                <p className="text-3xl font-black text-white"> 50,000</p>
                            </div>

                            <button
                                onClick={() => setShowExcitement(false)}
                                className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-base shadow-xl shadow-white/10 hover:bg-slate-100 transition-all active:scale-95"
                            >
                                View My Offers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offer Details Modal */}
            {selectedOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setSelectedOffer(null)}
                            className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"
                        >
                            ✕
                        </button>

                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-xl",
                            user?.role === 'MERCHANT' ? "bg-emerald-600 shadow-emerald-600/20" : `${selectedOffer.color} shadow-blue-600/20`
                        )}>
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <CreditCard className="w-6 h-6" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-1">{selectedOffer.amount}</h3>
                        <p className="text-slate-500 font-bold text-sm mb-6">{selectedOffer.name}</p>

                        <div className="space-y-3 mb-8">
                            {/* Tenure Selection - Dynamic from Configs */}
                            <div className="border-b border-slate-50 pb-3">
                                <span className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Select Tenure</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedOffer.configurations.map((conf: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedTenureConfig(conf);
                                                setSelectedFrequency(''); // Reset frequency
                                            }}
                                            className={cn(
                                                "py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 shadow-sm",
                                                selectedTenureConfig === conf
                                                    ? (user?.role === 'MERCHANT' ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20' : 'bg-slate-900 text-white border-slate-900')
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                            )}
                                        >
                                            {conf.tenure_days >= 30 ? `${Math.round(conf.tenure_days / 30)} Months` : `${conf.tenure_days} Days`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Frequency Selector - Dependent on Tenure */}
                            {selectedTenureConfig && (
                                <div className="border-b border-slate-50 pb-3 animate-in fade-in slide-in-from-top-2">
                                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Repayment Frequency</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(selectedTenureConfig.allowed_frequencies || []).map((freq: string) => {
                                            // Get precalculated EMI data from backend
                                            const preview = emiPreviews[freq];
                                            const emi = preview?.emi_amount || 0;
                                            const numEmis = preview?.num_emis || 0;

                                            return (
                                                <button
                                                    key={freq}
                                                    onClick={() => setSelectedFrequency(freq)}
                                                    className={cn(
                                                        "py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95",
                                                        selectedFrequency === freq
                                                            ? (user?.role === 'MERCHANT' ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20' : 'bg-slate-900 text-white border-slate-900')
                                                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                                    )}
                                                >
                                                    <span className="uppercase tracking-wider">{freq.replace('_', ' ')}</span>
                                                    <span className={`text-[10px] ${selectedFrequency === freq ? 'text-slate-300' : 'text-slate-800'}`}>
                                                        {isLoadingPreview ? 'Calculating...' : `${emi.toLocaleString('en-IN')} PER EMI`}
                                                    </span>
                                                    {preview && !isLoadingPreview && (
                                                        <span className="text-[9px] opacity-75">
                                                            {numEmis} EMIs
                                                        </span>
                                                    )}

                                                    {selectedTenureConfig.cashback && selectedTenureConfig.cashback[freq] > 0 && (
                                                        <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl font-bold tracking-wider">
                                                            {selectedTenureConfig.cashback[freq]} CB
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Fees Display */}
                            {selectedTenureConfig && (
                                <div className="border-b border-slate-50 pb-3 space-y-2">
                                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Fees Breakdown</span>
                                    {selectedTenureConfig.fees && selectedTenureConfig.fees.map((fee: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-slate-500 font-medium">{fee.name}</span>
                                            <span className="text-slate-800 font-bold">{fee.amount}</span>
                                        </div>
                                    ))}
                                    {(() => {
                                        const totalFees = selectedTenureConfig.fees?.reduce((acc: number, f: any) => acc + (Number(f.amount) || 0), 0) || 0;
                                        const otherFeesRate = selectedTenureConfig.other_fees_rate ?? (selectedTenureConfig.gst_rate ?? 18);
                                        const otherFeesAmount = Math.round(totalFees * (otherFeesRate / 100));
                                        return (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Other Fees</span>
                                                <span className="text-slate-800 font-bold">{otherFeesAmount}</span>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex justify-between text-xs pt-1 border-t border-dashed border-slate-100">
                                        <span className="text-slate-500 font-medium">Service Charge</span>
                                        <span className="text-slate-800 font-bold">
                                            {selectedFrequency && selectedTenureConfig.interest_rates?.[selectedFrequency]
                                                ? selectedTenureConfig.interest_rates[selectedFrequency]
                                                : selectedTenureConfig.interest_rate}% / mo
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (!selectedTenureConfig) {
                                    toast.error("Please select a tenure option");
                                    return;
                                }
                                if (!selectedFrequency) {
                                    toast.error("Please select a repayment frequency");
                                    return;
                                }
                                handleApply();
                            }}
                            className={cn(
                                "w-full py-4 mt-6 mb-2 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2",
                                !selectedFrequency
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : (user?.role === 'MERCHANT' ? "bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700 font-bold" : "bg-slate-900 text-white shadow-slate-900/30 hover:bg-slate-800")
                            )}
                        >
                            Confirm & Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
