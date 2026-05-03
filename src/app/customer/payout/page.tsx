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

    // Vault Logs (Settlements)
    const [vaultLogs, setVaultLogs] = useState<any[]>([]);
    const [vaultLogsLoading, setVaultLogsLoading] = useState(true);
    const fetchVaultLogs = async () => {
        try {
            const data = await apiFetch('/vault/logs');
            setVaultLogs(data.logs || []);
        } catch (e) { console.error(e); }
        finally { setVaultLogsLoading(false); }
    };
    useEffect(() => { fetchVaultLogs(); }, []);

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

    const [transferStatus, setTransferStatus] = useState<any>(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [showWithdrawalLimits, setShowWithdrawalLimits] = useState(false);
    const [ruleError, setRuleError] = useState<{ title: string, message: string } | null>(null);
    const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
    const [isRefundInfoOpen, setIsRefundInfoOpen] = useState(false);
    const [isBenefitAlertOpen, setIsBenefitAlertOpen] = useState(false);

    // Vault & Settlement modals
    const [isVaultDepositOpen, setIsVaultDepositOpen] = useState(false);
    const [isSettlementTenureOpen, setIsSettlementTenureOpen] = useState(false);
    const [isVaultWithdrawOpen, setIsVaultWithdrawOpen] = useState(false);
    const [vaultDepositAmount, setVaultDepositAmount] = useState('');
    const [vaultDepositTenure, setVaultDepositTenure] = useState<number | null>(null);
    const [settlementTenureDays, setSettlementTenureDays] = useState<number | null>(null);
    const [vaultWithdrawAmount, setVaultWithdrawAmount] = useState('');
    const [isVaultFlipped, setIsVaultFlipped] = useState(false);
    const [showVaultCardNumber, setShowVaultCardNumber] = useState(false);
    const [showVaultExpiry, setShowVaultExpiry] = useState(false);
    const [showVaultCvc, setShowVaultCvc] = useState(false);
    const [isVaultSubmitting, setIsVaultSubmitting] = useState(false);

    // Bank Details State
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [bankSuggestions, setBankSuggestions] = useState<string[]>([]);
    const [showBankSuggestions, setShowBankSuggestions] = useState(false);
    const [ifscSuggestions, setIfscSuggestions] = useState<any[]>([]);
    const [showIfscSuggestions, setShowIfscSuggestions] = useState(false);
    const [selectedBank, setSelectedBank] = useState<any>(null);

    // Initialize bank details if user already has them
    useEffect(() => {
        if (userData) {
            setBankName(userData.bank_name || '');
            setAccountNumber(userData.account_number || '');
            setConfirmAccountNumber(userData.account_number || '');
            setIfscCode(userData.ifsc_code || '');
            setAccountHolderName(userData.account_holder_name || userData.name || '');
        }
    }, [userData]);

    // Suggestion logic
    const fetchSuggestions = async (search: string, type: 'bank' | 'ifsc') => {
        try {
            const data = await apiFetch(`/wallet/banks?search=${search}&type=${type}`);
            if (type === 'bank') {
                setBankSuggestions(data || []);
                setShowBankSuggestions(data?.length > 0);
            } else {
                setIfscSuggestions(data || []);
                setShowIfscSuggestions(data?.length > 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bankName.trim().length > 1 && bankName !== userData?.bank_name) {
                fetchSuggestions(bankName, 'bank');
            } else {
                setBankSuggestions([]);
                setShowBankSuggestions(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [bankName, userData?.bank_name]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (ifscCode.trim().length > 2 && ifscCode !== userData?.ifsc_code) {
                fetchSuggestions(ifscCode, 'ifsc');
            } else {
                setIfscSuggestions([]);
                setShowIfscSuggestions(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [ifscCode, userData?.ifsc_code]);

    const handleVaultDeposit = async () => {
        if (!vaultDepositAmount || !vaultDepositTenure) return;
        setIsVaultSubmitting(true);
        try {
            await apiFetch('/vault/deposit', {
                method: 'POST',
                body: JSON.stringify({
                    amount: parseFloat(vaultDepositAmount),
                    tenure_days: vaultDepositTenure
                }),
            });
            toast.success('Deposited to Vault');
            setIsVaultDepositOpen(false);
            setVaultDepositAmount('');
            setVaultDepositTenure(null);
            mutateWallet();
            fetchVault();
            fetchVaultLogs();
        } catch (e: any) { toast.error(e.message || 'Deposit failed'); }
        finally { setIsVaultSubmitting(false); }
    };

    const handleSettlementTenure = async () => {
        if (!settlementTenureDays) return;
        setIsVaultSubmitting(true);
        try {
            await apiFetch('/vault/deposit', {
                method: 'POST',
                body: JSON.stringify({ tenure_days: settlementTenureDays }),
            });
            toast.success(`Settlement tenure set to ${settlementTenureDays} days`);
            setIsSettlementTenureOpen(false);
            setSettlementTenureDays(null);
            mutateWallet();
            fetchVault();
            fetchVaultLogs();
        } catch (e: any) { toast.error(e.message || 'Failed to set tenure'); }
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
            fetchVaultLogs();
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
    const is24hWaitPassed = isVerifiedAtLeastOnce && (user?.kyc_status === 'FULL_VERIFIED' || !!user?.admin_verified_at || (Date.now() - verificationTime > 24 * 60 * 60 * 1000));

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

        if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
            toast.error("Please fill all bank details");
            return;
        }

        if (accountNumber !== confirmAccountNumber) {
            toast.error("Account numbers do not match");
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

        if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
            toast.error("Please fill all bank details");
            return;
        }

        if (accountNumber !== confirmAccountNumber) {
            toast.error("Account numbers do not match");
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
                const fresh24hPassed = freshVerifiedTime > 0 && (freshUser.kyc_status === 'FULL_VERIFIED' || !!freshUser.admin_verified_at || (Date.now() - freshVerifiedTime > 24 * 60 * 60 * 1000));
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
                    bank_name: bankName,
                    account_number: accountNumber,
                    ifsc_code: ifscCode,
                    account_holder_name: accountHolderName
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

                if (errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('unlock')) {
                    toast.error(errorMsg || "Withdrawal restricted");
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

                {user?.has_pending_kyc_reupload ? (
                    <div className="bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto shadow-inner ring-8 ring-rose-50/50">
                            <Lock size={48} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Payout Restricted</h3>
                            <p className="text-slate-500 font-bold text-base leading-relaxed px-8">
                                Your bank settlement access is temporarily locked due to a pending KYC document correction request. 
                                <br/><span className="text-rose-500/80 text-sm mt-2 block">Please update your documents to restore full financial access.</span>
                            </p>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => router.push('/customer/loan')}
                                className="w-full max-w-sm py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group mx-auto"
                            >
                                Complete Re-upload <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Main Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Input Side */}
                    <div className="space-y-4">
                        {/* Vault Card — 3D Flip & Privacy Toggles */}
                        {vaultData?.vault && (
                            <div className="relative mb-6">
                                <div
                                    className="relative w-full max-w-[320px] mx-auto perspective-1000 cursor-pointer h-[175px]"
                                    onClick={() => setIsVaultFlipped(!isVaultFlipped)}
                                >
                                    <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isVaultFlipped ? 'rotate-y-180' : ''}`}>

                                        {/* FRONT SIDE */}
                                        <div className="absolute inset-0 backface-hidden">
                                            <div className="bg-[#0f1113] rounded-xl px-5 py-4 text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col justify-between group">
                                                {/* Brushed Metal Texture Effect */}
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#1a1d21] to-[#2a2d33]" />
                                                    <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                                                        style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)` }}>
                                                    </div>
                                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                                                    </div>
                                                    {/* Large Background Logo Accent */}
                                                    <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full border-[12px] border-[#c5a059]/10 flex items-center justify-center">
                                                        <div className="w-32 h-32 rounded-full border-[1px] border-[#c5a059]/5" />
                                                    </div>
                                                </div>

                                                <div className="relative z-10 flex flex-col h-full justify-between">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col gap-0">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full border-2 border-[#c5a059] flex items-center justify-center p-0.5">
                                                                    <div className="w-full h-full bg-[#c5a059] rounded-full flex items-center justify-center">
                                                                        <CheckCircle2 size={10} className="text-[#0f1113]" strokeWidth={4} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-black tracking-[0.1em] text-[#c5a059] uppercase leading-none">Open Score</span>
                                                                    <span className="text-[5px] font-bold text-[#c5a059]/60 uppercase tracking-widest mt-0.5">Smart Credit For Daily Needs</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className="text-[6px] font-black text-[#c5a059]/80 uppercase tracking-[0.2em]">Premium Metal Card</span>
                                                            <div className="h-[1px] w-12 bg-gradient-to-l from-[#c5a059]/40 to-transparent mt-0.5" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-1">
                                                        {/* Gold Chip */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-7 bg-gradient-to-br from-[#e6c07b] via-[#c5a059] to-[#8e6e36] rounded-md shadow-inner relative overflow-hidden border border-[#8e6e36]/30">
                                                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                                                                    {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-black/20" />)}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-[2px]">
                                                                <div className="w-[1px] h-3 bg-[#c5a059]/40" />
                                                                <div className="w-[1px] h-3 bg-[#c5a059]/30" />
                                                                <div className="w-[1px] h-3 bg-[#c5a059]/20" />
                                                            </div>
                                                        </div>

                                                        {/* Action Toggles */}
                                                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => setIsVaultDepositOpen(true)}
                                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"
                                                            >
                                                                <ArrowDownToLine size={10} className="text-[#c5a059]" />
                                                            </button>
                                                            <button
                                                                onClick={() => setIsVaultWithdrawOpen(true)}
                                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"
                                                            >
                                                                <ArrowUpFromLine size={10} className="text-[#c5a059]" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Card Number */}
                                                    <div className="py-1 flex items-center justify-start gap-4 group/number" onClick={(e) => e.stopPropagation()}>
                                                        <p className="font-mono text-base tracking-[0.15em] text-[#fef9f3] drop-shadow-sm font-medium">
                                                            {showVaultCardNumber
                                                                ? vaultData.vault.card_number?.replace(/(.{4})/g, '$1 ').trim()
                                                                : '••••  ••••  ••••  ' + vaultData.vault.card_number?.slice(-4)}
                                                        </p>
                                                        <button
                                                            onClick={() => setShowVaultCardNumber(!showVaultCardNumber)}
                                                            className="p-1 hover:bg-white/10 rounded-md transition-all opacity-0 group-hover/number:opacity-100"
                                                        >
                                                            <Eye size={12} className={showVaultCardNumber ? 'text-amber-400' : 'text-[#c5a059]/50'} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-end justify-between pt-1">
                                                        <div className="space-y-1">
                                                            <div className="flex flex-col">
                                                                <span className="text-[5px] font-bold uppercase tracking-widest text-[#c5a059]/60">Valid Thru</span>
                                                                <span className="text-[10px] font-mono text-[#fef9f3] mt-0.5">
                                                                    {showVaultExpiry ? (vaultData.vault.expiry_date || '12/29') : '••/••'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.05em] text-[#fef9f3]/90">
                                                                    {userData?.name || 'Rahul Kumar'}
                                                                </span>
                                                                <span className="text-[6px] font-black text-[#c5a059] uppercase tracking-[0.1em] mt-0.5">0% Interest Credit</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <span className="text-[5px] font-bold uppercase tracking-widest text-[#c5a059]/60 block mb-0.5">Powered By</span>
                                                            <span className="text-[8px] font-black tracking-[0.1em] text-[#fef9f3] uppercase">Open Score</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE — Security & Info */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180">
                                            <div className="bg-[#0f1113] rounded-xl text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col group">
                                                {/* Black Magnetic Strip */}
                                                <div className="w-full h-8 bg-[#000] mt-4 shadow-inner" />

                                                <div className="px-5 py-4 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="space-y-1">
                                                            <div className="w-16 h-4 bg-white/5 rounded-sm border border-white/5 flex items-center justify-center">
                                                                <span className="text-[5px] font-black text-white/30 uppercase tracking-widest italic">Authorized Signature</span>
                                                            </div>
                                                            <div className="w-24 h-6 bg-white/10 rounded flex items-center justify-end px-2 border border-white/10">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[4px] font-bold text-[#c5a059] uppercase leading-none mb-0.5">CVV / Secure</span>
                                                                    <span className="text-[10px] font-mono text-[#f9e37a] tracking-widest">
                                                                        {showVaultCvc ? (vaultData.vault.cvc || '•••') : '•••'}
                                                                    </span>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); setShowVaultCvc(!showVaultCvc); }} className="ml-2 p-1 hover:bg-white/10 rounded transition-colors">
                                                                    <Eye size={8} className={showVaultCvc ? 'text-amber-400' : 'text-white/30'} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[7px] font-black tracking-[0.2em] text-[#c5a059] uppercase leading-none">Vault Matrix</span>
                                                            <div className="flex items-center gap-1 opacity-20 justify-end mt-1">
                                                                <Lock size={8} />
                                                                <span className="text-[5px] font-black uppercase tracking-widest">Encrypted</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Minimal Rates List */}
                                                    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-wrap gap-1.5 py-1" onClick={(e) => e.stopPropagation()}>
                                                        {vaultData.rates?.slice(0, 4).map((r: any) => (
                                                            <div key={r.id} className="bg-white/[0.03] border border-white/[0.04] px-2 py-1.5 rounded-md flex flex-col hover:bg-white/[0.07] transition-all min-w-[60px]">
                                                                <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">{r.tenure_days} Days</span>
                                                                <span className="text-[10px] font-black text-[#c5a059] leading-none">{r.interest_rate}%</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-1 flex items-center justify-between border-t border-white/[0.03] pt-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[5px] font-serif italic text-white/10 uppercase tracking-widest">Secured by Open Score protocol</span>
                                                            <span className="text-[4px] font-bold text-white/5 uppercase mt-0.5">This card remains the property of the issuer.</span>
                                                        </div>
                                                        <div className="flex gap-[1px] h-2 items-end opacity-10">
                                                            {[1, 3, 1, 5, 2, 4, 1, 6].map((w, i) => (
                                                                <div key={i} className="bg-white" style={{ width: `${w}px`, height: '100%' }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                <div className="flex items-center justify-between gap-2">
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
                                    {isMerchant && vaultData?.vault && (
                                        <button
                                            onClick={() => {
                                                const hasActiveSettlement = vaultData?.deposits?.some((d: any) => parseFloat(d.interest_rate) === 0);
                                                if (hasActiveSettlement) {
                                                    toast.error("Settlement tenure is locked. You cannot change it while a tenure is active.");
                                                    return;
                                                }
                                                setIsSettlementTenureOpen(true);
                                            }}
                                            className={`p-1.5 text-white hover:bg-white/10 rounded-xl transition-all active:scale-90 flex items-center justify-center border border-white/5 shadow-inner ${vaultData?.deposits?.some((d: any) => parseFloat(d.interest_rate) === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={vaultData?.deposits?.some((d: any) => parseFloat(d.interest_rate) === 0) ? "Tenure Locked" : "Set Settlement Tenure"}
                                        >
                                            <ArrowRightLeft size={16} strokeWidth={3} />
                                        </button>
                                    )}
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
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5" />
                                Settlement Bank Account
                            </h3>

                            <div className="space-y-4">
                                {/* Bank Name Suggestion */}
                                <div className="relative">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowBankSuggestions(false), 200)}
                                        onFocus={() => bankSuggestions.length > 0 && setShowBankSuggestions(true)}
                                        placeholder="Search or Enter Bank"
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all"
                                    />
                                    {showBankSuggestions && (
                                        <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {bankSuggestions.map((name, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setBankName(name);
                                                        setShowBankSuggestions(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={ifscCode}
                                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                            onBlur={() => setTimeout(() => setShowIfscSuggestions(false), 200)}
                                            onFocus={() => ifscSuggestions.length > 0 && setShowIfscSuggestions(true)}
                                            placeholder="SBIN00XXXXX"
                                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all font-mono"
                                        />
                                        {showIfscSuggestions && (
                                            <div className="absolute z-[60] w-[200%] mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                {ifscSuggestions.map((bank, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setBankName(bank.bank_name);
                                                            setIfscCode(bank.ifsc);
                                                            setSelectedBank(bank);
                                                            setShowIfscSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50"
                                                    >
                                                        <div className="text-[10px] font-black text-indigo-600">{bank.ifsc}</div>
                                                        <div className="text-[9px] font-bold text-slate-800">{bank.bank_name}</div>
                                                        <div className="text-[8px] text-slate-400 truncate">{bank.branch_name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Holder Name</label>
                                        <input
                                            type="text"
                                            value={accountHolderName}
                                            onChange={(e) => setAccountHolderName(e.target.value)}
                                            placeholder="A/C Holder Name"
                                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Account Number</label>
                                        <input
                                            type="password"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Enter A/C Number"
                                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Confirm Number</label>
                                        <input
                                            type="text"
                                            value={confirmAccountNumber}
                                            onChange={(e) => setConfirmAccountNumber(e.target.value)}
                                            placeholder="Confirm A/C Number"
                                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 placeholder:text-slate-200 outline-none transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {selectedBank && (
                                <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-indigo-600">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Bank Details Found</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 leading-tight">
                                        {selectedBank.branch_name} • {selectedBank.city}, {selectedBank.state}
                                    </p>
                                </div>
                            )}

                            <p className="mt-4 flex items-start gap-2 text-[10px] font-bold text-indigo-700/80 leading-relaxed italic">
                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                                Settlements are processed instantly to verified bank accounts.
                            </p>
                        </div>

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

                {/* Vault Logs (Settlements) Section */}
                {vaultData?.vault && (
                    <div className="mt-10 animate-in slide-in-from-bottom duration-700">
                        <div className="flex items-center justify-between px-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                    <ReceiptIndianRupee size={16} strokeWidth={3} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Settlement Logs</h3>
                            </div>
                            <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase shadow-sm">
                                Settlement Tracker
                            </div>
                        </div>

                        <div className="space-y-3">
                            {vaultLogsLoading ? (
                                [1, 2].map(i => <div key={i} className="h-20 bg-white border border-slate-50 rounded-3xl animate-pulse"></div>)
                            ) : vaultLogs.length > 0 ? (
                                vaultLogs.map((log: any) => {
                                    const isUpcoming = log.status === 'ACTIVE';
                                    const isDone = log.status === 'MATURED' || log.status === 'WITHDRAWN';

                                    return (
                                        <div
                                            key={log.id}
                                            className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all hover:border-slate-300 ${isUpcoming ? 'border-amber-100' : 'border-slate-100'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isUpcoming ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {isUpcoming ? <Clock size={20} strokeWidth={3} /> : <CheckCircle2 size={20} strokeWidth={3} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">
                                                        {parseFloat(log.amount).toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {isUpcoming ? 'Expected ' : 'Settled '}
                                                        {new Date(log.cycle_start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                        {' • ' + log.tenure_days + 'D Settlement'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${isUpcoming ? 'bg-amber-100 text-amber-700' :
                                                        log.status === 'MATURED' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {isUpcoming ? 'Upcoming' : log.status === 'MATURED' ? 'Settled' : log.status}
                                                </span>
                                                <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                                                    #{log.id}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">No Vault Logs</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Your settlement timeline will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                                            w.status === 'WAITING' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {w.status}
                                    </span>
                                    {w.status === 'WAITING' && (
                                        <div className="mt-2 text-left bg-blue-50/50 p-2 rounded-xl border border-blue-100/50 max-w-[200px]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Clock className="w-2.5 h-2.5 text-blue-500" />
                                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">On Hold</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-blue-700 leading-tight">
                                                {w.admin_note || "Bank server is experiencing a delay. Funds will be sent within hours."}
                                            </p>
                                        </div>
                                    )}
                                    {w.status !== 'WAITING' && w.admin_note && (
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
                </>
            )}
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
                        <p className="text-slate-400 font-bold text-[10px] leading-relaxed uppercase tracking-widest mb-6">
                            {showWithin24hMessage
                                ? 'Your profile has been verified successfully. Your payout will be activated within 24 hours.'
                                : 'Your merchant profile is under review. Field verification is required to enable bank settlements.'}
                        </p>

                        {!showWithin24hMessage && (
                            <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-left animate-in slide-in-from-top-2 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <Info className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                                        Tip: Collect at least ₹1,000 in your wallet to automatically trigger account verification within 7 to 15 days.
                                    </p>
                                </div>
                            </div>
                        )}

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

                            <div className="px-1 py-2 bg-white/50 rounded-xl border border-slate-100/50 space-y-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Landmark size={10} className="text-slate-400" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Details</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{bankName}</span>
                                    <span className="text-[10px] font-mono text-slate-500 tracking-tighter">
                                        {'*'.repeat(Math.max(0, accountNumber.length - 4)) + accountNumber.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-medium text-slate-400 truncate max-w-[150px]">{accountHolderName}</span>
                                    <span className="text-[8px] font-black text-indigo-400 font-mono">{ifscCode}</span>
                                </div>
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
                                {withdrawalRule?.late_withdrawal_message || 'Confirm'}
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

            {/* Settlement Tenure Modal */}
            {isSettlementTenureOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-[300px] rounded-[1.5rem] p-5 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Settlement Timer</h3>
                            <button onClick={() => setIsSettlementTenureOpen(false)} className="p-1 hover:bg-slate-50 rounded-full"><XCircle className="w-4 h-4 text-slate-300" /></button>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Settlement Delay</p>
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 leading-tight">
                                You can get a higher increment after choose settlement duration.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Select Setllement</label>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    { days: 3, label: 'T3', range: '60 - 120' },
                                    { days: 7, label: 'T7', range: '140 - 280' },
                                    { days: 10, label: 'T10', range: '200 - 400' },
                                    { days: 15, label: 'T15', range: '300 - 600' },
                                    { days: 30, label: 'T30', range: '600 - 1200' },
                                ].map((t) => (
                                    <button
                                        key={t.days}
                                        onClick={() => setSettlementTenureDays(t.days)}
                                        className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${settlementTenureDays === t.days
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-100 hover:border-slate-200 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${settlementTenureDays === t.days ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {t.label}
                                            </div>
                                            <span className="text-[11px] font-black text-slate-900">{t.days} Days</span>
                                        </div>
                                        <div className="flex flex-col items-end justify-center">
                                            <span className="text-[10px] font-black text-emerald-600 leading-none">{t.range}</span>
                                            <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">per 1000</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSettlementTenure}
                            disabled={isVaultSubmitting || !settlementTenureDays || settlementTenureDays < 1}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
                        >
                            {isVaultSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Activate'}
                        </button>
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
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${vaultDepositTenure === r.tenure_days
                                                    ? 'border-slate-900 bg-slate-50 shadow-sm'
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
        </div>
    );
}
