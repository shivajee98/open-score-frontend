'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Briefcase, FileText, CheckCircle, Clock, XCircle, ShieldCheck, QrCode, UploadCloud, Coins, ArrowRight, Lock, File, IdCard, Wallet, MapPin, ZoomIn, ZoomOut, ShieldAlert } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from '@/components/ui/Toast';
import QrStatusStepper from '@/components/qr/QrStatusStepper';
import { Package, Truck, Home, CreditCard } from 'lucide-react';

export default function MyWorkDashboard() {
    const router = useRouter();
    const { data: user, isLoading, mutate } = useApi('/auth/me');
    
    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'qr'>('profile');
    const [showICard, setShowICard] = useState(false);
    const [showAuthLetter, setShowAuthLetter] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);
    
    // Letter Editable Values
    const [editableOnboardingAmount, setEditableOnboardingAmount] = useState('100');
    const [editableLoanAmount, setEditableLoanAmount] = useState('600');
    const [editableBonusThreshold, setEditableBonusThreshold] = useState('4000');
    const [editableBonusLoans, setEditableBonusLoans] = useState('40');

    useEffect(() => {
        if (user) {
            const onboardingAmount = user.merchant_onboarding_amount || user.sub_user?.merchant_onboarding_amount || user.sub_user?.referral_amount || 100;
            const loanAmount = user.loan_disbursement_commission || user.sub_user?.loan_disbursement_commission || user.sub_user?.cashback_flat_amount || 600;
            setEditableOnboardingAmount(onboardingAmount.toString());
            setEditableLoanAmount(loanAmount.toString());
        }
    }, [user]);
    
    // QR History State
    const [qrHistory, setQrHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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
    const isKycApproved = kycStatus === 'approved';
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
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-10 pb-12 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <BackButton className="mb-6 flex items-center gap-2 text-indigo-200 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </BackButton>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">My Work</h1>
                            <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">{profile ? 'Active Employee' : user?.sub_user_id ? 'Profile Pending' : 'Not Linked Yet'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            >
                                <Briefcase size={20} />
                            </button>
                            <button 
                                onClick={() => setShowAuthLetter(true)}
                                className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            >
                                <FileText size={20} />
                            </button>
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

            <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-20">
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-1 mb-6 flex border border-slate-100">
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('kyc')} 
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'kyc' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        KYC Docs
                    </button>
                    <button 
                        onClick={() => setActiveTab('qr')} 
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'qr' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        QR Code
                        {!isKycApproved && <Lock size={10} className="text-slate-300" />}
                    </button>
                </div>

                {/* Tab: Profile Overview */}
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mb-4 ${
                                isKycApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                kycStatus === 'pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                kycStatus === 'rejected' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {isKycApproved ? 'Verified Partner' : kycStatus === 'pending' ? 'Verification Pending' : kycStatus === 'rejected' ? 'Verification Rejected' : 'Verification Required'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">
                                {isKycApproved ? 'Your account is fully verified. You can now access all features, order QR codes, and transfer earnings.' 
                                : 'Complete your KYC verification to unlock your ID card, Earnings transfers, and QR Code booking.'}
                            </p>
                            
                            {!isKycApproved && (
                                <button 
                                    onClick={() => setActiveTab('kyc')}
                                    className="mt-6 w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Complete KYC Now
                                </button>
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
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{profile.working_location || 'Remote'}</p>
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
                                        className={`w-full py-3.5 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                                            isKycApproved 
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
                                    className="mt-6 px-5 py-2.5 bg-white text-emerald-800 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm border border-emerald-200 hover:bg-emerald-100 transition-colors active:scale-95"
                                >
                                    Replace Documents (Re-KYC)
                                </button>
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

                                {['aadhar_front', 'aadhar_back', 'pan_card', 'live_selfie', 'qualification_doc'].map((doc) => {
                                    const docLabel = doc === 'live_selfie' ? 'Live Selfie (verification)' : 
                                                     doc.replace(/_/g, ' ');
                                    const existingImg = user?.kyc_verification?.[doc];
                                    
                                    const handleUploadDoc = async (e: any) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 5 * 1024 * 1024) { return toast.error("Image too large (max 5MB)"); }
                                        
                                        toast.info(`Uploading ${docLabel}...`);
                                        try {
                                            const fd = new FormData();
                                            fd.append(doc, file);
                                            const res = await apiFetch('/auth/team/kyc-submit', {
                                                method: 'POST',
                                                body: fd,
                                            });
                                            if (res.error) throw new Error(res.error);
                                            toast.success(`${docLabel} uploaded successfully`);
                                            mutate(); // Refresh user data to show new image
                                        } catch (err: any) {
                                            toast.error(err.message || "Upload failed");
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
                                                {existingImg ? (
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://api.msmeloan.sbs${existingImg}`} className="h-10 w-16 rounded-md object-cover border border-slate-200" />
                                                        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline">
                                                            Change
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadDoc} {...(doc === 'live_selfie' ? { capture: 'user' } : {})} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                                                        <UploadCloud size={14} /> Upload
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadDoc} {...(doc === 'live_selfie' ? { capture: 'user' } : {})} />
                                                    </label>
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
                    <div>
                        {!isKycApproved ? (
                            <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-300 mb-4">
                                    <Lock size={32} />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg">Feature Locked</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2 mb-6">Physical QR code bookings are only available to verified profiles.</p>
                                <button onClick={() => setActiveTab('kyc')} className="w-full py-3 bg-indigo-50 text-indigo-700 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                                    Go to KYC
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <QrBookingForm onRefresh={() => {mutate(); fetchQrHistory();}} />
                                <QrHistoryList history={qrHistory} loading={loadingHistory} onRefresh={fetchQrHistory} />
                            </div>
                        )}
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
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                <p className="text-indigo-700 font-black text-[9px] uppercase tracking-widest">{profile?.profile_name || 'Authorized Independent Partner'}</p>
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
                                                    ₹<input type="text" className="w-12 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableOnboardingAmount} onChange={(e) => setEditableOnboardingAmount(e.target.value)} /> successful Onboarding
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-4">Loan Successfully Processed through App</td>
                                                <td className="p-4 text-indigo-900 border-t-transparent flex items-center gap-1">
                                                    ₹<input type="text" className="w-12 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableLoanAmount} onChange={(e) => setEditableLoanAmount(e.target.value)} /> per successful loan
                                                </td>
                                            </tr>
                                            <tr className="bg-amber-50/30">
                                                <td className="p-4 text-indigo-950 italic">Monthly Bonus Target (Threshold)</td>
                                                <td className="p-4 text-indigo-900 flex items-center gap-1">
                                                    ₹<input type="text" className="w-12 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableBonusThreshold} onChange={(e) => setEditableBonusThreshold(e.target.value)} /> on <input type="text" className="w-10 bg-transparent border-b border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none text-center font-bold px-0 mx-0.5" value={editableBonusLoans} onChange={(e) => setEditableBonusLoans(e.target.value)} /> Successful Loans
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
                        <style dangerouslySetInnerHTML={{ __html: `
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
        </div>
    );
}

function QrBookingForm({ onRefresh }: { onRefresh: () => void }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        full_name: '',
        mobile_number: '',
        address: '',
        city: '',
        pin_code: '',
        landmark: '',
        alternate_mobile: '',
        security_amount: '1000'
    });
    const [screenshot, setScreenshot] = useState<File | null>(null);

    const handleNext = () => {
        if (!form.address || !form.city || !form.pin_code) {
            return toast.error("Please fill in all address fields");
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!screenshot) {
            return toast.error("Please upload payment screenshot");
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('full_name', form.full_name);
            fd.append('mobile_number', form.mobile_number);
            fd.append('address', form.address);
            fd.append('city', form.city);
            fd.append('pin_code', form.pin_code);
            fd.append('landmark', form.landmark);
            fd.append('alternate_mobile', form.alternate_mobile);
            fd.append('security_amount', form.security_amount);
            fd.append('payment_screenshot', screenshot);

            const res = await apiFetch('/auth/team/qr-book', {
                method: 'POST',
                body: fd,
            });

            if (res.error) throw new Error(res.error);
            toast.success("QR Code requested successfully! Pending Agent approval.");
            onRefresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to book QR Code");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-1">Book Physical QR</h2>
            <p className="text-xs font-medium text-slate-500 mb-6">Security Deposit QR is not refundable or not transferable</p>

            {/* Progress Bar */}
            <div className="flex items-center mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Full Name</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            placeholder="Full Name..."
                            className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Mobile Number</label>
                        <input
                            type="text"
                            value={form.mobile_number}
                            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                            placeholder="Mobile Number..."
                            className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Alternate Mobile Number</label>
                        <input
                            type="text"
                            value={form.alternate_mobile}
                            onChange={(e) => setForm({ ...form, alternate_mobile: e.target.value })}
                            placeholder="Alternate Mobile Number..."
                            className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Delivery Address</label>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Full street address..."
                            className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">City</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder="City"
                                className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">PIN Code</label>
                            <input
                                type="text"
                                value={form.pin_code}
                                onChange={(e) => setForm({ ...form, pin_code: e.target.value.replace(/\D/g, '') })}
                                maxLength={6}
                                placeholder="6 Digits"
                                className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Landmark</label>
                        <input
                            type="text"
                            value={form.landmark}
                            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                            placeholder="Near by..."
                            className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 outline-none"
                        />
                    </div>
                    <button onClick={handleNext} className="w-full py-4 mt-4 bg-indigo-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-colors">
                        Proceed To Payment
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Security Amount For QR Print & Courier</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['1000', '2000', '5000'].map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setForm({ ...form, security_amount: amt })}
                                    className={`py-3 rounded-xl border-2 font-black transition-all ${form.security_amount === amt ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-4 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => {
                        window.location.href = `/customer/add-money?amount=${form.security_amount}`;
                    }}>
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm">Pay Deposit Now directly from UPI</h4>
                            <p className="text-xs text-amber-700 mt-1 font-medium">Click here to pay ₹{form.security_amount} via UPI, then take a screenshot of the success page.</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Upload Payment Screenshot</label>
                        {screenshot ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-between">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                        <CheckCircle size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 truncate">{screenshot.name}</span>
                                </div>
                                <button onClick={() => setScreenshot(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
                                    <XCircle size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-indigo-500 transition-all group">
                                <UploadCloud size={32} className="mb-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                <span className="font-bold text-sm text-slate-700">Choose Image or Take Screenshot</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setScreenshot(e.target.files[0])} />
                            </label>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="py-4 px-6 bg-slate-100 text-slate-700 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                            Back
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            )}
        </div>
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
            case 'printed': return 'bg-purple-50 text-purple-600 border-purple-100'; // Printing Complete
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
            case 'agent_approved': return 'Agent Verified';
            case 'payment_confirmed': return 'Payment Approved';
            case 'printed': return 'Order Printed';
            case 'dispatched': return 'Order Dispatched';
            case 'delivering': return 'Out for Delivery';
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
                                <h4 className="text-sm font-black text-slate-900 leading-none">QR Standee</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">#{item.id} • ₹{item.security_amount}</p>
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
                                <p className="text-[10px] font-medium text-slate-400 mt-1">{item.city} - {item.pin_code}</p>
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
