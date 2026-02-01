'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Wallet, Landmark, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function PayoutPage() {
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await apiFetch('/auth/me');
                const walletData = await apiFetch('/wallet/balance');

                // Fetch loans to check eligibility (Must have active loan >= 50k)
                let isRestrictedLocal = false;
                if (userData.role === 'CUSTOMER') {
                    const loans = await apiFetch('/loans');
                    const eligibleLoan = loans.find((l: any) =>
                        ['ACTIVE', 'DISBURSED', 'APPROVED', 'PROCEEDED'].includes(l.status) &&
                        Number(l.amount) >= 50000
                    );

                    if (!eligibleLoan) {
                        setIsRestricted(true);
                        isRestrictedLocal = true;
                    }
                }

                // Merge wallet data (daily_earnings) into user object for UI check
                setUser({ ...userData, daily_earnings: walletData.daily_earnings });
                setBalance(walletData.balance);

                if (!isRestrictedLocal && (!userData.bank_name || !userData.account_number)) {
                    toast.error("Please update your bank details in profile first");
                    router.push('/customer/profile');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

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
        try {
            await apiFetch('/wallet/request-withdrawal', {
                method: 'POST',
                body: JSON.stringify({
                    amount: payoutAmount,
                    bank_name: user.bank_name,
                    account_number: user.account_number,
                    ifsc_code: user.ifsc_code,
                    account_holder_name: user.account_holder_name
                })
            });
            setIsSuccess(true);
            toast.success("Cred-out request submitted!");
        } catch (e: any) {
            toast.error(e.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
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

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
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

    if (isRestricted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 relative z-10">
                        <Landmark className="w-10 h-10 text-rose-500" />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-rose-100">
                            <AlertCircle size={16} className="text-rose-500 fill-rose-50" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Denied</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Pending Requirements</p>

                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                        <p className="text-slate-600 text-sm font-bold leading-relaxed mb-4">
                            Direct bank withdrawals (Cred-out) are exclusively available for our <span className="text-slate-900 font-black">Premium Members</span>.
                        </p>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-black">X</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">You cannot withdraw to bank account.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={12} strokeWidth={3} />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">To unlock, get an active loan of <span className="text-slate-900 font-black">₹50,000+</span>.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/customer/pay')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-slate-200"
                        >
                            <Wallet size={18} />
                            Use Scan & Pay Instead
                        </button>
                        <button
                            onClick={() => router.push('/customer/loan')}
                            className="w-full py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            Check Loan Eligibility
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans box-border selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-md mx-auto">
                <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 mb-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
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
                                    className="w-full pl-12 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="mt-3 flex gap-2">
                                {[100, 500, 1000, 5000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        className="px-4 py-2 bg-slate-50 text-slate-500 rounded-full font-black text-xs hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        +₹{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Landmark className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Settlement Account</h3>
                            </div>

                            <div className="bg-white/80 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bank</span>
                                    <span className="text-xs font-black text-slate-900">{user.bank_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">A/C Number</span>
                                    <span className="text-xs font-black text-slate-900">{user.account_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">IFSC</span>
                                    <span className="text-xs font-black text-slate-900">{user.ifsc_code}</span>
                                </div>
                            </div>

                            <p className="mt-4 flex items-start gap-2 text-[10px] font-bold text-indigo-600 leading-relaxed">
                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                Funds will be transferred to this account within 24-48 hours after approval.
                            </p>
                        </div>

                        <button
                            onClick={handlePayout}
                            disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200 mt-4 overflow-hidden relative"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Request Cred-out
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 items-start">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                        Simulated Mode: Transactions are for demonstration purposes. No real money will be transferred during this simulation.
                    </p>
                </div>
            </div>
        </div>
    );
}
