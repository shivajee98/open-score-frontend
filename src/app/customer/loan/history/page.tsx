'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export default function LoanHistory() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: any) => {
        if (loading || fetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, fetchingMore, hasMore]);

    const fetchLoans = async (pageNum: number) => {
        if (pageNum === 1) setLoading(true);
        else setFetchingMore(true);

        try {
            const data = await apiFetch(`/loans?page=${pageNum}`);
            // Defensive: Backend now returns paginated object
            const newLoans = data.data || (Array.isArray(data) ? data : []);

            if (pageNum === 1) {
                setLoans(newLoans);
            } else {
                setLoans(prev => [...prev, ...newLoans]);
            }

            // If data is paginated
            if (data.current_page !== undefined) {
                setHasMore(data.current_page < data.last_page);
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error(e);
            setHasMore(false);
        } finally {
            setLoading(false);
            setFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchLoans(page);
    }, [page]);

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-12 pb-20 px-4 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10">
                    <button onClick={() => router.push('/customer/loan')} className="mb-6 flex items-center gap-2 text-white/50 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Virtual Credit
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Virtual Credit History</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Application Lifecycle</p>
                        </div>
                        <div className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white`}>
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 -mt-10 relative z-20">

                {loading && loans.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />)}
                    </div>
                ) : loans.length > 0 ? (
                    <div className="space-y-4">
                        {loans.map((loan, idx) => (
                            <div
                                key={loan.id}
                                ref={idx === loans.length - 1 ? lastElementRef : null}
                                onClick={() => router.push(`/customer/loan/status/view?id=${loan.id}`)}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${(loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= Number(loan.amount)) ? 'bg-slate-100 text-slate-700' :
                                            loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                                loan.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                    loan.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' :
                                                        loan.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :
                                                            'bg-slate-100 text-slate-500'
                                            }`}>
                                            {(loan.status === 'DISBURSED' && Number(loan.paid_amount || 0) >= Number(loan.amount)) ? 'COMPLETED' :
                                                loan.status === 'APPROVED' ? 'DISBURSAL UNDER PROCESS' :
                                                    loan.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(loan.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight"> {parseFloat(loan.amount).toLocaleString('en-IN')}</h3>
                                        {loan.status === 'APPROVED' && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {loan.tenure} Months • {loan.payout_frequency} Payout
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {loan.status === 'DISBURSED' && parseFloat(loan.paid_amount) < parseFloat(loan.amount) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/customer/loan/status/repayment?id=${loan.id}`);
                                            }}
                                            className="text-[10px] font-black text-white uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-xl border border-slate-900 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                        >
                                            Repay
                                        </button>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {fetchingMore && (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 px-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-black text-lg">No history found</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Your virtual credit applications will appear here.</p>
                        <button
                            onClick={() => router.push('/customer/loan')}
                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Apply Now
                        </button>
                    </div>
                )}

                {!hasMore && loans.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">End of virtual credit history</p>
                    </div>
                )}
            </div>
        </div>
    );
}
