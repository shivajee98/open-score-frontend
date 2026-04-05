'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Coins, TrendingUp, History, Users, ArrowUpRight, CheckCircle, Clock, Trophy, Copy, Check, X, AlertCircle, QrCode } from 'lucide-react';
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
    const [transferAmount, setTransferAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'QR' | 'LOAN'>('QR');

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
                                <p className="text-[9px] font-black text-violet-200 uppercase tracking-widest">Earn Wallet</p>
                                <h3 className="text-3xl font-black mt-1">
                                    {((stats?.qr_earning || 0) + (stats?.loan_earning || 0) + (stats?.bonus_earned || 0)).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                </h3>
                                <p className="text-[10px] text-violet-200 font-medium mt-1">Total Earnings</p>
                            </div>
                            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                                <Coins size={26} className="text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">QR Mapping</p>
                                <p className="text-base font-black">{(stats?.qr_earning || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">Loan Bonus</p>
                                <p className="text-base font-black">{(stats?.loan_earning || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest">Milestone</p>
                                <p className="text-base font-black">{(stats?.bonus_earned || 0).toLocaleString('en-IN')}</p>
                            </div>
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
                                {stats?.unverified_held > 0 && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="animate-pulse" />
                                            <span>Held (Unverified): {stats.unverified_held.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                {timeLeft.locked && (
                                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                        <Clock size={12} />
                                        <span>Withdraw in: {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m</span>
                                    </div>
                                )}
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
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">QR Mapping Earning</p>
                                <p className="text-lg font-black text-slate-800">{stats?.qr_earning?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Loan Earning</p>
                                <p className="text-lg font-black text-slate-800">{stats?.loan_earning?.toLocaleString() || 0}</p>
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
                            disabled={submitting || (stats?.available || 0) <= 0 || timeLeft.locked || (stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)}
                            className={`w-full py-4 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${timeLeft.locked || (stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {timeLeft.locked
                                ? 'Currently Time Locked'
                                : (stats?.min_qr_onboard_for_transfer > 0 && (stats?.qr_onboard_count || 0) < stats.min_qr_onboard_for_transfer)
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
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wider mb-2">Your Earning Rates</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
                                        <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">QR Mapping</p>
                                        <p className="text-lg font-black">{(stats?.my_rates?.qr_onboarding_rate || 0).toLocaleString()}</p>
                                        <p className="text-[8px] text-indigo-200/70 uppercase">Per Merchant</p>
                                    </div>
                                    <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
                                        <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Virtual Credit Disbursement</p>
                                        <p className="text-lg font-black">{(stats?.my_rates?.loan_disbursement_rate || 0).toLocaleString()}</p>
                                        <p className="text-[8px] text-indigo-200/70 uppercase">Per Disbursement</p>
                                    </div>
                                    {(stats?.my_rates?.bonus_milestone_count > 0 || (user?.sub_user_id && stats?.my_rates?.bonus_milestone_amount === 0)) && (
                                        <div className="bg-amber-400/20 border border-amber-400/30 rounded-xl px-4 py-2 backdrop-blur-md">
                                            <p className="text-[9px] text-amber-200 uppercase tracking-widest font-bold flex items-center gap-1">
                                                <Trophy size={8} /> Milestone
                                            </p>
                                            <p className="text-lg font-black">{(stats?.my_rates?.bonus_milestone_amount || 0).toLocaleString()}</p>
                                            <p className="text-[8px] text-amber-200/70 uppercase">Target: {stats?.my_rates?.bonus_milestone_count || '-'} Mappings</p>
                                        </div>
                                    )}
                                </div>
                                {user?.sub_user_id && !stats?.my_rates?.qr_onboarding_rate && !stats?.my_rates?.loan_disbursement_rate && (
                                    <p className="text-[9px] text-indigo-200 mt-3 font-bold uppercase tracking-widest">Note: Your commission rates are currently set to 0 by your agency.</p>
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
                        <div className="flex p-1 bg-slate-200/50 rounded-xl">
                            <button
                                onClick={() => setActiveTab('QR')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'QR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <QrCode size={14} />
                                QR Onboarding
                            </button>
                            <button
                                onClick={() => setActiveTab('LOAN')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'LOAN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <History size={14} />
                                Virtual Credit Process
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 p-4">
                        {stats?.history?.filter((f: any) => {
                            if (activeTab === 'QR') return Number(f.signup_bonus) > 0 || f.type === 'QR';
                            return Number(f.loan_bonus) > 0 || f.type === 'LOAN';
                        }).length > 0 ? (
                            stats.history.filter((f: any) => {
                                if (activeTab === 'QR') return Number(f.signup_bonus) > 0 || f.type === 'QR';
                                return Number(f.loan_bonus) > 0 || f.type === 'LOAN';
                            }).map((friend: any) => (
                                <div key={friend.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">{friend.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{friend.mobile}</p>
                                        </div>
                                        <div className="flex gap-4 text-right">
                                            {activeTab === 'QR' ? (
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">QR Mapped Earn</p>
                                                    <p className={`text-xs font-black ${friend.is_field_verified ? 'text-emerald-600' : 'text-slate-300'}`}>{Number(friend.signup_bonus || 0).toFixed(0)}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Disbursed Earn</p>
                                                    <p className={`text-xs font-black ${friend.is_field_verified ? 'text-indigo-600' : 'text-slate-300'}`}>{Number(friend.loan_bonus || 0).toFixed(0)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="grid grid-cols-4 gap-1 relative pt-2 mb-2">
                                        {/* Step 1: Joined */}
                                        <div className="flex flex-col items-center gap-1 z-10 text-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100`}>
                                                <Users size={12} />
                                            </div>
                                            <span className="text-[7px] font-black uppercase text-emerald-500">Joined</span>
                                        </div>

                                        {/* Step 2: Action (Mapped/Applied) */}
                                        <div className="flex flex-col items-center gap-1 z-10 text-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                                (friend.type === 'LOAN' && friend.has_applied_loan) || (friend.type !== 'LOAN')
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                                : 'bg-white border-slate-200 text-slate-300'
                                            }`}>
                                                {friend.type === 'LOAN' ? <History size={11} /> : <QrCode size={11} />}
                                            </div>
                                            <span className={`text-[7px] font-black uppercase ${(friend.type === 'LOAN' && friend.has_applied_loan) || (friend.type !== 'LOAN') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {friend.type === 'LOAN' ? 'Applied' : 'Mapped'}
                                            </span>
                                        </div>

                                        {/* Step 3: Verified */}
                                        <div className="flex flex-col items-center gap-1 z-10 text-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                                friend.is_field_verified 
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                                : 'bg-white border-amber-300 text-amber-500 animate-pulse'
                                            }`}>
                                                {friend.is_field_verified ? <Check size={11} /> : <Clock size={11} />}
                                            </div>
                                            <span className={`text-[7px] font-black uppercase ${friend.is_field_verified ? 'text-emerald-500' : 'text-amber-500'}`}>Verified</span>
                                        </div>

                                        {/* Step 4: Paid */}
                                        <div className="flex flex-col items-center gap-1 z-10 text-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                                friend.is_field_verified 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                                : 'bg-white border-slate-200 text-slate-300'
                                            }`}>
                                                <Trophy size={11} />
                                            </div>
                                            <span className={`text-[7px] font-black uppercase ${friend.is_field_verified ? 'text-indigo-600' : 'text-slate-400'}`}>Paid</span>
                                        </div>

                                        {/* Connecting Line Backdrop */}
                                        <div className="absolute top-[21px] left-[15%] right-[15%] h-[1.5px] bg-slate-100 -z-0"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <TrendingUp className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No referral earnings yet</p>
                                <button
                                    onClick={() => router.push('/customer/referral')}
                                    className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Start Referring Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-slate-900 tracking-tight">Withdraw Earnings</h3>
                            <button onClick={() => setShowTransferModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {stats?.transfer_min_amount > 0 && (
                            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-bold flex items-start gap-2 mb-6 border border-amber-200/50">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>Minimum allowed withdraw amount is {stats.transfer_min_amount.toLocaleString()}.</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Available to withdraw: {stats?.available?.toLocaleString()}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold text-lg"></span>
                                    </div>
                                    <input
                                        type="number"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full bg-white border-2 border-indigo-500 rounded-2xl py-4 pl-10 pr-4 font-black text-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={submitTransfer}
                                disabled={submitting || !transferAmount || Number(transferAmount) <= 0 || Number(transferAmount) > stats?.available}
                                className="w-full py-4 bg-indigo-400 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
