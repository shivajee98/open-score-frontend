
import { TenureMonths } from "@/lib/loanUtils";
import { cn } from "@/lib/loanUtils";

interface TenureSelectorProps {
    options: TenureMonths[];
    selected: TenureMonths;
    onChange: (t: TenureMonths) => void;
    payoutCount?: number;
}

export default function TenureSelector({ options, selected, onChange, payoutCount }: TenureSelectorProps) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Tenure</h3>
            <div className="flex gap-3">
                {options.map(t => (
                    <button
                        key={t}
                        onClick={() => onChange(t)}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl font-bold text-base border-2 transition-all",
                            selected === t
                                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5"
                                : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                        )}
                    >
                        {t} Months
                        {payoutCount && selected === t && (
                            <span className="block text-[10px] uppercase tracking-widest mt-1 opacity-60">
                                {payoutCount} Total Repayments
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
