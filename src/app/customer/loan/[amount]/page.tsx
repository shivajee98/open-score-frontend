
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, Shield } from 'lucide-react';
import {
    LOAN_PLANS,
    TenureMonths,
    PayoutOption,
    calculateEarnings
} from '@/lib/loanUtils';
import EarningsCard from '@/components/loan/EarningsCard';
import TenureSelector from '@/components/loan/TenureSelector';
import PayoutSelector from '@/components/loan/PayoutSelector';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';

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


    const handleConfirm = async () => {
        if (!payout) return;

        setLoading(true);
        try {
            // Use direct fetch to hit local Next.js API route instead of external backend
            const res = await fetch('/api/loan/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: plan.amount,
                    tenure,
                    payout_frequency: payout.frequency,
                    payout_option_id: payout.id
                })
            });

            if (!res.ok) throw new Error('Failed to submit application');
            toast.success('Loan application submitted!');
            router.push('/customer/loan/apply'); // Navigate to confirmation or dashboard
        } catch (e: any) {
            toast.error(e.message || 'Application failed');
        } finally {
            setLoading(false);
        }
    };

    if (!plan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="animate-pulse w-full max-w-md h-96 bg-slate-200 rounded-3xl"></div></div>;

    const currentOptions = plan.payoutOptions(tenure);
    const { total, breakdown } = payout ? calculateEarnings(plan.amount, tenure, payout) : { total: 0, breakdown: '-' };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            {/* Header */}
            <div className="bg-slate-900 p-6 pb-24 rounded-b-[2rem]">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </button>
            </div>

            <div className="px-6 -mt-20">
                <EarningsCard plan={plan} tenure={tenure} payout={payout} />

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
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Earnings Breakdown</span>
                        {isBreakdownOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {isBreakdownOpen && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Principal Amount</span>
                                    <span className="font-bold text-slate-900">₹ {plan.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Payout Rate/Fixed</span>
                                    <span className="font-bold text-emerald-600">{breakdown}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-50">
                                    <span className="text-slate-900 font-black">Total Expected</span>
                                    <span className="font-black text-emerald-600">₹ {total.toLocaleString()}</span>
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
                        {['Earnings credited to wallet only.', 'Early closure cancels future payouts.', 'Payout option locks after disbursal.'].map((term, i) => (
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
        </div>
    );
}
