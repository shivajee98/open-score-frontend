
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Zap } from 'lucide-react';
import { LOAN_PLANS } from '@/lib/loanUtils';

export default function LoanList() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <button onClick={() => router.push('/customer')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-3xl font-black text-slate-900 mb-2">Select Loan Plan</h1>
            <p className="text-slate-500 font-medium mb-8">Choose a plan that fits your business needs.</p>

            <div className="space-y-6">
                {Object.values(LOAN_PLANS).map((plan) => (
                    <div
                        key={plan.amount}
                        onClick={() => router.push(`/customer/loan/${plan.amount}`)}
                        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group cursor-pointer hover:border-blue-200 transition-all active:scale-[0.98]"
                    >
                        <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${plan.color}`}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full bg-gradient-to-r ${plan.color} uppercase tracking-wide`}>
                                        {plan.title}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900">₹ {plan.amount.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        <p className="text-slate-500 font-medium text-sm mb-6">{plan.description}</p>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            Starting from {Math.min(...plan.tenures)} Months
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
