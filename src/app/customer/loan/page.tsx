
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Zap, Clock } from 'lucide-react';
import { LOAN_PLANS } from '@/lib/loanUtils';

export default function LoanList() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.push('/customer')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Select Loan Plan</h1>
                <p className="text-slate-500 font-medium text-sm">Choose a plan that fits your business needs.</p>
            </div>

            {/* Loan Plans Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {Object.values(LOAN_PLANS).map((plan) => (
                    <div
                        key={plan.amount}
                        onClick={() => router.push(`/customer/loan/${plan.amount}`)}
                        className="bg-white rounded-[2rem] p-5 pt-12 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden group cursor-pointer hover:border-blue-200 transition-all active:scale-[0.95]"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.color}`}></div>
                        <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                            <ChevronRight size={16} />
                        </div>

                        <div className="mb-3">
                            <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full bg-gradient-to-r ${plan.color} uppercase tracking-wide`}>
                                {plan.title}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">₹ {plan.amount >= 1000 ? `${plan.amount / 1000}k` : plan.amount}</h3>
                        <p className="text-xs font-bold text-slate-400 line-clamp-1">{plan.description}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity / History Highlight */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                    <button onClick={() => router.push('/customer/loan/history')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                </div>

                <div
                    onClick={() => router.push('/customer/loan/history')}
                    className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>

                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="text-blue-400 w-4 h-4" />
                                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Last Application</span>
                            </div>
                            <h3 className="text-xl font-black mb-1">₹ 20,000 Loan</h3>
                            <p className="text-xs font-medium text-slate-400">Applied on 24 Jan • <span className="text-emerald-400">Approved</span></p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Loans */}
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">More Options</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { title: 'Business Loan', icon: '💼', desc: 'For heavy inventory' },
                        { title: 'Personal Loan', icon: '🏠', desc: 'For personal use' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 opacity-60">
                            <div className="text-2xl mb-3 grayscale">{item.icon}</div>
                            <h4 className="font-black text-slate-900 text-sm mb-1">{item.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">{item.desc}</p>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
