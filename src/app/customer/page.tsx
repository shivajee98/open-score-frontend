'use client';

import { useState, useEffect } from 'react';
import { apiFetch, clearAuthState } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/store/useStore';
import { Wallet, Smartphone, Landmark, ScanBarcode, Send, History, Zap, CreditCard, ShieldCheck, QrCode, Flame, Droplets, Wifi, LayoutGrid, Tv, TrendingUp, Lock, Check, ArrowRight, ChevronLeft, ChevronRight, Bell, Headphones, Eye, EyeOff, RefreshCw, Gift, MapPin } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import MerchantClaimModal from '@/components/MerchantClaimModal';
import SupportModal from '@/components/SupportModal';
import HomeBannerCarousel from '@/components/HomeBannerCarousel';

import WelcomeBonusPopup from '@/components/WelcomeBonusPopup';

export default function CustomerHome() {
    const { user: cachedUser, wallet: cachedWallet, loans: cachedLoans, setUser, setWallet, setLoans } = useStore();
    const router = useRouter();

    // Data Fetching with Cache
    const { data: user, isLoading: userLoading, mutate: mutateUser, isValidating: userValidating } = useApi('/auth/me');
    const { data: walletData, isLoading: walletLoading, mutate: mutateWallet, isValidating: walletValidating } = useApi('/wallet/balance');
    const { data: loans, isLoading: loansLoading, mutate: mutateLoans, isValidating: loansValidating } = useApi((user?.role === 'CUSTOMER' || user?.role === 'MERCHANT' || user?.role === 'STUDENT') ? '/loans' : null);

    // Sync SWR data to Zustand Store for persistent caching
    useEffect(() => { if (user) setUser(user); }, [user, setUser]);
    useEffect(() => { if (walletData) setWallet(walletData); }, [walletData, setWallet]);
    useEffect(() => { if (loans) setLoans(Array.isArray(loans) ? loans : (loans.data || [])); }, [loans, setLoans]);

    // Refresh user and wallet data every second for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            mutateWallet();
            mutateUser();
        }, 1000);
        return () => clearInterval(interval);
    }, [mutateWallet, mutateUser]);

    const activeUser = user || cachedUser;
    const activeWallet = walletData || cachedWallet;
    const activeLoans = (loans ? (Array.isArray(loans) ? loans : (loans.data || [])) : cachedLoans) || [];

    const isRefreshing = userValidating || walletValidating || loansValidating;

    const [showBalance, setShowBalance] = useState(true);
    // Promotional Banner State - Show on load
    const [showPromotionalBanner, setShowPromotionalBanner] = useState(true);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [activeBanner, setActiveBanner] = useState(0);
    const [dynamicText, setDynamicText] = useState("Apply Now & Get 0% Interest Credit");

    const banners = [
        {
            title: dynamicText,
            sub: "First Users Only!",
            color: "bg-gradient-to-br from-slate-900 to-blue-900",
            accent: "bg-blue-600",
            amount: "₹5,00,000",
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

    // Auto Slide for Banners
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 8000); // Slower speed
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
    const balance = activeWallet?.balance || '0';
    // Prioritize active_locked_balance from user profile (loans), else wallet locked balance
    const lockedBalance = (activeUser?.active_locked_balance || 0) > 0
        ? activeUser.active_locked_balance
        : (activeWallet?.locked_balance || '0');

    // Handle both array (legacy) and paginated object (new) responses
    const loansList = activeLoans;
    const kycLoan = loansList?.find((l: any) => l.status === 'KYC_SENT') || null;
    const activeLoan = loansList?.find((l: any) => l.status === 'DISBURSED' || l.status === 'OVERDUE');
    const hasActiveLoan = !!activeLoan;
    const loading = !activeUser && (userLoading || walletLoading);

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
                setShowLogoutHint(true);
            }, 6000);
        }
        return () => clearTimeout(timer);
    }, [loading, user]);

    // Check for Welcome Bonus
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
    const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(0);

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

    if (!user || loading) return (
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

    const isMerchant = user.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';


    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <WelcomeBonusPopup isOpen={showWelcomeBonus} onClose={handleCloseWelcomeBonus} amount={welcomeBonusAmount} />
            <HomeBannerCarousel isOpen={showPromotionalBanner} onClose={() => setShowPromotionalBanner(false)} />
            <MerchantClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} onSuccess={handleClaimSuccess} bonusAmount={merchantBonus} user={activeUser} />

            <Link href="/customer/merchant-locator">
                <button
                    className="fixed bottom-24 right-4 rounded-full w-12 h-12 shadow-2xl z-40 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all active:scale-90 border-4 border-white shadow-blue-500/20"
                    title="Find Merchants"
                >
                    <MapPin className="w-6 h-6" />
                </button>
            </Link>

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
                            {isMerchant ? (user?.business_name || 'MY STORE') : (user?.name || 'CUSTOMER')}
                        </h1>
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
                                    {user?.name?.[0] || 'U'}
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
                            <Link href="/customer/referral" prefetch={false}>
                                <button
                                    className="w-6 h-6 rounded-lg bg-amber-400 border border-amber-300 flex items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer text-slate-900 hover:bg-amber-500"
                                    title="Refer & Earn"
                                >
                                    <Gift size={12} strokeWidth={2.5} />
                                </button>
                            </Link>
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

                {/* Balance Card - Elite Credit Value */}
                <div className="relative group z-10 mx-auto max-w-sm">
                    {/* Outer Neon Glow */}
                    <div className={`absolute -inset-[2px] rounded-[1.4rem] ${isMerchant ? 'bg-emerald-400/50' : 'bg-indigo-500/30'} blur-md animate-pulse`}></div>

                    {/* Card Container */}
                    <div className={`relative ${isMerchant ? 'bg-emerald-500/40' : 'bg-white/5'} backdrop-blur-xl rounded-[1rem] py-1.5 px-3 flex items-center justify-between border-[1.5px] ${isMerchant ? 'border-emerald-300' : 'border-white/10'} shadow-[0_0_20px_rgba(var(--theme-glow),0.2),inset_0_0_20px_rgba(var(--theme-glow),0.1)] overflow-hidden`}>
                        <style jsx>{`
                            div {
                                --theme-glow: ${isMerchant ? '16, 185, 129' : '99, 102, 241'};
                            }
                        `}</style>
                        {/* Internal Shine Effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        <div className="flex items-center gap-3 relative z-10 w-full">
                            <div className="w-6 h-6 rounded-[6px] bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg">
                                <Wallet size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className={`${isMerchant ? 'text-emerald-50' : 'text-indigo-100'} text-[8px] font-bold uppercase tracking-[0.15em] opacity-90`}>Elite Credit Value</p>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="p-1 rounded-md hover:bg-white/10 transition-colors text-white/60"
                                    >
                                        {showBalance ? <Eye size={10} /> : <EyeOff size={10} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[18px] font-black text-white tracking-tighter drop-shadow-sm">
                                        ₹ {showBalance ? Number(balance).toLocaleString() : '••••••'}
                                    </p>
                                    {Number(lockedBalance) > 0 && showBalance && (
                                        <div
                                            onClick={() => toast.info("Funds are locked. Contact your supervisor.")}
                                            className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 cursor-pointer hover:bg-black/30 transition-colors active:scale-95"
                                        >
                                            <Lock size={10} className="text-yellow-400" />
                                            <span className="text-[10px] font-black text-white tracking-tight">₹{Number(lockedBalance).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Floating Card */}
            <div className="px-6 -mt-8 relative z-20 mb-3">
                <div className="bg-white py-1 px-1 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className={`grid ${hasActiveLoan ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
                        {[
                            { label: 'Scan QR', icon: <ScanBarcode size={20} strokeWidth={2.5} />, href: '/customer/pay?scan=true', color: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200', show: true },
                            { label: 'Pay ID', icon: <Send size={20} strokeWidth={2.5} />, href: '/customer/pay', color: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-indigo-200', show: true },
                            { label: 'Show QR', icon: <QrCode size={20} strokeWidth={2.5} />, href: '/customer/qr', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200', show: true },
                            { label: 'Repay', icon: <CreditCard size={20} strokeWidth={2.5} />, href: `/customer/loan/status/repayment?id=${activeLoan?.id}`, color: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200', show: hasActiveLoan },
                        ].filter(item => item.show).map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer">
                                <Link href={item.href} prefetch={false} className="contents">
                                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm border border-white/20 mb-1`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.1em] text-center">{item.label}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Marketing Banner - Get Needs Done */}
            <div className="px-4 mb-3">
                <div onClick={() => router.push('/customer/pay?scan=true')} className="cursor-pointer group">
                    <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 p-0.5 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-transform">
                        <div className="bg-slate-900 rounded-[0.9rem] px-4 py-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex-1">
                                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-100 font-black text-sm leading-tight tracking-tight mb-1">
                                        Get Your Need Done
                                    </h3>
                                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                                        By using this app or paying via this app
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                                    <ScanBarcode size={16} strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KYC Alert (If any) */}
            {
                kycLoan && (
                    <div className="px-4 mb-8">
                        <Link href={`/customer/loan/status/view?id=${kycLoan.id}`} prefetch={false}>
                            <div className="bg-yellow-400 p-4 rounded-3xl shadow-2xl shadow-yellow-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-yellow-400 flex items-center justify-center shadow-lg">
                                        <ShieldCheck size={36} />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-black text-lg leading-tight uppercase tracking-tight">Complete KYC Now</h3>
                                        <p className="text-slate-800 text-[10px] font-black leading-tight mt-1 opacity-60 uppercase tracking-widest">Required for Loan #{kycLoan.id}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            }

            {
                isMerchant && !user.pincode && (
                    <div className="px-4 mb-3">
                        <div onClick={() => setShowClaimModal(true)} className="cursor-pointer">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-purple-900/30 border-2 border-white/20 flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <Zap size={24} className="fill-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-base leading-tight uppercase tracking-tight">Claim ₹{merchantBonus} Cashback</h3>
                                        <p className="text-white/80 text-[9px] font-black leading-tight mt-0.5 opacity-80 uppercase tracking-widest">Complete Setup Now</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bank Setup Alert - Upfront */}
            {
                (!user.account_number || !user.ifsc_code) && (
                    <div className="px-4 mb-8">
                        <Link href="/customer/profile?editBank=true" prefetch={false}>
                            <div className="bg-rose-500 p-4 rounded-3xl shadow-2xl shadow-rose-900/30 border-4 border-white flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-rose-500 flex items-center justify-center shadow-lg">
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
                        className="flex transition-transform duration-500 ease-out"
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
                                    <div className="flex-1">
                                        <h3 className="text-white font-black text-[11px] tracking-tight leading-tight">
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

        </div>
    );
}
