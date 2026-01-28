
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    const router = useRouter();
    const amount = Number(params.amount);

    const [plan, setPlan] = useState<any>(null);
    const [tenure, setTenure] = useState<TenureMonths>(3);
    const [payout, setPayout] = useState<PayoutOption | null>(null);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (LOAN_PLANS[amount]) {
            setPlan(LOAN_PLANS[amount]);
            // Default tenure (lowest)
            const defaultTenure = LOAN_PLANS[amount].tenures[0];
            setTenure(defaultTenure);
            // Don't auto-select payout yet, force user choice or use useEffect below
        } else {
            router.replace('/customer/loan');
        }
    }, [amount, router]);

    // Reset payout when tenure changes
    useEffect(() => {
        setPayout(null);
    }, [tenure]);

    // Auto-select 'Best Value' if available? 
    // Prompt says: "Auto-select it initially".
    // We should run this when options change (i.e. tenure changes).
    useEffect(() => {
        if (!plan) return;
        const options = plan.payoutOptions(tenure);
        const best = options.find((o: PayoutOption) => o.isBestValue);
        if (best) setPayout(best);
    }, [plan, tenure]);


    const [showOverlay, setShowOverlay] = useState(false);

    const handleConfirm = async () => {
        if (!payout) return;

        setLoading(true);
        try {
            // Use real backend API
            const res = await apiFetch('/loans/apply', {
                method: 'POST',
                body: JSON.stringify({
                    amount: plan.amount,
                    tenure,
                    payout_frequency: payout.frequency,
                    payout_option_id: payout.id
                })
            });

            // apiFetch returns JSON data directly, or throws error
            const data = res;

            // Show animation overlay
            setShowOverlay(true);

            // Wait 3 seconds before redirecting
            setTimeout(() => {
                router.push(`/customer/loan/status/${data.id || data.loan_id || 'L-10293'}`);
            }, 3000);

        } catch (e: any) {
            toast.error(e.message || 'Application failed');
            setLoading(false);
        }
    };

    if (!plan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="animate-pulse w-full max-w-md h-96 bg-slate-200 rounded-3xl"></div></div>;

    const currentOptions = plan.payoutOptions(tenure);
    const { total, breakdown, count, emi } = payout ? calculateRepayment(plan.amount, tenure, payout) : { total: 0, breakdown: '-', count: 0, emi: 0 };

    // Calculate Breakdown Details
    // Principal: plan.amount
    // Interest + Fees: Total - Principal
    const interest = total > plan.amount ? total - plan.amount : 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            {/* Header */}
            <div className="bg-slate-900 p-6 pb-24 rounded-b-[2rem]">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </button>
            </div>

            <div className="px-6 -mt-20">
                {/* We need to update EarningsCard to handle Repayment props or just pass Plan */}
                {/* Ideally we should rename EarningsCard to LoanSummaryCard. For now let's pass new props if component supports, or we update component next. */}
                <RepaymentCard
                    plan={plan}
                    tenure={tenure}
                    payout={payout}
                    isRepayment={true}
                    totalRepayment={total}
                    breakdown={breakdown}
                />

                <TenureSelector
                    options={plan.tenures}
                    selected={tenure}
                    onChange={setTenure}
                />

                <PayoutSelector
                    options={currentOptions}
                    selected={payout}
                    onChange={setPayout}
                    planAmount={plan.amount}
                    tenure={tenure}
                />

                {/* Earnings Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8 shadow-sm">
                    <button
                        onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                        className="w-full flex justify-between items-center p-6 text-left active:bg-slate-50 transition-colors"
                    >
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Detailed EMI Payment</span>
                        {isBreakdownOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {isBreakdownOpen && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Principal Amount</span>
                                    <span className="font-bold text-slate-900">₹ {plan.amount.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">EMI</span>
                                    <span className="font-black text-slate-900 text-lg">₹ {emi.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">{payout?.label || 'Fixed'} Repayment Schedule</span>
                                    <span className="text-slate-400 font-bold">{count} Installments</span>
                                </div>

                                {payout?.cashback ? (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-emerald-600 font-black uppercase tracking-wider">Cash back (per installment)</span>
                                        <span className="font-black text-emerald-600">₹ {payout.cashback}</span>
                                    </div>
                                ) : null}

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Repayment</span>
                                        <span className="text-xl font-black text-slate-900">₹ {total.toLocaleString()}</span>
                                    </div>

                                    {((payout?.cashback || 0) * count) > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Total CASHBACK</span>
                                            <span className="text-xl font-black text-emerald-700">₹ {((payout?.cashback || 0) * count).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Terms */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <Shield className="w-5 h-5" />
                        <h4 className="font-black text-xs uppercase tracking-widest">Important Terms</h4>
                    </div>
                    <ul className="space-y-3">
                        {['Earnings credited to wallet only.', 'Early closure cancels future payouts.', 'Repayment schedule locks after disbursal.'].map((term, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-2 shrink-0" />
                                {term}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Fixed CTA - Floating above content but below nav (if z-50). Actually nav is z-50.
                User wants bottom buttons visible.
                If I put it at bottom-0, it covers nav.
                I will make it float ABOVE the nav.
                MobileNav is ~60-70px high.
            */}
            <div className="fixed bottom-[90px] left-6 right-6 z-40">
                <button
                    onClick={handleConfirm}
                    disabled={!payout || loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : `Confirm ₹${plan.amount.toLocaleString()} Loan`}
                </button>
            </div>

            <LoadingOverlay isVisible={showOverlay} />
        </div >
    );
}
