'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Users, Gift, TrendingUp, Copy, Check, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import MobileNav from '@/components/MobileNav';

export default function ReferralPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [referralCode, setReferralCode] = useState('');
    const [referralLink, setReferralLink] = useState('');
    const [stats, setStats] = useState({
        total_referrals: 0,
        total_signup_bonus: 0,
        total_loan_bonus: 0,
        total_earnings: 0,
        referrals: []
    });
    const [settings, setSettings] = useState({
        is_enabled: true,
        signup_bonus: 100,
        loan_disbursement_bonus: 250
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            // Fetch my referral code
            const codeData = await apiFetch('/referral/my-code');
            setReferralCode(codeData.referral_code);
            setReferralLink(codeData.referral_link);

            // Fetch my referral stats
            const statsData = await apiFetch('/referral/my-stats');
            setStats(statsData);

            // Fetch referral settings (for display)
            try {
                const settingsData = await apiFetch('/admin/referral-settings');
                setSettings(settingsData);
            } catch (e) {
                // User may not have access to settings, use defaults
                console.log('Cannot fetch settings', e);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Join OpenScore!',
            text: `Use my referral code ${referralCode} and get ₹${settings.signup_bonus} bonus!`,
            url: referralLink
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                handleCopy(referralLink);
            }
        } catch (error) {
            console.log('Share failed', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="max-w-md mx-auto p-4 space-y-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-slate-900">Share & Earn</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Invite friends and earn rewards
                    </p>
                </div>

                {/* Earnings Summary Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
                            <h2 className="text-3xl font-black">₹{stats.total_earnings.toLocaleString('en-IN')}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
                        <div>
                            <p className="text-white/60 text-xs mb-1">Signup Bonus</p>
                            <p className="text-lg font-black">₹{stats.total_signup_bonus.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">Loan Bonus</p>
                            <p className="text-lg font-black">₹{stats.total_loan_bonus.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                {/* Referral Code Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Your Referral Code</p>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xl font-black text-slate-900 tracking-wider text-center">
                            {referralCode}
                        </div>
                        <button
                            onClick={() => handleCopy(referralCode)}
                            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors active:scale-95"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Referral Link
                    </button>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 mb-4">How It Works</h3>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black shrink-0">
                                1
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Share Your Code</h4>
                                <p className="text-slate-500 text-xs">Send your referral code to friends and family</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black shrink-0">
                                2
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">They Sign Up</h4>
                                <p className="text-slate-500 text-xs">
                                    When they register, you earn <span className="font-bold text-green-600">₹{settings.signup_bonus}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black shrink-0">
                                3
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">They Get a Loan</h4>
                                <p className="text-slate-500 text-xs">
                                    When their loan is disbursed, you earn <span className="font-bold text-purple-600">₹{settings.loan_disbursement_bonus}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Statistics */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-900">Your Referrals</h3>
                        <div className="bg-slate-100 px-3 py-1 rounded-full">
                            <span className="text-slate-900 font-black text-sm">{stats.total_referrals}</span>
                        </div>
                    </div>

                    {stats.referrals && stats.referrals.length > 0 ? (
                        <div className="space-y-3">
                            {stats.referrals.map((referral: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {referral.name || referral.mobile || 'User'}
                                            </p>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(referral.joined_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-600 text-sm">
                                            +₹{Number(referral.signup_bonus || 0) + Number(referral.loan_bonus || 0)}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            {referral.type === 'LOAN' ? (referral.has_received_cashback ? 'Loan Disbursed' : 'Loan Applied') : (referral.is_onboarded ? 'Signed Up' : 'Joined')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No referrals yet</p>
                            <p className="text-slate-400 text-xs mt-1">Start sharing your code to earn rewards!</p>
                        </div>
                    )}
                </div>
            </div>

            <MobileNav />
        </div>
    );
}
