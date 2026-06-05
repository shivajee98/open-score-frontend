"use client";

import PinModal from "@/components/PinModal";
import { toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/useApi";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Subcomponents
import AddMoneyModal from "./_components/AddMoneyModal";
import AmountInputSection from "./_components/AmountInputSection";
import BalanceCards from "./_components/BalanceCards";
import BankAccountForm from "./_components/BankAccountForm";
import GrowthPlanModal from "./_components/GrowthPlanModal";
import Header from "./_components/Header";
import {
    ConfirmWithdrawalModal,
    LateWithdrawalErrorModal,
    RuleErrorModal,
    SettlementWalletModal,
    TransferRewardsModal,
    VerificationModal
} from "./_components/PayoutModals";
import PayoutRestricted from "./_components/PayoutRestricted";
import PayoutSkeleton from "./_components/PayoutSkeleton";
import ProcessingView from "./_components/ProcessingView";
import SettlementLogs from "./_components/SettlementLogs";
import SuccessView from "./_components/SuccessView";
import TransferStatusBanner from "./_components/TransferStatusBanner";
import VaultSection from "./_components/VaultSection";
import WithdrawalHistory from "./_components/WithdrawalHistory";

const DEFAULT_PLANS = [
  {
    id: "starter",
    title: "Starter Plan",
    min_amount: 2000,
    max_amount: 4000,
    tenure_days: 30,
    rate_percent: 1.0,
    rate_frequency: "DAILY",
    penalty_daily_charge: 20,
    penalty_cancellation_fee: 300,
    collapse_increment_on_penalty: true,
    sort_order: 1,
  },
  {
    id: "growth",
    title: "Growth Plan",
    min_amount: 5000,
    max_amount: 10000,
    tenure_days: 90,
    rate_percent: 1.5,
    rate_frequency: "DAILY",
    penalty_daily_charge: 20,
    penalty_cancellation_fee: 600,
    collapse_increment_on_penalty: true,
    sort_order: 2,
  },
  {
    id: "premium",
    title: "Premium Plan",
    min_amount: 20000,
    max_amount: 40000,
    tenure_days: 180,
    rate_percent: 3.0,
    rate_frequency: "DAILY",
    penalty_daily_charge: 20,
    penalty_cancellation_fee: 900,
    collapse_increment_on_penalty: true,
    sort_order: 3,
  },
  {
    id: "gold",
    title: "Gold Plan",
    min_amount: 20000,
    max_amount: 50000,
    tenure_days: 365,
    rate_percent: 5.0,
    rate_frequency: "DAILY",
    penalty_daily_charge: 20,
    penalty_cancellation_fee: 1500,
    collapse_increment_on_penalty: true,
    sort_order: 4,
  },
  {
    id: "elite",
    title: "Elite Plan",
    min_amount: 20000,
    max_amount: 100000,
    tenure_days: 730,
    rate_percent: 1.4,
    rate_frequency: "DAILY",
    penalty_daily_charge: 500,
    penalty_cancellation_fee: 3000,
    collapse_increment_on_penalty: true,
    sort_order: 5,
  },
];

export default function PayoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthProtection();

  // Data Fetching
  const {
    data: userData,
    isLoading: userLoading,
  } = useApi("/auth/me");
  const {
    data: walletData,
    isLoading: walletLoading,
    mutate: mutateWallet,
  } = useApi("/wallet/balance");
  const {
    data: rulesData,
    isLoading: rulesLoading,
    mutate: mutateRules,
  } = useApi("/wallet/withdrawal-rule");
  const { data: vaultRuleData, mutate: mutateVaultRule } = useApi(
    "/vault/withdrawal-rule",
  );

  // Vault Data
  const [vaultData, setVaultData] = useState<any>(null);
  const [vaultLoading, setVaultLoading] = useState(true);
  const fetchVault = async () => {
    try {
      const data = await apiFetch("/vault/me");
      setVaultData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setVaultLoading(false);
    }
  };
  useEffect(() => {
    fetchVault();
  }, []);

  // Vault Logs (Settlements)
  const [vaultLogs, setVaultLogs] = useState<any[]>([]);
  const [vaultLogsLoading, setVaultLogsLoading] = useState(true);
  const fetchVaultLogs = async () => {
    try {
      const data = await apiFetch("/vault/logs");
      setVaultLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setVaultLogsLoading(false);
    }
  };
  useEffect(() => {
    fetchVaultLogs();
  }, []);

  // Pagination for withdrawals
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [wPage, setWPage] = useState(1);
  const [hasMoreW, setHasMoreW] = useState(true);
  const [fetchingMoreW, setFetchingMoreW] = useState(false);
  const [initialLoadingW, setInitialLoadingW] = useState(true);

  const withdrawalsObserver = useRef<IntersectionObserver | null>(null);
  const lastWithdrawalRef = useCallback(
    (node: any) => {
      if (fetchingMoreW || initialLoadingW) return;
      if (withdrawalsObserver.current) withdrawalsObserver.current.disconnect();

      withdrawalsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreW) {
          setWPage((prev) => prev + 1);
        }
      });

      if (node) withdrawalsObserver.current.observe(node);
    },
    [fetchingMoreW, initialLoadingW, hasMoreW],
  );

  const fetchWithdrawals = async (page: number) => {
    if (page === 1) setInitialLoadingW(true);
    else setFetchingMoreW(true);

    try {
      const data = await apiFetch(`/wallet/withdrawals?page=${page}`);
      const newW = data.data || [];

      if (page === 1) {
        setWithdrawals(newW);
      } else {
        setWithdrawals((prev) => [...prev, ...newW]);
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

  // UI States
  const [amount, setAmount] = useState("");
  const [transferAmountValue, setTransferAmountValue] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSourceSelectionModalOpen, setIsSourceSelectionModalOpen] =
    useState(false);

  const [transferStatus, setTransferStatus] = useState<any>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [showWithdrawalLimits, setShowWithdrawalLimits] = useState(false);
  const [ruleError, setRuleError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [lateWithdrawalError, setLateWithdrawalError] = useState<string | null>(
    null,
  );

  // Vault & Settlement modals
  const [isSettlementTenureOpen, setIsSettlementTenureOpen] = useState(false);
  const [isSettlementWalletOpen, setIsSettlementWalletOpen] = useState(false);
  const [isVaultWithdrawOpen, setIsVaultWithdrawOpen] = useState(false);
  const [vaultWithdrawAmount, setVaultWithdrawAmount] = useState("");
  const [isVaultFlipped, setIsVaultFlipped] = useState(false);
  const [isVaultMaximized, setIsVaultMaximized] = useState(false);
  const [showVaultCardNumber, setShowVaultCardNumber] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [isVaultSubmitting, setIsVaultSubmitting] = useState(false);
  const [showVaultCvc, setShowVaultCvc] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "flipflops@upi";

  // Bank Details State
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankSuggestions, setBankSuggestions] = useState<string[]>([]);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);
  const [ifscSuggestions, setIfscSuggestions] = useState<any[]>([]);
  const [showIfscSuggestions, setShowIfscSuggestions] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);

  const activeDeposit = vaultData?.deposits?.find(
    (d: any) => d.status === "ACTIVE",
  );

  // Initialize bank details if user already has them
  useEffect(() => {
    if (userData) {
      setBankName(userData.bank_name || "");
      setAccountNumber(userData.account_number || "");
      setConfirmAccountNumber(userData.account_number || "");
      setIfscCode(userData.ifsc_code || "");
      setAccountHolderName(userData.account_holder_name || userData.name || "");
    }
  }, [userData]);

  // Suggestions search logic
  const fetchSuggestions = async (search: string, type: "bank" | "ifsc") => {
    try {
      const data = await apiFetch(
        `/wallet/banks?search=${search}&type=${type}`,
      );
      if (type === "bank") {
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
        fetchSuggestions(bankName, "bank");
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
        fetchSuggestions(ifscCode, "ifsc");
      } else {
        setIfscSuggestions([]);
        setShowIfscSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ifscCode, userData?.ifsc_code]);

  const handleSettlementWallet = async (tenure: number) => {
    setIsVaultSubmitting(true);
    try {
      await apiFetch("/vault/deposit", {
        method: "POST",
        body: JSON.stringify({ tenure_days: tenure }),
      });
      toast.success(
        `Settlement plan set to ${tenure} days. Funds transferred to Vault.`,
      );
      setIsSettlementWalletOpen(false);
      mutateWallet();
      fetchVault();
      fetchVaultLogs();
    } catch (e: any) {
      toast.error(e.message || "Failed to set settlement plan");
    } finally {
      setIsVaultSubmitting(false);
    }
  };

  const handleGrowthPlanSubmit = async (
    planDetails: any,
    amt: number,
    paymentMethod: "WALLET" | "UPI",
    proofScreenshot: File | null
  ) => {
    setIsVaultSubmitting(true);
    try {
      if (paymentMethod === "WALLET") {
        await apiFetch("/vault/deposit", {
          method: "POST",
          body: JSON.stringify({
            tenure_days: planDetails.tenure_days,
            amount: amt,
            pay_from_wallet: true,
            growth_plan_id: planDetails.id,
          }),
        });
        toast.success(
          `Success! ${planDetails.title} activated with ${amt.toLocaleString("en-IN")}`,
        );
        setIsSettlementTenureOpen(false);
        mutateWallet();
        fetchVault();
        fetchVaultLogs();
      } else {
        if (!proofScreenshot) {
          toast.error("Please upload your payment screenshot proof.");
          setIsVaultSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("amount", amt.toString());
        formData.append("payment_mode", "UPI");
        formData.append("proof_image", proofScreenshot);
        formData.append("growth_plan_id", planDetails.id.toString());

        await apiFetch("/vault/add-money", {
          method: "POST",
          body: formData,
        });

        toast.success(
          "Payment proof submitted successfully! Verification usually takes less than 30 mins.",
        );
        setIsSettlementTenureOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit plan");
    } finally {
      setIsVaultSubmitting(false);
    }
  };

  const handleVaultWithdrawToWallet = async () => {
    const amtStr = window.prompt(
      `Enter amount to withdraw from Vault to Wallet (Max: ${vaultData?.vault?.balance || 0}):`,
    );
    if (!amtStr) return;

    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amt > (vaultData?.vault?.balance || 0)) {
      toast.error("Insufficient vault balance");
      return;
    }

    // Enforce spend lock requirement from active loan
    if (
      vaultRuleData?.unlock_status &&
      !vaultRuleData.unlock_status.is_unlocked
    ) {
      toast.error("Withdrawal locked: active loan spend requirements not met.");
      return;
    }

    // Enforce minimum limit
    if (vaultRuleData?.min_withdrawal && amt < vaultRuleData.min_withdrawal) {
      toast.error(
        `Minimum withdrawal amount is ${Number(vaultRuleData.min_withdrawal).toLocaleString("en-IN")}`,
      );
      return;
    }

    // Enforce maximum limit
    if (vaultRuleData?.max_withdrawal && amt > vaultRuleData.max_withdrawal) {
      toast.error(
        `Maximum withdrawal amount is ${Number(vaultRuleData.max_withdrawal).toLocaleString("en-IN")}`,
      );
      return;
    }

    // Enforce daily transaction count limit
    if (
      vaultRuleData?.daily_txn_limit &&
      vaultRuleData.today_txns_count >= vaultRuleData.daily_txn_limit
    ) {
      toast.error(
        `Daily transaction limit reached (${vaultRuleData.daily_txn_limit} allowed)`,
      );
      return;
    }

    // Enforce daily amount limit
    if (vaultRuleData?.daily_limit) {
      const remaining = Math.max(
        0,
        vaultRuleData.daily_limit - vaultRuleData.today_withdrawals,
      );
      if (amt > remaining) {
        toast.error(
          `Daily limit exceeded. Remaining limit today: ${remaining.toLocaleString("en-IN")}`,
        );
        return;
      }
    }

    setIsProcessing(true);
    try {
      await apiFetch("/vault/withdraw-to-wallet", {
        method: "POST",
        body: JSON.stringify({ amount: amt }),
      });
      toast.success(`Successfully withdrawn ${amt} to Wallet`);
      mutateWallet();
      fetchVault();
      fetchVaultLogs();
      if (mutateVaultRule) {
        mutateVaultRule();
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Vault withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("last_merchant_verification_request");
      if (stored) setLastRequestTime(parseInt(stored));
    }
  }, []);

  const canRequestVerification =
    !lastRequestTime || Date.now() - lastRequestTime > 24 * 60 * 60 * 1000;

  // Derived State
  const user = userData
    ? { ...userData, daily_earnings: walletData?.daily_earnings }
    : null;
  const balance = walletData?.balance || 0;
  const cashbackBalance = walletData?.cashback_balance || 0;

  // Dynamic Restrictions from Backend Rules
  const withdrawalRule = rulesData || null;
  const monthlyFreeCount = withdrawalRule?.monthly_free_count || 0;
  const usedThisMonth = withdrawalRule?.this_month_withdrawal_count || 0;

  const isLoading =
    userLoading ||
    walletLoading ||
    rulesLoading;

  // Merchant Verification Logic
  const isMerchant = user?.role === "MERCHANT";

  // Verification timeframe logic (24h timer)
  const verificationTime = Math.max(
    user?.field_verified_at ? new Date(user.field_verified_at).getTime() : 0,
    user?.admin_verified_at ? new Date(user.admin_verified_at).getTime() : 0,
  );
  const isVerifiedAtLeastOnce = verificationTime > 0;
  const is24hWaitPassed =
    isVerifiedAtLeastOnce &&
    (user?.kyc_status === "FULL_VERIFIED" ||
      !!user?.admin_verified_at ||
      Date.now() - verificationTime > 24 * 60 * 60 * 1000);

  // Truly verified means QR mapped, status is FULL_VERIFIED AND 24h passed
  const isMerchantVerified =
    isMerchant &&
    user?.is_qr_mapped &&
    user?.kyc_status === "FULL_VERIFIED" &&
    is24hWaitPassed;

  const handleRequestVerification = () => {
    if (!canRequestVerification) return;

    const now = Date.now();
    localStorage.setItem("last_merchant_verification_request", now.toString());
    setLastRequestTime(now);

    const ticketData = encodeURIComponent(
      JSON.stringify({
        prefill: true,
        autoSubmit: true,
        subject: `Merchant Payout Activation - Business Verification Request`,
        message: `Hi, I am a merchant (${user?.name}, Mobile: ${user?.mobile_number}). My QR mapping and KYC verification are pending. Please verify my business (${user?.business_name || "N/A"}) so I can start withdrawing funds to my bank account. Thank you.`,
        category: "merchant_verification",
      }),
    );
    router.push(`/customer/support?ticket=${ticketData}`);
  };

  const handlePayout = async () => {
    const payoutAmount = parseFloat(amount);
    if (!payoutAmount || payoutAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    proceedWithWalletPayout();
  };

  const proceedWithWalletPayout = () => {
    const payoutAmount = parseFloat(amount);
    if (payoutAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    // Check for charge applicability and show confirmation modal
    const isInPaidRange =
      payoutAmount >= (withdrawalRule?.min_charge_amount || 0) &&
      payoutAmount <= (withdrawalRule?.max_charge_amount || 0);

    const hasCharge = withdrawalRule?.is_charge_enabled && isInPaidRange;

    if (hasCharge || payoutAmount >= 500) {
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

    executeWithdrawal();
  };

  const executeWithdrawal = async () => {
    const payoutAmount = parseFloat(amount);
    setShowWithdrawalLimits(true);

    if (payoutAmount < (withdrawalRule.min_charge_amount || 0)) {
      toast.error(
        `Min settlement: ${(withdrawalRule.min_charge_amount || 0).toLocaleString()}`,
      );
      return;
    }

    if (
      withdrawalRule.max_withdrawal &&
      payoutAmount > withdrawalRule.max_withdrawal
    ) {
      toast.error(`Max: ${withdrawalRule.max_withdrawal.toLocaleString()}`);
      return;
    }

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      toast.error("Please fill all bank details");
      return;
    }

    setIsProcessing(true);
    setIsSubmitting(true);

    try {
      // Simulated delay for animation
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (withdrawalRule?.late_withdrawal_message) {
        setIsProcessing(false);
        setIsSubmitting(false);
        setLateWithdrawalError(withdrawalRule.late_withdrawal_message);
        return;
      }

      await apiFetch("/wallet/withdrawal-request", {
        method: "POST",
        body: JSON.stringify({
          amount: payoutAmount,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          account_holder_name: accountHolderName,
          account_number_confirmation: confirmAccountNumber,
        }),
      });

      await Promise.all([mutateWallet(), mutateWithdrawals(), mutateRules()]);
      setIsSuccess(true);
      toast.success("Cred-out request submitted!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An unexpected error occurred");
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
      toast.error(
        `Earn ${remaining.toLocaleString()} more to transfer to wallet.`,
      );
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
      await apiFetch("/wallet/cashback-to-wallet", {
        method: "POST",
        body: JSON.stringify({
          pin,
          amount: parseFloat(transferAmountValue),
        }),
      });
      toast.success("Rewards transferred successfully!");
      setIsPinModalOpen(false);
      setTransferAmountValue("");
      mutateWallet();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to transfer rewards");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMoneySubmit = async (
    amt: number,
    source: "WALLET" | "UPI",
    proof: File | null
  ) => {
    setIsAddingMoney(true);
    try {
      const formData = new FormData();
      formData.append("amount", amt.toString());
      formData.append("payment_mode", source);
      if (source === "UPI" && proof) {
        formData.append("proof_image", proof);
      }

      const res = await apiFetch("/vault/add-money", {
        method: "POST",
        body: formData,
      });

      if (res.vault)
        setVaultData((prev: any) => ({ ...prev, vault: res.vault }));
      toast.success(res.message || "Request submitted successfully!");
      setIsAddMoneyModalOpen(false);
      fetchVault();
      mutateWallet();
    } catch (error: any) {
      toast.error(error.message || "Failed to add money");
    } finally {
      setIsAddingMoney(false);
    }
  };

  const transferEnabled = user?.transfer_enabled;

  // Fetch transfer status for merchants
  useEffect(() => {
    if (isMerchant && transferEnabled) {
      apiFetch("/merchant/bank-transfers/status")
        .then(setTransferStatus)
        .catch(() => {});
    }
  }, [isMerchant, transferEnabled]);

  if (isLoading) {
    return <PayoutSkeleton />;
  }

  if (!isAuthenticated || !user) return null;

  // Processing UI
  if (isProcessing) {
    return <ProcessingView isMerchant={isMerchant} />;
  }

  // Success UI
  if (isSuccess) {
    return (
      <SuccessView
        amount={amount}
        onBack={() => {
          setIsSuccess(false);
          setAmount("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-safe mb-18 flex justify-center">
      <div className="w-full max-w-md p-4">
        {/* Header */}
        <Header
          isMerchantVerified={isMerchantVerified}
          onBackClick={() => router.push("/customer")}
        />

        {user?.has_pending_kyc_reupload ? (
          <PayoutRestricted onCompleteReupload={() => router.push("/customer/loan")} />
        ) : (
          <>
            {/* Main Column Stack */}
            <div className="flex flex-col gap-4">
              {/* Vault Card section */}
              {vaultData?.vault && (
                <VaultSection
                  vaultData={{
                    vault: vaultData.vault,
                    rates: vaultData.growth_plans && vaultData.growth_plans.length > 0 ? vaultData.growth_plans : DEFAULT_PLANS
                  }}
                  userData={userData}
                  activeDeposit={activeDeposit}
                  isVaultFlipped={isVaultFlipped}
                  setIsVaultFlipped={setIsVaultFlipped}
                  isVaultMaximized={isVaultMaximized}
                  setIsVaultMaximized={setIsVaultMaximized}
                  showVaultCardNumber={showVaultCardNumber}
                  setShowVaultCardNumber={setShowVaultCardNumber}
                  showVaultCvc={showVaultCvc}
                  setShowVaultCvc={setShowVaultCvc}
                  onAddMoneyClick={() => setIsAddMoneyModalOpen(true)}
                  onWithdrawClick={handleVaultWithdrawToWallet}
                  onSettlementTenureClick={() => setIsSettlementTenureOpen(true)}
                />
              )}

              {/* Balance Cards (Wallet and Cashback) */}
              <BalanceCards
                isMerchant={isMerchant}
                balance={balance}
                cashbackBalance={cashbackBalance}
                onAddAmount={(val) => setAmount(val)}
                onSettlementClick={() => setIsSettlementWalletOpen(true)}
                onTransferClick={handleTransferToWallet}
                isSubmitting={isSubmitting}
              />

              {/* Amount input & limits section */}
              <AmountInputSection
                amount={amount}
                setAmount={setAmount}
                onPayoutSubmit={handlePayout}
                isSubmitting={isSubmitting}
                withdrawalRule={withdrawalRule}
              />

              {/* Bank Account Form */}
              <BankAccountForm
                isVerified={!!userData?.account_number}
                bankName={bankName}
                setBankName={setBankName}
                ifscCode={ifscCode}
                setIfscCode={setIfscCode}
                accountHolderName={accountHolderName}
                setAccountHolderName={setAccountHolderName}
                accountNumber={accountNumber}
                setAccountNumber={setAccountNumber}
                confirmAccountNumber={confirmAccountNumber}
                setConfirmAccountNumber={setConfirmAccountNumber}
                bankSuggestions={bankSuggestions}
                showBankSuggestions={showBankSuggestions}
                setShowBankSuggestions={setShowBankSuggestions}
                ifscSuggestions={ifscSuggestions}
                showIfscSuggestions={showIfscSuggestions}
                setShowIfscSuggestions={setShowIfscSuggestions}
                isSubmitting={isSubmitting}
                amount={amount}
                balance={balance}
                isMerchant={isMerchant}
                withdrawalRule={withdrawalRule}
                onPayoutSubmit={handlePayout}
              />

              {/* Standard quota error status display */}
              {withdrawalRule?.is_charge_enabled &&
                monthlyFreeCount > 0 &&
                usedThisMonth >= monthlyFreeCount && (
                  <div className="mb-4 mt-2 px-4 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <span className="text-amber-400 font-bold">!</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                        Standard fees apply
                      </p>
                      <p className="text-[8px] font-bold text-amber-500/60">
                        Free monthly quota ({monthlyFreeCount}) exhausted.
                      </p>
                    </div>
                  </div>
                )}



              {/* Bulk transfer button for merchants */}
              {isMerchant && (
                <button
                  onClick={() => router.push("/customer/transfer")}
                  disabled={!transferEnabled}
                  className={`w-full py-4 mt-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${
                    transferEnabled
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/10"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                  title={
                    !transferEnabled
                      ? "Transfer is not enabled for your account. Contact admin."
                      : "Transfer to bank accounts"
                  }
                >
                  Transfer
                </button>
              )}

              {/* Bulk Transfer status banner */}
              {isMerchant && transferStatus?.has_transfers && (
                <TransferStatusBanner transferStatus={transferStatus} />
              )}
            </div>

            {/* Settlement logs tracker */}
            <SettlementLogs
              vaultLogs={vaultLogs}
              isLoading={vaultLogsLoading}
            />

            {/* Withdrawal logs list tracker */}
            <WithdrawalHistory
              withdrawals={withdrawals}
              lastWithdrawalRef={lastWithdrawalRef}
              isValidating={initialLoadingW || fetchingMoreW}
            />
          </>
        )}

        {/* MODALS SECTION */}

        {/* Rewards Transfer modal popup */}
        <TransferRewardsModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          transferAmountValue={transferAmountValue}
          setTransferAmountValue={setTransferAmountValue}
          cashbackBalance={cashbackBalance}
          isSubmitting={isSubmitting}
          onConfirm={confirmTransferAmount}
        />

        {/* Pin Verification overlay screen */}
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onComplete={handlePinVerification}
          title="Verify Wallet PIN"
        />

        {/* Limits Rule Error modal popup */}
        <RuleErrorModal
          ruleError={ruleError ? ruleError.message : null}
          onClose={() => setRuleError(null)}
          onViewTiers={() => {
            setRuleError(null);
            setShowWithdrawalLimits(true);
          }}
        />

        {/* Fast bank settlement activation verification request modal popup */}
        <VerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          onVerify={() => {
            setIsVerificationModalOpen(false);
            handleRequestVerification();
          }}
        />

        {/* Confirm withdrawal details sheet check popup */}
        <ConfirmWithdrawalModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          amount={amount}
          chargeAmount={(
            (parseFloat(amount) || 0) >= (withdrawalRule?.min_charge_amount || 0) &&
            (parseFloat(amount) || 0) <= (withdrawalRule?.max_charge_amount || 0)
              ? ((parseFloat(amount) || 0) * (withdrawalRule?.charge_percent || 0)) / 100
              : 0
          ).toString()}
          bankName={bankName}
          accountNumber={accountNumber}
          cashbackDeduction={
            userData?.has_withdraw_cashback_deduction && userData?.cashback_percent_deduction
              ? (parseFloat(amount) || 0) * parseFloat(userData.cashback_percent_deduction)
              : 0
          }
          isMerchant={isMerchant}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmWithdrawal}
        />

        {/* Green wallet settlement tenure options slider modal */}
        <SettlementWalletModal
          isOpen={isSettlementWalletOpen}
          onClose={() => setIsSettlementWalletOpen(false)}
          onSelectTier={handleSettlementWallet}
        />

        {/* Late withdrawal warning dialog box */}
        <LateWithdrawalErrorModal
          errorMsg={lateWithdrawalError}
          onClose={() => setLateWithdrawalError(null)}
        />

        {/* Growth Plan Modal */}
        <GrowthPlanModal
          isOpen={isSettlementTenureOpen}
          onClose={() => setIsSettlementTenureOpen(false)}
          rates={vaultData?.growth_plans && vaultData.growth_plans.length > 0 ? vaultData.growth_plans : DEFAULT_PLANS}
          walletBalance={balance}
          isVaultSubmitting={isVaultSubmitting}
          upiId={upiId}
          onSubmit={handleGrowthPlanSubmit}
        />

        {/* Add Money Modal */}
        <AddMoneyModal
          isOpen={isAddMoneyModalOpen}
          onClose={() => setIsAddMoneyModalOpen(false)}
          walletBalance={balance}
          isAddingMoney={isAddingMoney}
          upiId={upiId}
          onSubmit={handleAddMoneySubmit}
        />
      </div>
    </div>
  );
}
