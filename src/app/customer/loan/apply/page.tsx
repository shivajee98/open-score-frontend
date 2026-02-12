'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Zap, CreditCard, Calendar, FileText, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';

export default function LoanApplication() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // UI States
    const [entryMode, setEntryMode] = useState(true);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [showExcitement, setShowExcitement] = useState(false);

    // Data States
    const [user, setUser] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [cooldown, setCooldown] = useState({ active: false, daysRemaining: 0 });

    // Form Data
    const [isWhatsappSame, setIsWhatsappSame] = useState(true);

    // Selection States for V2
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [selectedTenureConfig, setSelectedTenureConfig] = useState<any>(null);
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
    const [emiPreviews, setEmiPreviews] = useState<Record<string, any>>({});  // Store EMI calculations from backend
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        address: '',
        city: '',
        pinCode: '',
        altMobile: '',
        whatsappTicket: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Fetch User Profile
                const userData = await apiFetch('/auth/me');
                setUser(userData);
                if (userData && userData.name) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.name || '',
                        address: user.business_address || '',
                        pinCode: user.pincode || '',
                        // city not explicitly in user model? but let's see
                    }));
                    // If name and address exist, we can potentially skip step 1
                    // But maybe we just want to pre-fill.
                    // The user said: "if a user have already filled that form, then also why are we again opening that form"
                    // So let's skip to Step 2 if user has name and address.
                    if (user.name && (user.business_address || user.pincode)) {
                        setStep(2);
                    }
                }

                const response = await apiFetch('/loans');
                const data = Array.isArray(response) ? response : (response?.data || []);
                setLoans(data);

                // Identify Active Loan (Not closed/rejected/cancelled)
                const active = data.find((l: any) => {
                    const statusMatch = ['PENDING', 'PROCEEDED', 'KYC_SENT', 'FORM_SUBMITTED', 'APPROVED', 'PREVIEW'].includes(l.status);
                    const isUnpaidDisbursed = l.status === 'DISBURSED' && Number(l.paid_amount || 0) < Number(l.amount);
                    return statusMatch || isUnpaidDisbursed;
                });
                setActiveLoan(active);

                // Check Cooldown
                const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

    const handleInputChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e: any) => {
        e.preventDefault();

        // Age Validation
        const today = new Date();
        const birthDate = new Date(formData.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            toast.error('You must be at least 18 years old to apply for a loan.');
            return;
        }

        // Handle loan referral code - transfer to main storage if not already set
        const loanReferralCode = localStorage.getItem('loan_referral_code');
        const existingReferralCode = localStorage.getItem('referral_code');
        if (loanReferralCode && loanReferralCode.trim() && !existingReferralCode) {
            localStorage.setItem('referral_code', loanReferralCode.trim().toUpperCase());
            localStorage.removeItem('loan_referral_code');
        }

        setLoading(true);
        try {
            // Save user KYC data to profile so it's only filled once
            await apiFetch('/auth/me/update', {
                method: 'PUT',
                body: JSON.stringify({
                    name: formData.fullName,
                    business_address: formData.address,
                    city: formData.city,
                    pincode: formData.pinCode,
                    // We can store DOB and alt mobile in additional fields if needed
                    // For now, these are saved for this loan application
                })
            });

            setStep(2);
            setShowExcitement(true);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save information');
        } finally {
            setLoading(false);
        }
    };

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
                    amount: `₹${parseFloat(p.amount).toLocaleString('en-IN')}`,
                    type: 'Credit',
                    // V2 Configuration Data
                    configurations: p.configurations || [],
                    // Visual summaries
                    tenureSummary: p.configurations?.map((c: any) => c.tenure_days < 30 ? `${c.tenure_days}d` : `${Math.round(c.tenure_days / 30)}m`).join(' / ') || 'N/A',
                    bestFor: p.tag_text || 'Standard',
                    // Robustly extract color for solid background
                    color: (() => {
                        const colorMatch = p.plan_color?.match(/(?:from|bg)-([a-z]+-[0-9]+)/);
                        return colorMatch ? `bg-${colorMatch[1]}` : 'bg-indigo-600';
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
        if (planId && entryMode) {
            setEntryMode(false);
        }
    }, [searchParams, entryMode]);

    const handleApply = async () => {
        if (!selectedOffer || !selectedTenureConfig) return;

        setLoading(true);
        try {
            await apiFetch('/loans/apply', {
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
            toast.success("Application Submitted!");
            router.push('/customer/loan');
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
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden animate-in slide-in-from-right-8 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        {/* Persistent Back Button - Mode 2 */}
                        <button
                            onClick={() => {
                                if (step === 1) setEntryMode(true);
                                else setStep(step - 1);
                            }}
                            className="absolute left-6 top-6 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-20"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div className="mb-8 text-center mt-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Apply for Loan</h1>
                            <p className="text-slate-500 text-sm font-medium">Get instant approval in minutes.</p>
                        </div>

                        {step === 1 && (
                            <form onSubmit={handleFormSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Full Name (As per Aadhaar)</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                        placeholder="e.g. Rahul Kumar"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Pin Code</label>
                                        <input
                                            type="text"
                                            name="pinCode"
                                            value={formData.pinCode}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                            placeholder="000000"
                                            required
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm resize-none"
                                        placeholder="Enter your current address"
                                        rows={2}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                        placeholder="e.g. Mumbai"
                                        required
                                    />
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-500">Is this your WhatsApp Number?</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsWhatsappSame(!isWhatsappSame)}
                                            className={`w-10 h-6 rounded-full p-1 transition-colors ${isWhatsappSame ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isWhatsappSame ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                    {!isWhatsappSame && (
                                        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                            <input
                                                type="tel"
                                                name="whatsappTicket"
                                                value={formData.whatsappTicket}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-slate-200 rounded-lg p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                                placeholder="Enter WhatsApp Number"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Alternate Mobile No</label>
                                    <input
                                        type="tel"
                                        name="altMobile"
                                        value={formData.altMobile}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                        placeholder="+91"
                                        required
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                                        Have a Referral Code? (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={localStorage.getItem('loan_referral_code') || ''}
                                        onChange={(e) => {
                                            const code = e.target.value.toUpperCase();
                                            localStorage.setItem('loan_referral_code', code);
                                        }}
                                        className="w-full bg-white border border-blue-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm uppercase tracking-wider"
                                        placeholder="ENTER REFERRAL CODE"
                                        maxLength={20}
                                    />
                                    <p className="text-xs text-blue-600 mt-2">
                                        Enter a referral code to help both you and your referrer earn rewards!
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-base shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Checking Eligibility...' : 'Submit For Loan Approval'} <Zap className="w-4 h-4 text-yellow-400" />
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                                {/* Offers List */}
                                {plans.map((offer, index) => (
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
                                        <div className={`absolute top-0 left-0 w-1 h-full ${offer.color}`}></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{offer.type}</p>
                                                <h3 className="text-xl font-black text-slate-900">{offer.amount}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className={`block text-xs font-bold px-2 py-1 rounded text-white mb-1 ${offer.color}`}>
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
                                            <button className={`py-2.5 text-white rounded-lg font-bold text-xs shadow-lg transition-colors ${offer.color}`}>
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                                <p className="text-3xl font-black text-white">₹ 50,000</p>
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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
                        <button
                            onClick={() => setSelectedOffer(null)}
                            className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"
                        >
                            ✕
                        </button>

                        <div className={`w-12 h-12 rounded-xl ${selectedOffer.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                            <CreditCard className="w-8 h-8" />
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
                                            className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${selectedTenureConfig === conf
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
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
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1 ${selectedFrequency === freq
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span className="uppercase tracking-wider">{freq.replace('_', ' ')}</span>
                                                    <span className={`text-[10px] ${selectedFrequency === freq ? 'text-slate-300' : 'text-slate-800'}`}>
                                                        {isLoadingPreview ? 'Calculating...' : `₹${emi.toLocaleString('en-IN')} PER EMI`}
                                                    </span>
                                                    {preview && !isLoadingPreview && (
                                                        <span className="text-[9px] opacity-75">
                                                            {numEmis} EMIs
                                                        </span>
                                                    )}

                                                    {selectedTenureConfig.cashback && selectedTenureConfig.cashback[freq] > 0 && (
                                                        <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] px-1 rounded-bl">
                                                            ₹{selectedTenureConfig.cashback[freq]} CB
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
                                            <span className="text-slate-800 font-bold">₹{fee.amount}</span>
                                        </div>
                                    ))}
                                    {(() => {
                                        const totalFees = selectedTenureConfig.fees?.reduce((acc: number, f: any) => acc + (Number(f.amount) || 0), 0) || 0;
                                        const gstRate = selectedTenureConfig.gst_rate ?? 18;
                                        const gstAmount = Math.round(totalFees * (gstRate / 100));
                                        return (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-medium">GST ({gstRate}%)</span>
                                                <span className="text-slate-800 font-bold">₹{gstAmount}</span>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex justify-between text-xs pt-1 border-t border-dashed border-slate-100">
                                        <span className="text-slate-500 font-medium">Interest</span>
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
                            className={`w-full py-2.5 text-white rounded-xl font-black text-base shadow-xl hover:opacity-90 transition-opacity ${selectedOffer.color}`}
                        >
                            Confirm & Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
