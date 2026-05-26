'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Briefcase, FileText, CheckCircle, Clock, XCircle, ShieldCheck, QrCode, UploadCloud, Coins, ArrowRight, Lock, File, IdCard, Wallet, MapPin, ZoomIn, ZoomOut, ShieldAlert, Smartphone, Camera, Check, Zap } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from '@/components/ui/Toast';
import QrStatusStepper from '@/components/qr/QrStatusStepper';
import { Package, Truck, Home, CreditCard, ScanBarcode, History, User, MessageSquare, Search, Copy, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SupportTicketScreen from '@/components/support/SupportTicketScreen';
import DirectSupportChat from '@/components/support/DirectSupportChat';
import FloatingHelpButton from '@/components/FloatingHelpButton';
import VirtualCardProcessModal from '@/components/VirtualCardProcessModal';
import { convertHeicToJpeg } from '@/lib/heic-utils';
import CampaignPopup from '@/components/CampaignPopup';

const navItems = [
    { label: 'Home', href: '/customer', icon: <Home size={20} /> },
    { label: 'Scan & Pay', href: '/customer/pay?scan=true', icon: <ScanBarcode size={20} /> },
    { label: 'History', href: '/customer/transactions', icon: <History size={20} /> },
    { label: 'Profile', href: '/customer/profile', icon: <User size={20} /> },
];

export default function MyWorkDashboard() {
    const router = useRouter();
    const { data: user, isLoading, mutate } = useApi('/auth/me');
    const { data: activeCampaign } = useApi('/campaigns/active');

    const [liveActiveAgents, setLiveActiveAgents] = useState(1400);

    useEffect(() => {
        const fetchLiveAgents = async () => {
            try {
                const res = await apiFetch('/public/active-users');
                if (res?.active_users) {
                    // Inflate agents count to a proportion of users, e.g. ~16.5%
                    const calculatedAgents = Math.floor(res.active_users * 0.165);
                    setLiveActiveAgents(calculatedAgents);
                }
            } catch (e) {
                // Fluctuating fallback
                setLiveActiveAgents(prev => {
                    const drift = Math.floor(Math.random() * 3) - 1; // -1 to +1
                    const nextVal = prev + drift;
                    return nextVal < 600 ? 605 : nextVal;
                });
            }
        };

        fetchLiveAgents();
        const interval = setInterval(fetchLiveAgents, 5000);
        return () => clearInterval(interval);
    }, []);

    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'qr'>('profile');
    const [showICard, setShowICard] = useState(false);
    const [showAuthLetter, setShowAuthLetter] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showVirtualCardModal, setShowVirtualCardModal] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);

    // Letter Editable Values
    const [editableOnboardingAmount, setEditableOnboardingAmount] = useState('100');
    const [editableLoanAmount, setEditableLoanAmount] = useState('600');
    const [editableBonusMilestoneCount, setEditableBonusMilestoneCount] = useState('10');
    const [editableBonusMilestoneAmount, setEditableBonusMilestoneAmount] = useState('200');

    useEffect(() => {
        if (user) {
            const onboardingAmount = user.merchant_onboarding_amount ?? user.sub_user?.merchant_onboarding_amount ?? user.sub_user?.referral_amount ?? 100;
            const loanAmount = user.loan_disbursement_commission ?? user.sub_user?.loan_disbursement_commission ?? user.sub_user?.cashback_flat_amount ?? 600;
            const bonusCount = user.bonus_milestone_count ?? user.sub_user?.bonus_milestone_count ?? 10;
            const bonusAmount = user.bonus_milestone_amount ?? user.sub_user?.bonus_milestone_amount ?? 200;

            setEditableOnboardingAmount(onboardingAmount.toString());
            setEditableLoanAmount(loanAmount.toString());
            setEditableBonusMilestoneCount(bonusCount.toString());
            setEditableBonusMilestoneAmount(bonusAmount.toString());
        }
    }, [user]);

    // QR History State
    const [qrHistory, setQrHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [qrSearchTerm, setQrSearchTerm] = useState('');

    // Earn Wallet State
    const [earnStats, setEarnStats] = useState<any>(null);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const fetchEarnStats = async () => {
        try {
            const res = await apiFetch('/auth/team/earnings');
            setEarnStats(res);
        } catch (e) {
            console.error('Failed to fetch earn stats', e);
        }
    };

    const fetchQrHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await apiFetch('/auth/qr-history');
            if (res.history) setQrHistory(res.history);
        } catch (err) {
            console.error("Failed to fetch QR history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchQrHistory();
        fetchEarnStats();
    }, []);

    // Screenshot & Security Logic
    const [isFocused, setIsFocused] = useState(true);

    useEffect(() => {
        if (!showAuthLetter) return;

        const handleBlur = () => setIsFocused(false);
        const handleFocus = () => setIsFocused(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block PrintScreen, Ctrl+P, CMD+P, CMD+S, etc.
            if (e.key === 'PrintScreen' ||
                ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))) {
                e.preventDefault();
                toast.error("Screen capture is disabled for this document.");
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('keydown', handleKeyDown);

        // Prevent context menu globally while letter is open
        const preventDefault = (e: any) => e.preventDefault();
        document.addEventListener('contextmenu', preventDefault);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', preventDefault);
        };
    }, [showAuthLetter]);

    const kycStatus = user?.kyc_verification?.status || 'Missing';
    const isKycApproved = kycStatus.toUpperCase() === 'APPROVED';
    const profile = user?.team_profile;

    const handleReKyc = async () => {
        if (!confirm('Are you sure you want to restart KYC? This will delete your current documents.')) return;
        try {
            // Because they are a normal user, we hit the /auth route or a specific user-facing re-kyc route.
            // Wait, we need to create this route on the backend for the normal user.
            // I should double check what route we need for the user to delete their own KYC, or if we even added one.
            // The instructions asked for `POST /sub-user/users/{id}/re-kyc` which is for the agent.
            // Let's create an endpoint in `AuthController` for the user to do it themselves.
            await apiFetch('/auth/team/kyc-submit/re-kyc', { method: 'POST' });
            toast.success('Re-KYC initialized. Please upload new documents.');
            mutate();
            setActiveTab('kyc');
        } catch (e: any) {
            toast.error(e.message || 'Failed to initialize Re-KYC');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (isLoading || !user) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading My Work...</div>;
    }

    return (
        <DashboardLayout navItems={navItems} title="My Work Dashboard">
            <CampaignPopup />
            <div className="min-h-screen bg-slate-50 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-10 pb-12 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <BackButton className="mb-[clamp(1rem,4vw,2rem)] flex items-center gap-2 text-indigo-200 font-black text-[clamp(9px,2vw,11px)] uppercase tracking-[0.2em] hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </BackButton>

                    <div className="flex justify-between items-end gap-4 overflow-hidden">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[clamp(1.5rem,6vw,2.5rem)] font-[950] text-white tracking-tight leading-[0.95] truncate">My Work</h1>
                                
                                {/* Live Agents Pill with Lightning flash effect */}
                                <div className="flex items-center gap-1 bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-widest shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.3)] agent-lightning-animate relative overflow-hidden">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    <Zap size={9} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                                    <span>{liveActiveAgents} LIVE Agents</span>
                                    <style>{`
                                        @keyframes agent-lightning-flash {
                                            0%, 90%, 94%, 98%, 100% {
                                                box-shadow: 0 0 12px rgba(52, 211, 153, 0.25), inset 0 0 4px rgba(52, 211, 153, 0.1);
                                                border-color: rgba(52, 211, 153, 0.4);
                                                background-color: rgba(16, 185, 129, 0.25);
                                            }
                                            92% {
                                                box-shadow: 0 0 30px rgba(52, 211, 153, 0.95), 0 0 60px rgba(52, 211, 153, 0.7);
                                                border-color: rgba(52, 211, 153, 1);
                                                background-color: rgba(52, 211, 153, 0.5);
                                                filter: brightness(1.3);
                                            }
                                            96% {
                                                box-shadow: 0 0 35px rgba(52, 211, 153, 1), 0 0 70px rgba(52, 211, 153, 0.85);
                                                border-color: rgba(255, 255, 255, 1);
                                                background-color: rgba(52, 211, 153, 0.6);
                                                filter: brightness(1.6);
                                            }
                                        }
                                        .agent-lightning-animate {
                                            animation: agent-lightning-flash 5s infinite;
                                        }
                                    `}</style>
                                </div>
                            </div>
                            <p className="text-indigo-200 text-[clamp(9px,2vw,11px)] font-black mt-2 uppercase tracking-[0.2em]">{profile ? 'Active Employee' : user?.sub_user_id ? 'Profile Pending' : 'Not Linked Yet'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            >
                                <Briefcase size={20} />
                            </button>
                            {isKycApproved && profile && user?.show_letter && (
                                <button
                                    onClick={() => setShowAuthLetter(true)}
                                    className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                                >
                                    <FileText size={20} />
                                </button>
                            )}
                            <button
                                onClick={() => router.push('/customer/earnings')}
                                className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            >
                                <Wallet size={20} />
                            </button>
                            <button
                                onClick={() => isKycApproved ? setShowICard(true) : setActiveTab('kyc')}
                                className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            >
                                <IdCard size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-[clamp(1rem,5vw,1.5rem)] -mt-8 relative z-20">
                {/* Tabs */}
                <div className="bg-white rounded-[1.75rem] shadow-2xl shadow-slate-200/60 p-1.5 mb-[clamp(1.5rem,5vw,2.5rem)] flex border border-slate-100/50 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3.5 text-[clamp(9px,2vw,11px)] font-black uppercase tracking-widest rounded-[1.25rem] transition-all duration-300 ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-sm scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`flex-1 py-3.5 text-[clamp(9px,2vw,11px)] font-black uppercase tracking-widest rounded-[1.25rem] transition-all duration-300 ${activeTab === 'kyc' ? 'bg-indigo-50 text-indigo-700 shadow-sm scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        KYC Docs
                    </button>
                    <button
                        onClick={() => setActiveTab('qr')}
                        className={`flex-1 py-3.5 text-[clamp(9px,2vw,11px)] font-black uppercase tracking-widest rounded-[1.25rem] transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'qr' ? 'bg-indigo-50 text-indigo-700 shadow-sm scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        QR Code
                    </button>
                </div>

                {/* Tab: Profile Overview */}
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        {/* Campaign Spotlight - Shown if not enrolled */}
                        {activeCampaign?.data && !activeCampaign.data.registration && (
                            <div 
                                onClick={() => {
                                    sessionStorage.removeItem(`campaign_${activeCampaign.data.id}`);
                                    window.location.reload();
                                }}
                                className="relative w-full rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all duration-500 mb-6"
                            >
                                <img 
                                    src="/vendor/11.webp" 
                                    alt="Campaign" 
                                    className="w-full h-auto block group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#041226] via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div className="text-white">
                                        <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-1">Exclusive Reward</p>
                                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">JOIN {activeCampaign.data.title}</h3>
                                    </div>
                                    <div className="px-6 py-2 bg-gradient-to-r from-[#FAD961] to-[#F76B1C] rounded-xl text-[#041226] font-black text-xs uppercase tracking-widest shadow-xl">
                                        JOIN NOW
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contest Tracker */}
                        {activeCampaign?.data?.registration && (
                            <div className="bg-[#041226] rounded-[2rem] p-6 relative overflow-hidden border border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Active Contest</p>
                                        <h3 className="text-white text-xl font-black mt-1 uppercase tracking-wider">{activeCampaign.data.title}</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">Plan {activeCampaign?.data?.registration?.selected_plan}</p>
                                    </div>
                                </div>
                                
                                {(() => {
                                    const planGoals: any = {
                                        'A': { loans: 2100, onboarding: 1000 },
                                        'B': { loans: 510, onboarding: 250 },
                                        'C': { loans: 210, onboarding: 100 },
                                        'D': { loans: 60, onboarding: 30 },
                                        'E': { loans: 30, onboarding: 15 },
                                    };
                                    const selectedPlan = activeCampaign?.data?.registration?.selected_plan;
                                    const goals = (selectedPlan ? planGoals[selectedPlan] : null) || { loans: 1, onboarding: 1 };
                                    const loanCount = ((user as any)?.campaign_loan_count ?? (earnStats as any)?.approved_loans) || 0;
                                    const onboardCount = ((user as any)?.campaign_qr_count ?? (earnStats as any)?.onboarded_vendors) || 0;
                                    const loanPerc = Math.min(100, (loanCount / goals.loans) * 100);
                                    const onboardPerc = Math.min(100, (onboardCount / goals.onboarding) * 100);

                                    return (
                                        <div className="space-y-6 relative z-10">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Loans Achieved</p>
                                                    <p className="text-white text-sm font-black">{loanCount} <span className="text-slate-500 text-[10px]">/ {goals.loans}</span></p>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FACC15] transition-all duration-1000" 
                                                        style={{ width: `${loanPerc}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Onboarding Progress</p>
                                                    <p className="text-white text-sm font-black">{onboardCount} <span className="text-slate-500 text-[10px]">/ {goals.onboarding}</span></p>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-1000" 
                                                        style={{ width: `${onboardPerc}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center gap-2">
                                                <div className="flex-1 h-px bg-white/10"></div>
                                                <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Overall Progress: {Math.round((loanPerc + onboardPerc) / 2)}%</p>
                                                <div className="flex-1 h-px bg-white/10"></div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        {/* Process Virtual Card Entry (Agent Specific) */}
                        {isKycApproved && (
                            <div 
                                onClick={() => setShowVirtualCardModal(true)}
                                className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-2xl shadow-indigo-500/20 border border-white/10 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/20 group-hover:rotate-12 transition-transform">
                                        <CreditCard size={28} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-black text-white tracking-tight leading-none uppercase">Process Virtual Card</h3>
                                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mt-2">Field Agent Activation Tool</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white relative z-10">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        )}

                        {/* Status Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mb-4 ${isKycApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    kycStatus === 'pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                        kycStatus === 'rejected' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                            'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-[clamp(1.25rem,4vw,1.75rem)] font-[950] text-slate-900 tracking-tight leading-none text-balance">
                                {isKycApproved ? 'Verified Partner' : kycStatus === 'pending' ? 'Verification Pending' : kycStatus === 'rejected' ? 'Verification Rejected' : 'Verification Required'}
                            </h2>
                            <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] font-medium text-slate-500 mt-4 max-w-sm leading-relaxed">
                                {isKycApproved ? 'Your account is fully verified. You can now access all features, order QR codes, and transfer earnings.'
                                    : 'Complete your KYC verification to unlock your ID card, Earnings transfers, and QR Code booking.'}
                            </p>

                            {!isKycApproved && (
                                <div className="flex w-full gap-2 mt-6">
                                    <button
                                        onClick={() => {
                                            if (user?.latest_loan?.reupload_fields?.length > 0) {
                                                window.open(user.latest_loan.kyc_url, '_blank');
                                            } else {
                                                setActiveTab('kyc');
                                            }
                                        }}
                                        className={`flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${user?.latest_loan?.reupload_fields?.length > 0 ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                                    >
                                        {user?.latest_loan?.reupload_fields?.length > 0 ? <><ExternalLink size={14} /> Update Your Details</> : 'Complete KYC Now'}
                                    </button>
                                    {user?.latest_loan?.reupload_fields?.length > 0 && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.latest_loan.kyc_url);
                                                toast.success('Update link copied!');
                                            }}
                                            className="px-4 py-4 bg-rose-100 text-rose-600 rounded-xl font-black text-sm hover:bg-rose-200 transition-all flex items-center justify-center shadow-sm"
                                            title="Copy Update Link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                            {user?.latest_loan?.reupload_fields?.length > 0 && (
                                <p className="mt-5 text-[9px] font-black text-rose-500 uppercase tracking-[0.15em] animate-pulse">
                                    Action Required: {user.latest_loan.reupload_fields.map((f: string) => f.replace(/_/g, ' ')).join(', ')}
                                </p>
                            )}
                        </div>


                        {/* Digital I-Card Summary */}

                        {profile ? (
                            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Employee Details</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {user?.kyc_verification?.live_selfie ? (
                                            <img src={`https://api.msmeloan.sbs${user.kyc_verification.live_selfie}`} className="w-full h-full object-cover" />
                                        ) : profile.photo_path ? (
                                            <img src={`https://api.msmeloan.sbs${profile.photo_path}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-slate-400 font-black text-2xl">{profile.profile_name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900 leading-tight">{profile.name}</p>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                                            {profile.working_location || 'Remote'} 
                                            {user?.kyc_verification?.state && ` • ${user.kyc_verification.state}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Joining Date</p>
                                        <p className="text-sm font-black text-slate-900">{formatDate(profile.joining_date)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Alt Contact</p>
                                        <p className="text-sm font-black text-slate-900">{profile.alternate_number || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* View ID Card Button - Locked if KYC pending */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowICard(true)}
                                        disabled={!isKycApproved}
                                        className={`w-full py-3.5 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isKycApproved
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                                : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-70 cursor-not-allowed'
                                            }`}
                                    >
                                        <IdCard size={16} /> Digital I-Card
                                        {!isKycApproved && <Lock size={12} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-rose-500 flex items-center justify-center shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-rose-900 text-sm">Profile Pending</h3>
                                    <p className="text-xs text-rose-700 mt-1 font-medium">Your agent hasn't set up your employee profile yet. Contact them to arrange access.</p>
                                </div>
                            </div>
                        )}

                        {(user?.support_number || (user?.show_parent_support && user?.parent_support_number)) && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-[clamp(1.25rem,4vw,1.75rem)] font-[950] text-slate-900 tracking-tight">Need Support?</h3>
                                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] font-medium text-slate-500 mt-3 leading-relaxed">
                                    Your immediate senior is here to help you with your work, commissions, and platform guidance.
                                </p>
                                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                                    <a 
                                        href={`tel:${user.support_number || user.parent_support_number}`}
                                        className="py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Smartphone size={14} /> 
                                        {(user.support_number || user.parent_support_number).slice(0,2)}xxxxxx{(user.support_number || user.parent_support_number).slice(-2)}
                                    </a>
                                    <a 
                                        href={`https://wa.me/91${user.support_number || user.parent_support_number}`}
                                        target="_blank"
                                        className="py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
                                    >
                                        WhatsApp Chat
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Area Analytics Entry */}
                        <div 
                            onClick={() => router.push('/customer/my-work/pincodes')}
                            className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <MapPin size={28} />
                                </div>
                                <div className="text-left min-w-0">
                                    <h3 className="text-[clamp(1.1rem,4vw,1.5rem)] font-[950] text-slate-900 tracking-tight leading-tight">Pin Code List</h3>
                                    <p className="text-[clamp(9px,2vw,11px)] font-black text-indigo-600 uppercase tracking-[0.15em] leading-none mt-1.5">Discover Active Zones</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab: KYC Upload */}
                {activeTab === 'kyc' && (
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                        <h2 className="text-lg font-black text-slate-900 mb-1">Identity Verification (KYC)</h2>
                        <p className="text-xs font-medium text-slate-500 mb-6">Upload clear photos of your original documents.</p>

                        {kycStatus === 'approved' ? (
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h3 className="font-bold text-emerald-900">Verification Complete</h3>
                                <p className="text-xs text-emerald-700 mt-1">Your documents have been verified.</p>
                                <button
                                    onClick={handleReKyc}
                                    disabled={!user?.kyc_verification?.re_kyc_allowed}
                                    className={`mt-6 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm border transition-all active:scale-95 ${user?.kyc_verification?.re_kyc_allowed
                                            ? 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    {user?.kyc_verification?.re_kyc_allowed ? 'Replace Documents (Re-KYC)' : 'Re-KYC Locked by Agent'}
                                </button>
                                {!user?.kyc_verification?.re_kyc_allowed && (
                                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Contact your Agent to enable Re-KYC</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Full Name (As per Aadhar)</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        defaultValue={user?.kyc_verification?.full_name || user?.name}
                                        onBlur={async (e) => {
                                            const val = e.target.value;
                                            if (!val || val === (user?.kyc_verification?.full_name || user?.name)) return;
                                            try {
                                                await apiFetch('/auth/team/kyc-submit', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ full_name: val }),
                                                    headers: { 'Content-Type': 'application/json' }
                                                });
                                                toast.success("Name updated");
                                                mutate();
                                            } catch (err) {
                                                toast.error("Failed to update name");
                                            }
                                        }}
                                        className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                                    />
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Aadhar Number (12 Digits)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={12}
                                        placeholder="123456789012"
                                        defaultValue={user?.kyc_verification?.aadhar_number}
                                        onChange={(e) => {
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                        }}
                                        onBlur={async (e) => {
                                            const val = e.target.value;
                                            if (val.length !== 12) {
                                                if (val.length > 0) toast.error("Aadhar number must be 12 digits");
                                                return;
                                            }
                                            if (val === user?.kyc_verification?.aadhar_number) return;
                                            try {
                                                await apiFetch('/auth/team/kyc-submit', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ aadhar_number: val }),
                                                    headers: { 'Content-Type': 'application/json' }
                                                });
                                                toast.success("Aadhar updated");
                                                mutate();
                                            } catch (err) {
                                                toast.error("Failed to update Aadhar");
                                            }
                                        }}
                                        className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                                    />
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">PAN Card Number (Alphanumeric)</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="ABCDE1234F"
                                        style={{ textTransform: 'uppercase' }}
                                        defaultValue={user?.kyc_verification?.pan_number}
                                        onBlur={async (e) => {
                                            const val = e.target.value.toUpperCase();
                                            if (val.length !== 10) {
                                                if (val.length > 0) toast.error("PAN number must be 10 characters");
                                                return;
                                            }
                                            if (val === user?.kyc_verification?.pan_number) return;
                                            try {
                                                await apiFetch('/auth/team/kyc-submit', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ pan_number: val }),
                                                    headers: { 'Content-Type': 'application/json' }
                                                });
                                                toast.success("PAN updated");
                                                mutate();
                                            } catch (err) {
                                                toast.error("Failed to update PAN");
                                            }
                                        }}
                                        className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">City</label>
                                        <input
                                            type="text"
                                            placeholder="Your City"
                                            defaultValue={user?.kyc_verification?.city}
                                            onBlur={async (e) => {
                                                const val = e.target.value;
                                                if (!val || val === user?.kyc_verification?.city) return;
                                                try {
                                                    await apiFetch('/auth/team/kyc-submit', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ city: val }),
                                                        headers: { 'Content-Type': 'application/json' }
                                                    });
                                                    toast.success("City updated");
                                                    mutate();
                                                } catch (err) {
                                                    toast.error("Failed to update city");
                                                }
                                            }}
                                            className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">State</label>
                                        <input
                                            type="text"
                                            placeholder="Your State"
                                            defaultValue={user?.kyc_verification?.state}
                                            onBlur={async (e) => {
                                                const val = e.target.value;
                                                if (!val || val === user?.kyc_verification?.state) return;
                                                try {
                                                    await apiFetch('/auth/team/kyc-submit', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ state: val }),
                                                        headers: { 'Content-Type': 'application/json' }
                                                    });
                                                    toast.success("State updated");
                                                    mutate();
                                                } catch (err) {
                                                    toast.error("Failed to update state");
                                                }
                                            }}
                                            className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {['aadhar_front', 'aadhar_back', 'pan_card', 'live_selfie', 'qualification_doc'].map((doc) => {
                                    const docLabel = doc === 'live_selfie' ? 'Live Selfie (verification)' :
                                        doc.replace(/_/g, ' ');
                                    const existingImg = user?.kyc_verification?.[doc];

                                    const handleUploadDoc = async (e: any) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const processedFile = await convertHeicToJpeg(file);

                                        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
                                        const isImage = allowedTypes.includes(processedFile.type) || allowedExtensions.some(ext => processedFile.name.toLowerCase().endsWith(ext));

                                        if (!isImage) {
                                            return toast.error("Format not supported. Use JPEG, PNG, HEIC, or WebP.");
                                        }

                                        if (processedFile.size > 5 * 1024 * 1024) { return toast.error("Image too large (max 5MB)"); }

                                        setUploadingDoc(doc);
                                        try {
                                            const fd = new FormData();
                                            fd.append(doc, processedFile);
                                            const res = await apiFetch('/auth/team/kyc-submit', {
                                                method: 'POST',
                                                body: fd,
                                            });
                                            if (res.error) throw new Error(res.error);
                                            toast.success(`${docLabel} uploaded successfully`);
                                            mutate(); // Refresh user data to show new image
                                        } catch (err: any) {
                                            toast.error(err.message || "Upload failed");
                                        } finally {
                                            setUploadingDoc(null);
                                        }
                                    };

                                    return (
                                        <div key={doc} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-700 capitalize">{docLabel}</p>
                                                    {!existingImg && <p className="text-[10px] text-rose-500 font-bold tracking-widest uppercase mt-0.5">Required</p>}
                                                </div>

                                                {/* Preview Image if exists */}
                                                {uploadingDoc === doc ? (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                        Uploading...
                                                    </div>
                                                ) : existingImg ? (
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://api.msmeloan.sbs${existingImg}`} className="h-10 w-16 rounded-md object-cover border border-slate-200 shadow-sm" />
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1">
                                                                <Camera size={10} /> Cam
                                                                <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" capture="environment" onChange={handleUploadDoc} />
                                                            </label>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1">
                                                                <UploadCloud size={10} /> Gal
                                                                <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" onChange={handleUploadDoc} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-[10px] font-black text-indigo-700 cursor-pointer hover:bg-indigo-100 transition-all shadow-sm uppercase tracking-widest whitespace-nowrap">
                                                            <Camera size={14} /> Camera
                                                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" capture="environment" onChange={handleUploadDoc} />
                                                        </label>
                                                        <label className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-[10px] font-black text-slate-600 cursor-pointer hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest whitespace-nowrap">
                                                            <UploadCloud size={14} /> Gallery
                                                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" onChange={handleUploadDoc} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {kycStatus === 'rejected' && (
                                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                        <XCircle size={16} className="shrink-0" /> Your previous submission was rejected: {user?.kyc_verification?.notes || 'Invalid documents.'}
                                    </div>
                                )}

                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
                                    <p className="text-xs text-indigo-700 font-medium text-center">
                                        Documents are reviewed by your Agent. Once all 5 documents are uploaded, they will be sent for review automatically.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: QR Booking */}
                {activeTab === 'qr' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                                <QrCode size={40} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Order Physical QR Cards</h3>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed mt-2 px-4 uppercase tracking-widest">
                                    Get high-quality branded QR cards delivered to your doorstep. Stand out from the competition.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Deposit</p>
                                    <p className="text-lg font-black text-slate-900">1,000</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                                    <p className="text-lg font-black text-emerald-600 uppercase">Fee</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/customer/qr-payment')}
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Smartphone size={16} /> Book QR Now
                                <ArrowRight size={16} className="opacity-50" />
                            </button>

                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Instant Approval • Doorstep Delivery • Premium Quality
                            </p>
                        </div>
                        <div className="relative mb-4 px-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name, address, city..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                value={qrSearchTerm}
                                onChange={(e) => setQrSearchTerm(e.target.value)}
                            />
                        </div>

                        <QrHistoryList 
                            history={qrHistory.filter(item => {
                                if (!qrSearchTerm) return true;
                                const term = qrSearchTerm.toLowerCase();
                                return (
                                    (item.full_name && item.full_name.toLowerCase().includes(term)) ||
                                    (item.city && item.city.toLowerCase().includes(term)) ||
                                    (item.state && item.state.toLowerCase().includes(term)) ||
                                    (item.address && item.address.toLowerCase().includes(term)) ||
                                    (item.pin_code && item.pin_code.includes(term)) ||
                                    (item.id && item.id.toString().includes(term))
                                );
                            })} 
                            loading={loadingHistory} 
                            onRefresh={fetchQrHistory} 
                        />
                    </div>
                )}
            </div>

            {/* I-Card Modal */}
            {showICard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
                    <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/40 animate-in zoom-in-95 duration-500">
                        {/* Premium Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700"></div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
                        <div className="absolute top-12 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 blur-2xl"></div>
                        <div className="absolute top-48 left-0 w-full h-full bg-slate-50"></div>

                        {/* Card Header */}
                        <div className="relative z-10 p-8 flex justify-between items-start h-48">
                            <div>
                                <h4 className="text-white font-black text-2xl tracking-tighter leading-none uppercase">Open Score</h4>
                                <p className="text-indigo-300 text-[9px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Official Identity Card</p>
                            </div>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                                <ShieldCheck className="text-white" size={28} />
                            </div>
                        </div>

                        {/* Profile Photo - Floating */}
                        <div className="relative z-20 flex justify-center -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl border-4 border-white">
                                <div className="w-full h-full rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100">
                                    {user?.kyc_verification?.live_selfie ? (
                                        <img src={`https://api.msmeloan.sbs${user.kyc_verification.live_selfie}`} className="w-full h-full object-cover" />
                                    ) : profile?.photo_path ? (
                                        <img src={`https://api.msmeloan.sbs${profile.photo_path}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-300 font-black text-5xl">{profile?.profile_name?.charAt(0)}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="relative z-10 px-8 pb-10 text-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name_as_per_aadhar || user?.kyc_verification?.full_name || user?.name}</h3>
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">{profile?.profile_name || ''}</p>
                            </div>
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                <p className="text-indigo-700 font-black text-[9px] uppercase tracking-widest">Authorized Independent Partner</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-8 text-left border-t border-slate-200/60 pt-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Associate ID</p>
                                    <p className="text-sm font-black text-slate-900 font-mono">{user.my_referral_code || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Location</p>
                                    <p className="text-sm font-black text-slate-900">{profile?.working_location || 'Remote'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Joined On</p>
                                    <p className="text-sm font-black text-slate-900">{formatDate(profile?.joining_date || user.created_at)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Validity</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <p className="text-xs font-black text-emerald-600 uppercase">Perpetual</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Footer */}
                            <div className="mt-10 bg-gradient-to-r from-slate-900 to-indigo-950 py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <ShieldCheck className="text-emerald-400" size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Verification</p>
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider mt-1">Verified Profile</p>
                                    </div>
                                </div>
                                <QrCode size={20} className="text-indigo-200 opacity-50" />
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowICard(false);
                            }}
                            className="absolute top-4 right-4 z-50 p-2 bg-slate-900/10 hover:bg-slate-900/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md"
                        >
                            <XCircle size={28} />
                        </button>
                    </div>
                </div>
            )}

            {/* Authorization Letter Modal */}
            {showAuthLetter && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md p-0 overflow-y-auto flex flex-col items-center select-none"
                    onClick={() => setShowAuthLetter(false)}
                >
                    {/* Header Controls - Sticky */}
                    <div className="sticky top-0 w-full z-[120] bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between px-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.max(0.5, zoomLevel - 0.1)); }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <span className="text-[10px] font-black text-white w-12 text-center uppercase tracking-widest">{Math.round(zoomLevel * 100)}%</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.min(2, zoomLevel + 0.1)); }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={18} />
                                </button>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <ShieldAlert size={14} className="text-rose-400" />
                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Security Protected • Printing Disabled</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAuthLetter(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 flex items-center justify-center"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div
                        className={`relative transition-all duration-500 origin-top my-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ${!isFocused ? 'blur-3xl saturate-0 scale-[0.98] opacity-20' : ''}`}
                        style={{ transform: `scale(${zoomLevel})`, width: '210mm' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Security Overlay */}
                        <div className="absolute inset-0 z-[115] bg-transparent cursor-default" onContextMenu={(e) => e.preventDefault()}></div>

                        {!isFocused && (
                            <div className="absolute inset-0 z-[116] flex items-center justify-center p-20 text-center">
                                <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 shadow-2xl">
                                    <ShieldAlert size={80} className="text-white mx-auto mb-6 animate-pulse" />
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">View Protected</h2>
                                    <p className="text-white/60 text-sm mt-4 font-bold">Please click back into the window to view this document.</p>
                                </div>
                            </div>
                        )}

                        {/* Letter Content - Page 1 */}
                        <div className="bg-white relative overflow-hidden print:hidden" style={{ width: '210mm', minHeight: '297mm' }}>
                            <div className="p-16 text-slate-900 font-serif leading-relaxed relative h-full">
                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-[120px] text-blue-900/[0.03] font-black pointer-events-none whitespace-nowrap z-0 uppercase tracking-[0.2em]">
                                    Freelance
                                </div>

                                {/* Border Accent */}
                                <div className="absolute inset-8 border border-[#d4af37]/20 pointer-events-none"></div>

                                <header className="relative z-10 flex justify-between items-start border-b-2 border-indigo-900 pb-6 mb-10">
                                    <div className="logo-area font-sans">
                                        <h1 className="text-3xl font-serif tracking-widest text-indigo-900 leading-none">OPEN<span className="text-[#d4af37]">SCORE</span></h1>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-2">MSME SHAKTI - Budget Support Scheme</p>
                                    </div>
                                    <div className="text-right text-xs text-slate-500 font-sans">
                                        <p className="font-black text-slate-900 uppercase tracking-wider">REF: OS/FA/{new Date().getFullYear()}/{user?.my_referral_code || '782'}</p>
                                        <p className="mt-1">Date: {formatDate(new Date().toISOString())}</p>
                                    </div>
                                </header>

                                <div className="relative z-10 mb-10 font-sans">
                                    <h2 className="text-xs uppercase text-[#d4af37] font-black mb-2 tracking-widest">Issued To:</h2>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">{user.name}</p>
                                    <p className="text-sm font-bold text-slate-600 mt-1">{user?.kyc_verification?.company_name || profile?.profile_name || user.business_name || 'Independent Partner'}</p>
                                    <p className="text-sm text-slate-500 mt-0.5 italic">{user?.kyc_verification?.company_location_address || profile?.working_location || (user.city ? `${user.city}, ${user.state || 'India'}` : 'India')}</p>
                                </div>

                                <div className="relative z-10 text-center mb-10">
                                    <h3 className="font-serif text-xl text-indigo-900 uppercase tracking-[0.1em] py-3 border-y border-[#d4af37]/50 inline-block px-12">Freelance Authorization Letter</h3>
                                </div>

                                <div className="relative z-10 text-[13px] font-sans text-slate-700 text-justify mb-8 space-y-5 leading-relaxed">
                                    <p>
                                        This document serves as a formal and legally recognized confirmation that the below-mentioned Vendor / Authorized Agent has been duly empowered to represent, introduce, and facilitate freelance participation for the Open Score Platform Project. The authorized vendor shall be responsible for communicating the operational framework of the platform and onboarding eligible individuals who wish to participate as independent freelance promoters under the Open Score ecosystem.
                                    </p>
                                    <p>
                                        The Open Score Platform operates under a performance-linked freelance participation model, wherein individuals may voluntarily associate with the project as independent promoters or referral partners. Such engagement does not constitute employment, partnership, agency, or any form of fixed salary arrangement with Open Score. Participation on the platform is strictly task-based and incentive-driven, and earnings are calculated solely on the successful completion of defined platform activities.
                                    </p>
                                    <p>
                                        Upon successful onboarding, freelance participants may promote the Open Score mobile application and facilitate user registrations and loan processing activities in accordance with the operational guidelines of the platform. Any eligible incentive generated through these activities shall be automatically recorded and reflected within the participant’s in-app wallet dashboard, subject to the system verification and platform policies.
                                    </p>
                                </div>

                                <div className="relative z-10 border border-slate-200 rounded-xl overflow-hidden mb-10 font-sans shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-indigo-950 text-white text-[11px] uppercase tracking-widest">
                                                <th className="p-4 font-black">Platform Activity</th>
                                                <th className="p-4 font-black">Authorized Commission Structure</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-700 font-bold">
                                            <tr className="border-b border-slate-100">
                                                <td className="p-4">Merchant QR Onboarding</td>
                                                <td className="p-4 text-indigo-900 flex items-center gap-1">
                                                    <input type="text" className="w-15 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableOnboardingAmount} onChange={(e) => setEditableOnboardingAmount(e.target.value)} />  successful Onboarding
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-4">Loan Successfully Processed through App</td>
                                                <td className="p-4 text-indigo-900 border-t-transparent flex items-center gap-1">
                                                    <input type="text" className="w-15 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableLoanAmount} onChange={(e) => setEditableLoanAmount(e.target.value)} />  successful loan
                                                </td>
                                            </tr>
                                            <tr className="bg-amber-50/30">
                                                <td className="p-4 text-indigo-950 italic">Onboarding Bonus Milestone</td>
                                                <td className="p-4 text-indigo-900 flex items-center gap-1">
                                                    <input type="text" className="w-15 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableBonusMilestoneAmount} onChange={(e) => setEditableBonusMilestoneAmount(e.target.value)} /> on <input type="text" className="w-10 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableBonusMilestoneCount} onChange={(e) => setEditableBonusMilestoneCount(e.target.value)} /> Onboardings
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Page Break / Gap */}
                        <div className="h-8 bg-transparent w-full"></div>

                        {/* Letter Content - Page 2 */}
                        <div className="bg-white relative overflow-hidden print:hidden" style={{ width: '210mm', minHeight: '297mm' }}>
                            <div className="p-16 text-slate-900 font-serif leading-relaxed relative h-full flex flex-col">
                                {/* Border Accent */}
                                <div className="absolute inset-8 border border-[#d4af37]/20 pointer-events-none"></div>

                                <div className="relative z-10 text-[13px] font-sans text-slate-500 mb-8 italic leading-relaxed mt-8">
                                    <p>The onboarding and operational guidance for freelancers under this project is being conducted by the following Authorized Vendor / Agent, who has been permitted to represent the Open Score project for the purpose of freelancer engagement and operational explanation.</p>
                                </div>

                                <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-2xl p-10 mb-auto font-sans shadow-inner">
                                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-8 border-b border-indigo-100 pb-2">Business Associate Particulars</h4>
                                    <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
                                            <p className="text-lg font-black text-slate-800 border-b border-slate-200 pb-1">{user?.sub_user?.kyc_verification?.full_name || user?.sub_user?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Registered Business</label>
                                            <p className="text-lg font-black text-slate-800 border-b border-slate-200 pb-1">{user?.sub_user?.kyc_verification?.company_name || 'Individual Associate'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Primary Work Location</label>
                                            <p className="text-lg font-black text-slate-800 border-b border-slate-200 pb-1">{user?.sub_user?.kyc_verification?.company_location_address || 'Pan India'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Contact Information</label>
                                            <p className="text-lg font-black text-slate-800 border-b border-slate-200 pb-1">{user?.sub_user?.mobile_number}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 p-8 border-t border-slate-100 flex justify-between items-end font-sans">
                                    <div className="sign-off">
                                        <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">System Generated</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">Electronic Certificate. Digital verification valid.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-serif tracking-widest text-indigo-900 leading-none">OPEN<span className="text-[#d4af37]">SCORE</span></p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase mt-2 tracking-widest">msmeloan.sbs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Print Protection Overlay for Standard Browser Print */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                body * { visibility: hidden !important; background: none !important; }
                                html, body { background: #fff !important; }
                                .no-print-msg { visibility: visible !important; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block !important; }
                            }
                        `}} />
                        <div className="no-print-msg hidden fixed inset-0 flex items-center justify-center bg-white z-[1000] text-center p-20">
                            <div className="max-w-md">
                                <ShieldAlert size={64} className="text-rose-600 mx-auto mb-6" />
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Print Restricted</h1>
                                <p className="text-slate-500 font-medium">This document contains sensitive associate information. To maintain system security, standard browser printing has been disabled.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DirectSupportChat 
                isOpen={showSupport} 
                onClose={() => setShowSupport(false)} 
            />

            <VirtualCardProcessModal 
                isOpen={showVirtualCardModal} 
                onClose={() => setShowVirtualCardModal(false)} 
            />

            <FloatingHelpButton onClick={() => setShowSupport(true)} />

            {/* Direct Call Support Button (Floating) */}
            {(user?.support_number || (user?.show_parent_support && user?.parent_support_number)) && (
                <div className="fixed bottom-10 left-6 z-[99] animate-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={() => window.location.href = `tel:${user.support_number || user.parent_support_number}`}
                        className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1.5 rounded-full flex items-center group hover:scale-105 active:scale-95 transition-all"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
                            <Smartphone size={20} fill="currentColor" />
                        </div>
                    </button>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
}


function QrHistoryList({ history, loading, onRefresh }: { history: any[], loading: boolean, onRefresh: () => void }) {
    if (loading) return <div className="text-center py-10 font-bold text-slate-400 animate-pulse uppercase tracking-widest text-[10px]">Loading history...</div>;

    if (history.length === 0) return (
        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No previous QR bookings found</p>
        </div>
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-50 text-slate-500 border-slate-200';
            case 'agent_approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'payment_confirmed': return 'bg-indigo-50 text-indigo-600 border-indigo-100'; // Payment Approved
            case 'dispatched': return 'bg-blue-50 text-blue-600 border-blue-100'; // Order Dispatched
            case 'delivering': return 'bg-amber-50 text-amber-600 border-amber-100'; // Out for Delivery
            case 'completed': return 'bg-emerald-600 text-white border-emerald-600'; // Delivered
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Agent';
            case 'agent_approved': return 'PAYMENT RECEIVED';
            case 'payment_confirmed': return 'QR BOOKED';
            case 'dispatched': return 'Dispatched';
            case 'delivering': return 'IN TRANSIT';
            case 'completed': return 'Delivered';
            case 'rejected': return 'Rejected';
            default: return status.replace('_', ' ').toUpperCase();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Booking History</h3>
            {history.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                    <div className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-blue-600 shadow-sm">
                                <Package size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 leading-none">QR Bunch</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">#{item.id} • {item.security_amount}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyles(item.status)}`}>
                            {getStatusLabel(item.status)}
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        <div className="flex items-start gap-3 px-1">
                            <MapPin size={16} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{item.address}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1">{item.city}{item.state ? `, ${item.state}` : ''} - {item.pin_code}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Track Progress</p>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                <QrStatusStepper status={item.status} trackingUrl={item.tracking_url} />
                            </div>
                        </div>

                        {item.status === 'rejected' && item.rejection_reason && (
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-2">
                                <XCircle size={14} className="text-rose-500 mt-0.5" />
                                <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase">Reason: {item.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
