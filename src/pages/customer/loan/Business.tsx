'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Bell } from 'lucide-react';

export default function BusinessLoanPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="max-w-md mx-auto mt-10">
                <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-indigo-900/10 border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                        <Briefcase size={32} />
                    </div>

                    <h1 className="text-2xl font-black text-slate-900 mb-2">Business Loan</h1>
                    <p className="text-sm font-medium text-slate-400 mb-6">Scale your business with heavy inventory financing.</p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Limit Up To</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">₹10,00,000</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button disabled className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm opacity-50 cursor-not-allowed">
                            Apply Now
                        </button>
                        <button className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                            <Bell size={18} />
                            Notify Me When Live
                        </button>
                    </div>

                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Coming Soon to Open Score
                    </p>
                </div>
            </div>
        </div>
    );
}
