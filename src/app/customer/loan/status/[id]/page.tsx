
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Check, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoanStatus() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id as string;
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-slate-900 p-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl relative z-10">
                <button onClick={() => router.push('/customer/loan')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Loans
                </button>
                <h1 className="text-2xl font-black text-white mb-2">Application Status</h1>
                <p className="text-slate-400 font-medium text-sm">Track your loan application #{loanId}</p>
            </div>

            <div className="px-6 -mt-10 relative z-20 space-y-6">

                {/* Details Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Amount</p>
                                <h2 className="text-3xl font-black text-slate-900">₹ 9,056</h2>
                            </div>
                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide">Approved</span>
                        </div>

                        <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isDetailsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Processing Fee</span>
                                <span className="text-slate-900">₹ 600</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Credit re-assessment Fees</span>
                                <span className="text-slate-900">₹ 200</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>GST (18% on all Fees)</span>
                                <span className="text-slate-900">₹ 144</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Total Interest @ 2.46%</span>
                                <span className="text-slate-900">₹ 246</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Annualized Interest Rate</span>
                                <span className="text-slate-900">29.95% p.a</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                                <span>Disbursal Amount</span>
                                <span>₹ 9,056</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 pt-1">
                                <span>Loan ID</span>
                                <span>{loanId}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="w-full bg-slate-50 p-3 flex justify-center items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        {isDetailsOpen ? 'View Less' : 'View More'} <ChevronDown className={`w-4 h-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Timeline Stepper */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 px-8">
                            <div className="w-2/3 h-full bg-emerald-500 rounded-full"></div>
                        </div>

                        {/* Steps */}
                        {[
                            { label: 'Submitted', date: '15-Aug-19', status: 'done' },
                            { label: 'Approved', date: '15-Aug-19', status: 'done' },
                            { label: 'Disbursed', date: '', status: 'current' },
                            { label: 'Repayment', date: '', status: 'pending' },
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${step.status === 'done' ? 'bg-emerald-500 border-white text-white' :
                                        step.status === 'current' ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/30' :
                                            'bg-slate-100 border-white text-slate-300'
                                    }`}>
                                    {step.status === 'done' || step.status === 'current' ? <Check size={14} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</p>
                                    {step.date && <p className="text-[9px] font-bold text-slate-300">{step.date}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tip */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-amber-800 font-bold text-sm">Repay your loans on time to avoid penalties and increase your creditworthiness.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
