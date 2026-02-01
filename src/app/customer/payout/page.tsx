'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, Wallet, Landmark, ArrowRight, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function PayoutPage() {
    // Data Fetching
    const { data: userData, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: walletData, isLoading: walletLoading, mutate: mutateWallet } = useApi('/wallet/balance');
    const { data: loans, isLoading: loansLoading } = useApi(userData?.role === 'CUSTOMER' ? '/loans' : null);
    const { data: withdrawals, mutate: mutateWithdrawals } = useApi('/wallet/withdrawals');

    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Simulated processing state
    const [isSuccess, setIsSuccess] = useState(false);
    const [showRestricted, setShowRestricted] = useState(false); // Show restriction screen after attempt
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    // Derived State
    const user = userData ? { ...userData, daily_earnings: walletData?.daily_earnings } : null;
    const balance = walletData?.balance || 0;

    // Check restrictions (Logic kept for reference, but not for immediate blocking)
    const isRestricted = userData?.role === 'CUSTOMER' &&
        !loans?.some((l: any) =>
            ['ACTIVE', 'DISBURSED', 'APPROVED', 'PROCEEDED'].includes(l.status) &&
            Number(l.amount) >= 50000
        );

    const isLoading = userLoading || walletLoading || (userData?.role === 'CUSTOMER' && loansLoading);

    useEffect(() => {
        if (!isLoading && user && !isRestricted && (!user.bank_name || !user.account_number)) {
            toast.error("Please update your bank details in profile first");
            router.push('/customer/profile');
        }
    }, [isLoading, user, isRestricted, router]);

    const handlePayout = async () => {
        const payoutAmount = parseFloat(amount);
        if (!payoutAmount || payoutAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (payoutAmount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        setIsSubmitting(true);
        setIsProcessing(true); // Start simulated processing UI

        try {
            // Start both API call and Timer in parallel
            // We ensure at least 30 seconds of processing time for UX as requested
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 30000));

            const apiPromise = apiFetch('/wallet/request-withdrawal', {
                method: 'POST',
                body: JSON.stringify({
                    amount: payoutAmount,
                    bank_name: user?.bank_name,
                    account_number: user?.account_number,
                    ifsc_code: user?.ifsc_code,
                    account_holder_name: user?.account_holder_name
                })
            });

            // Wait for both
            const [_, apiResult] = await Promise.allSettled([minDelayPromise, apiPromise]);

            if (apiResult.status === 'fulfilled') {
                // Success
                await Promise.all([mutateWallet(), mutateWithdrawals()]); // Refresh balance and history
                setIsSuccess(true);
                toast.success("Cred-out request submitted!");
            } else {
                // Failed - Check if it was because of restriction logic (simulated or real)
                const error = apiResult.reason;
                const errorMsg = error?.message || "";

                if (isRestricted || errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('unlock')) {
                    setShowRestricted(true);
                } else {
                    toast.error(errorMsg || "Failed to submit request");
                }
            }

        } catch (e: any) {
            console.error(e);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
            setIsProcessing(false);
        }
    };

    if (!isAuthenticated || !user) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    // Processing UI (Simulated Wait)
    if (isProcessing) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-8 relative">
                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Landmark className="w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight animate-pulse">Validating Bank Transfer</h2>
                    <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed">
                        Verifying eligibility and bank connectivity. Please do not close this window.
                    </p>

                    <div className="mt-8 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full animate-[progress_30s_linear_forwards]" style={{ width: '0%' }}></div>
                    </div>
                    <style jsx>{`
                        @keyframes progress {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 animate-in zoom-in-50 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Request Received</h2>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                        Your Cred-out request for <span className="text-slate-900 font-black">₹{amount}</span> has been submitted to the administrator for approval.
                    </p>
                    <button
                        onClick={() => router.push('/customer')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
                    >
                        Back to Home
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // The "Rejected" Screen (Access Locked) - Only shown AFTER processing if failed/restricted
    if (showRestricted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-500">
                <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50 shadow-inner">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-rose-100">
                                <Lock className="w-8 h-8 text-rose-500" strokeWidth={2.5} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Request Declined</h2>
                        <p className="text-slate-500 font-medium text-sm px-2 mb-8 leading-relaxed">
                            Our system could not approve this withdrawal request at this time.
                        </p>

                        <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-start gap-4 relative z-10">
                                <div className="mt-1 bg-white p-1.5 rounded-lg shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-rose-500 fill-rose-50" />
                                </div>
                                <div>
                                    <h4 className="font-black text-rose-950 text-xs uppercase tracking-widest mb-1.5 opacity-80">Reason: Access Locked</h4>
                                    <p className="text-slate-700 text-xs font-bold leading-relaxed">
                                        You need an active loan of <span className="text-rose-600 font-black bg-rose-100/50 px-1 rounded">₹50,000 or more</span> to unlock direct bank withdrawals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={() => router.push('/customer/loan/apply')}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
                            >
                                <span className="w-2 h-2 rounded-full bg-yellow-400 group-hover:animate-pulse"></span>
                                Apply Now & Unlock
                            </button>
                            <button
                                onClick={() => { setShowRestricted(false); setAmount(''); }}
                                className="w-full py-4 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Try Different Amount
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans box-border selection:bg-blue-100 selection:text-blue-900 pb-20">
            <div className="max-w-md mx-auto">
                <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{balance.toLocaleString()}</h2>
                            {user.role === 'MERCHANT' && (
                                <p className="text-xs font-bold text-emerald-600 mt-1">
                                    Withdrawable Today: ₹{(user.daily_earnings || 0).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Cred-out Amount</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-12 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[100, 500, 1000, 5000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        +₹{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/30 rounded-full blur-2xl -mr-10 -mt-10"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                                    <Landmark className="w-4 h-4" />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Settlement Target</h3>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm space-y-3.5 border border-indigo-100/30">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Bank</span>
                                    <span className="font-black text-slate-900">{user.bank_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">A/C Number</span>
                                    <span className="font-black text-slate-900 font-mono tracking-wider">{user.account_number}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-tighter">IFSC</span>
                                    <span className="font-black text-slate-900 font-mono px-1.5 py-0.5 bg-slate-100 rounded">{user.ifsc_code}</span>
                                </div>
                            </div>

                            <p className="mt-4 flex items-start gap-2 text-[10px] font-bold text-indigo-700/80 leading-relaxed italic">
                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                                Funds will reach your account within 24-48 hours once verified by the treasury.
                            </p>
                        </div>

                        <button
                            onClick={handlePayout}
                            disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-slate-200 mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Verify & Withdraw
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* History Section */}
                <div className="mt-10 mb-20 animate-in slide-in-from-bottom duration-700">
                    <div className="flex items-center justify-between px-4 mb-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Withdrawal History</h3>
                        <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase shadow-sm">
                            {withdrawals?.length || 0} Requests
                        </div>
                    </div>

                    <div className="space-y-3">
                        {withdrawals?.map((w: any) => (
                            <div key={w.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${w.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                            w.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        <Landmark size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">₹{parseFloat(w.amount).toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {new Date(w.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • #{w.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${w.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                            w.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {w.status}
                                    </span>
                                    {w.admin_note && (
                                        <p className="text-[8px] font-bold text-slate-500 mt-1 italic max-w-[100px] truncate">{w.admin_note}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!withdrawals || withdrawals.length === 0) && (
                            <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">No transactions</p>
                                <p className="text-[10px] text-slate-400 font-medium">Your withdrawal history will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
