
import { TenureMonths } from "@/lib/loanUtils";
import { cn } from "@/lib/loanUtils";

interface TenureSelectorProps {
    options: number[];
    selected: number;
    onChange: (t: number) => void;
    payoutCount?: number;
    tenureType?: 'months' | 'days' | 'decimal';
}

export default function TenureSelector({ options, selected, onChange, payoutCount, tenureType = 'months' }: TenureSelectorProps) {
    const formatLabel = (days: number) => {
        if (tenureType === 'days') return `${days} Days`;
        if (tenureType === 'decimal') return `${(days / 30).toFixed(1)} Months`;

        // Months (rounded)
        if (days % 30 === 0) return `${days / 30} Months`;
        return `${Math.round(days / 30)} Months`;
    };
    return (
        <div className="mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Tenure</h3>
            <div className="grid grid-cols-2 gap-3">
                {options.map(t => (
                    <button
                        key={t}
                        onClick={() => onChange(t)}
                        className={cn(
                            "py-3 rounded-xl font-bold text-base border-2 transition-all flex flex-col items-center justify-center",
                            selected === t
                                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5"
                                : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                        )}
                    >
                        {formatLabel(t)}
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
