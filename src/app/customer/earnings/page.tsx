'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Coins, TrendingUp, History, Users, ArrowUpRight, CheckCircle, Clock, Trophy, Copy, Check, X, AlertCircle, QrCode, Search, Info, CreditCard, Loader2, Landmark, CheckCircle2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from '@/components/ui/Toast';
import { useStore } from '@/store/useStore';

export default function TeamEarningsPage() {
    const router = useRouter();
    const { user } = useStore();
    const { data: stats, isLoading, mutate: mutateStats } = useApi('/auth/team/earnings');
    const { data: referralData } = useApi(user?.sub_user_id ? '/referral/my-code' : null);

    // UI State
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [withdrawalTab, setWithdrawalTab] = useState<'request' | 'history'>('request');
    const [transferAmount, setTransferAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'QR' | 'LOAN' | 'CARD' | 'DECLINED' | 'WITHDRAWAL'>('QR');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRemark, setSelectedRemark] = useState<string | null>(null);

    // Card Activation State
    const [cardMobile, setCardMobile] = useState('');
    const [cardCustomer, setCardCustomer] = useState<any>(null);
    const [cardLoading, setCardLoading] = useState(false);
    const { data: cardRequests, mutate: mutateCardRequests } = useApi(activeTab === 'CARD' ? '/vault-cards' : null);

    // Withdrawal History State (Agent Transfer History)
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [pageW, setPageW] = useState(1);
    const [hasMoreW, setHasMoreW] = useState(true);
    const [fetchingMoreW, setFetchingMoreW] = useState(false);
    const [initialLoadingW, setInitialLoadingW] = useState(true);

    const fetchWithdrawals = useCallback(async (pageNum: number, isNew = false) => {
        try {
            if (!pageNum || pageNum < 1) return;
            const res = await apiFetch(`/auth/team/transfer-history?page=${pageNum}`);
            const newWithdrawals = res.data || [];

            if (isNew) {
                setWithdrawals(newWithdrawals);
            } else {
                setWithdrawals(prev => [...prev, ...newWithdrawals]);
            }

            setHasMoreW(res.current_page < res.last_page);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setInitialLoadingW(false);
            setFetchingMoreW(false);
        }
    }, []);

    useEffect(() => {
        fetchWithdrawals(1, true);
    }, [fetchWithdrawals]);

    // Observer for infinite scroll
    const observerW = useRef<IntersectionObserver | null>(null);
    const lastWithdrawalRef = useCallback((node: HTMLDivElement) => {
        if (fetchingMoreW || !hasMoreW) return;
        if (observerW.current) observerW.current.disconnect();

        observerW.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreW) {
                setFetchingMoreW(true);
                setPageW(prev => {
                    const next = prev + 1;
                    fetchWithdrawals(next);
                    return next;
                });
            }
        });

        if (node) observerW.current.observe(node);
    }, [fetchingMoreW, hasMoreW, fetchWithdrawals]);

    const handleCheckCustomer = async () => {
        if (cardMobile.length !== 10) return toast.error("Mobile number must be 10 digits");
        setCardLoading(true);
        try {
            const res = await apiFetch(`/vault-cards/check-user?mobile=${cardMobile}`);
            if (res.user_id) {
                setCardCustomer(res);
            } else {
                toast.error("Customer not found. Have them sign up first.");
                setCardCustomer(null);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to check customer");
        } finally {
            setCardLoading(false);
        }
    };

    const handleRequestCard = async () => {
        if (!cardMobile || cardMobile.length !== 10) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/vault-cards/request', {
                method: 'POST',
                body: JSON.stringify({ customer_number: cardMobile })
            });
            if (res.error) throw new Error(res.error);
            toast.success(res.message);
            mutateCardRequests();
            setCardMobile('');
            setCardCustomer(null);
        } catch (e: any) {
            toast.error(e.message || "Failed to request card");
        } finally {
            setSubmitting(false);
        }
    };

    // Timer State
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, locked: boolean }>({ d: 0, h: 0, m: 0, locked: false });

    useEffect(() => {
        if (!stats?.next_transfer_available_at) {
            setTimeLeft({ d: 0, h: 0, m: 0, locked: false });
            return;
        }

        const target = new Date(stats.next_transfer_available_at).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, locked: false });
            } else {
                setTimeLeft({
                    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    locked: true
                });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [stats?.next_transfer_available_at]);

    const handleCopy = () => {
        if (!referralData?.referral_code) return;
        navigator.clipboard.writeText(referralData.referral_code);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTransferClick = () => {
        const available = stats?.available || 0;
        if (available <= 0) return toast.error("No earnings available for transfer");
        if (timeLeft.locked) return toast.error("Transfer is locked by time rules.");
        setTransferAmount('');
        setWithdrawalTab('request');
        setShowTransferModal(true);
    };

    const submitTransfer = async () => {
        const available = stats?.available || 0;
        const amountNum = Number(transferAmount);

        if (!amountNum || isNaN(amountNum) || amountNum <= 0) return;
        if (amountNum > available) return toast.error("Amount exceeds available balance");
        if (stats?.transfer_min_amount > 0 && amountNum < stats.transfer_min_amount) {
            return toast.error(`Minimum allowed amount is ${stats.transfer_min_amount}`);
        }

        setSubmitting(true);
        try {
            const res = await apiFetch('/auth/team/transfer-earnings', {
                method: 'POST',
                body: JSON.stringify({ amount: amountNum })
            });
            if (res.error) throw new Error(res.error);
            toast.success(res.message || "Transfer requested successfully");
            setShowTransferModal(false);
            setTransferAmount('');
            mutateStats();
            fetchWithdrawals(1, true);
        } catch (e: any) {
            toast.error(e.message || "Transfer failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Earnings...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-10 pb-20 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <BackButton className="mb-6 flex items-center gap-2 text-indigo-200 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </BackButton>

                    <h1 className="text-2xl font-black text-white tracking-tight">My Earnings</h1>
                    <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">Performance Dashboard</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 space-y-4">

                {user?.sub_user_id && referralData?.referral_code && (
                    <div className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">My Referral Code</p>
                            <p className="text-xl font-black text-slate-900 tracking-wider">{referralData.referral_code}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                        >
                            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                )}

                {/* Earn Wallet Card */}
                <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-[2rem] p-6 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[9px] font-black text-violet-200 uppercase tracking-widest">Upcoming Earning</p>
                                <h3 className="text-3xl font-black mt-1">
                                    {/* {((stats?.qr_earning || 0) + (stats?.loan_earning || 0) + (stats?.bonus_earned || 0)).toLocaleString('en-IN', { minimumFractionDigits: 0 })} */}
                                    {(stats?.unverified_held ?? 0).toLocaleString()}
                                </h3>
                                <p className="text-[10px] text-violet-200 font-medium mt-1">Total Earnings</p>
                            </div>
                            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                                <Coins size={26} className="text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">QR Onboarded</p>
                                <p className="text-base font-black">{(stats?.qr_onboard_count || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">Loans Applied</p>
                                <p className="text-base font-black">{(stats?.loan_onboard_count || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">Verified</p>
                                <p className="text-base font-black">{(stats?.qr_verified_count || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest">
                                <span className="text-red-300">{(stats?.declined_count || 0)}</span> Lead(s) Declined
                            </p>
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                {stats?.kyc_status === 'approved' ? (
                    <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Available for Transfer</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.available?.toLocaleString() || 0}</h2>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ml-4">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Earned</p>
                                <p className="text-lg font-black text-slate-800">{stats?.total_earned?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pending/Transferred</p>
                                <p className="text-lg font-black text-slate-800">{stats?.transferred?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Verified Mappings</p>
                                <p className="text-lg font-black text-slate-800">{stats?.qr_verified_count?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Loans Disbursed</p>
                                <p className="text-lg font-black text-slate-800">{stats?.loan_verified_count?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        {/* QR Mapping Milestone Restriction */}
                        {stats?.min_qr_onboard_for_transfer > 0 && (
                            <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 transition-all ${(stats?.qr_onboard_count || 0) >= stats.min_qr_onboard_for_transfer
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-amber-50 border-amber-100 text-amber-700'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(stats?.qr_onboard_count || 0) >= stats.min_qr_onboard_for_transfer
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-500 text-white'
                                    }`}>
                                    {(stats?.qr_onboard_count || 0) >= stats.min_qr_onboard_for_transfer ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest leading-none mb-1">Mapping Milestone</p>
                                    <p className="text-xs font-bold">
                                        {(stats?.qr_onboard_count || 0) >= stats.min_qr_onboard_for_transfer
                                            ? `Milestone reached! (${stats.qr_onboard_count}/${stats.min_qr_onboard_for_transfer})`
                                            : `Complete ${stats.min_qr_onboard_for_transfer} QR mappings to unlock transfers. (${stats.qr_onboard_count} done)`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleTransferClick}
                            disabled={submitting || (stats?.available || 0) <= 0 || (stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)}
                            className={`w-full py-4 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${(stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {(stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)
                                ? 'Locked: Milestone '
                                : (stats?.available || 0) <= 0
                                    ? 'No Earnings Available'
                                    : 'Transfer to Wallet'
                            }
                            <ArrowUpRight size={16} />
                        </button>

                        <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                            Transfer requests are reviewed by the Admin.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">KYC Verification Required</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[240px]">
                            Please complete your KYC to enable earnings withdrawal and transfer.
                        </p>
                        <button
                            onClick={() => router.push('/customer/my-work')}
                            className="mt-6 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                        >
                            Complete KYC
                        </button>
                    </div>
                )}

                {/* Status/Banner — Earning Rates */}
                {(stats?.my_rates?.qr_onboarding_rate > 0 || stats?.my_rates?.loan_disbursement_rate > 0 || user?.sub_user_id) ? (
                    <div className="bg-indigo-600 rounded-3xl p-4 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-12 -mb-12"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-[10px] uppercase tracking-wider mb-1.5 opacity-80">Your Rates</h3>
                                <div className="flex flex-wrap gap-2">
                                    <div className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 backdrop-blur-md">
                                        <p className="text-[8px] text-indigo-200 uppercase tracking-tighter font-bold">QR Onboard</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-sm font-black">{(stats?.my_rates?.qr_onboarding_rate || 0).toLocaleString()}</p>
                                            <span className="text-[6px] text-indigo-200/70 uppercase">/Unit</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 backdrop-blur-md">
                                        <p className="text-[8px] text-indigo-200 uppercase tracking-tighter font-bold">V-Credit</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-sm font-black">{(stats?.my_rates?.loan_disbursement_rate || 0).toLocaleString()}</p>
                                            <span className="text-[6px] text-indigo-200/70 uppercase">/Disb</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 backdrop-blur-md">
                                        <p className="text-[8px] text-indigo-200 uppercase tracking-tighter font-bold">Vault Card</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-sm font-black">{(stats?.my_rates?.vault_card_commission || 0).toLocaleString()}</p>
                                            <span className="text-[6px] text-indigo-200/70 uppercase">/Actv</span>
                                        </div>
                                    </div>
                                    {(stats?.my_rates?.bonus_milestone_count > 0 || (user?.sub_user_id && stats?.my_rates?.bonus_milestone_amount === 0)) && (
                                        <div className="bg-amber-400/20 border border-amber-400/30 rounded-lg px-2.5 py-1 backdrop-blur-md">
                                            <p className="text-[8px] text-amber-200 uppercase tracking-tighter font-bold flex items-center gap-1">
                                                <Trophy size={7} /> Milestone
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <p className="text-sm font-black">{(stats?.my_rates?.bonus_milestone_amount || 0).toLocaleString()}</p>
                                                <span className="text-[6px] text-amber-200/70 uppercase">@{stats?.my_rates?.bonus_milestone_count || '-'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {user?.sub_user_id && !stats?.my_rates?.qr_onboarding_rate && !stats?.my_rates?.loan_disbursement_rate && (
                                    <p className="text-[8px] text-indigo-200 mt-2 font-bold uppercase tracking-widest leading-none">Note: Rates are 0 by agency.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-wider">Referring Profit</h3>
                                <p className="text-xs text-indigo-100 font-medium">Earn per signup & per virtual credit disbursement from your direct refers.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Earnings List */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-3 flex-wrap sm:flex-nowrap gap-1">
                            <button
                                onClick={() => setActiveTab('QR')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] ${activeTab === 'QR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <QrCode size={14} />
                                QR
                            </button>
                            <button
                                onClick={() => setActiveTab('LOAN')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] ${activeTab === 'LOAN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <History size={14} />
                                Credit
                            </button>
                            <button
                                onClick={() => setActiveTab('CARD')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] ${activeTab === 'CARD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <CreditCard size={14} />
                                Card
                            </button>
                            <button
                                onClick={() => setActiveTab('DECLINED')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] ${activeTab === 'DECLINED' ? 'bg-white text-rose-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <X size={14} />
                                Decline ({stats?.declined_count || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('WITHDRAWAL')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] ${activeTab === 'WITHDRAWAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <History size={14} />
                                Payouts
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {activeTab === 'QR' ? 'Mappings' : activeTab === 'LOAN' ? 'Referrals' : activeTab === 'CARD' ? 'Requests' : activeTab === 'WITHDRAWAL' ? 'Transfer History' : 'Declined Leads'} (
                                {activeTab === 'QR' ? (stats?.history?.filter((f: any) => f.status !== 'DECLINED' && (f.type !== 'LOAN')).length || 0) :
                                    activeTab === 'LOAN' ? (stats?.history?.filter((f: any) => f.status !== 'DECLINED' && f.type === 'LOAN').length || 0) :
                                        activeTab === 'CARD' ? (cardRequests?.data?.length || 0) :
                                            activeTab === 'WITHDRAWAL' ? (withdrawals?.length || 0) :
                                                (stats?.declined_count || 0)}
                                )
                            </p>
                            {activeTab !== 'CARD' && activeTab !== 'WITHDRAWAL' && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={14} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search name/mobile..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-300 font-medium"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        {activeTab === 'WITHDRAWAL' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 p-4">
                                {withdrawals?.map((w: any, idx) => (
                                    <div
                                        key={w.id}
                                        ref={idx === withdrawals.length - 1 ? lastWithdrawalRef : null}
                                        className="bg-white rounded-[22px] p-4 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                w.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                <Landmark size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">
                                                    ₹{parseFloat(w.amount).toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {new Date(w.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • #{w.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                w.status === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {w.status === 'COMPLETED' ? 'PAID' : w.status === 'FAILED' ? 'REJECTED' : w.status}
                                            </span>
                                            {w.description && (
                                                <p className="text-[7px] font-bold text-slate-400 mt-1 italic line-clamp-1">{w.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {initialLoadingW && withdrawals.length === 0 && (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
                                    </div>
                                )}

                                {fetchingMoreW && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                    </div>
                                )}

                                {!initialLoadingW && withdrawals.length === 0 && (
                                    <div className="py-12 text-center bg-white rounded-[2rem] border border-slate-100 border-dashed">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">No transactions</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Your payout history will appear here.</p>
                                    </div>
                                )}

                                {!hasMoreW && withdrawals.length > 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">End of history</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {activeTab === 'CARD' && (
                                    <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Request Vault Card</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earn on card activations</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                value={cardMobile}
                                                onChange={(e) => setCardMobile(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Customer Mobile"
                                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                            <button
                                                onClick={handleCheckCustomer}
                                                disabled={cardLoading || cardMobile.length !== 10}
                                                className="bg-slate-900 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 transition-all"
                                            >
                                                {cardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                                            </button>
                                        </div>
                                        {cardCustomer && (
                                            <div className="mt-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-0.5">Customer Name</p>
                                                    <p className="font-black text-indigo-900 text-sm">{cardCustomer.name}</p>
                                                </div>
                                                <button
                                                    onClick={handleRequestCard}
                                                    disabled={submitting}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md active:scale-95 disabled:opacity-50"
                                                >
                                                    {submitting ? 'Requesting...' : 'Request Card'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'CARD' && cardRequests?.data?.map((req: any) => (
                                    <div key={req.id} className="bg-white px-3 py-3 rounded-[22px] border border-slate-100 shadow-sm mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">{req.customer?.name || 'Unknown'}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{req.customer_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${req.status === 'ACTIVATED' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                        req.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        {req.status === 'PENDING_PAYMENT' && req.activation_charge && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <p className="text-xs font-bold text-slate-600">Charge: <span className="text-amber-600 font-black">₹{req.activation_charge}</span></p>
                                                <button
                                                    onClick={() => router.push(`/customer/virtual-card`)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                                >
                                                    Pay Now
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'REJECTED' && req.rejection_reason && (
                                            <div className="mt-2 text-[10px] text-rose-500 bg-rose-50 p-2 rounded-lg">
                                                {req.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {activeTab === 'CARD' && (!cardRequests?.data || cardRequests.data.length === 0) && (
                                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                                        <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No card requests yet</p>
                                    </div>
                                )}

                                {activeTab !== 'CARD' && stats?.history?.filter((f: any) => {
                                    if (activeTab === 'DECLINED') return f.status === 'DECLINED';
                                    if (f.status === 'DECLINED') return false;

                                    const matchTab = activeTab === 'QR' ? (f.type !== 'LOAN') : (f.type === 'LOAN');
                                    const matchSearch = (() => {
                                        if (!searchQuery) return true;
                                        const q = searchQuery.toLowerCase();
                                        return (f.name && f.name.toLowerCase().includes(q)) || (f.mobile && f.mobile.includes(q));
                                    })();
                                    return matchTab && matchSearch;
                                }).map((friend: any) => {
                                    const isVerified = friend.is_field_verified;
                                    const isDeclined = friend.status === 'DECLINED';
                                    const verifiedText = isDeclined ? 'Declined' : (friend.type === 'LOAN' ? 'Disbursed' : 'Txn Complete');

                                    const v = friend.validation;
                                    let progress = 0;
                                    if (v && v.thresholds) {
                                        const p1 = v.thresholds.min_tx > 0 ? (v.tx_count / v.thresholds.min_tx) : 1;
                                        const p2 = v.thresholds.min_amount > 0 ? (v.tx_amount / v.thresholds.min_amount) : 1;
                                        const p3 = v.thresholds.min_unique > 0 ? (v.unique_payers / v.thresholds.min_unique) : 1;
                                        progress = Math.min(1, Math.min(p1, p2, p3));
                                    }

                                    return (
                                        <div key={friend.id} className="bg-white px-3 py-2 rounded-[22px] border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                                        {friend.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black text-slate-900 leading-none mb-1">{friend.name || 'Anonymous'}</h4>
                                                        <p className="text-[8px] font-bold text-slate-400 font-mono">{friend.mobile || 'No Mobile'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Earned</p>
                                                    <p className="text-[11px] font-black text-indigo-600">₹{parseFloat(friend.amount || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 relative">
                                                <div className="flex items-center gap-1.5 z-10 w-full justify-between">
                                                    <div className="flex flex-col items-center gap-1 z-10 text-center">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Lead Type</p>
                                                            {isDeclined && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedRemark(friend.rejection_reason || 'Information provided was inaccurate or incomplete.'); }}
                                                                    className="w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors"
                                                                    title="View Remark"
                                                                >
                                                                    <Info size={8} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[7px] font-black text-slate-900 uppercase">{friend.type === 'LOAN' ? 'LOAN' : 'QR Mapping'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-1 z-10 text-center">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${(friend.type === 'LOAN' && friend.has_applied_loan) || (friend.type !== 'LOAN')
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                                                            : 'bg-white border-slate-200 text-slate-300'
                                                            }`}>
                                                            {friend.type === 'LOAN' ? <History size={11} /> : <QrCode size={11} />}
                                                        </div>
                                                        <span className={`text-[7px] font-black uppercase ${(friend.type === 'LOAN' && friend.has_applied_loan) || (friend.type !== 'LOAN') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {friend.type === 'LOAN' ? 'Applied' : 'Onboarded'}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-1 z-10 text-center">
                                                        <button
                                                            onClick={() => {
                                                                if (isDeclined) {
                                                                    setSelectedRemark(friend.rejection_reason || 'Information provided was inaccurate or incomplete.');
                                                                }
                                                            }}
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform active:scale-95 relative ${isVerified
                                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                                                                : isDeclined ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white border-amber-300 text-amber-500'
                                                                }`}
                                                        >
                                                            {isVerified ? (
                                                                <Check size={11} />
                                                            ) : isDeclined ? (
                                                                <X size={11} />
                                                            ) : (
                                                                <>
                                                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                                        <circle
                                                                            cx="10"
                                                                            cy="10"
                                                                            r="8"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeDasharray={2 * Math.PI * 8}
                                                                            strokeDashoffset={2 * Math.PI * 8 * (1 - progress)}
                                                                            className="opacity-20"
                                                                            style={{ transform: 'translate(1px, 1px)' }}
                                                                        />
                                                                        <circle
                                                                            cx="10"
                                                                            cy="10"
                                                                            r="8"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeDasharray={2 * Math.PI * 8}
                                                                            strokeDashoffset={2 * Math.PI * 8 * (1 - progress)}
                                                                            style={{ transform: 'translate(1px, 1px)' }}
                                                                        />
                                                                    </svg>
                                                                    <Clock size={8} className="relative z-10" />
                                                                </>
                                                            )}
                                                        </button>
                                                        <span className={`text-[7px] font-black uppercase ${isVerified ? 'text-emerald-500' : isDeclined ? 'text-rose-500' : 'text-amber-500'}`}>{verifiedText}</span>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-1 z-10 text-center">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isVerified
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                            : 'bg-white border-slate-200 text-slate-300'
                                                            }`}>
                                                            <Trophy size={11} />
                                                        </div>
                                                        <span className={`text-[7px] font-black uppercase ${isVerified ? 'text-indigo-600' : 'text-slate-400'}`}>Paid</span>
                                                    </div>
                                                    {!isDeclined && (
                                                        <div className="absolute top-[18px] left-[15%] right-[15%] h-[1px] bg-slate-100 -z-0"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeTab !== 'CARD' && stats?.history?.filter((f: any) => {
                                    if (activeTab === 'DECLINED') return f.status === 'DECLINED';
                                    if (f.status === 'DECLINED') return false;

                                    const matchTab = activeTab === 'QR' ? (f.type !== 'LOAN') : (f.type === 'LOAN');
                                    const matchSearch = (() => {
                                        if (!searchQuery) return true;
                                        const q = searchQuery.toLowerCase();
                                        return (f.name && f.name.toLowerCase().includes(q)) || (f.mobile && f.mobile.includes(q));
                                    })();
                                    return matchTab && matchSearch;
                                }).length === 0 && (
                                        <div className="p-12 text-center">
                                            {activeTab === 'DECLINED' ? (
                                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle size={32} />
                                                </div>
                                            ) : (
                                                <TrendingUp className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                            )}
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {activeTab === 'DECLINED' ? 'Great! No declined leads' : 'No referral earnings yet'}
                                            </p>
                                            {activeTab !== 'DECLINED' && (
                                                <button
                                                    onClick={() => router.push('/customer/referral')}
                                                    className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                                >
                                                    Start Referring Now
                                                </button>
                                            )}
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-slate-900 tracking-tight">Withdraw Earnings</h3>
                            <button onClick={() => setShowTransferModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {stats?.transfer_min_amount > 0 && (
                                <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-bold flex items-start gap-2 mb-2 border border-amber-200/50">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>Minimum allowed withdraw amount is {stats.transfer_min_amount.toLocaleString()}.</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Available to withdraw: {stats?.available?.toLocaleString()}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full bg-white border-2 border-indigo-500 rounded-2xl py-4 px-4 font-black text-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={submitTransfer}
                                disabled={submitting || !transferAmount || Number(transferAmount) <= 0 || Number(transferAmount) > stats?.available || (stats?.transfer_min_amount > 0 && Number(transferAmount) < stats?.transfer_min_amount)}
                                className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Remark Modal */}
            {selectedRemark && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setSelectedRemark(null)}>
                    <div className="bg-white rounded-[24px] p-5 max-w-[280px] w-full shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200 border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                <Info size={14} strokeWidth={3} />
                            </div>
                            <h3 className="text-[13px] font-black text-slate-900 tracking-tight">Rejection Remark</h3>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-h-[150px] overflow-y-auto pr-1">
                            {selectedRemark}
                        </p>
                        <button
                            onClick={() => setSelectedRemark(null)}
                            className="mt-4 w-full py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors active:scale-95"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
