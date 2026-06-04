"use client";

import CampaignPopup from "@/components/CampaignPopup";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import MerchantClaimModal from "@/components/MerchantClaimModal";
import MerchantLoanMilestone from "@/components/MerchantLoanMilestone";
import OutgoingCallModal from "@/components/OutgoingCallModal";
import { toast } from "@/components/ui/Toast";
import WelcomeBonusPopup from "@/components/WelcomeBonusPopup";
import VaultCard from "@/components/VaultCard";
import { useApi } from "@/hooks/useApi";
import { apiFetch, clearAuthState } from "@/lib/api";
import { cn } from "@/lib/loanUtils";
import { useStore } from "@/store/useStore";
import {
    ArrowRight,
    Check,
    Clock,
    Gift,
    History,
    Landmark,
    Lock,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldCheck,
    Smartphone,
    Upload,
    Users,
    X,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BankOffersGrid from "./_components/BankOffersGrid";
import DashboardHeader from "./_components/DashboardHeader";
import HeroDashboard from "./_components/HeroDashboard";
import MarketplaceSection from "./_components/MarketplaceSection";
import MoreWaysToEarnSection from "./_components/MoreWaysToEarnSection";
import PromoBannerCard from "./_components/PromoBannerCard";
import QuickActionsGrid from "./_components/QuickActionsGrid";
import SplashScreen from "./_components/SplashScreen";
import SuperSaverZoneCard from "./_components/SuperSaverZoneCard";

export default function CustomerHome() {
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

  // Email Verification States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Sync email from user profile
  useEffect(() => {
    if (activeUser?.email && !email) {
      setEmail(activeUser.email);
    }
  }, [activeUser?.email]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await apiFetch("/auth/email/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("OTP sent successfully to your email.");
        setIsOtpSent(true);
        setResendCountdown(60);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const response = await apiFetch("/auth/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Email verified successfully!");
        await mutateUser();
      }
    } catch (e: any) {
      toast.error(e.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const [showBalance, setShowBalance] = useState(true);
  const [showAdminMessage, setShowAdminMessage] = useState(false);
  const [showAdminMessageHistory, setShowAdminMessageHistory] = useState(false);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [liveActiveCount, setLiveActiveCount] = useState<number>(145);

  useEffect(() => {
    const fetchLiveUsers = async () => {
      try {
        const data = await apiFetch("/public/active-users");
        if (data && typeof data.active_users === "number") {
          setLiveActiveCount(data.active_users);
        }
      } catch (e) {
        setLiveActiveCount((prev) => {
          const drift = Math.random() > 0.5 ? 1 : -1;
          const next = prev + drift;
          return next < 120 ? 120 : next > 220 ? 220 : next;
        });
      }
    };

    fetchLiveUsers();
    const interval = setInterval(fetchLiveUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("customer_splash_seen");
    if (!hasSeenSplash) {
      setShowSplashScreen(true);
    }
  }, []);

  const handleCloseSplash = () => {
    setShowSplashScreen(false);
    sessionStorage.setItem("customer_splash_seen", "true");
  };

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
      color: "bg-linear-to-br from-slate-900 to-blue-900",
      accent: "bg-blue-600",
      amount: "5,00,000",
      label: "Limit Up to",
    },
    {
      title: "Experience Premium",
      sub: "Upgrade your Status",
      color: "bg-linear-to-br from-blue-950 to-indigo-950",
      accent: "bg-purple-600",
      amount: "Exclusive",
      label: "Benefits",
    },
    {
      title: "Secure Transactions",
      sub: "Bank-Grade Security",
      color: "bg-linear-to-br from-slate-900 to-slate-950",
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
          color: "bg-linear-to-br from-violet-700 via-purple-800 to-indigo-900",
          accent: "bg-violet-500",
          amount: "No Hidden Charge",
          label: "Available",
        },
        {
          title: "Wallet UPTO 2 Lakh  Daily",
          sub: "Daily Increment  2 %",
          color: "bg-linear-to-br from-amber-600 via-orange-700 to-red-800",
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

  const isVaultEnabledByAdmin = !!vaultSetupData?.vault;
  const activeVaultRequest =
    cardRequests?.find((r: any) =>
      ["ON_HOLD", "PENDING_APPROVAL", "REJECTED"].includes(r.status),
    ) ||
    (!isVaultEnabledByAdmin
      ? cardRequests?.find((r: any) => !["ACTIVATED"].includes(r.status))
      : null);
  const activeDeposit = vaultSetupData?.deposits?.find(
    (d: any) => d.status === "ACTIVE",
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
  const [isVaultMaximized, setIsVaultMaximized] = useState(false);

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center overflow-x-hidden">
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

  if (activeUser && !activeUser.email_verified_at) {
    return (
      <div
        className={`min-h-screen ${isMerchant ? "bg-slate-950" : "bg-slate-900"} flex flex-col justify-between relative overflow-hidden p-6`}
      >
        {/* Circuit board overlay pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="lock-circuit"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 40 h 80 M40 0 v 80"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
              <circle cx="40" cy="40" r="3" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#lock-circuit)" />
          </svg>
        </div>

        {/* Top Bar */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl ${isMerchant ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"} flex items-center justify-center border border-white/5`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              OpenScore Secure
            </span>
          </div>
          <button
            onClick={async () => {
              await clearAuthState();
              window.location.replace("/");
            }}
            className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Main Content Card */}
        <div className="my-auto z-10 w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-[1.8rem] bg-linear-to-tr from-amber-500 to-orange-600 items-center justify-center text-white mb-4 shadow-xl shadow-orange-500/20 animate-pulse">
              <Mail size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Verify Your Email
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">
              Required to activate your account benefits
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl p-6 shadow-2xl">
            {/* Email Field Group */}
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1.5 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      if (!isOtpSent) setEmail(e.target.value);
                    }}
                    disabled={isOtpSent || isSendingOtp}
                    placeholder="Enter your email address"
                    className={`w-full bg-slate-950/40 border ${isOtpSent ? "border-white/5 text-slate-500" : "border-white/10 text-white focus:border-indigo-500"} rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-none transition-all disabled:opacity-60`}
                  />
                  {isOtpSent && (
                    <button
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtp("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Field Group (Shown only when OTP is sent) */}
              {isOtpSent && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1.5 pl-1">
                    Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-3.5 px-4 text-center text-lg font-black tracking-[0.3em] text-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                  <div className="flex justify-between items-center mt-2.5 px-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Sent to {email}
                    </span>
                    {resendCountdown > 0 ? (
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {!isOtpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !email}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl ${
                      isMerchant
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/30"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/30"
                    } disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    {isSendingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send Verification OTP
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otp.length !== 6}
                    className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl shadow-emerald-950/30 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        Verify & Activate Account
                        <Check size={14} strokeWidth={3} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center z-10">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            By continuing, you verify this email is owned and managed by you.
            <br />
            Security audits are active. IP: logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      {showSplashScreen ? (
        <SplashScreen onClose={handleCloseSplash} />
      ) : (
        <CampaignPopup />
      )}
      {showLoanBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-100 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">
              New Loan of 15,000 Launched!{" "}
              <span className="ml-1 opacity-80">🚀 Apply Now</span>
            </p>
          </div>
          <button
            onClick={dismissLoanBanner}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <WelcomeBonusPopup
        isOpen={showWelcomeBonus}
        onClose={handleCloseWelcomeBonus}
        amount={welcomeBonusAmount}
      />
      {showVaultSetupPopup && (
        <div className="fixed inset-0 z-120 bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center px-5">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-indigo-900 via-violet-900 to-slate-900 p-5 text-white">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black tracking-tight">
                Vault Is Enabled For You
              </h3>
              <p className="text-xs font-bold text-white/80 mt-1">
                Admin has enabled Vault Card for your account.
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                Complete your vault setup in Payout to start deposits and secure
                withdrawals.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={dismissVaultSetupPopup}
                  className="py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Later
                </button>
                <button
                  onClick={handleVaultSetupNow}
                  className="py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Set Up Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <HomeBannerCarousel
        isOpen={showPromotionalBanner}
        onClose={() => setShowPromotionalBanner(false)}
      />

      {/* Payment Proof Re-upload Blocker */}
      {activeUser?.has_pending_reupload && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-500 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
              <Upload size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">
                Payment Issue Detected
              </p>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                Re-upload Proof Required
              </h4>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                Account is in View-Only mode until resolved
              </p>
            </div>
          </div>
          <Link href="/customer/loan">
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95">
              Fix Now <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      )}

      {/* Alternate Number Verification Banner */}
      {!activeUser?.is_debug && !activeUser?.has_verified_alternate_number && (
        <div className="mx-3 mt-4 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Smartphone size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-tight leading-tight">
                Verify Number
              </h4>
              <p className="text-[9px] font-bold text-slate-500 leading-tight">
                Verify alternate number
              </p>
            </div>
          </div>
          <Link href="/customer/profile">
            <button className="bg-rose-500 text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-rose-600 transition-all active:scale-95 shadow-sm shadow-rose-500/20">
              Verify <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      )}

      <MerchantClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSuccess={handleClaimSuccess}
        bonusAmount={merchantBonus}
        user={activeUser}
      />

      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 items-end">
        {activeUser?.sub_user_id && (
          <Link href="/customer/my-work">
            <button
              className="relative rounded-full w-12 h-12  bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all active:scale-90 border-4 border-white shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-[pulse_2s_ease-in-out_infinite]"
              title="My Work"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
              </span>
            </button>
          </Link>
        )}

        <Link href="/customer/merchant-locator">
          <button
            className="rounded-full w-12 h-12 shadow-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all active:scale-90 border-4 border-white shadow-blue-500/20"
            title="Find Merchants"
          >
            <MapPin className="w-6 h-6" />
          </button>
        </Link>
      </div>

      <DashboardHeader user={activeUser} liveCount={liveActiveCount} />

      <OutgoingCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        userId={activeUser?.id || 0}
      />

      {/* Balance and Vault Section */}
      <HeroDashboard
        walletBalance={balance}
        vaultBalance={vaultSetupData?.vault?.balance || 0}
        isVaultEnabled={isVaultEnabledByAdmin}
        onVaultClick={() => setIsVaultMaximized(true)}
      />

      {isVaultMaximized && (
        <div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl px-4"
            onClick={() => setIsVaultMaximized(false)}
        >
            <div className="w-full max-w-[320px] relative flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <VaultCard
                    vault={vaultSetupData?.vault}
                    rates={vaultSetupData?.rates}
                    activeDeposit={activeDeposit}
                    userName={activeUser?.name}
                    isFlipped={isVaultFlipped}
                    setIsFlipped={setIsVaultFlipped}
                    isMaximized={true}
                    setIsMaximized={setIsVaultMaximized}
                    showCardNumber={showVaultCardNumber}
                    setShowCardNumber={setShowVaultCardNumber}
                    showCvc={showVaultCvc}
                    setShowCvc={setShowVaultCvc}
                />
                {/* Hint Overlay */}
                <div className="mt-8 flex flex-col items-center gap-3 text-center animate-in fade-in z-[110]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                        {isVaultFlipped ? "Tap card to see front" : "Tap card to see CVV & Rates"}
                    </p>
                    <button
                        onClick={() => setIsVaultMaximized(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-black text-white transition-all uppercase tracking-widest active:scale-95"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Pending Transfer OTP Card */}
      {activeUser?.pending_transfer_otp && (
        <div className="px-6 -mt-4 relative z-20 mb-6 mx-auto max-w-sm">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-amber-400/20 animate-pulse">
                <Lock size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-200 uppercase tracking-[0.2em] leading-none mb-1">
                  Incoming Transfer
                </p>
                <p className="text-sm font-black text-white tracking-tight">
                  Verification Code (OTP)
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">
                  {Number(activeUser.pending_transfer_amount).toLocaleString()}
                </p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">
                  Pending
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex items-center justify-between mb-2">
              <div className="flex gap-2">
                {String(activeUser.pending_transfer_otp)
                  .split("")
                  .map((digit, i) => (
                    <div
                      key={i}
                      className="w-8 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xl font-black text-amber-400"
                    >
                      {digit}
                    </div>
                  ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    activeUser.pending_transfer_otp,
                  );
                  toast.success("OTP Copied!");
                }}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                <History size={16} />
              </button>
            </div>
            <p className="text-[9px] text-center text-white/40 font-bold uppercase tracking-widest italic">
              Share this code with the sender to verify
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActionsGrid
        hasActiveLoan={hasActiveLoan}
        activeLoanId={activeLoan?.id}
        hasInboxMessages={allAdminMessages.length > 0}
        onInboxClick={() => setShowAdminMessageHistory(true)}
        unreadCount={unreadAdminMessages.length}
      />

      {/* KYC Document Re-upload Blocker */}
      {activeUser?.has_pending_kyc_reupload && (
        <div className="px-4 mb-4">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-lg shadow-rose-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500 border-l-4 border-l-rose-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/10 rounded-full blur-2xl -mr-12 -mt-12"></div>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                    <Lock size={22} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">
                      Account Restricted
                    </p>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      KYC Action Required
                    </h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-80 italic">
                      Payments currently locked
                    </p>
                  </div>
                </div>
                <Link
                  href={
                    kycLoan
                      ? `/customer/loan/status/view?id=${kycLoan.id}`
                      : "/customer/loan"
                  }
                  className="shrink-0"
                >
                  <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 group/btn">
                    FIX KYC{" "}
                    <ArrowRight
                      size={14}
                      strokeWidth={3}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </Link>
              </div>

              {kycLoan?.reupload_fields?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-rose-200/50 mt-1">
                  <p className="w-full text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">
                    Items requiring update:
                  </p>
                  {kycLoan.reupload_fields.map((field: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-rose-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded-md shadow-sm"
                    >
                      {field.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeVaultRequest && (
        <div className="px-6 mb-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="relative w-full bg-[#0A0A12] rounded-[24px] p-4 flex flex-row items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-[#1f2030] overflow-hidden group">
            {/* Background Ambient Glows - Subtle */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/5 rounded-full blur-[60px] pointer-events-none z-0"></div>

            {/* Left Content Section - 65% width */}
            <div className="flex-[1.5] xs:flex-[1.6] sm:flex-[1.8] flex flex-col justify-center relative z-10 py-1">
              {/* Top Tag - Very Small */}
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-[#FFD600] fill-[#FFD600]" />
                <span className="italic font-bold text-[10px] tracking-widest text-[#A855F7] uppercase">
                  {activeVaultRequest.status === "PENDING_APPROVAL"
                    ? "Verifying"
                    : activeVaultRequest.status === "REJECTED"
                      ? "Declined"
                      : activeVaultRequest.status === "ON_HOLD"
                        ? "Card On Hold"
                        : "Limited Offer"}
                </span>
              </div>

              {/* Main Headline - Compact */}
              <h2 className="italic font-black text-[22px] sm:text-[28px] leading-tight tracking-wide text-white mb-1 whitespace-nowrap">
                {activeVaultRequest.status === "PENDING_APPROVAL" ? (
                  <>
                    Proof <span className="text-[#FFD600]">Verifying</span>
                  </>
                ) : activeVaultRequest.status === "REJECTED" ? (
                  <>
                    Payment <span className="text-rose-500">Declined</span>
                  </>
                ) : activeVaultRequest.status === "ON_HOLD" ? (
                  <>
                    Card <span className="text-amber-500">On Hold</span>
                  </>
                ) : (
                  <>
                    Get <span className="text-[#FFD600]">500</span> Instantly
                  </>
                )}
              </h2>

              {/* Sub Headline - Minimal */}
              <p className="italic text-[#9ca3af] text-[12px] font-semibold tracking-wide mb-3">
                {activeVaultRequest.status === "PENDING_APPROVAL"
                  ? "Securing Reward..."
                  : activeVaultRequest.status === "REJECTED"
                    ? "Please re-upload proof"
                    : activeVaultRequest.status === "ON_HOLD"
                      ? "Re-upload payment proof"
                      : "On Your Titanium Card"}
              </p>

              {/* Info Tag - Ultra Compact */}
              <div className="flex items-center gap-2">
                <Gift size={12} className="text-[#FFD600]/60" />
                <span className="text-[#9ca3af] text-[9px] font-medium tracking-widest uppercase opacity-60">
                  {activeVaultRequest.status === "PENDING_APPROVAL"
                    ? "Security Check"
                    : activeVaultRequest.status === "REJECTED"
                      ? "Try Again"
                      : activeVaultRequest.status === "ON_HOLD"
                        ? "Action Required"
                        : "Rewards Ready"}
                </span>
              </div>
            </div>

            {/* Right Section: Graphics + Button - 35% width */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              {/* 3D Graphics - Scaled for 16:9 thinness */}
              <div className="relative w-full h-[90px] flex justify-center items-center transform -translate-y-1">
                {/* Ring & Plate */}
                <div className="absolute w-[110px] sm:w-[140px] h-[36px] sm:h-[40px] bottom-[5px]">
                  <div className="absolute inset-0 bg-linear-to-b from-[#181E3D] to-[#0B0D1E] rounded-lg border-t border-[#4b6bfb]/20 shadow-lg z-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[0.5px] bg-blue-400/20"></div>
                    <span className="absolute bottom-1 right-2 text-[#8892b0] text-[7px] sm:text-[8px] font-bold tracking-widest opacity-40">
                      CASHBACK
                    </span>
                  </div>
                  <div className="absolute inset-[-6px] border-[1.5px] border-[#3B82F6] rounded-[100%] shadow-[0_0_10px_#3B82F6] transform -rotate-[8deg] z-0 opacity-40"></div>
                </div>

                {/* 3D "500" - Small */}
                <div
                  className="italic font-black text-[#FFD600] text-[42px] sm:text-[64px] leading-none tracking-tighter relative z-30 transform translate-x-1 sm:translate-x-2 -translate-y-1 animate-float"
                  style={{
                    textShadow: `
                                            -1px 1px 0px #cc9900,
                                            -2px 2px 0px #cc9900,
                                            -3px 3px 0px #cc9900,
                                            -4px 4px 0px #cc9900,
                                            -6px 8px 12px rgba(0, 0, 0, 0.8)
                                        `,
                  }}
                >
                  500
                </div>
              </div>

              {/* Button - Thin & Wide */}
              <Link href="/customer/virtual-card" className="w-full">
                <button className="relative z-30 w-full h-[38px] rounded-[10px] bg-linear-to-r from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center gap-2 text-white font-bold text-[12px] tracking-wider shadow-lg active:scale-95 transition-all">
                  <ArrowRight size={12} strokeWidth={4} />
                  <span className="uppercase">
                    {activeVaultRequest.status === "PENDING_APPROVAL"
                      ? "Status"
                      : activeVaultRequest.status === "REJECTED"
                        ? "Retry"
                        : activeVaultRequest.status === "ON_HOLD"
                          ? "Fix Now"
                          : "Claim"}
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Loan Milestone Progress Bar */}
      {isMerchant && (
        <MerchantLoanMilestone
          totalCreditVolume={Number(activeUser?.total_credit_volume || 0)}
          milestonePlan={activeUser?.milestone_plan}
        />
      )}

      {/* Promo Banner only shown if bank is not verified (to avoid duplicate cashback offer) */}
      {!activeUser?.bank_name && <PromoBannerCard />}

      {/* Tie User OTP Alert */}
      {activeUser?.pending_tie_otp && (
        <div className="px-4 mb-3">
          <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 p-5 rounded-3xl shadow-2xl shadow-indigo-900/40 border-[3px] border-indigo-500/30 flex flex-col gap-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shadow-inner border border-indigo-400/30">
                <Lock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-white font-black text-sm leading-tight uppercase tracking-tight">
                  Agent Link Request
                </h3>
                <p className="text-indigo-200/80 text-[10px] font-black leading-tight mt-1 uppercase tracking-widest">
                  Share this OTP with your agent
                </p>
              </div>
            </div>
            <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-2xl py-3 px-5 border border-indigo-500/20 flex items-center justify-between">
              <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                Secret Code
              </span>
              <span className="text-white text-3xl font-black tracking-[0.25em]">
                {activeUser.pending_tie_otp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KYC Alert (If any) - Only shown if not already blocked by re-upload at the top */}
      {kycLoan && !activeUser?.has_pending_kyc_reupload && (
        <div className="px-4 mb-3">
          <Link
            href={`/customer/loan/status/view?id=${kycLoan.id}`}
            prefetch={false}
          >
            <div
              className={cn(
                "py-3 px-4 rounded-2xl shadow-xl border-2 flex flex-col gap-2 group active:scale-[0.98] transition-all overflow-hidden relative",
                kycLoan.reupload_fields?.length > 0
                  ? "bg-rose-50 border-rose-500 shadow-rose-900/10 ring-4 ring-rose-500/10"
                  : "bg-yellow-400 border-white shadow-yellow-900/20",
              )}
            >
              <div className="flex items-center justify-between relative z-10 w-full">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
                      kycLoan.reupload_fields?.length > 0
                        ? "bg-rose-600 text-white"
                        : "bg-slate-900 text-yellow-400",
                    )}
                  >
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-black text-sm leading-tight uppercase tracking-tight",
                        kycLoan.reupload_fields?.length > 0
                          ? "text-rose-900"
                          : "text-slate-900",
                      )}
                    >
                      {kycLoan.reupload_fields?.length > 0
                        ? "Document Update Required"
                        : "Complete KYC Verification"}
                    </h3>
                    <p
                      className={cn(
                        "text-[8px] font-black mt-0.5 uppercase tracking-widest leading-tight",
                        kycLoan.reupload_fields?.length > 0
                          ? "text-rose-600/60"
                          : "text-slate-800 opacity-60",
                      )}
                    >
                      Credit Request ID #{kycLoan.id}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center",
                    kycLoan.reupload_fields?.length > 0
                      ? "bg-rose-600/10 text-rose-600"
                      : "bg-slate-900/10 text-slate-900",
                  )}
                >
                  <ArrowRight size={14} />
                </div>
              </div>

              {kycLoan.reupload_fields?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {kycLoan.reupload_fields.map((field: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-rose-600/10 text-rose-600 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-rose-600/10"
                    >
                      {field.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      {isMerchant && !activeUser?.pincode && (
        <div className="px-1 mb-1">
          <div
            onClick={() => setShowClaimModal(true)}
            className="cursor-pointer"
          >
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-1 rounded-2xl shadow-xl shadow-purple-900/30 border-2 border-white/20 flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Zap size={24} className="fill-white" />
                </div>
                <div>
                  <h4 className="text-white font-black text-base leading-tight uppercase tracking-tight">
                    Claim {merchantBonus} Cashback
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Setup Alert - Upfront */}
      <BankOffersGrid isBankVerified={!!activeUser?.bank_name} />
      <MarketplaceSection />
      <MoreWaysToEarnSection />
      <SuperSaverZoneCard />

      {/* Admin Message Overlay (Forced Read) */}
      {showAdminMessage && unreadAdminMessages.length > 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowAdminMessage(false)}
          />

          <div className="bg-white w-full max-w-[320px] rounded-4xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 italic-selection">
            {/* Header - More Professional & Compact */}
            <div className="bg-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowAdminMessage(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="text-white/60 group-hover:text-white"
                />
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <MessageSquare size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">
                  Correspondence
                </span>
              </div>

              <h3 className="text-lg font-black tracking-tight uppercase leading-none mt-2">
                {unreadAdminMessages[currentMsgIndex]?.title ||
                  "New Notification"}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Secure Payload
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={8} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase">
                    {unreadAdminMessages[currentMsgIndex] &&
                      new Date(
                        unreadAdminMessages[currentMsgIndex].created_at,
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6 min-h-[120px] flex flex-col justify-center shadow-inner">
                <p className="text-[13px] font-medium text-slate-700 leading-relaxed uppercase italic text-center">
                  {unreadAdminMessages[currentMsgIndex]?.message}
                </p>
              </div>

              <button
                onClick={() =>
                  handleMarkAsRead(unreadAdminMessages[currentMsgIndex].id)
                }
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
              >
                <Check size={12} strokeWidth={4} />
                Acknowledge Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message History Drawer */}
      {showAdminMessageHistory && (
        <div className="fixed inset-0 z-100 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAdminMessageHistory(false)}
          />

          <div className="bg-white w-full rounded-t-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-500 border-t border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Messages
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Interaction History
                </p>
              </div>
              <button
                onClick={() => setShowAdminMessageHistory(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 bg-slate-50/40">
              {allAdminMessages.length === 0 ? (
                <div className="text-center py-20">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-slate-200 mb-3 opacity-50"
                  />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    No Transmissions Found
                  </p>
                </div>
              ) : (
                allAdminMessages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-5 rounded-3xl border-2 transition-all ${msg.is_read ? "bg-white border-slate-100/50" : "bg-white border-indigo-200 shadow-lg shadow-indigo-100/30"}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${msg.is_read ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"}`}
                        >
                          <MessageSquare size={14} strokeWidth={2.5} />
                        </div>
                        <div>
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest block ${msg.is_read ? "text-slate-400" : "text-indigo-600"}`}
                          >
                            {msg.title ||
                              (msg.is_read ? "Notification" : "Priority Alert")}
                          </span>
                          <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">
                            ID: {msg.id.toString().padStart(6, "0")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {new Date(msg.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {msg.read_at && (
                          <p className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                            Ack Confirmed
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`rounded-2xl p-4 border ${msg.is_read ? "bg-slate-50/50 border-slate-100" : "bg-slate-50/30 border-indigo-50"}`}
                    >
                      <p
                        className={`text-[12px] font-medium leading-relaxed uppercase italic ${msg.is_read ? "text-slate-500" : "text-slate-800"}`}
                      >
                        {msg.message}
                      </p>
                    </div>
                    {!msg.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={12} strokeWidth={4} />
                        Confirm Receipt
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Buttons - Repositioned to Bottom Right for better accessibility */}
      <div className="fixed bottom-28 left-6 flex flex-col gap-5 z-50 items-start animate-in fade-in slide-in-from-left-10 duration-700">
        {activeUser?.meeting_link && (
          <button
            onClick={() => window.open(activeUser.meeting_link, "_blank")}
            className="w-14 h-14 rounded-2xl bg-indigo-600 border border-indigo-400/30 flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-90 transition-all cursor-pointer text-white hover:bg-indigo-700 font-black group relative overflow-hidden"
            title="Join Meeting"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-600/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare
              size={24}
              strokeWidth={2.5}
              className="group-hover:scale-110 transition-transform relative z-10"
            />
          </button>
        )}
        {activeUser?.support_number && (
          <button
            onClick={() =>
              (window.location.href = `tel:${activeUser.support_number}`)
            }
            className="w-16 h-16 rounded-4xl bg-emerald-500 border border-emerald-300/30 flex items-center justify-center shadow-[0_25px_50px_rgba(16,185,129,0.4)] active:scale-90 transition-all cursor-pointer text-white hover:bg-emerald-600 font-black animate-bounce-subtle group relative overflow-hidden"
            title="Call Support"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-emerald-600/0 via-white/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Phone
              size={28}
              strokeWidth={2.5}
              className="group-hover:rotate-12 transition-transform relative z-10"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full" />
          </button>
        )}
      </div>
    </div>
  );
}
