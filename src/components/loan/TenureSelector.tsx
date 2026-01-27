
import { TenureMonths } from "@/lib/loanUtils";
import { cn } from "@/lib/loanUtils";

interface TenureSelectorProps {
    options: TenureMonths[];
    selected: TenureMonths;
    onChange: (t: TenureMonths) => void;
}

export default function TenureSelector({ options, selected, onChange }: TenureSelectorProps) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Select Tenure</h3>
            <div className="flex gap-4">
                {options.map(t => (
                    <button
                        key={t}
                        onClick={() => onChange(t)}
                        className={cn(
                            "flex-1 py-4 rounded-2xl font-bold text-lg border-2 transition-all",
                            selected === t
                                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5"
                                : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                        )}
                    >
                        {t} Months
                    </button>
                ))}
            </div>
        </div>
    );
}
