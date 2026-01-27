
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function LoanHistory() {
    const router = useRouter();
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const data = await apiFetch('/loans');
                setLoans(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <button onClick={() => router.push('/customer/loan')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Loans
            </button>

            <h1 className="text-3xl font-black text-slate-900 mb-8">Loan History</h1>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />)}
                </div>
            ) : loans.length > 0 ? (
                <div className="space-y-4">
                    {loans.map((loan) => (
                        <div
                            key={loan.id}
                            onClick={() => router.push(`/customer/loan/status/${loan.id}`)}
                            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                        loan.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                            loan.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {loan.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {new Date(loan.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">₹ {loan.amount.toLocaleString()}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    {loan.tenure} Months • {loan.payout_frequency} Payout
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                {loan.status === 'APPROVED' ? <CheckCircle size={20} className="text-emerald-500" /> : <Clock size={20} className="text-amber-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No loan history found.</p>
                    <button
                        onClick={() => router.push('/customer/loan')}
                        className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                    >
                        Apply Now
                    </button>
                </div>
            )}
        </div>
    );
}
