'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, IndianRupee, PieChart, TrendingUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/loanUtils';

export default function RepaymentDashboard() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id as string;

    const [loan, setLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const fetchData = async () => {
        try {
            const data = await apiFetch(`/loans/${loanId}/repayments`);
            setLoan(data.loan);
            setRepayments(data.repayments);
        } catch (e) {
            console.error("Failed to fetch repayment data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [loanId]);

    const handleRepay = async () => {
        setPaying(true);
        try {
            await apiFetch(`/loans/${loanId}/repay`, { method: 'POST' });
            alert("EMI Paid Successfully!");
            fetchData();
        } catch (e: any) {
            alert(e.message || "Payment failed. Please check your wallet balance.");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Application not found</div>;

    const paidEmis = repayments.filter(r => r.status === 'PAID');
    const pendingEmi = repayments.find(r => r.status === 'PENDING');
    const totalPaid = Number(loan.paid_amount || 0);

    // Calculate total payable (Principal + GST + Fees) roughly for progress bar
    const processingFee = loan.amount == 10000 ? 0 : 1200;
    const loginFee = loan.amount == 10000 ? 300 : 200;
    const fieldKycFee = loan.amount == 10000 ? 500 : 600;
    const gstAmount = Math.round(loan.amount * 0.18);
    const totalPayable = Number(loan.amount) + processingFee + loginFee + fieldKycFee + gstAmount;

    const progress = Math.min(100, Math.round((totalPaid / totalPayable) * 100));

    // Group history by week to avoid long lists
    const groupedPaid = paidEmis.reduce((acc: any, curr: any) => {
        const date = new Date(curr.paid_at);
        const week = `Week ${Math.ceil(date.getDate() / 7)} of ${date.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
        if (!acc[week]) acc[week] = [];
        acc[week].push(curr);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header Area */}
            <div className="bg-slate-900 pt-10 pb-20 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <button onClick={() => router.push(`/customer/loan/status/${loanId}`)} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8 relative z-10 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Application Status
                </button>

                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 leading-none">Repayment</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-80">Analytical Dashboard</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Loan</span>
                        <span className="text-2xl font-black text-white leading-none">₹{totalPayable.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-10 relative z-20 space-y-6">

                {/* Visual Progress Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-none">Repayment Health</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{progress}% of total paid</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</span>
                            <span className="text-lg font-black text-slate-900 leading-none">₹{(totalPayable - totalPaid).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Minimal Progress Bar */}
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1 mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Paid: ₹{totalPaid.toLocaleString()}</span>
                        <span>{repayments.length - paidEmis.length} EMIs Left</span>
                    </div>
                </div>

                {/* Primary Action: Next Due */}
                {pendingEmi ? (
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/40 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest opacity-80">Next Due Date</h4>
                                    <p className="text-xl font-bold">{new Date(pendingEmi.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-80">EMI Amount</h4>
                                <p className="text-xl font-bold">₹{pendingEmi.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRepay}
                            disabled={paying}
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {paying ? <div className="w-5 h-5 border-2 border-indigo-600 rounded-full animate-spin border-t-transparent" /> : "Pay Installment Now"}
                        </button>
                        <p className="text-[9px] text-center text-indigo-200 mt-4 font-bold uppercase tracking-widest">Amount will be debited from your main wallet balance</p>
                    </div>
                ) : (
                    <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-900/40 text-center space-y-3">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black">Loan Fully Repaid!</h2>
                        <p className="text-emerald-50 text-xs font-medium">Your credit score has been upgraded because of your consistent repayment.</p>
                    </div>
                )}

                {/* Analytical History - Grouped */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden">
                    <button
                        onClick={() => setHistoryOpen(!historyOpen)}
                        className="w-full p-8 flex justify-between items-center group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-black text-slate-900 leading-none">Payment History</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analytical Grouping</p>
                            </div>
                        </div>
                        <ChevronDown className={cn("text-slate-300 group-hover:text-slate-900 transition-all", historyOpen ? "rotate-180" : "")} size={24} />
                    </button>

                    {historyOpen && (
                        <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                            {Object.entries(groupedPaid).length > 0 ? (
                                Object.entries(groupedPaid).reverse().map(([week, items]: [string, any]) => (
                                    <div key={week} className="border-l-2 border-slate-100 pl-6 relative">
                                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-200 border-2 border-white" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{week}</h4>
                                        <div className="space-y-3">
                                            {items.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="font-bold text-slate-900">₹{item.amount.toLocaleString()} EMI Paid</span>
                                                        <span className="block text-[9px] text-slate-400 leading-none mt-1">{new Date(item.paid_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black border border-emerald-100 uppercase tracking-widest">Verified</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-slate-400 font-bold py-4">No payments recorded yet.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Bottom Insight */}
            <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">
                    <AlertCircle size={12} /> Priority Credit Tip
                </div>
                <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-[280px] mx-auto">
                    Repaying before the due date increases your credit limit and unlocks higher loan amounts in the future.
                </p>
            </div>
        </div>
    );
}
