
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
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <button onClick={() => router.push('/customer/loan')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Loans
            </button>

            <h1 className="text-2xl font-black text-slate-900 mb-8">Loan History</h1>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />)}
                </div>
            ) : loans.length > 0 ? (
                <div className="space-y-3">
                    {loans.map((loan) => (
                        <div
                            key={loan.id}
                            onClick={() => router.push(`/customer/loan/status/${loan.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${(loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= Number(loan.amount)) ? 'bg-slate-100 text-slate-700' :
                                        loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                            loan.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                loan.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' :
                                                    loan.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :
                                                        'bg-slate-100 text-slate-500'
                                        }`}>
                                        {(loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= Number(loan.amount)) ? 'COMPLETED' : loan.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {new Date(loan.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900">₹ {loan.amount.toLocaleString()}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    {loan.tenure} Months • {loan.payout_frequency} Payout
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                {loan.status === 'DISBURSED' && parseFloat(loan.paid_amount) < parseFloat(loan.amount) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push('/customer/repayments');
                                        }}
                                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                    >
                                        Pay Now
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/customer/loan/status/${loan.id}`);
                                    }}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    See Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No loan history found.</p>
                    <button
                        onClick={() => router.push('/customer/loan')}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                    >
                        Apply Now
                    </button>
                </div>
            )}
        </div>
    );
}
