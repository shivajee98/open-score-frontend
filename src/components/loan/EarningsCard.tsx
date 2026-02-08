
import { LoanPlan, PayoutOption, TenureMonths, calculateEarnings } from "@/lib/loanUtils";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface EarningsCardProps {
    plan: LoanPlan;
    tenure: TenureMonths;
    payout: PayoutOption | null;
    isEmi?: boolean;
    totalEmi?: number;
    breakdown?: string;
    count?: number;
    tenureType?: 'months' | 'days' | 'decimal';
}

export default function EarningsCard({ plan, tenure, payout, isEmi, totalEmi, breakdown: propBreakdown, count: propCount, tenureType = 'months' }: EarningsCardProps) {
    const formatTenure = (days: number) => {
        if (tenureType === 'days') return `${days} Days`;
        if (tenureType === 'decimal') return `${(days / 30).toFixed(1)} Months`;

        // Default: Months (rounded)
        if (days % 30 === 0) return `${days / 30} Months`;
        return `${Math.round(days / 30)} Months`;
    };

    const result = isEmi && totalEmi !== undefined
        ? { total: totalEmi, breakdown: propBreakdown || '-', count: propCount || 0 }
        : (payout ? calculateEarnings(plan.amount, tenure, payout) : { total: 0, breakdown: '-', count: 0 });

    const { total, breakdown, count } = result;

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl relative mb-8 border border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Loan Amount</p>
                    <h2 className="text-xl font-bold whitespace-nowrap">₹ {plan.amount.toLocaleString('en-IN')}</h2>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} shadow-lg`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tenure</span>
                    </div>
                    <p className="text-base font-bold">{formatTenure(tenure)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Payout</span>
                    </div>
                    <p className="text-base font-bold truncate">{payout?.frequency || 'Select'}</p>
                </div>
            </div>

            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <div className="flex justify-between items-center gap-2">
                    <div className="shrink-0">
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">To Pay</p>
                        <p className="text-lg font-bold text-emerald-400 whitespace-nowrap">₹ {total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 overflow-hidden">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-400/10 px-2 py-1 rounded truncate max-w-full italic">{breakdown}</span>
                        {payout?.cashback && count > 0 && (
                            <span className="text-[9px] font-black text-emerald-300 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                Cashback upto ₹{(payout.cashback * count).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
