
import { PayoutOption, LoanPlan, TenureMonths, calculateEarnings, cn } from "@/lib/loanUtils";
import { CheckCircle, Flame } from "lucide-react";

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
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Select Payout Cycle</h3>
            <div className="space-y-3">
                {options.map(option => {
                    const { total } = calculateEarnings(planAmount, tenure, option);
                    const isSelected = selected?.id === option.id;

                    return (
                        <div
                            key={option.id}
                            onClick={() => onChange(option)}
                            className={cn(
                                "relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                isSelected
                                    ? "border-blue-600 bg-blue-50/50 shadow-md"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            {option.isBestValue && (
                                <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Flame size={10} fill="white" /> Best Value
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200"
                                )}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>
                                <div>
                                    <p className={cn("font-bold text-base", isSelected ? "text-slate-900" : "text-slate-600")}>
                                        {option.label}
                                    </p>
                                    <p className="text-xs font-bold text-slate-400">
                                        {option.returnPercentage ? `${option.returnPercentage}% Return` : `Fixed ₹${option.fixedAmount}`}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={cn("font-black text-lg", isSelected ? "text-emerald-600" : "text-slate-900")}>
                                    ₹ {total.toLocaleString('en-IN')}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Earn</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
