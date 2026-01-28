
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
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Select Repayment Schedule</h3>
            <div className="space-y-3">
                {options.map(option => {
                    const { emi } = calculateEarnings(planAmount, tenure, option);
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
                            {(option.isBestValue || option.val) && (
                                <div className={cn(
                                    "absolute -top-3 left-4 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg flex items-center gap-1",
                                    option.isBestValue ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                )}>
                                    {option.isBestValue && <Flame size={10} fill="white" />}
                                    {option.val || (option.isBestValue ? 'Best Value' : '')}
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
                                    <p className="text-xs font-medium text-slate-500 flex flex-col gap-0.5">
                                        {option.interestRate !== undefined && (
                                            <span className={option.interestRate === 0 ? "text-emerald-600" : "text-slate-500"}>
                                                {option.interestRate === 0 ? '0% Interest' : `${option.interestRate}% Interest`}
                                            </span>
                                        )}
                                        {option.cashback && (
                                            <span className="text-emerald-600">Wallet Cashback ₹{option.cashback}</span>
                                        )}
                                        {!option.cashback && option.interestRate === undefined && (
                                            <span>Total ₹{option.fixedAmount}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={cn("font-black text-lg", isSelected ? "text-emerald-600" : "text-slate-900")}>
                                    ₹ {emi.toLocaleString('en-IN')}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Per Repayment</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
