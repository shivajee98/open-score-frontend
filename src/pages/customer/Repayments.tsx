'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
    ArrowUpRight,
    Search,
    Filter,
    ShieldCheck,
    Coins,
    Sparkles,
    LayoutDashboard,
    Bell,
    Headphones
} from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import PinModal from '@/components/PinModal';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { toast } from '@/components/ui/Toast';

export default function RepaymentsPage() {
    const navigate = useNavigate();
    const [loans, setLoans] = useState<any[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFrequency, setFilterFrequency] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadLoans();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [loans, searchQuery, filterFrequency, filterStatus]);

    const loadLoans = async () => {
        try {
            const response = await apiFetch('/loans');
            const data = Array.isArray(response) ? response : (response?.data || []);
            setLoans(data);
        } catch (e) {
            console.error("Failed to load loans", e);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...loans];

        if (searchQuery) {
            filtered = filtered.filter(l =>
                (l.display_id || l.id).toString().includes(searchQuery) ||
                l.amount.toString().includes(searchQuery)
            );
        }

        if (filterFrequency !== 'ALL') {
            filtered = filtered.filter(l => l.payout_frequency === filterFrequency);
        }

        if (filterStatus !== 'ALL') {
            if (filterStatus === 'ACTIVE') {
                filtered = filtered.filter(l => l.status === 'DISBURSED');
            } else if (filterStatus === 'CLOSED') {
                filtered = filtered.filter(l => l.status !== 'DISBURSED' && l.status !== 'PENDING' && l.status !== 'APPROVED');
            }
        }

        setFilteredLoans(filtered);
    };

    const handleOpenLoan = async (loan: any) => {
        // If it's a disbursed loan, show the deep-dive dashboard instead of a simple modal
        if (loan.status === 'DISBURSED') {
            navigate(`/customer/loan/status/${loan.id}/repayment`);
            return;
        }

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

            const data = await apiFetch(`/loans/${selectedLoan.id}/repayments`);
            setRepayments(data.repayments || []);
            loadLoans();
        } catch (e: any) {
            toast.error(e.message || "Repayment failed. Please check your wallet balance.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Accounts...</p>
        </div>
    );

    const activeLoans = filteredLoans.filter(l => l.status === 'DISBURSED' && Number(l.paid_amount || 0) < Number(l.amount));
    const closedLoans = filteredLoans.filter(l =>
        (l.status !== 'DISBURSED' && l.status !== 'PENDING' && l.status !== 'APPROVED') ||
        (l.status === 'DISBURSED' && Number(l.paid_amount || 0) >= Number(l.amount))
    );

    // Aggregate Insights
    const totalActiveDebt = activeLoans.reduce((sum, l) => sum + (Number(l.amount) - Number(l.paid_amount || 0)), 0);
    const totalCashback = loans.reduce((sum, l) => sum + (Number(l.amount) * 0.01), 0); // Simulated 1% cashback aggregation

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
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

            {/* Premium Header Design */}
            <div className="bg-slate-900 pt-14 pb-24 px-4 relative overflow-hidden">
                {/* Decorative Circuits */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-white tracking-tighter leading-none">My Repayments</h1>
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] opacity-80 mt-1">Portfolio</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 relative">
                                <Bell size={16} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
                            </button>
                            <Link to="/customer/support">
                                <button
                                    className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                                >
                                    <Headphones size={16} />
                                </button>
                            </Link>
                            <Link to="/customer">
                                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95">
                                    <ArrowLeft size={16} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-6">
                    <ShieldCheck size={24} />
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 group">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                            <IndianRupee size={14} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Outstanding</p>
                        <h3 className="text-base font-black text-white tracking-tight">₹{totalActiveDebt.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 group">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                            <Coins size={14} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Repayment Bonus</p>
                        <h3 className="text-base font-black text-emerald-400 tracking-tight">₹{totalCashback.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="px-4 -mt-8 relative z-30">
                <div className="bg-white rounded-2xl p-3 shadow-2xl shadow-slate-900/10 flex items-center gap-3 border border-slate-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find loan ID or amount..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all border border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border",
                            showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                        )}
                    >
                        <Filter size={16} />
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-3 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Frequency</label>
                            <select
                                value={filterFrequency}
                                onChange={(e) => setFilterFrequency(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 outline-none border border-slate-100 focus:border-blue-200"
                            >
                                <option value="ALL">All Frequencies</option>
                                <option value="DAILY">Daily Payout</option>
                                <option value="WEEKLY">Weekly Payout</option>
                                <option value="MONTHLY">Monthly Payout</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Account Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 outline-none border border-slate-100 focus:border-blue-200"
                            >
                                <option value="ALL">All Accounts</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="CLOSED">Past Closed</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <main className="p-4 mt-4 space-y-8 animate-in fade-in duration-500">
                {/* Active Accounts Section */}
                <section>
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Accounts</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">Manage your current credit lines</p>
                        </div>
                        <div className="px-2.5 py-1 bg-blue-50 rounded-lg text-blue-600 text-[10px] font-black border border-blue-100 uppercase tracking-widest">
                            {activeLoans.length} Loans
                        </div>
                    </div>

                    {activeLoans.length > 0 ? (
                        <div className="space-y-4">
                            {activeLoans.map((loan) => (
                                <div
                                    key={loan.id}
                                    onClick={() => handleOpenLoan(loan)}
                                    className="p-4 rounded-xl bg-white border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-4 group active:scale-[0.98] transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-200 relative overflow-hidden"
                                >
                                    {/* Subtle Progress Bar Background */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-1000"
                                            style={{ width: `${Math.round((Number(loan.paid_amount || 0) / Number(loan.amount)) * 100)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Application #{loan.display_id || loan.id}</span>
                                                    <Sparkles size={8} className="text-amber-500 animate-pulse" />
                                                </div>
                                                <h3 className="text-xl font-black tracking-tighter text-slate-900">₹{parseFloat(loan.amount).toLocaleString()}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 mb-1">On Track</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{loan.payout_frequency}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-4">
                                        <div className="flex gap-4 flex-1 min-w-0">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">Paid</p>
                                                <p className="text-xs font-black text-slate-900 truncate">₹{parseFloat(loan.paid_amount || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">Balance</p>
                                                <p className="text-xs font-black text-slate-900 truncate">₹{(loan.amount - (loan.paid_amount || 0)).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10">
                                            Dashboard <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <LayoutDashboard className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-1">No Active Loans</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your financial ledger is clear</p>
                            <button onClick={() => navigate('/customer/loan')} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform active:scale-95">
                                Explore Loan Offers
                            </button>
                        </div>
                    )}
                </section>

                {/* Closed Accounts History */}
                {closedLoans.length > 0 && (
                    <section>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-2">Repayment History</h2>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                            {closedLoans.map((loan) => (
                                <div key={loan.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-base text-slate-900 tracking-tight">₹{parseFloat(loan.amount).toLocaleString()} Loan</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{loan.display_id || loan.id}</p>
                                                <span className="text-slate-200">|</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loan.tenure} Months</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Closed</p>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(loan.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Senior Insight Hook */}
                <div className="p-8 bg-blue-600 rounded-3xl text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <TrendingUp className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Credit Boost Info</h3>
                        </div>
                        <p className="text-sm font-medium text-blue-50 leading-relaxed mb-6">
                            Consistent on-time repayments can increase your future borrowing limit by up to <span className="font-black">₹50,000</span> and improve your approval speed.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Current Tier: Elite <ShieldCheck size={14} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal for Closed Loans Detail (Simple legacy modal) */}
            {
                showModal && selectedLoan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in duration-300">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Loan #{selectedLoan.id} Review</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Full Repayment Ledger</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-3">
                                    {repayments.map((rep, idx) => (
                                        <div key={rep.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">{idx + 1}</div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900">₹{parseFloat(rep.amount).toLocaleString()}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paid: {new Date(rep.paid_at || '').toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Success</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Repaid</p>
                                    <p className="text-xl font-black text-slate-900">₹{parseFloat(selectedLoan.amount).toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm"><IndianRupee size={24} /></div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
