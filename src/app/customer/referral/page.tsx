
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Gift, Copy, Share2, ArrowLeft, Trophy, Users, Banknote, Loader2, MessageCircle, X, Check, History as HistoryIcon, Clock, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import {
    WhatsappShareButton,
    FacebookShareButton,
    TwitterShareButton,
    TelegramShareButton,
    EmailShareButton,
    WhatsappIcon,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    EmailIcon,
    LinkedinShareButton,
    LinkedinIcon
} from 'react-share';
import { useStore } from '@/store/useStore';

export default function ReferralPage() {
    const router = useRouter();
    const { user } = useStore();
    const { data: referralData, isLoading, error } = useApi('/referral/my-code');
    const { data: statsData, isLoading: statsLoading } = useApi('/referral/my-stats');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'QR' | 'CREDIT'>('QR');

    // Combine loading state
    const loading = isLoading || statsLoading;

    useEffect(() => {
        if (user?.sub_user_id) {
            router.replace('/customer');
        }
    }, [user, router]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const copyToClipboard = () => {
        if (referralData?.referral_code) {
            handleCopy(referralData.referral_code);
        }
    };

    const shareCode = async () => {
        const shareText = `Use my referral code ${referralData?.referral_code} to join OpenScore and get a welcome bonus!`;
        const shareUrl = referralData?.referral_link || `https://play.google.com/store/apps/details?id=com.openscore.sbs&referrer=referral_code%3D${referralData?.referral_code}`;

        const shareData = {
            title: 'Join OpenScore',
            text: shareText,
            url: shareUrl
        };

        if (navigator.share && referralData?.referral_code) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
                setShowShareModal(true);
            }
        } else if (referralData?.referral_code) {
            setShowShareModal(true);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Share Modal / Bottom Sheet */}
            {showShareModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-white w-full sm:w-[400px] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-300 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

                        <button
                            className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
                            onClick={() => setShowShareModal(false)}
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Share with Friends</h3>
                            <p className="text-slate-500 text-sm mt-1">Spread the word and earn rewards</p>
                        </div>

                        <div className="grid grid-cols-4 gap-y-6 gap-x-2 justify-items-center mb-8">
                            {/* Get the properly formatted values */}
                            {(() => {
                                const shareText = `Use my referral code ${referralData?.referral_code} to join OpenScore and get a welcome bonus!`;
                                const shareUrl = referralData?.referral_link || `https://play.google.com/store/apps/details?id=com.openscore.sbs&referrer=referral_code%3D${referralData?.referral_code}`;

                                return (
                                    <>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <WhatsappShareButton url={shareUrl} title={shareText} separator="\n">
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <WhatsappIcon size={56} round />
                                                </div>
                                            </WhatsappShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">WhatsApp</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <TelegramShareButton url={shareUrl} title={shareText}>
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <TelegramIcon size={56} round />
                                                </div>
                                            </TelegramShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Telegram</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <FacebookShareButton url={shareUrl}>
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <FacebookIcon size={56} round />
                                                </div>
                                            </FacebookShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Facebook</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <TwitterShareButton url={shareUrl} title={shareText}>
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <TwitterIcon size={56} round />
                                                </div>
                                            </TwitterShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">X</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <LinkedinShareButton url={shareUrl} title="Join OpenScore!">
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <LinkedinIcon size={56} round />
                                                </div>
                                            </LinkedinShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">LinkedIn</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <button
                                                onClick={() => window.open(`sms:?body=${encodeURIComponent(shareText + " " + shareUrl)}`)}
                                                className="w-[56px] h-[56px] bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-md flex-shrink-0"
                                            >
                                                <MessageCircle className="w-7 h-7" />
                                            </button>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">SMS</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <EmailShareButton url={shareUrl} subject={`Join OpenScore!`} body={shareText}>
                                                <div className="hover:scale-110 transition-transform active:scale-95">
                                                    <EmailIcon size={56} round />
                                                </div>
                                            </EmailShareButton>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Email</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group">
                                            <button
                                                onClick={() => handleCopy(shareUrl)}
                                                className="w-[56px] h-[56px] bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-md flex-shrink-0"
                                            >
                                                {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Link</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                            <div className="flex-1 truncate font-mono text-xs text-slate-500">
                                {referralData?.referral_link || `https://play.google.com/store/apps/details?id=com.openscore.sbs&referrer=referral_code%3D${referralData?.referral_code}`}
                            </div>
                            <button
                                onClick={() => handleCopy(referralData?.referral_link || `https://play.google.com/store/apps/details?id=com.openscore.sbs&referrer=referral_code%3D${referralData?.referral_code}`)}
                                className="text-blue-600 font-black text-xs uppercase tracking-wider hover:text-blue-700"
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 ml-1 flex justify-between items-center">
                    <span>Reward Overview</span>
                    {statsData?.unverified_held > 0 && (
                        <span className="flex items-center gap-1 text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                            <Loader2 size={8} className="animate-spin" />
                            {statsData.unverified_held.toLocaleString()} Pending Verification
                        </span>
                    )}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8 translate-x-2 translate-y-2 group-hover:scale-110 transition-transform" />
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3 relative z-10">
                            <Banknote size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{statsData?.available?.toLocaleString() || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Available Earn</span>
                        {statsData?.unverified_held > 0 && (
                            <div className="mt-2 text-[8px] font-black text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Check size={8} /> {statsData.total_earnings?.toLocaleString()} Total Recorded
                            </div>
                        )}
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
                            <Check size={20} />
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

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
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
                                onClick={() => setActiveTab('CREDIT')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'CREDIT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <HistoryIcon size={14} />
                                Virtual Credit
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 p-4">
                        {(!statsData?.referrals || statsData.referrals.filter((f: any) => {
                            if (activeTab === 'QR') return (f.is_onboarded || f.has_received_cashback) && f.type !== 'LOAN';
                            return f.has_applied_loan || f.type === 'LOAN';
                        }).length === 0) ? (
                            <div className="p-10 text-center">
                                <Users size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No {activeTab === 'QR' ? 'QR' : 'Virtual Credit'} history</p>
                            </div>
                        ) : (
                            statsData.referrals.filter((f: any) => {
                                if (activeTab === 'QR') return (f.is_onboarded || f.has_received_cashback) && f.type !== 'LOAN';
                                return f.has_applied_loan || f.type === 'LOAN';
                            }).map((friend: any) => (
                                <div key={friend.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
                                    {!friend.is_field_verified && (
                                        <div className="absolute top-0 right-0 py-1 px-3 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm z-10 flex items-center gap-1.5 border-b border-l border-white/10">
                                            <Loader2 size={10} className="animate-spin" />
                                            Verification Pending
                                        </div>
                                    )}
                                    {friend.is_field_verified && (
                                        <div className="absolute top-0 right-0 py-1 px-3 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm z-10 flex items-center gap-1.5 border-b border-l border-white/10">
                                            <Check size={10} />
                                            Verified & Released
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-6 pt-2">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                {friend.name}
                                                {friend.is_field_verified && <Check className="text-emerald-500" size={14} />}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{friend.mobile}</p>
                                        </div>
                                        <div className="flex gap-4 text-right">
                                            {activeTab === 'QR' ? (
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Signup Earn</p>
                                                    <p className={`text-xs font-black ${friend.is_field_verified ? 'text-emerald-600' : 'text-amber-500'}`}>{Number(friend.signup_bonus || 0).toFixed(0)}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Earn</p>
                                                    <p className={`text-xs font-black ${friend.is_field_verified ? 'text-indigo-600' : 'text-amber-500'}`}>{Number(friend.loan_bonus || 0).toFixed(0)}</p>
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
                                                {friend.type === 'LOAN' ? <HistoryIcon size={11} /> : <QrCode size={11} />}
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
                        )}
                    </div>
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
