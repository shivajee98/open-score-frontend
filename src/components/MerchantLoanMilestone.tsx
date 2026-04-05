'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, CheckCircle2, Info } from 'lucide-react';

interface MilestonePlan {
    id: number;
    name: string;
    amount: number;
    milestone_min_amount: number;
    milestone_max_amount: number;
}

interface MerchantLoanMilestoneProps {
    totalCreditVolume: number;
    milestonePlan: MilestonePlan | null;
}

const MerchantLoanMilestone: React.FC<MerchantLoanMilestoneProps> = ({ totalCreditVolume, milestonePlan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    if (!milestonePlan) return null;

    const min = Number(milestonePlan.milestone_min_amount) || 0;
    const max = Number(milestonePlan.milestone_max_amount) || 1; // avoid div by zero
    const current = totalCreditVolume;

    // Progress percentage (constrained between 0 and 100)
    const progress = Math.min(Math.max(((current - min) / (max - min)) * 100, 0), 100);
    const isEligible = current >= max;
    const showProgress = current >= min;

    if (!showProgress && !isEligible) return null;

    return (
        <div className="mx-4 mb-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Main Collapsible Bar */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {isEligible ? <CheckCircle2 size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">
                                {isEligible ? 'Loan Eligibility Unlocked!' : 'Unlock Loan Upto'}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {milestonePlan.name} • {Number(milestonePlan.amount).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isOpen && !isEligible && (
                            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full">
                                {Math.round(progress)}%
                            </div>
                        )}
                        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                </div>

                {/* Progress Content */}
                {isOpen && (
                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4 pt-2">
                            {/* Progress Bar Container */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Usage</span>
                                    <span className="text-xs font-bold text-indigo-600">
                                        {current.toLocaleString()} / {max.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${isEligible ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                    <span>Goal: {min.toLocaleString()}</span>
                                    <span>Target: {max.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Inner Collapsible for Details */}
                            <div className="border-t border-slate-50 pt-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDetailsOpen(!isDetailsOpen);
                                    }}
                                    className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Info size={14} />
                                        <span>How to unlock {Number(milestonePlan.amount).toLocaleString()}?</span>
                                    </div>
                                    {isDetailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {isDetailsOpen && (
                                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
                                        Collect & transfer <span className="font-bold text-slate-800">{max.toLocaleString()}</span> on Open Score  to unlock <span className="font-bold text-indigo-600 text-[10px]">{milestonePlan.name}</span> Credit 0% No CIBIL You are 20,990 away.
                                        {isEligible
                                            ? " Congratulations! You have reached the target and can now apply for this loan."
                                            : ` You need ${(max - current).toLocaleString()} more in volume to unlock this loan.`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchantLoanMilestone;
