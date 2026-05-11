"use client";

import { toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/useApi";
import { apiFetch, clearAuthState } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "./_components/SplashScreen";

export default function CustomerHome() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    user: cachedUser,
    wallet: cachedWallet,
    loans: cachedLoans,
    setUser,
    setWallet,
    setLoans,
  } = useStore();
  const router = useRouter();

  // Data Fetching with Cache
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    mutate: mutateUser,
    isValidating: userValidating,
  } = useApi("/auth/me");
  const {
    data: walletData,
    isLoading: walletLoading,
    mutate: mutateWallet,
    isValidating: walletValidating,
  } = useApi("/wallet/balance");
  const {
    data: loans,
    isLoading: loansLoading,
    mutate: mutateLoans,
    isValidating: loansValidating,
  } = useApi(
    user?.role === "CUSTOMER" ||
      user?.role === "MERCHANT" ||
      user?.role === "STUDENT"
      ? "/loans"
      : null,
  );
  const { data: vaultSetupData } = useApi("/vault/me");
  const { data: adminMessages, mutate: mutateAdminMessages } = useApi(
    user ? "/admin-messages" : null,
  );
  const { data: cardRequests } = useApi("/vault-cards/my-requests");

  // Sync SWR data to Zustand Store for persistent caching
  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);
  useEffect(() => {
    if (walletData) setWallet(walletData);
  }, [walletData, setWallet]);
  useEffect(() => {
    if (loans) setLoans(Array.isArray(loans) ? loans : loans.data || []);
  }, [loans, setLoans]);

  // Note: Manual 1s polling removed to prevent server resource exhaustion.
  // SWR handles updates via revalidateOnFocus and automatic deduplication.

  const activeUser = user || cachedUser;
  const activeWallet = walletData || cachedWallet;
  const activeLoans =
    (loans ? (Array.isArray(loans) ? loans : loans.data || []) : cachedLoans) ||
    [];

  const isRefreshing = userValidating || walletValidating || loansValidating;

  const [showBalance, setShowBalance] = useState(true);
  const [showAdminMessage, setShowAdminMessage] = useState(false);
  const [showAdminMessageHistory, setShowAdminMessageHistory] = useState(false);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  const allAdminMessages = Array.isArray(adminMessages) ? adminMessages : [];
  const unreadAdminMessages = allAdminMessages.filter((m: any) => !m.is_read);



  useEffect(() => {
    if (unreadAdminMessages.length > 0 && !showAdminMessageHistory) {
      setShowAdminMessage(true);
    }
  }, [unreadAdminMessages.length, showAdminMessageHistory]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiFetch(`/admin-messages/${id}/read`, { method: "PUT" });
      mutateAdminMessages();
      if (unreadAdminMessages.length <= 1) {
        setShowAdminMessage(false);
      } else {
        setCurrentMsgIndex((prev) =>
          Math.max(0, Math.min(prev, unreadAdminMessages.length - 2)),
        );
      }
    } catch (error) {
      toast.error("Failed to acknowledge message");
    }
  };

  useEffect(() => {
    if (unreadAdminMessages.length > 0) {
      setShowAdminMessage(true);
    }
  }, [unreadAdminMessages.length]);
  // Promotional Banner State - Show on load
  const [showPromotionalBanner, setShowPromotionalBanner] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [dynamicText, setDynamicText] = useState(
    "Apply Now & Get 0% Interest Credit",
  );
  const isMerchant = activeUser?.role === "MERCHANT";
  const themeColor = isMerchant ? "emerald" : "blue";

  const baseBanners = [
    {
      title: dynamicText,
      sub: "First Users Only!",
      color: "bg-gradient-to-br from-slate-900 to-blue-900",
      accent: "bg-blue-600",
      amount: "5,00,000",
      label: "Limit Up to",
    },
    {
      title: "Experience Premium",
      sub: "Upgrade your Status",
      color: "bg-gradient-to-br from-blue-950 to-indigo-950",
      accent: "bg-purple-600",
      amount: "Exclusive",
      label: "Benefits",
    },
    {
      title: "Secure Transactions",
      sub: "Bank-Grade Security",
      color: "bg-gradient-to-br from-slate-900 to-slate-950",
      accent: "bg-emerald-600",
      amount: "100% Safe",
      label: "Safety",
    },
  ];

  // Merchant-only promotional cards
  const merchantBanners = isMerchant
    ? [
        {
          title: "Unlimited Transfer",
          sub: "On Zero Cost",
          color:
            "bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900",
          accent: "bg-violet-500",
          amount: "No Hidden Charge",
          label: "Available",
        },
        {
          title: "Wallet UPTO 2 Lakh  Daily",
          sub: "Daily Increment  2 %",
          color: "bg-gradient-to-br from-amber-600 via-orange-700 to-red-800",
          accent: "bg-amber-500",
          amount: "Increament Upto 2% Daily",
          label: "",
        },
      ]
    : [];

  const banners = [...baseBanners, ...merchantBanners];

  // Auto Slide for Banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 12000); // Slower speed for merchants with more cards
    return () => clearInterval(interval);
  }, [banners.length]);

  // Dynamic Text Effect for First Banner
  useEffect(() => {
    const texts = [
      "Apply Now & Get 0% Interest Credit - First Users Only!",
      "First User Advantage: Apply for Credit at 0% Interest",
      "Unlock 0% Interest Credit - First User Offer",
    ];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % texts.length;
      setDynamicText(texts[i]);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Derived State
  const mainBalance = activeWallet?.balance || "0";
  const cashbackBalance = activeWallet?.cashback_balance || "0";
  const balance = mainBalance;

  // Handle both array (legacy) and paginated object (new) responses
  const loansList = activeLoans;
  const lockRelevantLoanStatuses = new Set([
    "PREVIEW",
    "PENDING",
    "APPLIED",
    "PROCEEDED",
    "VETTING",
    "KYC_SENT",
    "FORM_SUBMITTED",
    "KYC_SUBMITTED",
    "APPROVED",
  ]);
  const hasLockRelevantLoan = loansList?.some((l: any) =>
    lockRelevantLoanStatuses.has(l.status),
  );

  // Show lock amount only while there is an active pre-disbursal loan lock
  // (cancelled/rejected flows should not show this badge).
  const lockedBalance = hasLockRelevantLoan
    ? (activeUser?.active_locked_balance || 0) > 0
      ? activeUser.active_locked_balance
      : activeWallet?.locked_balance || "0"
    : 0;

  const kycLoan =
    loansList?.find(
      (l: any) =>
        l.status === "KYC_SENT" ||
        (Array.isArray(l.reupload_fields) && l.reupload_fields.length > 0),
    ) || null;
  const activeLoan = loansList?.find(
    (l: any) => l.status === "DISBURSED" || l.status === "OVERDUE",
  );
  const hasActiveLoan = !!activeLoan;
  const loading = !activeUser && (userLoading || walletLoading);

  const activeVaultRequest = cardRequests?.find(
    (r: any) => !["ACTIVATED", "REJECTED"].includes(r.status),
  );

  // Fetch Cashback Settings
  const { data: cashbackSettings } = useApi("/admin/cashback-settings");
  const merchantBonus =
    cashbackSettings?.find((s: any) => s.role === "MERCHANT" && s.is_active)
      ?.cashback_amount || 250;

  const handleClaimSuccess = async (updatedUser: any) => {
    setShowClaimModal(false);
    // Refresh all data
    await Promise.all([mutateUser(), mutateWallet()]);
  };

  const [showLogoutHint, setShowLogoutHint] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading || !user) {
      timer = setTimeout(() => {
        const reloadCount = parseInt(
          sessionStorage.getItem("dash_reload_count") || "0",
        );
        if (reloadCount < 1) {
          sessionStorage.setItem("dash_reload_count", "1");
          window.location.reload();
        } else {
          setShowLogoutHint(true);
        }
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [loading, user]);

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.removeItem("dash_reload_count");
    }
  }, [user, loading]);

  // Check for Welcome Bonus
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(0);
  const [dismissedVaultPromptKey, setDismissedVaultPromptKey] = useState<
    string | null
  >(null);

  // Vault Card States
  const [isBigVaultOpen, setIsBigVaultOpen] = useState(false);
  const [isVaultFlipped, setIsVaultFlipped] = useState(false);
  const [showVaultCardNumber, setShowVaultCardNumber] = useState(false);
  const [showVaultExpiry, setShowVaultExpiry] = useState(false);
  const [showVaultCvc, setShowVaultCvc] = useState(false);

  // Call Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // New Loan Launch Banner State
  const [showLoanBanner, setShowLoanBanner] = useState(false);

  useEffect(() => {
    const launchTime = new Date("2026-04-20T17:42:00").getTime();
    const now = new Date().getTime();
    const isWithin24Hours = now - launchTime < 24 * 60 * 60 * 1000;
    const isDismissed =
      localStorage.getItem("loan_banner_dismissed_15k") === "true";

    if (isWithin24Hours && !isDismissed) {
      setShowLoanBanner(true);
    }
  }, []);

  const dismissLoanBanner = () => {
    setShowLoanBanner(false);
    localStorage.setItem("loan_banner_dismissed_15k", "true");
  };

  useEffect(() => {
    const checkBonus = async () => {
      if (!user) return;

      // 1. Check LocalStorage/Cookie first to save API calls
      const hasSeenLocal = localStorage.getItem("seen_welcome_bonus");
      if (hasSeenLocal === "true") return;

      // 2. Check Database Flag
      if (user.has_seen_welcome_bonus) {
        localStorage.setItem("seen_welcome_bonus", "true");
        return;
      }

      // Only check for reasonably new users (created within last 24 hours) or just check transactions
      try {
        const res = await apiFetch("/wallet/transactions?limit=5");
        if (res && res.data) {
          const bonusTx = res.data.find(
            (tx: any) =>
              tx.type === "CREDIT" &&
              (tx.description?.toLowerCase().includes("welcome bonus") ||
                tx.description?.toLowerCase().includes("signup bonus")),
          );

          if (bonusTx) {
            setWelcomeBonusAmount(parseFloat(bonusTx.amount));
            setShowWelcomeBonus(true);
          }
        }
      } catch (e) {
        console.error("Failed to check welcome bonus", e);
      }
    };

    if (user && !loading) {
      checkBonus();
    }
  }, [user, loading]);

  const handleCloseWelcomeBonus = async () => {
    setShowWelcomeBonus(false);
    localStorage.setItem("seen_welcome_bonus", "true");
    try {
      await apiFetch("/auth/welcome-bonus-seen", { method: "POST" });
      // Update local user state to reflect change without re-fetch
      if (user) {
        setUser({ ...user, has_seen_welcome_bonus: true });
      }
    } catch (e) {
      console.error("Failed to sync seen status", e);
    }
  };

  const vaultPromptDismissKey = activeUser?.id
    ? `vault_setup_prompt_dismissed_${activeUser.id}`
    : null;
  const isVaultPromptDismissedPersisted =
    typeof window !== "undefined" && vaultPromptDismissKey
      ? localStorage.getItem(vaultPromptDismissKey) === "true"
      : false;
  const isVaultEnabledByAdmin = !!vaultSetupData?.vault;
  const hasVaultUsage =
    Number(vaultSetupData?.vault?.balance || 0) > 0 ||
    (vaultSetupData?.deposits?.length || 0) > 0;
  const showVaultSetupPopup =
    !!activeUser?.id &&
    isVaultEnabledByAdmin &&
    !hasVaultUsage &&
    dismissedVaultPromptKey !== vaultPromptDismissKey &&
    !isVaultPromptDismissedPersisted;

  const dismissVaultSetupPopup = () => {
    if (!vaultPromptDismissKey || typeof window === "undefined") {
      return;
    }
    localStorage.setItem(vaultPromptDismissKey, "true");
    setDismissedVaultPromptKey(vaultPromptDismissKey);
  };

  const handleVaultSetupNow = () => {
    dismissVaultSetupPopup();
    router.push("/customer/payout");
  };

  if (
    activeUser?.status === "SUSPENDED" ||
    (userError as any)?.code === "ACCOUNT_SUSPENDED"
  ) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-10 shadow-2xl shadow-rose-500/10 border border-rose-100/50">
          <ShieldCheck size={48} strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-6 uppercase">
          Access Restricted
        </h1>

        <div className="max-w-md bg-slate-50 border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-10">
          <p className="text-slate-600 font-bold leading-relaxed mb-8 italic">
            "Your account has been suspended following a review of your recent
            onboarding/KYC process."
          </p>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] shadow-sm">
            Please contact our support team to resolve this issue.
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-xs">
          <button
            onClick={() =>
              (window.location.href = "https://wa.me/910000000000")
            }
            className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] py-6 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Contact Support Team
          </button>
          <button
            onClick={async () => {
              await clearAuthState();
              window.location.replace("/");
            }}
            className="w-full bg-white text-slate-400 font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl border border-slate-100 hover:text-rose-500 active:scale-95 transition-all"
          >
            Logout from Device
          </button>
        </div>
      </div>
    );
  }

  if (!activeUser || loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
            Loading Dashboard...
          </p>

          {showLogoutHint && (
            <div className="mt-8 pt-6 border-t border-slate-200 w-64 text-center animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-3">
                Taking too long?
              </p>
              <button
                onClick={async () => {
                  await clearAuthState();
                  window.location.reload();
                }}
                className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all mb-2"
              >
                Logout & Refresh
              </button>
              <p className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">
                Fixes stuck sessions & buffering loops
              </p>
            </div>
          )}
        </div>
      </div>
    );

    if (showSplash) {
    return <SplashScreen onClose={() => setShowSplash(false)} />;
  }
}
