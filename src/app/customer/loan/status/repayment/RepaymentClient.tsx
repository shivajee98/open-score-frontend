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
    ChevronLeft,
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
    FileText,
    HistoryIcon,
    Bell,
    Headphones,
    Smartphone,
    Upload,
    X,
    Menu
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
        const transactionNote = `EMI Payment for Loan #${loanId}`;

        // Construct the UPI Intent URL
        const upiUrl = `upi://pay?pa=9161168840@uboi&pn=OpenScore%20Payment&mc=0000&mode=02&purpose=00&am=${amount}&tn=${encodeURIComponent(transactionNote)}`;

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

            // 1. Submit Manual Repayment Proof
            const res = await fetch(`${apiUrl}/loans/${loanId}/manual-repay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || "Upload failed");

            // The backend now creates the ticket automatically in submitManualRepayment
            // We just need to redirect to the support page.
            // If the backend returns the created ticket, we can use it.
            const createdTicket = data.ticket;

            if (createdTicket?.id) {
                toast.success("Proof submitted! Redirecting to support...");
                router.push(`/customer/support?ticket=${encodeURIComponent(JSON.stringify(createdTicket))}`);
            } else {
                toast.success("Payment proof submitted! Verification pending.");
                setShowManualPay(false);
                setProofFile(null);
                setPreviewUrl(null);
                setTransactionId('');
                fetchData();
            }

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
                id: res.id,
                ref: res.ref,
                date: res.created_at
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

    const serviceFeeEmi = repayments.find(r => Number(r.emi_number) === 0);
    const regularEmis = repayments.filter(r => Number(r.emi_number) > 0);

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
                date={successData?.date || new Date().toISOString()}
                transactionId={successData?.id || ''}
                referenceId={successData?.ref || ''}
                onClose={() => setSuccessData(null)}
            />

            {/* Header */}
            <div className="bg-[#AEEBD0] pt-12 pb-16 px-6 rounded-b-[2rem] relative">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={() => router.push(`/customer/loan/status/view?id=${loanId}`)}
                            className="p-2 -ml-2 text-slate-800 hover:bg-black/5 rounded-full transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-[17px] font-black text-slate-800 tracking-tight">Payment Schedule</h1>
                        <div className="w-10"></div> {/* Spacer to keep title centered if needed, or just remove */}
                    </div>

                    <div className="mb-2">
                        <span className="block text-[11px] font-black text-slate-600/90 uppercase tracking-[0.05em] mb-1">Total Amount Due</span>
                        <span className="text-[40px] leading-none font-black text-slate-800 tracking-tighter">₹{totalPayable.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-8 relative z-20 space-y-6 pb-12">
                {/* Service Fee Card */}
                {serviceFeeEmi && (
                    <div className="bg-white rounded-[1.25rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex items-center justify-between border-l-[4px] border-l-emerald-400">
                        <div>
                            <div className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2.5",
                                serviceFeeEmi.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                                {serviceFeeEmi.status}
                            </div>
                            <h3 className="text-[15px] font-black text-slate-800 mb-0.5">Pay Fees & Charges to Unlock Your Loan</h3>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Processed on {new Date(serviceFeeEmi.due_date).toLocaleDateString('en-GB')}</p>

                            {serviceFeeEmi.admin_note && serviceFeeEmi.status === 'PENDING' && (
                                <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <AlertCircle size={10} /> Payment Rejected
                                    </p>
                                    <p className="text-[10px] font-medium text-rose-500 leading-relaxed">
                                        {serviceFeeEmi.admin_note}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-xl font-black text-slate-800 tracking-tight mb-2">₹{Number(serviceFeeEmi.amount).toLocaleString()}</p>
                            {Number(serviceFeeEmi.emi_number) !== 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-[#E6F8EF] text-emerald-600 rounded text-[9px] font-bold">
                                    +₹{(Number(serviceFeeEmi.amount) * cashbackRate).toFixed(0)} cashback
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Next Payment CTA */}
                {pendingEmi && (
                    <div className="bg-white rounded-[1.25rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
                                    <Calendar size={10} /> Due in {Math.ceil((new Date(pendingEmi.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                                </span>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                                    {Number(pendingEmi.emi_number) === 0 ? "Fee Amount" : "Installment Amount"}
                                </h4>
                                <p className="text-3xl font-black text-slate-800 tracking-tighter">₹{Number(pendingEmi.amount).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {!showManualPay ? (
                                <button
                                    onClick={handleUpiClick}
                                    disabled={paying || pendingEmi.status === 'PENDING_VERIFICATION' || pendingEmi.status === 'MANUAL_VERIFICATION'}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {(pendingEmi.status === 'PENDING_VERIFICATION' || pendingEmi.status === 'MANUAL_VERIFICATION') ? (
                                        pendingEmi.agent_approved_by ? (
                                            <>
                                                <CheckCircle2 size={16} className="text-emerald-400" /> Verified: Waiting Admin
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} className="text-amber-400" /> Under Verification
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Smartphone size={16} /> Pay via UPI App
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
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
                                                <Upload size={24} className="text-blue-500 mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tap to Upload Screenshot</p>
                                                <p className="text-[9px] text-slate-400 mt-1">Upload transaction screenshot to verify your payment</p>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Transaction ID (Optional)</p>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Enter UPI Ref No / TXN ID"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setShowManualPay(false)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
                                        <button onClick={submitManualPayment} disabled={!proofFile || paying} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 shadow-md">{paying ? 'Uploading...' : 'Submit Proof'}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-4 pl-1">Installment Breakdown</h4>

                    <div className="space-y-3">
                        {regularEmis.map((emi, index) => (
                            <div key={emi.id} className="space-y-3">
                                <div className="bg-white rounded-[1.25rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F0F6FF] flex items-center justify-center text-blue-500 font-black text-sm border border-blue-50">
                                            {emi.emi_number}
                                        </div>
                                        <div>
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-1.5",
                                                emi.status === 'PAID' ? "bg-emerald-50 text-emerald-600" :
                                                    new Date(emi.due_date) < new Date() && emi.status !== 'PAID' ? "bg-rose-50 text-rose-600" :
                                                        "bg-[#EEF2FF] text-blue-600"
                                            )}>
                                                {emi.status === 'PAID' ? 'PAID' : new Date(emi.due_date) < new Date() ? 'OVERDUE' : 'UPCOMING'}
                                            </div>
                                            <p className="text-[11px] font-black text-slate-700">Due: {new Date(emi.due_date).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[15px] font-black text-slate-800 tracking-tight mb-0.5">₹{Number(emi.amount).toLocaleString()}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.05em]">Installment {index + 1} of {regularEmis.length}</p>
                                    </div>
                                </div>
                                {emi.admin_note && emi.status === 'PENDING' && (
                                    <div className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                            <AlertCircle size={10} /> Payment Rejected
                                        </p>
                                        <p className="text-[10px] font-medium text-rose-500 leading-relaxed">
                                            {emi.admin_note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-center z-40">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-2xl">
                    <AlertCircle size={14} className="text-blue-400" />
                    Auto-Debit Active via Wallet
                </div>
            </div>
        </div >
    );
}
