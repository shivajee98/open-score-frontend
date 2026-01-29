'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
    ArrowLeft,
    CreditCard,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Zap,
    History,
    X,
    TrendingUp,
    IndianRupee,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import PinModal from '@/components/PinModal';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { toast } from '@/components/ui/Toast';

export default function RepaymentsPage() {
    const router = useRouter();
    const [loans, setLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const data = await apiFetch('/loans');
            // Include both DISBURSED and recently fully paid
            setLoans(data.filter((l: any) => l.status === 'DISBURSED' || l.paid_amount >= l.amount));
        } catch (e) {
            console.error("Failed to load loans", e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLoan = async (loan: any) => {
        setSelectedLoan(loan);
        setShowModal(true);
        try {
            const data = await apiFetch(`/loans/${loan.id}/repayments`);
            setRepayments(data.repayments || []);
        } catch (e) {
            console.error("Failed to load repayments", e);
        }
    };

    const handleRepay = async () => {
        if (!selectedLoan) return;

        const pending = repayments.find(r => r.status === 'PENDING');
        if (!pending) {
            toast.error("No pending EMIs found for this loan.");
            return;
        }

        setPinModalOpen(true);
    };

    const handleFinishRepay = async (pin: string) => {
        setPinModalOpen(false);
        const pending = repayments.find(r => r.status === 'PENDING');
        if (!pending) return;

        setActionLoading(true);
        try {
            const res = await apiFetch(`/loans/${selectedLoan.id}/repay`, {
                method: 'POST',
                body: JSON.stringify({ pin })
            });

            setSuccessData({
                amount: pending.amount,
                payeeName: `Loan EMI - #${selectedLoan.id}`,
                ref: res.ref
            });

            handleOpenLoan(selectedLoan); // Refresh repayments schedule in modal
            loadLoans(); // Refresh main list balance/status
        } catch (e: any) {
            toast.error(e.message || "Repayment failed. Please check your wallet balance.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading accounts...</p>
        </div>
    );

    const activeLoans = loans.filter(l => l.status === 'DISBURSED');
    const closedLoans = loans.filter(l => l.status !== 'DISBURSED');

    return (
        <div className="min-h-screen bg-white pb-24 font-sans text-slate-900">
            {/* PIN and Success Modals */}
            <PinModal
                isOpen={pinModalOpen}
                title={`Confirm EMI Payment`}
                onComplete={handleFinishRepay}
                onClose={() => setPinModalOpen(false)}
            />

            <PaymentSuccessModal
                isOpen={!!successData}
                amount={successData?.amount || '0'}
                payeeName={successData?.payeeName || ''}
                transactionRef={successData?.ref || ''}
                onClose={() => setSuccessData(null)}
            />

            {/* Minimal Google-style Top Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/customer')} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Repayments</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                    <CreditCard size={18} />
                </div>
            </header>

            <main className="p-4 space-y-6 animate-in fade-in duration-500">
                {/* Active Accounts Section */}
                <section>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Active Accounts</h2>
                    {activeLoans.length > 0 ? (
                        <div className="space-y-3">
                            {activeLoans.map((loan) => (
                                <div
                                    key={loan.id}
                                    onClick={() => handleOpenLoan(loan)}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Loan #{loan.id}</p>
                                            <h3 className="text-lg font-black">₹{parseFloat(loan.amount).toLocaleString()}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
                                                    Active
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">• {loan.payout_frequency}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all border border-slate-100">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active loans found</p>
                        </div>
                    )}
                </section>

                {/* Closed Accounts Section */}
                {closedLoans.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">History</h2>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                            {closedLoans.map((loan) => (
                                <div key={loan.id} className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">₹{parseFloat(loan.amount).toLocaleString()} Loan</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Application #{loan.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Paid Full</p>
                                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{new Date(loan.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Google-style Detail Modal */}
            {showModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-10 duration-500">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-50 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">Loan Account</span>
                                    <span className="text-[10px] font-bold text-slate-400">#{selectedLoan.id}</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">₹{parseFloat(selectedLoan.amount).toLocaleString()}</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                                    {selectedLoan.status === 'DISBURSED' ? (
                                        <><Clock size={14} className="text-amber-500" /> Repayment in progress</>
                                    ) : (
                                        <><CheckCircle2 size={14} className="text-emerald-500" /> Account fully closed</>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-10">

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                                        <Zap size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                    <p className="text-sm font-black text-slate-900">{selectedLoan.payout_frequency}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                                        <Calendar size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                                    <p className="text-sm font-black text-slate-900">{selectedLoan.tenure} Months</p>
                                </div>
                            </div>

                            {/* Repayment Schedule */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payment Schedule</h3>
                                    <p className="text-[10px] font-bold text-slate-400">Total {repayments.length} EMIs</p>
                                </div>

                                <div className="space-y-3">
                                    {repayments.map((rep, idx) => (
                                        <div key={rep.id} className={cn(
                                            "p-3 rounded-xl flex items-center justify-between transition-all",
                                            rep.status === 'PAID' ? "bg-emerald-50/30 border border-emerald-50" : "bg-white border border-slate-100"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center font-black text-xs",
                                                    rep.status === 'PAID' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm">₹{parseFloat(rep.amount).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {rep.status === 'PAID' ? `Paid on ${new Date(rep.paid_at || '').toLocaleDateString()}` : `Due: ${new Date(rep.due_date).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {rep.status === 'PAID' ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                                                </div>
                                            ) : (
                                                selectedLoan.status === 'DISBURSED' && new Date(rep.due_date) < new Date() && rep.status === 'PENDING' ? (
                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest font-bold">Overdue</span>
                                                ) : selectedLoan.status === 'DISBURSED' && repayments.findIndex(r => r.status === 'PENDING') === idx ? (
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse font-bold">Next Due</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pending</span>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / CTA */}
                        {selectedLoan.status === 'DISBURSED' && repayments.some(r => r.status === 'PENDING') && (
                            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                                <button
                                    onClick={handleRepay}
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-base uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Make Payment <ArrowUpRight size={20} /></>
                                    )}
                                </button>
                                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest mt-4">Funds will be debited from your OpenScore wallet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
