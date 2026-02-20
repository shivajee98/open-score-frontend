'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, Wallet, Landmark, ArrowRight, CheckCircle2, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function PayoutPage() {
    // Data Fetching
    const { data: userData, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: walletData, isLoading: walletLoading, mutate: mutateWallet } = useApi('/wallet/balance');
    const { data: loans, isLoading: loansLoading } = useApi(userData?.role === 'CUSTOMER' ? '/loans' : null);

    // Pagination for withdrawals
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [wPage, setWPage] = useState(1);
    const [hasMoreW, setHasMoreW] = useState(true);
    const [fetchingMoreW, setFetchingMoreW] = useState(false);
    const [initialLoadingW, setInitialLoadingW] = useState(true);

    const withdrawalsObserver = useRef<IntersectionObserver | null>(null);
    const lastWithdrawalRef = useCallback((node: any) => {
        if (fetchingMoreW || initialLoadingW) return;
        if (withdrawalsObserver.current) withdrawalsObserver.current.disconnect();

        withdrawalsObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreW) {
                setWPage(prev => prev + 1);
            }
        });

        if (node) withdrawalsObserver.current.observe(node);
    }, [fetchingMoreW, initialLoadingW, hasMoreW]);

    const fetchWithdrawals = async (page: number) => {
        if (page === 1) setInitialLoadingW(true);
        else setFetchingMoreW(true);

        try {
            const data = await apiFetch(`/wallet/withdrawals?page=${page}`);
            const newW = data.data || [];

            if (page === 1) {
                setWithdrawals(newW);
            } else {
                setWithdrawals(prev => [...prev, ...newW]);
            }

            if (data.current_page !== undefined) {
                setHasMoreW(data.current_page < data.last_page);
            } else {
                setHasMoreW(false);
            }
        } catch (e) {
            console.error(e);
            setHasMoreW(false);
        } finally {
            setInitialLoadingW(false);
            setFetchingMoreW(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals(wPage);
    }, [wPage]);

    const mutateWithdrawals = () => {
        setWPage(1);
        fetchWithdrawals(1);
    };

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
    const loansList = Array.isArray(loans) ? loans : (loans?.data || []);
    const isRestricted = userData?.role === 'CUSTOMER' &&
        !loansList.some((l: any) =>
            ['ACTIVE', 'DISBURSED', 'APPROVED', 'PROCEEDED'].includes(l.status) &&
            Number(l.amount) >= 50000
        );

    const isLoading = userLoading || walletLoading || (userData?.role === 'CUSTOMER' && loansLoading);

    // Removed auto-redirect - let users see the payout page and add bank details from there

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

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'indigo';

    // Processing UI (Simulated Wait)
    if (isProcessing) {
        return (
            <div className={`min-h-screen ${isMerchant ? 'bg-emerald-950' : 'bg-slate-900'} flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-8 relative">
                        <div className={`absolute inset-0 border-4 ${isMerchant ? 'border-emerald-500/30' : 'border-indigo-500/30'} rounded-full`}></div>
                        <div className={`absolute inset-0 border-4 ${isMerchant ? 'border-emerald-400' : 'border-indigo-500'} border-t-transparent rounded-full animate-spin`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Landmark className={`w-8 h-8 ${isMerchant ? 'text-emerald-400' : 'text-indigo-400'} animate-pulse`} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight animate-pulse">Validating Bank Transfer</h2>
                    <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed">
                        Verifying eligibility and bank connectivity. Please do not close this window.
                    </p>

                    <div className="mt-8 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${isMerchant ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full animate-[progress_30s_linear_forwards]`} style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Withdrawal Requested</h2>
                <p className="text-slate-500 font-bold text-sm max-w-xs mb-8">
                    Your request for ₹{parseFloat(amount).toLocaleString('en-IN')} has been submitted successfully and is under verification.
                </p>
                <button
                    onClick={() => { setIsSuccess(false); setAmount(''); }}
                    className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                    Back to Payments
                </button>
            </div>
        );
    }

    if (showRestricted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">

                <div className="space-y-4 mb-12">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">0% Free Credit Value Unable to Transfer</h2>
                    <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-wider">
                        Loans above ₹50,000 allow Transfer
Amounts below ₹50,000 can be easily used for shopping and merchant payments.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-900/5 w-full max-w-sm text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h4 className="font-black text-slate-900 text-sm mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                        How to Transfer?
                    </h4>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5">1</div>
                            <p className="text-slate-500 text-xs font-bold leading-normal">Complete your current loan repayment cycles on time.</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 mt-0.5">2</div>
                            <p className="text-slate-500 text-xs font-bold leading-normal">Apply for a loan of ₹50,000 or above to enable full withdrawal access.</p>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => router.push('/customer/loan')}
                    className="mt-12 w-full max-w-sm py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                    Upgrade Loan Plan
                    <ArrowRight size={18} />
                </button>
                <button
                    onClick={() => setShowRestricted(false)}
                    className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                >
                    Back to Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-safe">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.push('/customer')} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cred-out</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bank Settlement</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Input Side */}
                    <div className="space-y-4">
                        <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-900 via-teal-950 to-emerald-900' : 'from-slate-900 via-indigo-950 to-slate-900'} rounded-2xl p-6 text-white shadow-lg shadow-slate-900/10 relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="flex items-center gap-3 mb-6 opacity-60">
                                <Wallet size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isMerchant ? 'Sale Settlement' : 'Withdrawable Balance'}</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-lg opacity-40 font-black mr-2">₹</span>
                                <span className="text-4xl font-black tracking-tighter">
                                    {balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {[100, 500, 1000, 2000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black transition-colors"
                                    >
                                        +₹{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="mb-0">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Transfer Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-slate-900 transition-colors">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter Amount"
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 pl-10 pr-4 text-xl font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Side */}
                    <div className="space-y-4">
                        {user?.bank_name && user?.account_number ? (
                            <>
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Landmark className="w-3.5 h-3.5" />
                                        Settlement Bank Account
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="font-bold text-slate-400 uppercase tracking-tighter text-xs">Bank</span>
                                            <span className="font-black text-slate-900 uppercase text-sm">{user?.bank_name}</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="font-bold text-slate-400 uppercase tracking-tighter text-xs">A/C No.</span>
                                            <span className="font-black text-slate-900 font-mono italic text-sm">
                                                {'*'.repeat(Math.max(0, (user?.account_number?.length || 0) - 4)) + user?.account_number?.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="font-bold text-slate-400 uppercase tracking-tighter text-xs">IFSC</span>
                                            <span className="font-black text-slate-900 font-mono px-1.5 py-0.5 bg-slate-100 rounded text-sm">{user?.ifsc_code}</span>
                                        </div>
                                    </div>

                                    <p className="mt-3 flex items-start gap-2 text-[10px] font-bold text-indigo-700/80 leading-relaxed italic">
                                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                                        Contact support to update bank details
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-6 border-2 border-rose-200 shadow-sm">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Landmark className="w-8 h-8 text-rose-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Add Bank Details</h3>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                        You need to add your bank account details to receive payouts
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/customer/profile?editBank=true')}
                                    className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-sm hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                                >
                                    Go to Profile & Add Details
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handlePayout}
                            disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                            className={`w-full py-4 ${isMerchant ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-2xl font-black text-sm disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-200 mt-2`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Verify & Withdraw
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                            Activity Log
                        </div>
                    </div>

                    <div className="space-y-3">
                        {withdrawals?.map((w: any, idx) => (
                            <div
                                key={w.id}
                                ref={idx === withdrawals.length - 1 ? lastWithdrawalRef : null}
                                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all"
                            >
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

                        {initialLoadingW && withdrawals.length === 0 && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white border border-slate-50 rounded-3xl animate-pulse"></div>)}
                            </div>
                        )}

                        {fetchingMoreW && (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        )}

                        {!initialLoadingW && withdrawals.length === 0 && (
                            <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">No transactions</p>
                                <p className="text-[10px] text-slate-400 font-medium">Your withdrawal history will appear here.</p>
                            </div>
                        )}

                        {!hasMoreW && withdrawals.length > 0 && (
                            <div className="text-center py-8">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">End of withdrawal history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
