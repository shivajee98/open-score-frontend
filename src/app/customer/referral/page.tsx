
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Gift, Copy, Share2, ArrowLeft, Trophy, Users, Banknote, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

export default function ReferralPage() {
    const router = useRouter();
    const { data: referralData, isLoading, error } = useApi('/referral/my-code');
    const { data: statsData, isLoading: statsLoading } = useApi('/referral/my-stats');

    // Combine loading state
    const loading = isLoading || statsLoading;

    const copyToClipboard = () => {
        if (referralData?.referral_code) {
            navigator.clipboard.writeText(referralData.referral_code);
            toast.success("Referral code copied!");
        }
    };

    const shareCode = async () => {
        const shareText = `Use my referral code ${referralData?.referral_code} to join OpenScore and get a welcome bonus!`;
        const shareUrl = `https://openscore.msmeloan.sbs?ref=${referralData?.referral_code}`;

        if (navigator.share && referralData?.referral_code) {
            try {
                await navigator.share({
                    title: 'Join OpenScore',
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                console.log('Share failed', err);
                // Fallback to clipboard if share was cancelled or failed
                navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                toast.success("Link copied to clipboard!");
            }
        } else if (referralData?.referral_code) {
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            toast.success("Link copied to clipboard!");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-slate-900 px-6 pt-8 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white mb-6 active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Refer & Earn</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                        Invite friends and earn rewards instantly
                    </p>
                </div>
            </div>

            <div className="px-6 -mt-10 relative z-20">
                {/* Main Code Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 text-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 text-amber-600">
                        <Gift size={32} />
                    </div>

                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Invite Code</h2>

                    <div onClick={copyToClipboard} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer active:bg-slate-100 transition-colors group mb-6">
                        <span className="text-3xl font-black text-slate-900 tracking-[0.2em]">{referralData?.referral_code || '---'}</span>
                        <Copy size={16} className="text-slate-400 group-hover:text-slate-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={14} /> Copy Code
                        </button>
                        <button
                            onClick={shareCode}
                            className="py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                        >
                            <Share2 size={14} /> Share
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 ml-1">Reward Overview</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
                            <Banknote size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">₹{statsData?.total_earnings || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Earned</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                            <Users size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{statsData?.total_referrals || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Friends Joined</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-3">
                            <Trophy size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{statsData?.total_onboarded || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Onboarded</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                            <Banknote size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{statsData?.total_disbursed || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Paid Rewards</span>
                    </div>
                </div>

                {/* Referral History */}
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 ml-1 flex items-center justify-between">
                    <span>Earning History</span>
                    <span className="text-[8px] bg-slate-200 px-2 py-0.5 rounded-full">
                        {statsData?.referrals?.filter((f: any) => Number(f.signup_bonus) > 0 || Number(f.loan_bonus) > 0).length || 0} Users
                    </span>
                </h3>

                <div className="space-y-3 mb-8">
                    {(!statsData?.referrals || statsData.referrals.length === 0) ? (
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center">
                            <Users size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No earning history</p>
                        </div>
                    ) : (
                        statsData.referrals.filter((f: any) => f.is_onboarded || f.has_received_cashback).map((friend: any) => (
                            <div key={friend.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{friend.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{friend.mobile}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Earning</p>
                                        <p className="text-xs font-black text-blue-600">₹{(Number(friend.signup_bonus) + Number(friend.loan_bonus)).toFixed(0)}</p>
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                <div className="grid grid-cols-4 gap-1 relative pt-2">
                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${true ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            <Users size={12} />
                                        </div>
                                        <span className="text-[7px] font-black uppercase text-slate-400">Joined</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${friend.is_onboarded ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            <Trophy size={11} />
                                        </div>
                                        <span className="text-[7px] font-black uppercase text-slate-400">Rewarded</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${friend.has_applied_loan ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-200 text-slate-300'} ${friend.has_applied_loan && !friend.has_received_cashback ? 'animate-pulse' : ''}`}>
                                            <Banknote size={12} />
                                        </div>
                                        <span className="text-[7px] font-black uppercase text-slate-400">Loan Applied</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${friend.has_received_cashback ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            <Gift size={12} />
                                        </div>
                                        <span className="text-[7px] font-black uppercase text-slate-400">Earning</span>
                                    </div>

                                    {/* Connecting Line Backdrop */}
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-slate-100 -z-0"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Info */}
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                            <Trophy size={16} />
                        </div>
                        <div>
                            <h4 className="font-black text-indigo-900 text-sm mb-1">How it works?</h4>
                            <p className="text-indigo-800/80 text-xs leading-relaxed">
                                Share your code with friends. When they sign up using your code, you both earn instant cashback rewards directly to your wallet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
