
import { PayoutOption, LoanPlan, TenureMonths, calculateRepayment, cn } from "@/lib/loanUtils";
import { CheckCircle, Flame, ChevronDown } from "lucide-react";

interface PayoutSelectorProps {
    options: PayoutOption[];
    selected: PayoutOption | null;
    onChange: (o: PayoutOption) => void;
    planAmount: number;
    tenureDays: number;
}

export default function PayoutSelector({ options, selected, onChange, planAmount, tenureDays }: PayoutSelectorProps) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Select EMI Plan</h3>
            <div className="space-y-3">
                {options.map(option => {
                    const { total, count, emi } = calculateRepayment(planAmount, tenureDays, option);
                    const isSelected = selected?.id === option.id;

                    return (
                        <div
                            key={option.id}
                            onClick={() => onChange(option)}
                            className={cn(
                                "relative rounded-2xl border-2 cursor-pointer transition-all flex flex-col group mb-4",
                                isSelected
                                    ? "border-blue-600 bg-white shadow-2xl shadow-blue-900/10 ring-4 ring-blue-50"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            {/* Pro Tag - Moved inside to prevent clipping */}
                            {(option.isBestValue || option.val) && (
                                <div className={cn(
                                    "absolute top-4 left-6 z-10 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1",
                                    option.isBestValue ? "bg-orange-500" : "bg-blue-500"
                                )}>
                                    {option.isBestValue && <Flame size={10} fill="white" />}
                                    {option.val || (option.isBestValue ? 'Best Value' : '')}
                                </div>
                            )}

                            <div className={cn("p-4 pt-10 flex items-start justify-between gap-3", !option.isBestValue && !option.val && "pt-6")}>
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all",
                                        isSelected ? "border-blue-600 bg-blue-600 shadow-lg shadow-blue-200" : "border-slate-200"
                                    )}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                        <h4 className={cn("font-black text-lg tracking-tight leading-none mb-2", isSelected ? "text-slate-900" : "text-slate-700")}>
                                            {option.label}
                                        </h4>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                                            {option.interestRate !== undefined && (
                                                <p className={cn("text-[10px] font-black uppercase tracking-widest", option.interestRate === 0 ? "text-emerald-500" : "text-slate-400")}>
                                                    {option.interestRate === 0 ? '0% Interest' : `${option.interestRate}% Interest`}
                                                </p>
                                            )}
                                            {option.cashback && (
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                    ₹{option.cashback} Cashback
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className={cn("text-xl font-black tracking-tighter leading-none mb-1", isSelected ? "text-emerald-600" : "text-slate-900")}>
                                        ₹ {emi.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Per EMI</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown - Seamless Integration */}
                            {isSelected && (
                                <div className="px-4 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="pt-6 border-t border-slate-50 space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Structure</span>
                                            </div>
                                            <ChevronDown size={14} className="text-slate-300 rotate-180" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-1">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Principal</p>
                                                <p className="text-sm font-black text-slate-900">₹{planAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                                                <p className="text-sm font-black text-slate-900">{count} EMIs</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net EMI</p>
                                                <p className="text-sm font-black text-slate-900">₹{emi.toLocaleString()}</p>
                                            </div>
                                            {option.cashback && (
                                                <div>
                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Cashback</p>
                                                    <p className="text-sm font-black text-emerald-600">₹{option.cashback}/EMI</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-900 rounded-xl p-3 text-white flex justify-between items-center shadow-lg shadow-slate-900/10">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total EMI Pay</p>
                                                <p className="text-lg font-black">₹{total.toLocaleString()}</p>
                                            </div>
                                            {((option.cashback || 0) * count) > 0 && (
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">You Save</p>
                                                    <p className="text-base font-black text-emerald-400">₹{((option.cashback || 0) * count).toLocaleString()}</p>
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
