
import { LoanPlan, PayoutOption, TenureMonths, calculateEarnings } from "@/lib/loanUtils";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface EarningsCardProps {
    plan: LoanPlan;
    tenure: TenureMonths;
    payout: PayoutOption | null;
}

export default function EarningsCard({ plan, tenure, payout }: EarningsCardProps) {
    const { total, breakdown } = payout ? calculateEarnings(plan.amount, tenure, payout) : { total: 0, breakdown: '-' };

    return (
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative mb-8 border border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Loan Amount</p>
                    <h2 className="text-3xl font-black">₹ {plan.amount.toLocaleString('en-IN')}</h2>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} shadow-lg`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tenure</span>
                    </div>
                    <p className="text-lg font-bold">{tenure} Months</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Payout</span>
                    </div>
                    <p className="text-lg font-bold truncate">{payout?.frequency || 'Select'}</p>
                </div>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Expected Earnings</p>
                        <p className="text-2xl font-black text-emerald-400">₹ {total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-400/10 px-2 py-1 rounded">{breakdown}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
