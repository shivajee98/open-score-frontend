'use client';

import BackButton from '@/components/BackButton';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, User, Users, Building2, Search, Check, X, Clock, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Partner = () => {
    const { data: user, error: userError, isLoading: userLoading } = useApi('/auth/me');
    const { data: statusData, mutate: mutateStatus, isLoading: statusLoading } = useApi('/partner/my-status');
    const isMerchant = user?.role === 'MERCHANT';

    const [step, setStep] = useState<'choose' | 'code' | 'confirm'>('choose');
    const [selectedType, setSelectedType] = useState<'agent' | 'vendor' | null>(null);
    const [vendorCode, setVendorCode] = useState('');
    const [vendorPreview, setVendorPreview] = useState<any>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const partnerRequest = statusData?.request;
    const [autoLookupAttempted, setAutoLookupAttempted] = useState(false);

    const handleLookup = async (codeOverride?: string) => {
        const code = (codeOverride || vendorCode).trim().toUpperCase();
        if (!code) return;
        
        setLookupLoading(true);
        try {
            const res = await apiFetch(`/partner/lookup?code=${code}`);
            setVendorPreview(res.vendor);
            if (codeOverride) setVendorCode(code);
            setStep('confirm');
        } catch (e: any) {
            if (!codeOverride) {
                toast.error(e.message || 'Vendor not found');
            }
            setVendorPreview(null);
        } finally {
            setLookupLoading(false);
        }
    };

    // Auto-detect referral code from localStorage on mount
    useEffect(() => {
        const checkAutoCode = async () => {
            if (autoLookupAttempted) return;
            if (partnerRequest?.status === 'pending' || partnerRequest?.status === 'approved') return;
            
            const storedCode = localStorage.getItem('referral_code');
            console.log('[PartnerPage] Checking localStorage for referral_code:', storedCode);
            
            if (storedCode) {
                setAutoLookupAttempted(true);
                const cleanCode = storedCode.trim().toUpperCase();
                setVendorCode(cleanCode);
                
                console.log('[PartnerPage] Attempting auto-lookup for code:', cleanCode);
                try {
                    const res = await apiFetch(`/partner/lookup?code=${cleanCode}`);
                    console.log('[PartnerPage] Auto-lookup success:', res.vendor);
                    setVendorPreview(res.vendor);
                } catch (e: any) {
                    console.error('[PartnerPage] Auto-lookup failed:', e.message);
                }
            } else {
                console.log('[PartnerPage] No code found in localStorage');
            }
        };

        if (statusData !== undefined) { // Wait for status query to complete
            checkAutoCode();
        }
    }, [statusData, autoLookupAttempted, vendorCode]); // Added vendorCode to deps to react to external changes

    // Listen for referral code updates (if page is already open when code is detected)
    useEffect(() => {
        const handleRefUpdate = () => {
            console.log('[PartnerPage] referral_code_updated event received');
            setAutoLookupAttempted(false); // Allow re-attempt
        };
        window.addEventListener('referral_code_updated', handleRefUpdate);
        return () => window.removeEventListener('referral_code_updated', handleRefUpdate);
    }, []);

    // Auto-detect state from existing request
    useEffect(() => {
        if (partnerRequest?.status === 'pending' || partnerRequest?.status === 'approved') {
            setStep('choose'); // Will show status card instead
        }
    }, [partnerRequest]);

    const handleSubmit = async () => {
        if (!selectedType || !vendorCode.trim()) return;
        setSubmitting(true);
        try {
            await apiFetch('/partner/request', {
                method: 'POST',
                body: JSON.stringify({
                    vendor_code: vendorCode.trim().toUpperCase(),
                    type: selectedType,
                }),
            });
            toast.success('Request submitted! The vendor will review it shortly.');
            mutateStatus();
            setStep('choose');
            setSelectedType(null);
            setVendorCode('');
            setVendorPreview(null);
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your partner request?')) return;
        setCancelling(true);
        try {
            await apiFetch('/partner/cancel', { method: 'DELETE' });
            toast.success('Request cancelled.');
            mutateStatus();
        } catch (e: any) {
            toast.error(e.message || 'Failed to cancel request');
        } finally {
            setCancelling(false);
        }
    };

    if (userLoading || statusLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const hasPendingRequest = partnerRequest?.status === 'pending';
    const hasApprovedRequest = partnerRequest?.status === 'approved';
    const hasRejectedRequest = partnerRequest?.status === 'rejected';

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 font-sans">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-12 pb-24 px-4 relative overflow-hidden shadow-2xl`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10 max-w-2xl mx-auto pt-4">
                    <BackButton
                        className="mb-8 flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                    </BackButton>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Become a Partner</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Join the Network</p>
                        </div>
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-slate-300/50 border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full blur-3xl -mr-16 -mt-16`}></div>

                    {/* === STATUS DISPLAY: Pending/Approved/Rejected === */}
                    {(hasPendingRequest || hasApprovedRequest) && (
                        <div className="relative">
                            <div className={`p-6 rounded-2xl border-2 ${hasPendingRequest ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasPendingRequest ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {hasPendingRequest ? <Clock className="w-6 h-6" /> : <Check className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black ${hasPendingRequest ? 'text-amber-900' : 'text-emerald-900'}`}>
                                            {hasPendingRequest ? 'Pending Approval' : 'Request Approved!'}
                                        </h3>
                                        <p className={`text-xs font-bold ${hasPendingRequest ? 'text-amber-600' : 'text-emerald-600'} uppercase tracking-widest`}>
                                            {partnerRequest?.type === 'agent' ? 'Agent Request' : 'Vendor Request'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Vendor</span>
                                        <span className="text-sm font-black text-slate-900">{partnerRequest?.vendor_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Code</span>
                                        <span className="text-sm font-mono font-bold text-slate-700">{partnerRequest?.vendor_code}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Submitted</span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {new Date(partnerRequest?.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {hasPendingRequest && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="w-full mt-2 px-4 py-3 bg-white border border-amber-200 text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50"
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Request'}
                                    </button>
                                )}

                                {hasApprovedRequest && (
                                    <div className="mt-2 p-3 bg-emerald-100 rounded-xl">
                                        <p className="text-xs font-bold text-emerald-800 text-center">
                                            {partnerRequest?.type === 'vendor'
                                                ? '🎉 You are now a vendor! Login to the Agent app to access your dashboard.'
                                                : '🎉 You are now linked as an agent! Your vendor will configure your commission settings.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rejected status - allow re-request */}
                    {hasRejectedRequest && !hasPendingRequest && !hasApprovedRequest && step === 'choose' && (
                        <div className="mb-6 p-5 rounded-2xl border-2 border-rose-200 bg-rose-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600">
                                    <X className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-rose-900">Previous Request Rejected</h3>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                                        {partnerRequest?.type === 'agent' ? 'Agent Request' : 'Vendor Request'} • {partnerRequest?.vendor_name}
                                    </p>
                                </div>
                            </div>
                            {partnerRequest?.reject_reason && (
                                <p className="text-xs font-bold text-rose-700 bg-rose-100 p-3 rounded-xl">
                                    Reason: {partnerRequest.reject_reason}
                                </p>
                            )}
                            <p className="text-xs text-rose-600 mt-3 font-medium">You can submit a new request below.</p>
                        </div>
                    )}

                    {/* === STEP: CHOOSE ROLE === */}
                    {!hasPendingRequest && !hasApprovedRequest && step === 'choose' && (
                        <div className="relative space-y-4">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-black text-slate-900 mb-1">How do you want to join?</h2>
                                <p className="text-xs text-slate-500 font-medium">Choose a role {vendorPreview ? 'to submit your request' : 'and enter the vendor\'s referral code'}</p>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight mt-2 flex items-center justify-center gap-1.5 bg-amber-50 py-1.5 rounded-lg border border-amber-100/50">
                                    <AlertTriangle className="w-3 h-3" /> Final role is determined by the vendor
                                </p>
                            </div>

                            {vendorPreview && (
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em]">Joining Under</p>
                                            <p className="text-sm font-black text-slate-900">{vendorPreview.name}</p>
                                            <p className="text-[10px] font-mono font-bold text-blue-600/60 uppercase">{vendorPreview.referral_code}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { 
                                            setVendorPreview(null); 
                                            setVendorCode(''); 
                                            localStorage.removeItem('referral_code');
                                            setAutoLookupAttempted(false);
                                        }}
                                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 underline underline-offset-4"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            {!vendorPreview && localStorage.getItem('referral_code') && (
                                <button 
                                    onClick={() => setAutoLookupAttempted(false)}
                                    className="w-full py-2 px-4 rounded-xl bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4 hover:bg-blue-200 transition-colors"
                                >
                                    Found Saved Code. Click to Auto-Fill
                                </button>
                            )}

                            {/* Agent Card */}
                            <button
                                onClick={() => { 
                                    setSelectedType('agent'); 
                                    if (vendorPreview) setStep('confirm');
                                    else setStep('code'); 
                                }}
                                className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-slate-900 mb-0.5">Request Agent Role</h3>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            Work under its network. Earn commissions on QR signups and loan disbursals.
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>

                            {/* Vendor Card */}
                            <button
                                onClick={() => { 
                                    setSelectedType('vendor'); 
                                    if (vendorPreview) setStep('confirm');
                                    else setStep('code'); 
                                }}
                                className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-slate-900 mb-0.5">Request Vendor Role</h3>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            Build your own team. Earn margins on your agents&apos; work and build a network.
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* === STEP: ENTER CODE === */}
                    {step === 'code' && (
                        <div className="relative space-y-5">
                            <button
                                onClick={() => { setStep('choose'); setSelectedType(null); setVendorCode(''); }}
                                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-all group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>

                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${selectedType === 'agent' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} text-white shadow-lg`}>
                                    {selectedType === 'agent' ? <User className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
                                </div>
                                <h2 className="text-lg font-black text-slate-900">
                                    Join as {selectedType === 'agent' ? 'Agent' : 'Vendor'}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">Enter the vendor&apos;s referral code</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vendor Referral Code</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        value={vendorCode}
                                        onChange={(e) => setVendorCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. SU8AK3XYZT"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl font-mono text-lg font-bold text-slate-900 tracking-widest text-center focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white"
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleLookup()}
                                disabled={lookupLoading || !vendorCode.trim()}
                                className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                    selectedType === 'agent'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:shadow-blue-600/50'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-600/30 hover:shadow-purple-600/50'
                                }`}
                            >
                                {lookupLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Looking up...
                                    </span>
                                ) : 'Find Vendor'}
                            </button>
                        </div>
                    )}

                    {/* === STEP: CONFIRM === */}
                    {step === 'confirm' && vendorPreview && (
                        <div className="relative space-y-5">
                            <button
                                onClick={() => { setStep('code'); setVendorPreview(null); }}
                                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-all group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>

                            <div className="text-center">
                                <h2 className="text-lg font-black text-slate-900 mb-1">Confirm Request</h2>
                                <p className="text-xs text-slate-500 font-medium">Review the details before submitting</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Vendor Name</span>
                                    <span className="text-sm font-black text-slate-900">{vendorPreview.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Referral Code</span>
                                    <span className="text-sm font-mono font-bold text-slate-700">{vendorPreview.referral_code}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Joining As</span>
                                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                        selectedType === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                        {selectedType}
                                    </span>
                                </div>
                            </div>

                            {selectedType === 'vendor' && !vendorPreview.can_create_vendors && (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-amber-800">
                                        This vendor may not have permission to onboard new vendors. Your request might be declined.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('choose'); setSelectedType(null); setVendorCode(''); setVendorPreview(null); }}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className={`flex-1 py-4 rounded-2xl font-black text-sm text-white transition-all shadow-lg disabled:opacity-50 ${
                                        selectedType === 'agent'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/30'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-600/30'
                                    }`}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                        </span>
                                    ) : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Partner;