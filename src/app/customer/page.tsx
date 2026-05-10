'use client';

import { useState, useEffect } from 'react';
import { apiFetch, clearAuthState } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/store/useStore';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, QrCode, Flame, Droplets, Wifi, LayoutGrid, Tv, TrendingUp, Lock, Check, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Bell, Headphones, Eye, EyeOff, RefreshCw, Gift, MapPin, Activity, User, Users, ReceiptIndianRupee, MessageSquare, ArrowDownToLine, ArrowUpFromLine, X, Clock, Upload, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import MerchantClaimModal from '@/components/MerchantClaimModal';
import SupportModal from '@/components/SupportModal';
import HomeBannerCarousel from '@/components/HomeBannerCarousel';
import { cn } from '@/lib/loanUtils';
import WelcomeBonusPopup from '@/components/WelcomeBonusPopup';
import MerchantLoanMilestone from '@/components/MerchantLoanMilestone';
import OutgoingCallModal from '@/components/OutgoingCallModal';
import CampaignModal from '@/components/CampaignModal';

export default function CustomerHome() {
    const { user: cachedUser, wallet: cachedWallet, loans: cachedLoans, setUser, setWallet, setLoans } = useStore();
    const router = useRouter();

    // Data Fetching with Cache
    const { data: user, error: userError, isLoading: userLoading, mutate: mutateUser, isValidating: userValidating } = useApi('/auth/me');
    const { data: walletData, isLoading: walletLoading, mutate: mutateWallet, isValidating: walletValidating } = useApi('/wallet/balance');
    const { data: loans, isLoading: loansLoading, mutate: mutateLoans, isValidating: loansValidating } = useApi((user?.role === 'CUSTOMER' || user?.role === 'MERCHANT' || user?.role === 'STUDENT') ? '/loans' : null);
    const { data: vaultSetupData } = useApi('/vault/me');
    const { data: adminMessages, mutate: mutateAdminMessages } = useApi(user ? '/admin-messages' : null);
    const { data: cardRequests } = useApi('/vault-cards/my-requests');
    const { data: campaignStatus } = useApi('/campaign/status');

    // Sync SWR data to Zustand Store for persistent caching
    useEffect(() => { if (user) setUser(user); }, [user, setUser]);
    useEffect(() => { if (walletData) setWallet(walletData); }, [walletData, setWallet]);
    useEffect(() => { if (loans) setLoans(Array.isArray(loans) ? loans : (loans.data || [])); }, [loans, setLoans]);

    // Note: Manual 1s polling removed to prevent server resource exhaustion.
    // SWR handles updates via revalidateOnFocus and automatic deduplication.

    const activeUser = user || cachedUser;
    const activeWallet = walletData || cachedWallet;
    const activeLoans = (loans ? (Array.isArray(loans) ? loans : (loans.data || [])) : cachedLoans) || [];

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
            await apiFetch(`/admin-messages/${id}/read`, { method: 'PUT' });
            mutateAdminMessages();
            if (unreadAdminMessages.length <= 1) {
                setShowAdminMessage(false);
            } else {
                setCurrentMsgIndex(prev => Math.max(0, Math.min(prev, unreadAdminMessages.length - 2)));
            }
        } catch (error) {
            toast.error('Failed to acknowledge message');
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
    const [dynamicText, setDynamicText] = useState("Apply Now & Get 0% Interest Credit");
    const isMerchant = activeUser?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    const baseBanners = [
        {
            title: dynamicText,
            sub: "First Users Only!",
            color: "bg-gradient-to-br from-slate-900 to-blue-900",
            accent: "bg-blue-600",
            amount: "5,00,000",
            label: "Limit Up to"
        },
        {
            title: "Experience Premium",
            sub: "Upgrade your Status",
            color: "bg-gradient-to-br from-blue-950 to-indigo-950",
            accent: "bg-purple-600",
            amount: "Exclusive",
            label: "Benefits"
        },
        {
            title: "Secure Transactions",
            sub: "Bank-Grade Security",
            color: "bg-gradient-to-br from-slate-900 to-slate-950",
            accent: "bg-emerald-600",
            amount: "100% Safe",
            label: "Safety"
        }
    ];

    // Merchant-only promotional cards
    const merchantBanners = isMerchant ? [
        {
            title: "Unlimited Transfer",
            sub: "On Zero Cost",
            color: "bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900",
            accent: "bg-violet-500",
            amount: "No Hidden Charge",
            label: "Available"
        },
        {
            title: "Wallet UPTO 2 Lakh  Daily",
            sub: "Daily Increment  2 %",
            color: "bg-gradient-to-br from-amber-600 via-orange-700 to-red-800",
            accent: "bg-amber-500",
            amount: "Increament Upto 2% Daily",
            label: ""
        },
    ] : [];

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
            "Unlock 0% Interest Credit - First User Offer"
        ];
        let i = 0;
        const timer = setInterval(() => {
            i = (i + 1) % texts.length;
            setDynamicText(texts[i]);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    // Derived State
    const mainBalance = activeWallet?.balance || '0';
    const cashbackBalance = activeWallet?.cashback_balance || '0';
    const balance = mainBalance;

    // Handle both array (legacy) and paginated object (new) responses
    const loansList = activeLoans;
    const lockRelevantLoanStatuses = new Set([
        'PREVIEW',
        'PENDING',
        'APPLIED',
        'PROCEEDED',
        'VETTING',
        'KYC_SENT',
        'FORM_SUBMITTED',
        'KYC_SUBMITTED',
        'APPROVED',
    ]);
    const hasLockRelevantLoan = loansList?.some((l: any) => lockRelevantLoanStatuses.has(l.status));

    // Show lock amount only while there is an active pre-disbursal loan lock
    // (cancelled/rejected flows should not show this badge).
    const lockedBalance = hasLockRelevantLoan
        ? ((activeUser?.active_locked_balance || 0) > 0
            ? activeUser.active_locked_balance
            : (activeWallet?.locked_balance || '0'))
        : 0;

    const kycLoan = loansList?.find((l: any) => l.status === 'KYC_SENT' || (Array.isArray(l.reupload_fields) && l.reupload_fields.length > 0)) || null;
    const activeLoan = loansList?.find((l: any) => l.status === 'DISBURSED' || l.status === 'OVERDUE');
    const hasActiveLoan = !!activeLoan;
    const loading = !activeUser && (userLoading || walletLoading);

    const activeVaultRequest = cardRequests?.find((r: any) => !['ACTIVATED', 'REJECTED'].includes(r.status));


    // Fetch Cashback Settings
    const { data: cashbackSettings } = useApi('/admin/cashback-settings');
    const merchantBonus = cashbackSettings?.find((s: any) => s.role === 'MERCHANT' && s.is_active)?.cashback_amount || 250;

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
                const reloadCount = parseInt(sessionStorage.getItem('dash_reload_count') || '0');
                if (reloadCount < 1) {
                    sessionStorage.setItem('dash_reload_count', '1');
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
            sessionStorage.removeItem('dash_reload_count');
        }
    }, [user, loading]);

    // Check for Welcome Bonus
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
    const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(0);
    const [dismissedVaultPromptKey, setDismissedVaultPromptKey] = useState<string | null>(null);

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
    const [showCampaignModal, setShowCampaignModal] = useState(false);

    useEffect(() => {
        if (campaignStatus?.is_active) {
            let isTargeted = false;
            if (campaignStatus.visibility === 'ALL') {
                isTargeted = true;
            } else if (campaignStatus.visibility === 'ROLES') {
                isTargeted = campaignStatus.target_roles?.includes(activeUser?.role);
            } else if (campaignStatus.visibility === 'USERS') {
                isTargeted = campaignStatus.target_user_ids?.includes(activeUser?.id);
            }

            // Only show Agent poster if role is AGENT (as per user request)
            if (isTargeted && activeUser?.role === 'AGENT') {
                const hasSeen = sessionStorage.getItem('seen_campaign_2024');
                if (!hasSeen) {
                    const timer = setTimeout(() => {
                        setShowCampaignModal(true);
                        sessionStorage.setItem('seen_campaign_2024', 'true');
                    }, 2000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [campaignStatus, activeUser]);

    useEffect(() => {
        const launchTime = new Date('2026-04-20T17:42:00').getTime();
        const now = new Date().getTime();
        const isWithin24Hours = now - launchTime < 24 * 60 * 60 * 1000;
        const isDismissed = localStorage.getItem('loan_banner_dismissed_15k') === 'true';

        if (isWithin24Hours && !isDismissed) {
            setShowLoanBanner(true);
        }
    }, []);

    const dismissLoanBanner = () => {
        setShowLoanBanner(false);
        localStorage.setItem('loan_banner_dismissed_15k', 'true');
    };

    useEffect(() => {
        const checkBonus = async () => {
            if (!user) return;

            // 1. Check LocalStorage/Cookie first to save API calls
            const hasSeenLocal = localStorage.getItem('seen_welcome_bonus');
            if (hasSeenLocal === 'true') return;

            // 2. Check Database Flag
            if (user.has_seen_welcome_bonus) {
                localStorage.setItem('seen_welcome_bonus', 'true');
                return;
            }

            // Only check for reasonably new users (created within last 24 hours) or just check transactions
            try {
                const res = await apiFetch('/wallet/transactions?limit=5');
                if (res && res.data) {
                    const bonusTx = res.data.find((tx: any) =>
                        tx.type === 'CREDIT' &&
                        (tx.description?.toLowerCase().includes('welcome bonus') || tx.description?.toLowerCase().includes('signup bonus'))
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
        localStorage.setItem('seen_welcome_bonus', 'true');
        try {
            await apiFetch('/auth/welcome-bonus-seen', { method: 'POST' });
            // Update local user state to reflect change without re-fetch
            if (user) {
                setUser({ ...user, has_seen_welcome_bonus: true });
            }
        } catch (e) {
            console.error("Failed to sync seen status", e);
        }
    };

    const vaultPromptDismissKey = activeUser?.id ? `vault_setup_prompt_dismissed_${activeUser.id}` : null;
    const isVaultPromptDismissedPersisted = typeof window !== 'undefined' && vaultPromptDismissKey
        ? localStorage.getItem(vaultPromptDismissKey) === 'true'
        : false;
    const isVaultEnabledByAdmin = !!vaultSetupData?.vault;
    const hasVaultUsage = Number(vaultSetupData?.vault?.balance || 0) > 0 || (vaultSetupData?.deposits?.length || 0) > 0;
    const showVaultSetupPopup = !!activeUser?.id
        && isVaultEnabledByAdmin
        && !hasVaultUsage
        && dismissedVaultPromptKey !== vaultPromptDismissKey
        && !isVaultPromptDismissedPersisted;

    const dismissVaultSetupPopup = () => {
        if (!vaultPromptDismissKey || typeof window === 'undefined') {
            return;
        }
        localStorage.setItem(vaultPromptDismissKey, 'true');
        setDismissedVaultPromptKey(vaultPromptDismissKey);
    };

    const handleVaultSetupNow = () => {
        dismissVaultSetupPopup();
        router.push('/customer/payout');
    };

    if (activeUser?.status === 'SUSPENDED' || (userError as any)?.code === 'ACCOUNT_SUSPENDED') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-10 shadow-2xl shadow-rose-500/10 border border-rose-100/50">
                    <ShieldCheck size={48} strokeWidth={1.5} />
                </div>

                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-6 uppercase">Access Restricted</h1>

                <div className="max-w-md bg-slate-50 border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-10">
                    <p className="text-slate-600 font-bold leading-relaxed mb-8 italic">
                        "Your account has been suspended following a review of your recent onboarding/KYC process."
                    </p>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] shadow-sm">
                        Please contact our support team to resolve this issue.
                    </div>
                </div>

                <div className="flex flex-col gap-5 w-full max-w-xs">
                    <button
                        onClick={() => window.location.href = 'https://wa.me/910000000000'}
                        className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] py-6 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Contact Support Team
                    </button>
                    <button
                        onClick={async () => {
                            await clearAuthState();
                            window.location.replace('/');
                        }}
                        className="w-full bg-white text-slate-400 font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl border border-slate-100 hover:text-rose-500 active:scale-95 transition-all"
                    >
                        Logout from Device
                    </button>
                </div>
            </div>
        );
    }

    if (!activeUser || loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Dashboard...</p>

                {showLogoutHint && (
                    <div className="mt-8 pt-6 border-t border-slate-200 w-64 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-3">Taking too long?</p>
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



    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <CampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} role={activeUser?.role} />
            {showLoanBanner && (
                <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-lg animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                            <Zap size={14} className="text-white fill-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            New Loan of 15,000 Launched! <span className="ml-1 opacity-80">🚀 Apply Now</span>
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
            <WelcomeBonusPopup isOpen={showWelcomeBonus} onClose={handleCloseWelcomeBonus} amount={welcomeBonusAmount} />
            {showVaultSetupPopup && (
                <div className="fixed inset-0 z-[120] bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center px-5">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 p-5 text-white">
                            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Vault Is Enabled For You</h3>
                            <p className="text-xs font-bold text-white/80 mt-1">
                                Admin has enabled Vault Card for your account.
                            </p>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                                Complete your vault setup in Payout to start deposits and secure withdrawals.
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
            <HomeBannerCarousel isOpen={showPromotionalBanner} onClose={() => setShowPromotionalBanner(false)} />

            {/* Payment Proof Re-upload Blocker */}
            {activeUser?.has_pending_reupload && (
                <div className="mx-4 mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-500 border-l-4 border-l-amber-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                            <Upload size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Payment Issue Detected</p>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Re-upload Proof Required</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Account is in View-Only mode until resolved</p>
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
                <div className="mx-4 mt-4 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                            <Smartphone size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Mandatory Action</p>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Verify Alternate Number</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Required for loan & secure withdrawals</p>
                        </div>
                    </div>
                    <Link href="/customer/profile">
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95">
                            Verify Now <ArrowRight size={12} />
                        </button>
                    </Link>
                </div>
            )}

            <MerchantClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} onSuccess={handleClaimSuccess} bonusAmount={merchantBonus} user={activeUser} />

            <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 items-end">
                {activeUser?.sub_user_id && (
                    <Link href="/customer/my-work">
                        <button
                            className="relative rounded-full w-12 h-12 shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all active:scale-90 border-4 border-white shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-[pulse_2s_ease-in-out_infinite]"
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

            {/* Header Redesign - Tech/Circuit Theme */}
            <div className={`px-4 pt-8 pb-10 relative overflow-hidden shadow-2xl ${isMerchant ? 'bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950' : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950'}`}>
                {/* Main Gradient Background Overlay */}
                <div className={`absolute inset-0 z-0 ${isMerchant ? 'bg-gradient-to-br from-emerald-900/50 via-emerald-950/50 to-teal-900/50' : 'opacity-50'}`}></div>

                {/* Circuit Board Pattern Overlay - Reduced Density */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                            <path d="M40 40 h 60 v 60 h 60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="160" cy="100" r="3" fill="white" />
                            <path d="M300 40 v 100 h -60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="240" cy="140" r="3" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>

                {/* Random Glowing Circuit Lines - Sparse */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-[15%] left-[5%] w-[1px] h-40 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform rotate-45 animate-pulse"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-[1px] h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform -rotate-12 animate-[pulse_4s_infinite]"></div>
                </div>

                <div className="flex justify-between items-start text-white mb-6 relative z-10">
                    <div>
                        <p className={`${isMerchant ? 'text-emerald-50' : 'text-indigo-100'}/90 text-[7px] font-black uppercase tracking-[0.2em] mb-1 opacity-80`}>Welcome Back</p>
                        <h1 className="text-lg font-black tracking-tighter drop-shadow-sm uppercase">
                            {isMerchant ? (activeUser?.business_name || 'MY STORE') : (activeUser?.name || 'CUSTOMER')}
                        </h1>
                        {isMerchant && (
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                                    <Gift size={10} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Incremental Value</span>
                                </div>
                                <span className="text-sm font-black text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                    {showBalance ? Number(activeWallet?.cashback_balance || 0).toLocaleString() : '••••••'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5">
                            <Link href="/customer/notifications" prefetch={false}>
                                <button className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20 relative">
                                    <Bell size={12} strokeWidth={2.5} />
                                    <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
                                </button>
                            </Link>
                            <Link href="/customer/profile" prefetch={false}>
                                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-[10px] shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20 overflow-hidden">
                                    {activeUser?.name?.[0] || 'U'}
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {/* Add Money Button */}
                            <Link href="/customer/add-money" prefetch={false}>
                                <button
                                    className="w-7 h-7 rounded-lg bg-emerald-500 border border-emerald-400 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-emerald-600 font-black"
                                    title="Add Money"
                                >
                                    <div className="relative">
                                        <Wallet size={12} strokeWidth={2.5} />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-3 h-3 flex items-center justify-center border border-emerald-500">
                                            <span className="text-emerald-500 text-[8px] font-black leading-none">+</span>
                                        </div>
                                    </div>
                                </button>
                            </Link>
                            {!activeUser?.sub_user_id && (
                                <Link href="/customer/referral" prefetch={false}>
                                    <button
                                        className="w-6 h-6 rounded-lg bg-amber-400 border border-amber-300 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-slate-900 hover:bg-amber-500"
                                        title="Refer & Earn"
                                    >
                                        <Gift size={12} strokeWidth={2.5} />
                                    </button>
                                </Link>
                            )}
                            <Link href="/customer/support" prefetch={false}>
                                <button
                                    className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-white hover:bg-white/20"
                                    title="Help & Support"
                                >
                                    <Headphones size={12} strokeWidth={2.5} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <OutgoingCallModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} userId={activeUser?.id || 0} />

                {/* Balance and Vault Section */}
                <div className={`relative group z-10 mx-auto max-w-sm mb-4 grid gap-2 ${isVaultEnabledByAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Balance Card - Elite Credit Value */}
                    <div className="relative group w-full h-[60px]">
                        {/* Outer Neon Glow */}
                        <div className={`absolute -inset-[2px] rounded-[1.4rem] ${isMerchant ? 'bg-emerald-400/50' : 'bg-indigo-500/30'} blur-md animate-pulse`}></div>

                        {/* Card Container */}
                        <div className={`relative w-full h-full ${isMerchant ? 'bg-emerald-500/40' : 'bg-white/5'} backdrop-blur-xl rounded-[1.2rem] py-1.5 px-3 flex flex-col justify-center border-[1.5px] ${isMerchant ? 'border-emerald-300' : 'border-white/10'} shadow-[0_0_20px_rgba(var(--theme-glow),0.2),inset_0_0_20px_rgba(var(--theme-glow),0.1)] overflow-hidden`}>
                            <style jsx>{`
                                div {
                                    --theme-glow: ${isMerchant ? '16, 185, 129' : '99, 102, 241'};
                                }
                            `}</style>
                            {/* Internal Shine Effect */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="relative z-10 w-full flex flex-col gap-1">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <div className="w-4 h-4 rounded-[4px] bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg shrink-0">
                                            <Wallet size={8} strokeWidth={2.5} />
                                        </div>
                                        <p className={`${isMerchant ? 'text-emerald-50' : 'text-indigo-100'} text-[7px] font-bold uppercase tracking-[0.15em] opacity-90 truncate`}>Elite Credit Value</p>
                                    </div>
                                    <button onClick={() => setShowBalance(!showBalance)} className="p-0.5 rounded-md hover:bg-white/10 transition-colors text-white/60 shrink-0">
                                        {showBalance ? <Eye size={10} /> : <EyeOff size={10} />}
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                                    <p className={`${isVaultEnabledByAdmin ? 'text-[15px]' : 'text-[18px]'} font-black text-white tracking-tighter drop-shadow-sm truncate`}>
                                        {showBalance ? Number(balance).toLocaleString() : '••••••'}
                                    </p>
                                    {Number(lockedBalance) > 0 && showBalance && (
                                        <div onClick={() => toast.info("Funds are locked.")} className="flex items-center gap-1 bg-black/20 px-1 py-0.5 rounded-sm border border-white/10 shrink-0 cursor-pointer">
                                            <Lock size={8} className="text-yellow-400" />
                                            <span className="text-[8px] font-black text-white tracking-tight">{Number(lockedBalance).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {Number(activeWallet?.held_balance) > 0 && showBalance && (
                                        <div
                                            onClick={() => router.push('/customer/transactions')}
                                            className="flex flex-col gap-0.5 bg-blue-600/20 px-2 py-1 rounded-lg border border-blue-400/30 shrink-0 cursor-pointer hover:bg-blue-600/30 transition-all active:scale-95 group/held"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Clock size={8} className="text-blue-300" />
                                                <span className="text-[7px] font-black text-blue-200 uppercase tracking-tighter">Amount Reversal</span>
                                            </div>
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[10px] font-black text-white tracking-tighter">₹{Number(activeWallet.held_balance).toLocaleString()}</span>
                                                <span className="text-[6px] font-bold text-blue-300/80 uppercase">Recovery</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Mini Vault Card Trigger */}
                    {isVaultEnabledByAdmin && (
                        <div
                            className="relative group w-full h-[60px] cursor-pointer active:scale-[0.98] transition-transform"
                            onClick={() => setIsBigVaultOpen(true)}
                        >
                            {/* Vault Outer Glow */}
                            <div className="absolute -inset-[2px] rounded-[1.4rem] bg-[#c5a059]/30 blur-md group-hover:blur-lg animate-pulse transition-all"></div>

                            {/* Mini Vault UI Container - Metal/Gold Theme */}
                            <div className="relative w-full h-full bg-[#0f1113] backdrop-blur-xl rounded-[1.2rem] py-1.5 px-3 flex flex-col justify-center border-[1.5px] border-[#c5a059]/30 shadow-inner overflow-hidden group-hover:border-[#c5a059]/50 transition-colors">
                                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}></div>

                                <div className="relative z-10 w-full flex flex-col gap-1">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full border border-[#c5a059] flex items-center justify-center p-0.5">
                                                <div className="w-full h-full bg-[#c5a059] rounded-full flex items-center justify-center">
                                                    <CheckCircle2 size={8} className="text-[#0f1113]" strokeWidth={4} />
                                                </div>
                                            </div>
                                            <span className="text-[7px] font-black tracking-[0.2em] text-[#c5a059] uppercase">Vault Card</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-[#c5a059] animate-pulse"></div>
                                            <span className="text-[5px] font-black text-[#c5a059]/40 uppercase tracking-widest">Metal Asset</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-auto border-t border-white/5 pt-0.5">
                                        <div>
                                            <span className="text-[5px] font-bold uppercase tracking-widest text-[#c5a059]/60 block opacity-60">Asset Value</span>
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[8px] font-black text-[#c5a059]">₹</span>
                                                <span className="text-[14px] font-black tracking-tighter text-[#fef9f3] truncate max-w-[60px]">
                                                    {parseFloat(vaultSetupData?.vault?.balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-[#c5a059]/10 p-0.5 rounded-[3px]">
                                                <ArrowRight size={8} className="text-[#c5a059]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BIG VAULT OVERLAY MODAL - Premium Metal Design */}
                {isVaultEnabledByAdmin && (
                    <div
                        className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isBigVaultOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setIsBigVaultOpen(false)}
                    >
                        <div className={`absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-700 ${isBigVaultOpen ? 'opacity-100' : 'opacity-0'}`} />

                        <div className="relative w-full max-w-[340px] px-4 perspective-[2000px] h-[175px]">
                            <div
                                className={`w-full h-full transition-all duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer
                                  ${isBigVaultOpen
                                        ? 'opacity-100 [transform:translateY(0)_scale(1)_rotateY(360deg)]'
                                        : 'opacity-0 [transform:translateY(20vh)_scale(0.5)_rotateY(0deg)]'
                                    }`}
                                onClick={(e) => { e.stopPropagation(); setIsVaultFlipped(!isVaultFlipped); }}
                            >
                                <button
                                    className={`absolute -top-12 right-0 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-700 ${isBigVaultOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                    onClick={(e) => { e.stopPropagation(); setIsBigVaultOpen(false); }}
                                >
                                    <X size={16} />
                                </button>

                                <div className={`relative w-full h-full transition-transform duration-[800ms] preserve-3d ease-[cubic-bezier(0.23,1,0.32,1)] ${isVaultFlipped ? 'rotate-y-180' : ''}`}>

                                    {/* FRONT SIDE - Premium Metal */}
                                    <div className="absolute inset-0 backface-hidden">
                                        <div className="bg-[#0f1113] rounded-xl px-5 py-4 text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col justify-between group">
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#1a1d21] to-[#2a2d33]" />
                                                <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                                                    style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)` }}>
                                                </div>
                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                                                </div>
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
                                                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => router.push('/customer/payout?deposit=true')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                        >
                                                            <ArrowDownToLine size={10} className="text-[#c5a059]" />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push('/customer/payout?withdraw=true')}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                        >
                                                            <ArrowUpFromLine size={10} className="text-[#c5a059]" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
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
                                                    <div className="text-right">
                                                        <span className="text-[6px] font-black text-[#c5a059]/80 uppercase tracking-[0.2em]">Premium Metal Card</span>
                                                    </div>
                                                </div>

                                                <div className="py-1 flex items-center justify-start gap-4 group/number" onClick={(e) => e.stopPropagation()}>
                                                    <p className="font-mono text-base tracking-[0.15em] text-[#fef9f3] drop-shadow-sm font-medium">
                                                        {showVaultCardNumber
                                                            ? vaultSetupData.vault.card_number?.replace(/(.{4})/g, '$1 ').trim()
                                                            : '••••  ••••  ••••  ' + vaultSetupData.vault.card_number?.slice(-4)}
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
                                                                {showVaultExpiry ? (vaultSetupData.vault.expiry_date || '12/29') : '••/••'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.05em] text-[#fef9f3]/90">
                                                                {activeUser?.name || 'Rahul Kumar'}
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

                                    {/* BACK SIDE - Yield Matrix */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                                        <div className="bg-[#0f1113] rounded-xl text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col group">
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
                                                                    {showVaultCvc ? (vaultSetupData.vault.cvc || '•••') : '•••'}
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

                                                <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto scrollbar-hide py-1" onClick={(e) => e.stopPropagation()}>
                                                    {vaultSetupData.rates?.slice(0, 4).map((r: any) => (
                                                        <div key={r.id} className="bg-white/[0.03] border border-white/[0.04] px-2 py-1.5 rounded-md flex flex-col hover:bg-white/[0.07] transition-all">
                                                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">{r.tenure_days} Days</span>
                                                            <span className="text-[10px] font-black text-[#c5a059] leading-none">{r.interest_rate}%</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-1 flex items-center justify-between border-t border-white/[0.03] pt-2">
                                                    <div className="flex gap-[1px] h-2 items-end opacity-10">
                                                        {[1, 3, 1, 5, 2, 4, 1, 6, 2].map((w, i) => (
                                                            <div key={i} className="bg-white" style={{ width: `${w}px`, height: '100%' }} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[6px] font-serif italic text-white/10 uppercase tracking-widest">Secured by Open Score</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                                <p className="text-[10px] font-black text-amber-200 uppercase tracking-[0.2em] leading-none mb-1">Incoming Transfer</p>
                                <p className="text-sm font-black text-white tracking-tight">Verification Code (OTP)</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">{Number(activeUser.pending_transfer_amount).toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Pending</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5 flex items-center justify-between mb-2">
                            <div className="flex gap-2">
                                {String(activeUser.pending_transfer_otp).split('').map((digit, i) => (
                                    <div key={i} className="w-8 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xl font-black text-amber-400">
                                        {digit}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(activeUser.pending_transfer_otp);
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

            {/* Quick Actions - Floating Card */}
            <div className="px-6 -mt-8 relative z-20 mb-3">
                <div className="bg-white py-1 px-1 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className={`grid ${hasActiveLoan ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
                        {[
                            { label: 'Scan QR', icon: <ScanBarcode size={20} strokeWidth={2.5} />, href: '/customer/pay?scan=true', color: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200', show: true },
                            { label: 'Pay ID', icon: <Send size={20} strokeWidth={2.5} />, href: '/customer/pay', color: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-indigo-200', show: true },
                            {
                                label: 'Inbox',
                                icon: (
                                    <div className="relative">
                                        <MessageSquare size={20} strokeWidth={2.5} />
                                        {unreadAdminMessages.length > 0 && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-bounce" />
                                        )}
                                    </div>
                                ),
                                href: '#',
                                color: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-purple-200',
                                show: allAdminMessages.length > 0,
                                onClick: () => setShowAdminMessageHistory(true)
                            },
                            { label: 'Show QR', icon: <QrCode size={20} strokeWidth={2.5} />, href: '/customer/qr', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200', show: true },
                            { label: 'Repay', icon: <CreditCard size={20} strokeWidth={2.5} />, href: `/customer/loan/status/repayment?id=${activeLoan?.id}`, color: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200', show: hasActiveLoan },
                        ].filter(item => item.show).map((item, i) => {
                            const isDisabled = (activeUser?.has_pending_reupload || activeUser?.has_pending_kyc_reupload) && (item.label === 'Scan QR' || item.label === 'Pay ID' || item.label === 'Show QR');

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-all active:scale-95",
                                        isDisabled ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
                                    )}
                                    onClick={() => {
                                        if (isDisabled) {
                                            toast.error("Account Restricted. Please fix the payment issue first.");
                                            return;
                                        }
                                        item.onClick?.();
                                    }}
                                >
                                    <Link
                                        href={isDisabled ? '#' : item.href}
                                        prefetch={false}
                                        className={cn("contents", isDisabled && "pointer-events-none")}
                                    >
                                        <div className={cn(
                                            `w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm border border-white/20 mb-1`,
                                            isDisabled && "bg-slate-400 text-slate-100 shadow-none border-none"
                                        )}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.1em] text-center">{item.label}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

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
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Account Restricted</p>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">KYC Action Required</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-80 italic">
                                            Payments currently locked
                                        </p>
                                    </div>
                                </div>
                                <Link href={kycLoan ? `/customer/loan/status/view?id=${kycLoan.id}` : "/customer/loan"} className="shrink-0">
                                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 group/btn">
                                        FIX KYC <ArrowRight size={14} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </div>

                            {kycLoan?.reupload_fields?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-rose-200/50 mt-1">
                                    <p className="w-full text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Items requiring update:</p>
                                    {kycLoan.reupload_fields.map((field: string, idx: number) => (
                                        <span key={idx} className="bg-rose-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded-md shadow-sm">
                                            {field.replace(/_/g, ' ')}
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
                        <div className="flex-[1.8] flex flex-col justify-center relative z-10 py-1">
                            
                            {/* Top Tag - Very Small */}
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={12} className="text-[#FFD600] fill-[#FFD600]" />
                                <span className="italic font-bold text-[10px] tracking-[0.1em] text-[#A855F7] uppercase">
                                    {activeVaultRequest.status === 'PENDING_APPROVAL' ? 'Verifying' : 'Limited Offer'}
                                </span>
                            </div>

                            {/* Main Headline - Compact */}
                            <h2 className="italic font-black text-[22px] sm:text-[28px] leading-tight tracking-wide text-white mb-1 whitespace-nowrap">
                                {activeVaultRequest.status === 'PENDING_APPROVAL' ? (
                                    <>Proof <span className="text-[#FFD600]">Verifying</span></>
                                ) : (
                                    <>Get <span className="text-[#FFD600]">500</span> Instantly</>
                                )}
                            </h2>

                            {/* Sub Headline - Minimal */}
                            <p className="italic text-[#9ca3af] text-[12px] font-semibold tracking-wide mb-3">
                                {activeVaultRequest.status === 'PENDING_APPROVAL' ? 'Securing Reward...' : 'On Your Titanium Card'}
                            </p>

                            {/* Info Tag - Ultra Compact */}
                            <div className="flex items-center gap-2">
                                <Gift size={12} className="text-[#FFD600]/60" />
                                <span className="text-[#9ca3af] text-[9px] font-medium tracking-widest uppercase opacity-60">
                                    {activeVaultRequest.status === 'PENDING_APPROVAL' ? 'Security Check' : 'Rewards Ready'}
                                </span>
                            </div>
                        </div>

                        {/* Right Section: Graphics + Button - 35% width */}
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                            
                            {/* 3D Graphics - Scaled for 16:9 thinness */}
                            <div className="relative w-full h-[90px] flex justify-center items-center transform -translate-y-1">
                                {/* Ring & Plate */}
                                <div className="absolute w-[140px] h-[40px] bottom-[5px]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#181E3D] to-[#0B0D1E] rounded-lg border-t-[1px] border-[#4b6bfb]/20 shadow-lg z-10 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-[0.5px] bg-blue-400/20"></div>
                                        <span className="absolute bottom-1 right-2 text-[#8892b0] text-[8px] font-bold tracking-[0.1em] opacity-40">CASHBACK</span>
                                    </div>
                                    <div className="absolute inset-[-6px] border-[1.5px] border-[#3B82F6] rounded-[100%] shadow-[0_0_10px_#3B82F6] transform -rotate-[8deg] z-0 opacity-40"></div>
                                </div>

                                {/* 3D "500" - Small */}
                                <div 
                                    className="italic font-black text-[#FFD600] text-[54px] sm:text-[64px] leading-none tracking-tighter relative z-30 transform translate-x-2 -translate-y-1 animate-float"
                                    style={{
                                        textShadow: `
                                            -1px 1px 0px #cc9900,
                                            -2px 2px 0px #cc9900,
                                            -3px 3px 0px #cc9900,
                                            -4px 4px 0px #cc9900,
                                            -6px 8px 12px rgba(0, 0, 0, 0.8)
                                        `
                                    }}
                                >
                                    500
                                </div>
                            </div>

                            {/* Button - Thin & Wide */}
                            <Link href="/customer/virtual-card" className="w-full">
                                <button className="relative z-30 w-full h-[38px] rounded-[10px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center gap-2 text-white font-bold text-[12px] tracking-wider shadow-lg active:scale-95 transition-all">
                                    <ArrowRight size={12} strokeWidth={4} />
                                    <span className="uppercase">
                                        {activeVaultRequest.status === 'PENDING_APPROVAL' ? 'Status' : 'Claim'}
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

            {/* Marketing Banner - Get Needs Done */}
            <div className={`px-1 mb-1 ${activeUser?.has_pending_reupload || activeUser?.has_pending_kyc_reupload ? 'opacity-30 grayscale cursor-not-allowed pointer-events-none' : ''}`}>
                <div onClick={() => router.push('/customer/pay?scan=true')} className="cursor-pointer group">
                    <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 p-0.5 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-transform">
                        <div className="bg-slate-900 rounded-[0.9rem] px-4 py-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex-1">
                                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-100 font-black text-sm leading-tight tracking-tight mb-1">
                                        Transfer and Get Daily Essential
                                    </h3>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                                    <ScanBarcode size={16} strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tie User OTP Alert */}
            {
                activeUser?.pending_tie_otp && (
                    <div className="px-4 mb-3">
                        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-5 rounded-3xl shadow-2xl shadow-indigo-900/40 border-[3px] border-indigo-500/30 flex flex-col gap-4 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shadow-inner border border-indigo-400/30">
                                    <Lock size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm leading-tight uppercase tracking-tight">Agent Link Request</h3>
                                    <p className="text-indigo-200/80 text-[10px] font-black leading-tight mt-1 uppercase tracking-widest">Share this OTP with your agent</p>
                                </div>
                            </div>
                            <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-2xl py-3 px-5 border border-indigo-500/20 flex items-center justify-between">
                                <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Secret Code</span>
                                <span className="text-white text-3xl font-black tracking-[0.25em]">{activeUser.pending_tie_otp}</span>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* KYC Alert (If any) - Only shown if not already blocked by re-upload at the top */}
            {
                kycLoan && !activeUser?.has_pending_kyc_reupload && (
                    <div className="px-4 mb-3">
                        <Link href={`/customer/loan/status/view?id=${kycLoan.id}`} prefetch={false}>
                            <div className={cn(
                                "py-3 px-4 rounded-2xl shadow-xl border-2 flex flex-col gap-2 group active:scale-[0.98] transition-all overflow-hidden relative",
                                kycLoan.reupload_fields?.length > 0
                                    ? "bg-rose-50 border-rose-500 shadow-rose-900/10 ring-4 ring-rose-500/10"
                                    : "bg-yellow-400 border-white shadow-yellow-900/20"
                            )}>
                                <div className="flex items-center justify-between relative z-10 w-full">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
                                            kycLoan.reupload_fields?.length > 0 ? "bg-rose-600 text-white" : "bg-slate-900 text-yellow-400"
                                        )}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "font-black text-sm leading-tight uppercase tracking-tight",
                                                kycLoan.reupload_fields?.length > 0 ? "text-rose-900" : "text-slate-900"
                                            )}>
                                                {kycLoan.reupload_fields?.length > 0 ? 'Document Update Required' : 'Complete KYC Verification'}
                                            </h3>
                                            <p className={cn(
                                                "text-[8px] font-black leading-tight mt-0.5 uppercase tracking-widest leading-none",
                                                kycLoan.reupload_fields?.length > 0 ? "text-rose-600/60" : "text-slate-800 opacity-60"
                                            )}>Credit Request ID #{kycLoan.id}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center",
                                        kycLoan.reupload_fields?.length > 0 ? "bg-rose-600/10 text-rose-600" : "bg-slate-900/10 text-slate-900"
                                    )}>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>

                                {kycLoan.reupload_fields?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {kycLoan.reupload_fields.map((field: string, idx: number) => (
                                            <span key={idx} className="bg-rose-600/10 text-rose-600 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-rose-600/10">
                                                {field.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                )
            }

            {
                isMerchant && !activeUser?.pincode && (
                    <div className="px-1 mb-1">
                        <div onClick={() => setShowClaimModal(true)} className="cursor-pointer">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-2xl shadow-xl shadow-purple-900/30 border-2 border-white/20 flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <Zap size={24} className="fill-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-base leading-tight uppercase tracking-tight">Claim {merchantBonus} Cashback</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bank Setup Alert - Upfront */}
            {
                (!activeUser?.account_number || !activeUser?.ifsc_code) && (
                    <div className="px-4 mb-4">
                        <Link href="/customer/profile?editBank=true" prefetch={false}>
                            <div className="bg-rose-500 p-2 rounded-3xl shadow-2xl shadow-rose-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-rose-500 flex items-center justify-center shadow-lg">
                                        <Landmark size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-sm leading-tight uppercase tracking-tight">SET UP BANK ACCOUNT (NEW)</h3>
                                        <p className="text-rose-100 text-[10px] font-black leading-tight mt-1 opacity-80 uppercase tracking-widest">Required to send & receive money</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            }

            {/* Banners - Full Width Carousel */}
            <div className="relative mt-4 z-30 mb-10 group px-1">
                {/* Left Arrow - Outside */}
                <button
                    onClick={() => setActiveBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 z-50 transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
                >
                    <ChevronLeft size={14} />
                </button>

                <div className="overflow-hidden mx-4">
                    <div
                        className="flex transition-transform duration-700 ease-out"
                        style={{ transform: `translateX(calc(-${activeBanner} * (88% + 0.75rem)))` }}
                    >
                        {banners.map((banner, i) => (
                            <div
                                key={i}
                                onClick={() => router.push('/customer/loan')}
                                className={`w-[88%] h-24 mr-3 ${banner.color} rounded-2xl py-4 px-6 flex-shrink-0 flex flex-col justify-center shadow-2xl shadow-slate-900/40 cursor-pointer border border-white/10 relative overflow-hidden transition-all duration-300 ${i === activeBanner ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${banner.accent}/10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-white font-black text-[13px] sm:text-[15px] tracking-tight leading-tight line-clamp-2">
                                            {banner.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex flex-col">
                                                <span className={`text-white/40 ${i === 0 ? 'text-[8px]' : 'text-[6px]'} font-black uppercase tracking-widest`}>{banner.label}</span>
                                                <span className={`font-black tracking-tighter inline-block ${i === 0 ? 'text-lg bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' : 'text-xs text-white'}`}>
                                                    {banner.amount}
                                                </span>
                                            </div>
                                            {i === 0 && (
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Apply Now</span>
                                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-lg border border-white/10 ml-2">
                                        <Zap className="text-yellow-400 fill-yellow-400 w-3 h-3 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                        {banners.map((_, i) => (
                            <div
                                key={i}
                                className={`h-0.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-3 bg-white' : 'w-1 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Arrow - Outside */}
                <button
                    onClick={() => setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 z-50 transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={14} />
                </button>
            </div>




            {/* Recharge & Bills Section */}
            <div className="px-4 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        Recharge & Bills
                        <span className="ml-3 text-[7px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse border border-rose-100 shadow-sm tracking-widest">Coming Soon</span>
                    </h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {[
                        { label: 'Electricity', icon: <Zap size={18} className="text-amber-500 fill-amber-500 animate-pulse" /> },
                        { label: 'Mobile', icon: <Smartphone size={18} className="text-blue-500 animate-[bounce_2s_infinite]" /> },
                        { label: 'DTH', icon: <Tv size={18} className="text-slate-900" /> },
                        { label: 'Water', icon: <Droplets size={18} className="text-blue-500 animate-bounce delay-100" /> },
                        { label: 'Gas', icon: <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" /> },
                        { label: 'Broadband', icon: <Wifi size={18} className="text-purple-500 animate-pulse" /> },
                        { label: 'Insurance', icon: <ShieldCheck size={18} className="text-emerald-500" /> },
                        { label: 'More', icon: <LayoutGrid size={18} className="text-slate-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition-all">
                            <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden transition-all group-hover:shadow-md group-hover:-translate-y-1">
                                {item.icon}
                                <div className="absolute inset-0 bg-slate-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Services Section */}
            <div className="px-4 mb-24">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Services</h3>
                    <div className="w-8 h-1 bg-slate-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { title: 'Digital Gold', sub: 'Secure & Instant Savings', icon: <Landmark size={24} className="text-amber-500" /> },
                        { title: 'Mutual Funds', sub: 'Wealth Management', icon: <TrendingUp size={24} className="text-emerald-500" /> },
                        { title: 'Shakti Credit Card', sub: 'Powering Your Purchases', icon: <CreditCard size={24} className="text-blue-500" /> },
                        { title: 'EMI Card', sub: 'Easy Installments', icon: <CreditCard size={24} className="text-indigo-500" /> },
                        { title: 'Medical Card', sub: 'Healthcare Support', icon: <Activity size={24} className="text-rose-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-50 shadow-xl shadow-slate-900/5 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.title}</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Admin Message Overlay (Forced Read) */}
            {showAdminMessage && unreadAdminMessages.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAdminMessage(false)} />

                    <div className="bg-white w-full max-w-[320px] rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 italic-selection">
                        {/* Header - More Professional & Compact */}
                        <div className="bg-slate-900 p-6 text-white relative">
                            <button
                                onClick={() => setShowAdminMessage(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                            >
                                <X size={16} strokeWidth={2} className="text-white/60 group-hover:text-white" />
                            </button>

                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <MessageSquare size={16} strokeWidth={2.5} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Correspondence</span>
                            </div>

                            <h3 className="text-lg font-black tracking-tight uppercase leading-none mt-2">
                                {unreadAdminMessages[currentMsgIndex]?.title || 'New Notification'}
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure Payload</span>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <Clock size={8} strokeWidth={3} />
                                    <span className="text-[8px] font-black uppercase">
                                        {unreadAdminMessages[currentMsgIndex] && new Date(unreadAdminMessages[currentMsgIndex].created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6 min-h-[120px] flex flex-col justify-center shadow-inner">
                                <p className="text-[13px] font-medium text-slate-700 leading-relaxed uppercase italic text-center">
                                    {unreadAdminMessages[currentMsgIndex]?.message}
                                </p>
                            </div>

                            <button
                                onClick={() => handleMarkAsRead(unreadAdminMessages[currentMsgIndex].id)}
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
                <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdminMessageHistory(false)} />

                    <div className="bg-white w-full rounded-t-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-500 border-t border-slate-100">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Messages</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Interaction History</p>
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
                                    <MessageSquare size={32} className="mx-auto text-slate-200 mb-3 opacity-50" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Transmissions Found</p>
                                </div>
                            ) : (
                                allAdminMessages.map((msg: any) => (
                                    <div key={msg.id} className={`p-5 rounded-3xl border-2 transition-all ${msg.is_read ? 'bg-white border-slate-100/50' : 'bg-white border-indigo-200 shadow-lg shadow-indigo-100/30'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${msg.is_read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}>
                                                    <MessageSquare size={14} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest block ${msg.is_read ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                        {msg.title || (msg.is_read ? 'Notification' : 'Priority Alert')}
                                                    </span>
                                                    <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">ID: {msg.id.toString().padStart(6, '0')}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                {msg.read_at && (
                                                    <p className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">Ack Confirmed</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`rounded-2xl p-4 border ${msg.is_read ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-50/30 border-indigo-50'}`}>
                                            <p className={`text-[12px] font-medium leading-relaxed uppercase italic ${msg.is_read ? 'text-slate-500' : 'text-slate-800'}`}>
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
                        onClick={() => window.open(activeUser.meeting_link, '_blank')}
                        className="w-14 h-14 rounded-2xl bg-indigo-600 border border-indigo-400/30 flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-90 transition-all cursor-pointer text-white hover:bg-indigo-700 font-black group relative overflow-hidden"
                        title="Join Meeting"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageSquare size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform relative z-10" />
                    </button>
                )}
                {activeUser?.support_number && (
                    <button
                        onClick={() => window.location.href = `tel:${activeUser.support_number}`}
                        className="w-16 h-16 rounded-[2rem] bg-emerald-500 border border-emerald-300/30 flex items-center justify-center shadow-[0_25px_50px_rgba(16,185,129,0.4)] active:scale-90 transition-all cursor-pointer text-white hover:bg-emerald-600 font-black animate-bounce-subtle group relative overflow-hidden"
                        title="Call Support"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 via-white/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Phone size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform relative z-10" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full" />
                    </button>
                )}
            </div>
        </div>
    );
}
