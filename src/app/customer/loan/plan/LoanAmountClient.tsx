'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, Shield } from 'lucide-react';
import {
    LOAN_PLANS,
    TenureMonths,
    PayoutOption,
    calculateRepayment
} from '@/lib/loanUtils';
import RepaymentCard from '@/components/loan/EarningsCard'; // We'll rename the component later or alias it for now
import TenureSelector from '@/components/loan/TenureSelector';
import PayoutSelector from '@/components/loan/PayoutSelector';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function LoanDetail() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    // Support both path param (dev) and query param (static export)
    const amount = Number(params?.amount || searchParams.get('amount'));

    const [plan, setPlan] = useState<any>(null);
    const [selectedTenureIndex, setSelectedTenureIndex] = useState<number>(0);
    const [payout, setPayout] = useState<PayoutOption | null>(null);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setLoading(true);
                const plans = await apiFetch('/loan-plans');
                // Find by amount or better yet, we should have used ID. 
                // But for now, if it's the old [amount] route, we find by amount.
                // However, we should prefer planId if available.
                const planId = new URLSearchParams(window.location.search).get('planId');

                let found = null;
                if (planId) {
                    found = plans.find((p: any) => p.id == planId);
                } else {
                    found = plans.find((p: any) => Number(p.amount) === amount);
                }

                if (found) {
                    // Map to the format expected by this page's child components
                    const mappedPlan = {
                        ...found,
                        amount: Number(found.amount),
                        tenure_type: found.tenure_type || 'months',
                        tenures: found.configurations?.map((c: any, idx: number) => ({
                            days: c.tenure_days,
                            index: idx
                        })) || [],
                        payoutOptions: (index: number) => {
                            const conf = found.configurations?.[index];
                            if (!conf) return [];
                            return (conf.allowed_frequencies || []).map((freq: string) => ({
                                id: freq,
                                label: freq.replace('_', ' '),
                                frequency: freq,
                                interestRate: (conf.interest_rates && conf.interest_rates[freq] !== undefined)
                                    ? conf.interest_rates[freq]
                                    : (conf.interest_rate || 0),
                                cashback: conf.cashback?.[freq] || 0,
                                isBestValue: freq === 'Daily', // Default for now
                                tenureDays: conf.tenure_days // Exact days for calculation
                            }));
                        }
                    };
                    setPlan(mappedPlan);
                    if (mappedPlan.tenures.length > 0) {
                        setSelectedTenureIndex(0);
                    }
                } else {
                    router.replace('/customer/loan');
                }
            } catch (e) {
                console.error("Failed to load plan", e);
                router.replace('/customer/loan');
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [amount, router]);

    // Reset payout when tenure changes
    useEffect(() => {
        setPayout(null);
    }, [selectedTenureIndex]);

    // Auto-select 'Best Value' if available? 
    // Prompt says: "Auto-select it initially".
    // We should run this when options change (i.e. tenure changes).
    useEffect(() => {
        if (!plan) return;
        const options = plan.payoutOptions(selectedTenureIndex);
        const best = options.find((o: PayoutOption) => o.isBestValue);
        if (best) setPayout(best);
    }, [plan, selectedTenureIndex]);


    const [showOverlay, setShowOverlay] = useState(false);

    const handleConfirm = async () => {
        if (!payout) return;

        setLoading(true);
        try {
            const tenureDays = plan.configurations[selectedTenureIndex].tenure_days;
            // Use real backend API
            const res = await apiFetch('/loans/apply', {
                method: 'POST',
                body: JSON.stringify({
                    amount: plan.amount,
                    tenure: tenureDays > 6 ? tenureDays : Math.round(tenureDays / 30), // Backend heuristic: > 6 is days, <= 6 is months
                    payout_frequency: payout.frequency,
                    payout_option_id: payout.id,
                    loan_plan_id: plan.id,
                    referral_code: localStorage.getItem('referral_code') || localStorage.getItem('loan_referral_code') || localStorage.getItem('referral code')
                })
            });

            // apiFetch returns JSON data directly, or throws error
            const data = res;

            // Show animation overlay
            setShowOverlay(true);

            // Wait 3 seconds before redirecting
            setTimeout(() => {
                router.push(`/customer/loan/status/view?id=${data.id || data.loan_id || 'L-10293'}`);
            }, 3000);

        } catch (e: any) {
            toast.error(e.message || 'Application failed');
            setLoading(false);
        }
    };

    if (!plan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="animate-pulse w-full max-w-md h-96 bg-slate-200 rounded-2xl"></div></div>;

    const tenureDays = plan.configurations[selectedTenureIndex]?.tenure_days || 0;
    const currentOptions = plan.payoutOptions(selectedTenureIndex);
    const { total, breakdown, count, emi } = payout ? calculateRepayment(plan.amount, tenureDays, payout) : { total: 0, breakdown: '-', count: 0, emi: 0 };

    // Calculate Breakdown Details
    // Principal: plan.amount
    // Interest + Fees: Total - Principal
    // We want to show: Principal, Interest, Fees, Total Payable
    const principal = plan.amount;
    const totalPayable = total;

    // Heuristic: processing_fee is usually configured. 
    // Ideally calculateRepayment should return breakdown of fees.
    // For now, let's assume interest is (Total - Principal - Fees).
    // But we don't have exact fees here without configuration.
    // Let's rely on standard logic: Interest = Principal * Rate * Tenure. 
    // Remainder = Fees.

    // Better Approach: Just show "Est. Fees & Charges" line if (Total - Principal - Interest) > 0
    // But calculateRepayment internal logic for 'total' includes everything.
    // Let's invoke a helper or just estimate.

    // Inline Interest Calculation (since PlanUtils is not imported/available)
    let estInterest = 0;
    if (payout?.interestRate) {
        // Simple Interest: P * R * T
        // Rate is flat % for tenure usually in this system
        estInterest = (principal * payout.interestRate) / 100;
    }

    const estFees = totalPayable - principal - estInterest;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            {/* Header */}
            <div className="bg-slate-900 p-4 pb-24 rounded-b-[2rem]">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </button>
            </div>

            <div className="px-4 -mt-20">
                {/* We need to update EarningsCard to handle Repayment props or just pass Plan */}
                {/* Ideally we should rename EarningsCard to LoanSummaryCard. For now let's pass new props if component supports, or we update component next. */}
                <RepaymentCard
                    plan={plan}
                    tenure={tenureDays}
                    payout={payout}
                    isEmi={true}
                    totalEmi={total}
                    breakdown={breakdown}
                    count={count}
                    tenureType={plan.tenure_type}
                    // New Props for Fee Separation
                    principal={principal}
                    estInterest={estInterest}
                    estFees={estFees}
                />

                <TenureSelector
                    options={plan.tenures}
                    selected={selectedTenureIndex}
                    onChange={setSelectedTenureIndex}
                    payoutCount={payout ? count : undefined}
                    tenureType={plan.tenure_type}
                />

                <PayoutSelector
                    options={currentOptions}
                    selected={payout}
                    onChange={setPayout}
                    planAmount={plan.amount}
                    tenureDays={tenureDays}
                />



                {/* Terms */}
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <Shield className="w-5 h-5" />
                        <h4 className="font-black text-xs uppercase tracking-widest">Important Terms</h4>
                    </div>
                    <ul className="space-y-3">
                        {['Earnings credited to wallet only.', 'Early closure cancels future payouts.', 'Repayment schedule locks after disbursal.'].map((term, i) => (
                            <li key={i} className="flex gap-2 text-sm font-medium text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-2 shrink-0" />
                                {term}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* CTA - Now non-sticky, at the end of content */}
                <div className="mt-8 pb-32">
                    <button
                        onClick={handleConfirm}
                        disabled={!payout || loading}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-base shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : `Proceed`}
                    </button>
                </div>
            </div>

            <LoadingOverlay isVisible={showOverlay} />
        </div>
    );
}
