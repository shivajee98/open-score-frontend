'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/loanUtils';
import PinModal from '@/components/PinModal';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { toast } from '@/components/ui/Toast';
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Calendar,
    IndianRupee,
    PieChart,
    TrendingUp,
    ChevronDown,
    Zap,
    ShieldCheck,
    Coins,
    Sparkles,
    Search,
    Filter,
    ArrowRightCircle,
    ReceiptIcon,
    HistoryIcon,
    Bell,
    Headphones,
    Smartphone,
    Upload,
    X
} from 'lucide-react';

export default function RepaymentDashboard() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const loanId = (params?.id || searchParams.get('id')) as string;

    const [loan, setLoan] = useState<any>(null);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(true);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Manual Payment State
    const [showManualPay, setShowManualPay] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter states
    const [emiFilter, setEmiFilter] = useState('ALL');

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
        if (!pendingEmi) {
            toast.error("No pending EMIs found.");
            return;
        }
        setPinModalOpen(true);
    };

    const handleUpiClick = () => {
        if (!pendingEmi) return;

        const amount = pendingEmi.amount;
        const payeeVpa = "rzpy.test@icici"; // Testing VPA or user config
        const payeeName = "OpenScore";
        const transactionRef = `EMI${loanId}${Date.now()}`;
        const transactionNote = `EMI Payment for Loan #${loanId}`;
        const currency = "INR";

        // Construct the UPI Intent URL
        const upiUrl = `upi://pay?pa=${payeeVpa}&pn=${payeeName}&tr=${transactionRef}&tn=${transactionNote}&am=${amount}&cu=${currency}`;

        // Create a hidden link and click it
        const link = document.createElement('a');
        link.href = upiUrl;
        link.click();

        toast.info("Opening UPI App... Please come back and upload screenshot.");
        setShowManualPay(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File too large. Max 10MB allows.");
                return;
            }
            setProofFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submitManualPayment = async () => {
        if (!proofFile) {
            toast.error("Please upload payment screenshot");
            return;
        }

        setPaying(true);
        const formData = new FormData();
        formData.append('proof_image', proofFile);
        formData.append('amount', pendingEmi.amount);
        if (transactionId) {
            formData.append('transaction_id', transactionId);
        }

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.msmeloan.sbs/api';

            const res = await fetch(`${apiUrl}/loans/${loanId}/manual-repay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || "Upload failed");

            toast.success("Payment proof submitted! Verification pending.");
            setShowManualPay(false);
            setProofFile(null);
            setPreviewUrl(null);
            setTransactionId('');
            fetchData();
        } catch (e: any) {
            toast.error(e.message || "Failed to submit proof");
        } finally {
            setPaying(false);
        }
    };

    const handleFinishRepay = async (pin: string) => {
        setPinModalOpen(false);
        if (!pendingEmi) return;

        setPaying(true);
        try {
            const res = await apiFetch(`/loans/${loanId}/repay`, {
                method: 'POST',
                body: JSON.stringify({ pin })
            });

            setSuccessData({
                amount: pendingEmi.amount,
                payeeName: `Loan EMI - #${loanId}`,
                ref: res.ref
            });

            fetchData();
        } catch (e: any) {
            toast.error(e.message || "Payment failed. Please check your wallet balance.");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent shadow-xl"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Repayment DNA...</p>
            </div>
        </div>
    );

    if (!loan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Application not found</div>;

    const paidEmis = repayments.filter(r => r.status === 'PAID');
    const pendingEmi = repayments.find(r => r.status === 'PENDING');
    const totalPaid = Number(loan.paid_amount || 0);

    // Use Backend Calculations
    const calculations = loan.calculations || {};
    const totalPayable = Number(calculations.net_payable_amount || loan.amount);

    // Progress Calculation
    const progress = totalPayable > 0 ? Math.min(100, Math.round((totalPaid / totalPayable) * 100)) : 0;

    // Fintech Analytics
    const cashbackRate = 0.01; // 1% cashback on each repayment
    const totalCashbackEarned = paidEmis.reduce((sum, r) => sum + (Number(r.amount) * cashbackRate), 0);

    // Grouping & Filtering for UI
    const filteredRepayments = repayments.filter(r => {
        if (emiFilter === 'ALL') return true;
        if (emiFilter === 'PAID') return r.status === 'PAID';
        if (emiFilter === 'PENDING') return r.status === 'PENDING';
        if (emiFilter === 'OVERDUE') return r.status === 'PENDING' && new Date(r.due_date) < new Date();
        return true;
    });

    const isLoanCleared = loan.status === 'CLOSED' || (repayments.length > 0 && !pendingEmi && totalPaid >= totalPayable);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
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

            {/* Premium Multi-Layer Header */}
            <div className="bg-slate-900 pt-8 pb-16 px-4 rounded-b-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-slate-900 to-indigo-900/30"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <button
                            onClick={() => router.push(`/customer/loan/status/view?id=${loanId}`)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all border border-white/5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Application Root
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 relative">
                                <Bell size={16} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
                            </button>
                            <Link href="/customer/support">
                                <button
                                    className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                                >
                                    <Headphones size={16} />
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                <h1 className="text-xl font-black text-white tracking-tighter uppercase">Repayment</h1>
                            </div>
                            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.25em] opacity-70 pl-0.5">#{loan.display_id || loan.id}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-70">To Pay</span>
                            <span className="text-xl font-black text-white leading-none tracking-tight">₹{totalPayable.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 px-0.5">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
                            <Coins size={16} className="text-emerald-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cashback</p>
                            <p className="text-lg font-black text-emerald-400 leading-none">₹{totalCashbackEarned.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
                            <Zap size={16} className="text-amber-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                            <p className="text-lg font-black text-white leading-none capitalize">{loan.payout_frequency}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
                            <Calendar size={16} className="text-blue-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total EMIs</p>
                            <p className="text-lg font-black text-white leading-none">{repayments.length} Units</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
                            <ShieldCheck size={16} className="text-indigo-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Tier</p>
                            <p className="text-lg font-black text-white uppercase leading-none">Gold</p>
                        </div>
                    </div>

                    {isLoanCleared && (
                        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><CheckCircle2 size={12} /> Status: Cleared</p>
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ready for Upgrade</p>
                            </div>
                            <button
                                onClick={() => router.push('/customer/loan')}
                                className="bg-white text-blue-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                            >
                                Apply New Loan <ArrowRightCircle size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 -mt-12 relative z-20 space-y-6">
                {/* Main Progress & Health Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-50 overflow-hidden relative group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform flex-shrink-0">
                                <PieChart size={28} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">Repayment Health</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Excellent</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l pl-2 border-slate-200 hidden xs:block">100% Consistency</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">Total Outstanding</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{(totalPayable - totalPaid).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="relative pt-2">
                        <div className="h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-100">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.3)] relative"
                                style={{ width: `${progress}%` }}
                            >
                                {progress > 15 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white uppercase tracking-widest">
                                        {progress}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <span className="flex items-center gap-1"><ArrowRightCircle size={10} className="text-blue-500" /> Paid: ₹{totalPaid.toLocaleString()}</span>
                            <span>{repayments.length - paidEmis.length} EMIs to Goal</span>
                        </div>
                    </div>
                </div>

                {/* Next Payment CTA */}
                {pendingEmi ? (
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                                    <Calendar size={12} className="text-blue-400" /> Due in {Math.ceil((new Date(pendingEmi.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                                </span>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Installment Amount</h4>
                                    <p className="text-4xl font-black tracking-tighter">₹{Number(pendingEmi.amount).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <ReceiptIcon size={24} className="text-white opacity-80" />
                                </div>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">ID: {pendingEmi.display_id || pendingEmi.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</p>
                                <p className="text-sm font-black">{new Date(pendingEmi.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Estimated Cashback</p>
                                <p className="text-sm font-black text-emerald-400">+ ₹{(Number(pendingEmi.amount) * cashbackRate).toFixed(0)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {!showManualPay ? (
                                <>
                                    <button
                                        onClick={handleUpiClick}
                                        disabled={paying}
                                        className="w-full py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 border border-slate-200"
                                    >
                                        <Smartphone size={18} className="text-blue-600" /> Pay via UPI App
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-40">
                                                <img src={previewUrl} alt="Proof" className="w-full h-full object-contain rounded-lg" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setProofFile(null); setPreviewUrl(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-rose-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-blue-400 mb-2" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tap to Upload Screenshot</p>
                                                <p className="text-[9px] text-slate-500 mt-1">Upload transaction screenshot to verify your payment</p>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>

                                    {/* Transaction ID Input */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transaction ID (Optional)</p>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Enter UPI Ref No / TXN ID"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setShowManualPay(false)} className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                                        <button onClick={submitManualPayment} disabled={!proofFile || paying} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50">{paying ? 'Uploading...' : 'Submit Proof'}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : isLoanCleared ? (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl shadow-blue-900/40 text-center space-y-6 relative overflow-hidden">
                        <Sparkles size={40} className="text-white animate-bounce mx-auto" />
                        <h2 className="text-3xl font-black tracking-tight mb-2">Loan Cleared!</h2>
                        <button onClick={() => router.push('/customer/loan')} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 mx-auto">Apply New Loan <ArrowRightCircle size={16} /></button>
                    </div>
                ) : null}

                {/* Analytical Ledger Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Analytical Ledger</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Deep-dive categorization</p>
                        </div>
                        <HistoryIcon size={24} className="text-slate-300" />
                    </div>

                    <div className="px-8 py-4 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-100">
                        {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(f => (
                            <button
                                key={f}
                                onClick={() => setEmiFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    emiFilter === f ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-2">
                        {filteredRepayments.length > 0 ? (
                            filteredRepayments.map((rep, idx) => (
                                <div key={rep.id} className={cn("p-5 rounded-[2rem] border transition-all flex items-center justify-between group", rep.status === 'PAID' ? "bg-white border-slate-100" : "bg-slate-50 border-transparent")}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border transition-all", rep.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-300 border-slate-100")}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <p className="font-black text-lg text-slate-900 tracking-tight">₹{parseFloat(rep.amount).toLocaleString()}</p>
                                                {rep.status === 'PAID' && <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[7px] font-black uppercase">+₹{(Number(rep.amount) * cashbackRate).toFixed(0)} Cashback</span>}
                                            </div>
                                            <div className="grid grid-cols-[60px_1fr] gap-y-1.5 items-center">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.1em] border-r border-slate-100 pr-2">Due Date</span>
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest pl-2">{new Date(rep.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {rep.status === 'PAID' ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-[0.1em]"><CheckCircle2 size={10} /> Verified</div>
                                        ) : (
                                            new Date(rep.due_date) < new Date() ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 text-[9px] font-black uppercase tracking-[0.1em]"><AlertCircle size={10} /> Overdue</div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[9px] font-black uppercase tracking-[0.1em]">Upcoming</div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-3">
                                <Search size={32} className="mx-auto text-slate-200" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching EMIs found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Impact Analysis */}
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white overflow-hidden relative group">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={20} />
                            <h3 className="text-lg font-black tracking-tight">Loan Impact Analysis</h3>
                        </div>
                        <p className="text-sm font-medium text-blue-100 leading-relaxed">By clearing this loan on time, you are unlocking a <span className="text-white font-black text-base italic underline">₹25,000 credit upgrade</span> in your next cycle.</p>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-700 bg-blue-400 flex items-center justify-center text-[8px] font-black uppercase">Lv{i}</div>)}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">You are in Top 5% Payers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-center z-40">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-2xl">
                    <AlertCircle size={14} className="text-blue-400" />
                    Auto-Debit Active via Wallet
                </div>
            </div>
        </div>
    );
}
