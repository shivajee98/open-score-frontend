
import { PayoutOption, LoanPlan, TenureMonths, calculateRepayment, cn } from "@/lib/loanUtils";
import { CheckCircle, Flame, ChevronDown } from "lucide-react";

interface PayoutSelectorProps {
    options: PayoutOption[];
    selected: PayoutOption | null;
    onChange: (o: PayoutOption) => void;
    planAmount: number;
    tenure: TenureMonths;
}

export default function PayoutSelector({ options, selected, onChange, planAmount, tenure }: PayoutSelectorProps) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Select Repayment Schedule</h3>
            <div className="space-y-3">
                {options.map(option => {
                    const { total, count, emi } = calculateRepayment(planAmount, tenure, option);
                    const isSelected = selected?.id === option.id;

                    return (
                        <div
                            key={option.id}
                            onClick={() => onChange(option)}
                            className={cn(
                                "relative overflow-hidden rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col group",
                                isSelected
                                    ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-900/10"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            <div className="p-6 flex items-center justify-between">
                                {(option.isBestValue || option.val) && (
                                    <div className={cn(
                                        "absolute -top-3 left-6 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg flex items-center gap-1",
                                        option.isBestValue ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                    )}>
                                        {option.isBestValue && <Flame size={10} fill="white" />}
                                        {option.val || (option.isBestValue ? 'Best Value' : '')}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all",
                                        isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200"
                                    )}>
                                        {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                        <p className={cn("font-black text-lg leading-none", isSelected ? "text-slate-900" : "text-slate-700")}>
                                            {option.label}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                            {option.interestRate !== undefined && (
                                                <span className={option.interestRate === 0 ? "text-emerald-600" : "text-slate-400"}>
                                                    {option.interestRate === 0 ? '0% Interest' : `${option.interestRate}% Interest`}
                                                </span>
                                            )}
                                            {option.cashback && (
                                                <span className="text-emerald-600">Wallet Cashback ₹{option.cashback}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className={cn("text-xl font-black", isSelected ? "text-emerald-600" : "text-slate-900")}>₹ {emi.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Per Repayment</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown - Only show when selected */}
                            {isSelected && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                                    <div className="bg-white rounded-2xl p-5 space-y-4 border border-blue-100/50 shadow-inner">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex justify-between items-center">
                                            Detailed EMI Payment
                                            <ChevronDown size={14} className="rotate-180" />
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">Principal</span>
                                                <span className="font-black text-slate-900">₹ {planAmount.toLocaleString()}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">EMI</span>
                                                <span className="font-black text-slate-900 text-lg">₹ {emi.toLocaleString()}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-wider">{option.label} Repayments</span>
                                                <span className="text-slate-400 font-bold">{count} EMI</span>
                                            </div>

                                            {option.cashback ? (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-emerald-600 font-black uppercase tracking-wider">Cashback Per EMI</span>
                                                    <span className="font-black text-emerald-600">₹ {option.cashback}</span>
                                                </div>
                                            ) : null}

                                            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                                                <span className="font-black text-slate-900 text-sm uppercase tracking-widest">Total Pay</span>
                                                <span className="text-lg font-black text-slate-900">₹ {total.toLocaleString()}</span>
                                            </div>

                                            {((option.cashback || 0) * count) > 0 && (
                                                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                                                    <span className="font-black text-emerald-700 text-[10px] uppercase tracking-widest">Total Reward</span>
                                                    <span className="text-lg font-black text-emerald-700">₹ {((option.cashback || 0) * count).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
