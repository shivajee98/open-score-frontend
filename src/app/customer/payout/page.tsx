'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, Wallet, Landmark, ArrowRight, CheckCircle2, AlertCircle, Lock, Loader2, ArrowRightLeft, Clock, XCircle, Gift, ReceiptIndianRupee, MessageSquare, Eye, ChevronDown, Info, CreditCard, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import PinModal from '@/components/PinModal';

export default function PayoutPage() {
    // Data Fetching
    const { data: userData, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: walletData, isLoading: walletLoading, mutate: mutateWallet } = useApi('/wallet/balance');
    const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useApi('/wallet/withdrawal-rule');
    const { data: loans, isLoading: loansLoading } = useApi(userData?.role === 'CUSTOMER' ? '/loans' : null);

    // Vault Data
    const [vaultData, setVaultData] = useState<any>(null);
    const [vaultLoading, setVaultLoading] = useState(true);
    const fetchVault = async () => {
        try {
            const data = await apiFetch('/vault/me');
            setVaultData(data);
        } catch (e) { console.error(e); }
        finally { setVaultLoading(false); }
    };
    useEffect(() => { fetchVault(); }, []);

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
    const [transferAmountValue, setTransferAmountValue] = useState('');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Simulated processing state
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showRestricted, setShowRestricted] = useState(false); // Show restriction screen after attempt
    const [transferStatus, setTransferStatus] = useState<any>(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [showWithdrawalLimits, setShowWithdrawalLimits] = useState(false);
    const [ruleError, setRuleError] = useState<{ title: string, message: string } | null>(null);
    const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
    const [isRefundInfoOpen, setIsRefundInfoOpen] = useState(false);
    const [isBenefitAlertOpen, setIsBenefitAlertOpen] = useState(false);

    // Vault modals
    const [isVaultDepositOpen, setIsVaultDepositOpen] = useState(false);
    const [isVaultWithdrawOpen, setIsVaultWithdrawOpen] = useState(false);
    const [vaultDepositAmount, setVaultDepositAmount] = useState('');
    const [vaultDepositTenure, setVaultDepositTenure] = useState<number | null>(null);
    const [vaultWithdrawAmount, setVaultWithdrawAmount] = useState('');
    const [isVaultFlipped, setIsVaultFlipped] = useState(false);
    const [showVaultCardNumber, setShowVaultCardNumber] = useState(false);
    const [showVaultExpiry, setShowVaultExpiry] = useState(false);
    const [showVaultCvc, setShowVaultCvc] = useState(false);
    const [isVaultSubmitting, setIsVaultSubmitting] = useState(false);

    const handleVaultDeposit = async () => {
        if (!vaultDepositAmount || !vaultDepositTenure) return;
        setIsVaultSubmitting(true);
        try {
            await apiFetch('/vault/deposit', {
                method: 'POST',
                body: JSON.stringify({ amount: parseFloat(vaultDepositAmount), tenure_days: vaultDepositTenure }),
            });
            toast.success('Deposited to Vault');
            setIsVaultDepositOpen(false);
            setVaultDepositAmount('');
            setVaultDepositTenure(null);
            mutateWallet();
            fetchVault();
        } catch (e: any) { toast.error(e.message || 'Deposit failed'); }
        finally { setIsVaultSubmitting(false); }
    };

    const handleVaultWithdraw = async () => {
        if (!vaultWithdrawAmount) return;
        setIsVaultSubmitting(true);
        try {
            await apiFetch('/vault/withdraw', {
                method: 'POST',
                body: JSON.stringify({ amount: parseFloat(vaultWithdrawAmount) }),
            });
            toast.success('Bank settlement request submitted. Your vault funds will be transferred to your bank.');
            setIsVaultWithdrawOpen(false);
            setVaultWithdrawAmount('');
            mutateWallet();
            fetchVault();
        } catch (e: any) { toast.error(e.message || 'Withdrawal failed'); }
        finally { setIsVaultSubmitting(false); }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('last_merchant_verification_request');
            if (stored) setLastRequestTime(parseInt(stored));
        }
    }, []);

    const canRequestVerification = !lastRequestTime || (Date.now() - lastRequestTime > 24 * 60 * 60 * 1000);

    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    // Derived State
    const user = userData ? { ...userData, daily_earnings: walletData?.daily_earnings } : null;
    const balance = walletData?.balance || 0;
    const cashbackBalance = walletData?.cashback_balance || 0;

    // Dynamic Restrictions from Backend Rules
    const withdrawalRule = rulesData || null;
    const isLocked = withdrawalRule?.unlock_status?.has_active_loan && !withdrawalRule?.unlock_status?.is_unlocked;
    const dailyTxnLimit = withdrawalRule?.daily_txn_limit;
    const usedTxnsToday = withdrawalRule?.today_txn_count; // Backend sends used count
    const monthlyFreeCount = withdrawalRule?.monthly_free_count || 0;
    const usedThisMonth = withdrawalRule?.this_month_withdrawal_count || 0;

    const isLoading = userLoading || walletLoading || rulesLoading || (userData?.role === 'CUSTOMER' && loansLoading);

    // Merchant Verification Logic
    const isMerchant = user?.role === 'MERCHANT';

    // Verification timeframe logic (24h timer)
    const verificationTime = Math.max(
        user?.field_verified_at ? new Date(user.field_verified_at).getTime() : 0,
        user?.admin_verified_at ? new Date(user.admin_verified_at).getTime() : 0
    );
    const isVerifiedAtLeastOnce = verificationTime > 0;
    const is24hWaitPassed = isVerifiedAtLeastOnce && (Date.now() - verificationTime > 24 * 60 * 60 * 1000);

    // Truly verified means QR mapped, status is FULL_VERIFIED AND 24h passed
    const isMerchantVerified = isMerchant && user?.is_qr_mapped && user?.kyc_status === 'FULL_VERIFIED' && is24hWaitPassed;
    const isMerchantUnverified = isMerchant && !isMerchantVerified;

    // Timer message for modal
    const showWithin24hMessage = isMerchant && isVerifiedAtLeastOnce && !is24hWaitPassed;

    const handleRequestVerification = () => {
        if (!canRequestVerification) return;

        const now = Date.now();
        localStorage.setItem('last_merchant_verification_request', now.toString());
        setLastRequestTime(now);

        const ticketData = encodeURIComponent(JSON.stringify({
            prefill: true,
            autoSubmit: true,
            subject: `Merchant Payout Activation - Business Verification Request`,
            message: `Hi, I am a merchant (${user?.name}, Mobile: ${user?.mobile_number}). My QR mapping and KYC verification are pending. Please verify my business (${user?.business_name || 'N/A'}) so I can start withdrawing funds to my bank account. Thank you.`,
            category: 'merchant_verification'
        }));
        router.push(`/customer/support?ticket=${ticketData}`);
    };

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

        // Check for charge applicability and show confirmation modal
        // Charge applies if:
        const isFreeTier = payoutAmount > (withdrawalRule?.max_charge_amount || 0);
        const isInPaidRange = payoutAmount >= (withdrawalRule?.min_charge_amount || 0) &&
            payoutAmount <= (withdrawalRule?.max_charge_amount || 0);

        // Fee applies ONLY in the dedicated paid range. 
        // Above the range is always free per the latest requirement.
        const hasCharge = withdrawalRule?.is_charge_enabled && isInPaidRange;

        if (hasCharge || payoutAmount >= 500) { // Always confirm for larger amounts or if charge applies
            setIsConfirmModalOpen(true);
            return;
        }

        // If no confirmation needed, proceed
        executeWithdrawal();
    };

    const executeWithdrawal = async () => {
        const payoutAmount = parseFloat(amount);
        setShowWithdrawalLimits(true);

        // Check absolute minimum
        if (payoutAmount < (withdrawalRule.min_charge_amount || 0)) {
            toast.error(`Min settlement: ${(withdrawalRule.min_charge_amount || 0).toLocaleString()}`);
            return;
        }

        // High tier logic
        const isHighTier = payoutAmount > (withdrawalRule.max_charge_amount || 0);
        const isPaidRange = payoutAmount >= (withdrawalRule.min_charge_amount || 0) &&
            payoutAmount <= (withdrawalRule.max_charge_amount || 0);

        if (!isHighTier && !isPaidRange) {
            toast.error(`Minimum payout is ${withdrawalRule.min_charge_amount}`);
            return;
        }

        // Check limits
        if (withdrawalRule.max_withdrawal && payoutAmount > withdrawalRule.max_withdrawal) {
            toast.error(`Max: ${withdrawalRule.max_withdrawal.toLocaleString()}`);
            return;
        }
        if (dailyTxnLimit && usedTxnsToday !== null && usedTxnsToday >= dailyTxnLimit) {
            toast.error("Daily request limit reached");
            return;
        }
        if (isLocked) {
            setShowRestricted(true);
            return;
        }

        // 2. Fetch latest user data to check verification status
        setIsSubmitting(true);
        let currentMerchantUnverified = isMerchantUnverified;
        try {
            const freshUser = await mutateUser();
            if (freshUser) {
                const freshVerifiedTime = Math.max(
                    freshUser.field_verified_at ? new Date(freshUser.field_verified_at).getTime() : 0,
                    freshUser.admin_verified_at ? new Date(freshUser.admin_verified_at).getTime() : 0
                );
                const fresh24hPassed = freshVerifiedTime > 0 && (Date.now() - freshVerifiedTime > 24 * 60 * 60 * 1000);
                const isFreshMerchantVerified = freshUser.role === 'MERCHANT' && freshUser.is_qr_mapped && freshUser.kyc_status === 'FULL_VERIFIED' && fresh24hPassed;
                currentMerchantUnverified = freshUser.role === 'MERCHANT' && !isFreshMerchantVerified;
            }
        } catch (e) {
            console.error("Failed to refresh user status", e);
        }

        // 3. Verification Pending check
        if (currentMerchantUnverified) {
            setIsSubmitting(false);
            setIsVerificationModalOpen(true);
            return;
        }

        // 4. API Request Execution
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
                await Promise.all([mutateWallet(), mutateWithdrawals(), mutateRules()]); // Refresh balance, history and rules
                setIsSuccess(true);
                toast.success("Cred-out request submitted!");
            } else {
                // Failed - Check if it was because of restriction logic (simulated or real)
                const error = apiResult.reason;
                const errorMsg = error?.message || "";

                if (isLocked || errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('unlock')) {
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

    const handleConfirmWithdrawal = () => {
        setIsConfirmModalOpen(false);
        executeWithdrawal();
    };

    const handleTransferToWallet = () => {
        const threshold = user?.cashback_threshold_amount || 0;
        const currentBalance = parseFloat(cashbackBalance.toString());

        if (currentBalance < threshold) {
            const remaining = threshold - currentBalance;
            toast.error(`Earn ${remaining.toLocaleString()} more to transfer to wallet.`);
            return;
        }

        setTransferAmountValue(cashbackBalance.toString());
        setIsTransferModalOpen(true);
    };

    const confirmTransferAmount = () => {
        const amt = parseFloat(transferAmountValue);
        if (!amt || amt <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (amt > parseFloat(cashbackBalance.toString())) {
            toast.error("Insufficient cashback balance");
            return;
        }
        setIsTransferModalOpen(false);
        setIsPinModalOpen(true);
    };

    const handlePinVerification = async (pin: string) => {
        setIsSubmitting(true);
        try {
            await apiFetch('/wallet/cashback-to-wallet', {
                method: 'POST',
                body: JSON.stringify({
                    pin,
                    amount: parseFloat(transferAmountValue)
                })
            });
            toast.success("Rewards transferred successfully!");
            setIsPinModalOpen(false);
            setTransferAmountValue('');
            mutateWallet();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to transfer rewards");
        } finally {
            setIsSubmitting(false);
        }
    };

    const themeColor = isMerchant ? 'emerald' : 'indigo';
    const transferEnabled = user?.transfer_enabled;

    // Fetch transfer status for merchants
    useEffect(() => {
        if (isMerchant && transferEnabled) {
            apiFetch('/merchant/bank-transfers/status').then(setTransferStatus).catch(() => { });
        }
    }, [isMerchant, transferEnabled]);

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
                    Your request for {parseFloat(amount).toLocaleString('en-IN')} has been submitted successfully and is under verification.
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

    // The full-screen restriction is removed to retain users on the page
    // if (isMerchantUnverified) { ... }

    if (showRestricted || (isLocked && !isSuccess)) {
        const unlock = withdrawalRule?.unlock_status;
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">

                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                        {unlock?.has_active_loan ? 'Unlock Account for Transfers' : 'Withdrawal Restricted'}
                    </h2>
                    <p className="text-slate-400 font-bold text-xs leading-relaxed uppercase tracking-wider max-w-xs mx-auto">
                        {unlock?.has_active_loan
                            ? `Your current ${unlock.loan_plan} requires specific activity to enable wallet transfers.`
                            : "Your account is currently ineligible for large transfers. Please check your limits."}
                    </p>
                </div>

                {unlock?.has_active_loan && (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-900/5 w-full max-w-sm text-left relative overflow-hidden mb-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                            How to Unlock?
                        </h4>

                        <div className="space-y-4">
                            {unlock.requirements.map((req: any, idx: number) => (
                                <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight mb-2">
                                        <span className={req.current >= req.required ? 'text-emerald-600' : 'text-slate-500'}>
                                            {req.label} {req.current >= req.required ? '✓' : ''}
                                        </span>
                                        <span className="text-slate-400">
                                            {req.type === 'spend' ? '' : ''}{req.current.toLocaleString()} / {req.type === 'spend' ? '' : ''}{req.required.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${req.current >= req.required ? 'bg-emerald-500' : (req.type === 'spend' ? 'bg-indigo-600' : 'bg-amber-500')}`}
                                            style={{ width: `${Math.min(100, (req.current / req.required) * 100)}%` }}
                                        />
                                    </div>
                                    {req.current < req.required && (
                                        <p className="text-[9px] font-bold text-rose-400 mt-2 uppercase tracking-tighter">
                                            {req.type === 'spend' ? `Spend ${req.remaining.toLocaleString()} more` : `Complete ${req.remaining} more transactions`}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!unlock?.is_unlocked && (
                    <div className="w-full max-w-sm bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-8 text-left">
                        <p className="text-[10px] font-bold text-amber-700 leading-normal flex items-start gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>Even when locked, you can always withdraw amounts you earned above your loan value: <b>{withdrawalRule?.unlock_status?.locked_amount ? Math.max(0, balance - withdrawalRule.unlock_status.locked_amount).toLocaleString() : '0'}</b></span>
                        </p>
                    </div>
                )}

                <button
                    onClick={() => router.push('/customer/loan')}
                    className="w-full max-w-sm py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                    Upgrade Loan Plan
                    <ArrowRight size={18} />
                </button>
                <button
                    onClick={() => setShowRestricted(false)}
                    className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
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
                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            {isMerchantVerified && (
                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-500">
                                    <CheckCircle2 size={10} strokeWidth={3} />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                                </div>
                            )}
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cred-out</h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bank Settlement</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Input Side */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Main Balance Card */}
                            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-900 via-teal-950 to-emerald-900' : 'from-slate-900 via-indigo-950 to-indigo-900'} rounded-2xl p-4 text-white shadow-lg shadow-slate-900/10 relative overflow-hidden group h-32 flex flex-col justify-between`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="flex items-center gap-2 mb-1 opacity-60">
                                    <Wallet size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{isMerchant ? 'Settlement' : 'Available'}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-sm opacity-40 font-black mr-1"></span>
                                    <span className="text-2xl font-black tracking-tighter">
                                        {balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                                    {[100, 500, 1000].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val.toString())}
                                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[7px] font-black transition-colors whitespace-nowrap"
                                        >
                                            +{val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cashback Card */}
                            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-900/10 relative overflow-hidden group h-32 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="flex items-center gap-2 mb-1 opacity-60">
                                    <Gift size={12} strokeWidth={3} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Incremental</span>
                                </div>
                                <div className="mb-1">
                                    <span className="text-sm opacity-40 font-black mr-1"></span>
                                    <span className="text-2xl font-black tracking-tighter drop-shadow-md">
                                        {cashbackBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg py-1 px-2 border border-white/10 w-fit">
                                        <p className="text-[7px] font-black uppercase tracking-widest text-white/80 leading-tight">Reward Holdings</p>
                                    </div>
                                    <button
                                        onClick={handleTransferToWallet}
                                        disabled={isSubmitting}
                                        className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all active:scale-90 disabled:opacity-50 flex items-center justify-center border border-white/5 shadow-inner"
                                    >
                                        <ArrowRightLeft size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Vault Card — 3D Flip & Privacy Toggles */}
                        {vaultData?.vault && (
                            <div className="relative mb-6">
                                <div 
                                    className="relative w-full max-w-[340px] mx-auto perspective-1000 cursor-pointer h-[191px]"
                                    onClick={() => setIsVaultFlipped(!isVaultFlipped)}
                                >
                                    <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isVaultFlipped ? 'rotate-y-180' : ''}`}>
                                        
                                        {/* FRONT SIDE */}
                                        <div className="absolute inset-0 backface-hidden">
                                            <div className="bg-[#121417] rounded-xl px-4 py-3.5 text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col justify-between group">
                                                {/* Matte Finish & Grain */}
                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                                                </div>
                                                <div className="absolute inset-0 opacity-5 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                                                <div className="relative z-10 flex flex-col h-full justify-between">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 bg-gradient-to-br from-[#f9e37a] to-[#a8924a] rounded-sm flex items-center justify-center text-[#121417] font-black text-[8px] shadow-sm transform -rotate-6 group-hover:rotate-0 transition-transform">OS</div>
                                                                <span className="text-[9px] font-['Noto_Serif'] italic tracking-[0.2em] text-[#f9e37a]">VAULT</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                            <button 
                                                                onClick={() => setIsVaultDepositOpen(true)}
                                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                            >
                                                                <ArrowDownToLine size={10} className="text-[#f9e37a]" />
                                                            </button>
                                                            <button 
                                                                onClick={() => setIsVaultWithdrawOpen(true)}
                                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                            >
                                                                <ArrowUpFromLine size={10} className="text-[#f9e37a]" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Card Number with Hide Toggle */}
                                                    <div className="py-2 flex items-center justify-center gap-3 group/number" onClick={(e) => e.stopPropagation()}>
                                                        <p className="font-mono text-[13px] tracking-[0.25em] text-white/80 text-center pl-4">
                                                            {showVaultCardNumber 
                                                                ? vaultData.vault.card_number?.replace(/(.{4})/g, '$1 ').trim() 
                                                                : '••••  ••••  ••••  ' + vaultData.vault.card_number?.slice(-4)}
                                                        </p>
                                                        <button 
                                                            onClick={() => setShowVaultCardNumber(!showVaultCardNumber)}
                                                            className="p-1 hover:bg-white/10 rounded-md transition-all opacity-0 group-hover/number:opacity-100"
                                                        >
                                                            <Eye size={12} className={showVaultCardNumber ? 'text-amber-400' : 'text-white/30'} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-end justify-between border-t border-white/[0.03] pt-2 pb-0.5">
                                                        <div>
                                                            <span className="text-[6px] font-bold uppercase tracking-widest text-[#a8924a] block opacity-60 mb-0.5">Asset Value</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-[10px] font-['Noto_Serif'] text-[#f9e37a]">₹</span>
                                                                <span className="text-lg font-black tracking-tighter text-[#fef9f3]">
                                                                    {parseFloat(vaultData.vault.balance || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-4 text-[8px] font-mono text-white/30 mb-0.5" onClick={(e) => e.stopPropagation()}>
                                                            <div className="text-right border-r border-white/5 pr-3 flex flex-col items-end group/exp">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="block text-[5px] uppercase tracking-widest text-[#a8924a] opacity-60">Valid Thru</span>
                                                                    <button onClick={() => setShowVaultExpiry(!showVaultExpiry)} className="opacity-0 group-hover/exp:opacity-100 transition-opacity">
                                                                        <Eye size={8} />
                                                                    </button>
                                                                </div>
                                                                <span className="text-white/50">{showVaultExpiry ? (vaultData.vault.expiry_date || '—') : '••/••'}</span>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end group/cvc">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="block text-[5px] uppercase tracking-widest text-[#a8924a] opacity-60">Secure</span>
                                                                    <button onClick={() => setShowVaultCvc(!showVaultCvc)} className="opacity-0 group-hover/cvc:opacity-100 transition-opacity">
                                                                        <Eye size={8} />
                                                                    </button>
                                                                </div>
                                                                <span className="text-white/50">{showVaultCvc ? (vaultData.vault.cvc || '•••') : '•••'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE — Yield Matrix */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180">
                                            <div className="bg-[#121417] rounded-xl text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col group">
                                                {/* Black Magnetic Strip */}
                                                <div className="w-full h-8 bg-[#000] mt-5 shadow-inner" />
                                                
                                                <div className="px-5 py-4 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black tracking-[0.2em] text-[#f9e37a] uppercase leading-none">Yield Matrix</span>
                                                            <span className="text-[5px] font-black tracking-[0.4em] text-white/20 uppercase mt-1">Cycle Intelligence</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-20">
                                                            <Lock size={10} />
                                                            <span className="text-[6px] font-black uppercase tracking-widest">ENCRYPTED</span>
                                                        </div>
                                                    </div>

                                                    {/* Internal Rates Grid */}
                                                    <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto scrollbar-hide py-1" onClick={(e) => e.stopPropagation()}>
                                                        {vaultData.rates?.map((r: any) => (
                                                            <div key={r.id} className="bg-white/[0.03] border border-white/[0.04] p-2 rounded-lg flex flex-col justify-center hover:bg-white/[0.07] transition-all">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[6px] font-black text-white/40 uppercase tracking-widest">{r.tenure_days}D</span>
                                                                    <TrendingUp size={8} className="text-emerald-500/40" />
                                                                </div>
                                                                <span className="text-sm font-black text-[#f9e37a] leading-none">{r.interest_rate}%</span>
                                                                <span className="text-[5px] font-bold text-white/20 uppercase mt-1 tracking-tighter">Annual Yield</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between border-t border-white/[0.03] pt-2">
                                                        <div className="flex gap-[1px] h-3 items-end opacity-20">
                                                            {[1,3,1,5,2,4,1,6,2,3,1,7,4,1].map((w, i) => (
                                                                <div key={i} className="bg-white" style={{ width: `${w}px`, height: '100%' }} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[6px] font-serif italic text-white/10 uppercase tracking-widest">OPEN SCORE BRANDED ASSET</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Transfer Amount</label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter Amount"
                                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-xl font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all"
                                />
                            </div>
                            {withdrawalRule && amount && parseFloat(amount) > 0 && (
                                <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${parseFloat(amount) > (withdrawalRule.max_charge_amount || 0)
                                                    ? 'bg-emerald-500 shadow-[0_0_8px_oklch(0.7_0.2_150)]'
                                                    : parseFloat(amount) < (withdrawalRule.min_charge_amount || 0)
                                                        ? 'bg-slate-300'
                                                        : 'bg-amber-500 shadow-[0_0_8px_oklch(0.7_0.2_80)]'
                                                }`}></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                                                {parseFloat(amount) > (withdrawalRule.max_charge_amount || 0)
                                                    ? 'Priority Duty-Free Payout'
                                                    : parseFloat(amount) < (withdrawalRule.min_charge_amount || 0)
                                                        ? 'Invalid Amount'
                                                        : 'Standard Withdrawal (Paid Tier)'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-900">
                                            {(() => {
                                                const amt = parseFloat(amount) || 0;
                                                const minAmt = (withdrawalRule.min_charge_amount || 0);
                                                const maxAmt = (withdrawalRule.max_charge_amount || 0);

                                                if (amt < minAmt) return 'Fee: -';
                                                if (amt > maxAmt) return 'Fee: 0';

                                                // Between min and max -> Paid Tier
                                                return `Fee: ${withdrawalRule.charge_percent || 0}%`;
                                            })()}
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100"></div>

                                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} strokeWidth={3} />
                                            <span>Daily: {usedTxnsToday}/{dailyTxnLimit}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Landmark size={10} strokeWidth={3} />
                                            <span>Tier Range: {(withdrawalRule.min_charge_amount || 0).toLocaleString()} - {(withdrawalRule.max_charge_amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {parseFloat(amount) < (withdrawalRule.min_charge_amount || 0) && (
                                        <div className="mt-1 flex items-center gap-2 text-rose-500 animate-pulse text-[9px] font-black uppercase tracking-tighter">
                                            <XCircle size={12} />
                                            Entry amount below Minimum Limit
                                        </div>
                                    )}
                                </div>
                            )}
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
                                        Bank details will update 24 to 48 hours
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

                        {withdrawalRule?.is_charge_enabled && monthlyFreeCount > 0 && usedThisMonth >= monthlyFreeCount && (
                            <div className="mb-4 mt-2 px-4 py-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <AlertCircle size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Standard fees apply</p>
                                    <p className="text-[8px] font-bold text-amber-600/70">Free monthly quota ({monthlyFreeCount}) exhausted.</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePayout}
                            disabled={isSubmitting || !amount || parseFloat(amount) < (withdrawalRule?.min_charge_amount || 0) || parseFloat(amount) > balance}
                            className={`w-full py-4 ${isMerchant ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-2xl font-black text-sm disabled:bg-slate-100 disabled:text-slate-300 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200 mt-2`}
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

                        {/* Transfer Button */}
                        {isMerchant && (
                            <button
                                onClick={() => router.push('/customer/transfer')}
                                disabled={!transferEnabled}
                                className={`w-full py-4 mt-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${transferEnabled
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-200'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                title={!transferEnabled ? 'Transfer is not enabled for your account. Contact admin.' : 'Transfer to bank accounts'}
                            >
                                <ArrowRightLeft size={18} />
                                Transfer
                                {!transferEnabled && <Lock size={14} className="ml-1 opacity-50" />}
                            </button>
                        )}

                        {/* Transfer Status Banner */}
                        {isMerchant && transferStatus?.has_transfers && (
                            <div className={`w-full mt-3 p-4 rounded-2xl border flex items-center gap-3 ${transferStatus.status === 'PENDING' ? 'bg-amber-50 border-amber-200' :
                                transferStatus.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200' :
                                    transferStatus.status === 'REJECTED' ? 'bg-rose-50 border-rose-200' :
                                        'bg-slate-50 border-slate-200'
                                }`}>
                                {transferStatus.status === 'PENDING' && <Clock className="w-5 h-5 text-amber-500" />}
                                {transferStatus.status === 'APPROVED' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                {transferStatus.status === 'REJECTED' && <XCircle className="w-5 h-5 text-rose-500" />}
                                <div>
                                    <p className="text-xs font-black text-slate-900">
                                        {transferStatus.status === 'PENDING' ? 'Transfer Under Process' :
                                            transferStatus.status === 'APPROVED' ? 'Transfer Approved' :
                                                transferStatus.status === 'REJECTED' ? 'Transfer Rejected' : transferStatus.status}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400">
                                        Bulk Pay {transferStatus.total_amount?.toLocaleString('en-IN')} • {transferStatus.count} recipients
                                    </p>
                                </div>
                            </div>
                        )}
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
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs font-black ${parseFloat(w.charge_amount) > 0 ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                {parseFloat(w.amount).toLocaleString('en-IN')}
                                            </p>
                                            {parseFloat(w.charge_amount) > 0 && (
                                                <p className="text-xs font-black text-emerald-600">
                                                    {parseFloat(w.net_amount).toLocaleString('en-IN')}
                                                </p>
                                            )}
                                        </div>
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
                                        <p className="text-[8px] font-bold text-slate-500 mt-1 italic max-w-[150px]">{w.admin_note}</p>
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
            </div >
            {/* Amount Input Modal */}
            {
                isTransferModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Transfer Rewards</h3>
                                <button onClick={() => setIsTransferModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-4">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Available Rewards</p>
                                    <p className="text-xl font-black text-orange-900">{parseFloat(cashbackBalance.toString()).toLocaleString()}</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Amount to Transfer</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-slate-900 transition-colors"></span>
                                        <input
                                            type="number"
                                            value={transferAmountValue}
                                            onChange={(e) => setTransferAmountValue(e.target.value)}
                                            placeholder="Enter Amount"
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 pl-10 pr-4 text-xl font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={confirmTransferAmount}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    Continue
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PIN Verification Modal */}
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onComplete={handlePinVerification}
                title="Verify Wallet PIN"
            />

            {/* Rule Error Modal */}
            {
                ruleError && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl" onClick={() => setRuleError(null)}></div>
                        <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                <Clock size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 text-center mb-2">{ruleError.title}</h2>
                            <p className="text-sm font-bold text-slate-500 text-center mb-8 leading-relaxed">
                                {ruleError.message}
                            </p>
                            <button
                                onClick={() => setRuleError(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Merchant Verification Modal */}
            {isVerificationModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

                        <button
                            onClick={() => setIsVerificationModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <XCircle className="w-5 h-5 text-slate-400" />
                        </button>

                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                            <Lock className="w-8 h-8 text-amber-500" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter leading-tight">
                            {showWithin24hMessage ? 'Activation in Progress' : 'Verification Pending'}
                        </h3>
                        <p className="text-slate-400 font-bold text-[10px] leading-relaxed uppercase tracking-widest mb-8">
                            {showWithin24hMessage 
                                ? 'Your profile has been verified successfully. Your payout will be activated within 24 hours.'
                                : 'Your merchant profile is under review. Field verification is required to enable bank settlements.'}
                        </p>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 mb-8 text-left">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${user?.is_qr_mapped ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                {user?.is_qr_mapped ? '✓' : ''}
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-900 tracking-tight">
                                    {isVerifiedAtLeastOnce ? 'Verification Completed' : 'QR Mapping Verification'}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">
                                    {showWithin24hMessage ? 'Enabling Payout (24hrs)' : (isVerifiedAtLeastOnce ? 'Status: Fully Verified' : 'Pending Field KYC')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleRequestVerification}
                                disabled={!canRequestVerification}
                                className={`w-full py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 ${canRequestVerification
                                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {canRequestVerification ? 'Request Fast Verification' : 'Request Already Sent'}
                                <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsVerificationModalOpen(false)}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Withdrawal Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

                        <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tighter">Are you sure?</h3>
                        <p className="text-slate-400 font-bold text-[9px] leading-relaxed uppercase tracking-widest mb-6">
                            Review settlement details
                        </p>

                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-6 space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Settlement</span>
                                <span className="text-xs font-black text-slate-900">{parseFloat(amount).toLocaleString()}</span>
                            </div>

                            {(() => {
                                const amt = parseFloat(amount);
                                const chargeRange = (amt >= (withdrawalRule?.min_charge_amount || 0) && amt <= (withdrawalRule?.max_charge_amount || 0));
                                const showFee = withdrawalRule?.is_charge_enabled && chargeRange;
                                const feeAmt = showFee ? (amt * (withdrawalRule.charge_percent || 0)) / 100 : 0;

                                // Cashback reversal preview
                                const ratio = balance > 0 ? Math.min(1, amt / balance) : 0;
                                const cashbackDeduction = (cashbackBalance * ratio);

                                return (
                                    <>
                                        {showFee && (
                                            <div className="flex justify-between items-center px-1 text-rose-500">
                                                <span className="text-[9px] font-black uppercase tracking-widest">Fee ({withdrawalRule.charge_percent}%)</span>
                                                <span className="text-xs font-black">-{feeAmt.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="h-px bg-slate-200/50 mx-1"></div>

                                        <div className={`p-4 rounded-xl shadow-md border flex justify-between items-center ${isMerchant ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 border-slate-800 text-white shadow-slate-200'}`}>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Net Cred-out</span>
                                            <span className="text-lg font-black">
                                                {(amt - feeAmt).toLocaleString()}
                                            </span>
                                        </div>

                                        {cashbackDeduction > 0 && (
                                            <div className="mt-6 px-1 space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <AlertCircle size={14} className="flex-shrink-0" />
                                                    <span className="text-xs font-black uppercase tracking-widest leading-none">Cashback Expired Due To Withdraw</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                                                    Withdrawal will reduce your cashback, <span className="text-rose-500 font-extrabold">{cashbackDeduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                </p>
                                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => setIsRefundInfoOpen(!isRefundInfoOpen)}
                                                            className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
                                                        >
                                                            How to save cashback?
                                                            <ChevronDown size={12} className={`transition-transform duration-300 ${isRefundInfoOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </div>

                                                    {isRefundInfoOpen && (
                                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl animate-in slide-in-from-top-1 fade-in duration-300">
                                                            <p className="text-[10px] font-bold text-slate-500 leading-normal">
                                                                Avoid withdrawals. Use app transfers for full benefits.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleConfirmWithdrawal}
                                className="py-3.5 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                            >
                                <AlertCircle size={14} />
                                Confirm
                            </button>
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="py-3.5 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vault Deposit Modal */}
            {isVaultDepositOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Deposit to Vault</h3>
                            <button onClick={() => setIsVaultDepositOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><XCircle className="w-5 h-5 text-slate-300" /></button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Amount (₹)</label>
                            <input type="number" value={vaultDepositAmount} onChange={(e) => setVaultDepositAmount(e.target.value)} placeholder="Enter amount"
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-lg font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 outline-none" />
                        </div>

                        {vaultData?.rates?.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Select Tenure</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {vaultData.rates.map((r: any) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setVaultDepositTenure(r.tenure_days)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                vaultDepositTenure === r.tenure_days
                                                    ? 'border-slate-900 bg-slate-50'
                                                    : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <span className="text-sm font-black text-slate-900 block">{r.tenure_days} Days</span>
                                            <span className="text-[10px] font-bold text-emerald-600">{r.interest_rate}% return</span>
                                            {r.penalty_rate > 0 && <span className="text-[8px] font-bold text-rose-400 block">Early exit: {r.penalty_rate}%</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleVaultDeposit}
                            disabled={isVaultSubmitting || !vaultDepositAmount || !vaultDepositTenure}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-slate-200"
                        >
                            {isVaultSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Deposit'}
                        </button>
                    </div>
                </div>
            )}

            {/* Vault Withdraw Modal — Bank Settlement (No Fees) */}
            {isVaultWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Withdraw from Vault</h3>
                            <button onClick={() => setIsVaultWithdrawOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><XCircle className="w-5 h-5 text-slate-300" /></button>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Balance</span>
                            <span className="text-sm font-black text-slate-900">₹{parseFloat(vaultData?.vault?.balance || 0).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Withdraw Amount (₹)</label>
                            <input type="number" value={vaultWithdrawAmount} onChange={(e) => setVaultWithdrawAmount(e.target.value)} placeholder="Enter amount"
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-lg font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 outline-none" />
                        </div>

                        {/* Settlement Info — No Fees */}
                        {vaultWithdrawAmount && parseFloat(vaultWithdrawAmount) > 0 && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement Amount</span>
                                    <span className="text-sm font-black text-slate-900">₹{parseFloat(vaultWithdrawAmount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Processing Fee</span>
                                    <span className="text-[10px] font-black text-emerald-600">₹0 (Waived)</span>
                                </div>
                                <div className="h-px bg-slate-200/50"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net to Bank</span>
                                    <span className="text-sm font-black text-emerald-700">₹{parseFloat(vaultWithdrawAmount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}

                        {/* Bank Details Preview */}
                        {user?.bank_name && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Landmark className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement Account</span>
                                </div>
                                <p className="text-xs font-black text-slate-900">{user.bank_name}</p>
                                <p className="text-[10px] font-bold text-slate-500">A/C: {'*'.repeat(Math.max(0, (user?.account_number?.length || 0) - 4)) + user?.account_number?.slice(-4)}</p>
                            </div>
                        )}

                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-5 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                                Early withdrawal may incur a penalty and forfeit interest for the current cycle. Funds will be settled to your bank account.
                            </p>
                        </div>

                        <button
                            onClick={handleVaultWithdraw}
                            disabled={isVaultSubmitting || !vaultWithdrawAmount || parseFloat(vaultWithdrawAmount) > parseFloat(vaultData?.vault?.balance || 0) || parseFloat(vaultWithdrawAmount) <= 0}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-slate-200"
                        >
                            {isVaultSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Bank Settlement'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
