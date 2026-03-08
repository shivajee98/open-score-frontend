'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Briefcase, FileText, CheckCircle, Clock, XCircle, ShieldCheck, QrCode, UploadCloud, Coins, ArrowRight, Lock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from '@/components/ui/Toast';

export default function MyWorkDashboard() {
    const router = useRouter();
    const { data: user, isLoading, mutate } = useApi('/auth/me');
    
    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'qr'>('profile');

    const kycStatus = user?.kyc_verification?.status || 'Missing';
    const isKycApproved = kycStatus === 'approved';
    const profile = user?.team_profile;

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
                            <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">{profile ? 'Active Employee' : 'Not Linked Yet'}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-white">
                            <Briefcase size={24} />
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
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                                        {profile.photo ? (
                                            <img src={`https://api.msmeloan.sbs${profile.photo}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold block">{profile.profile_name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900">{profile.profile_name}</p>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{profile.working_location}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Joining Date</p>
                                        <p className="text-sm font-bold text-slate-900">{profile.joining_date}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Alt Contact</p>
                                        <p className="text-sm font-bold text-slate-900">{profile.alternate_number || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* View ID Card Button - Locked if KYC pending */}
                                <div className="mt-4">
                                    <button 
                                        disabled={!isKycApproved}
                                        className={`w-full py-3 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${
                                            isKycApproved 
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-70 cursor-not-allowed'
                                        }`}
                                    >
                                        <FileText size={16} /> Digital I-Card
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
                        
                        {/* Earnings Section Placeholder */}
                        {isKycApproved && (
                             <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Earnings</h3>
                                    <Coins size={16} className="text-amber-500" />
                                </div>
                                <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Available to Transfer</p>
                                    <p className="text-3xl font-black mt-1">₹{user?.team_earnings || 0}</p>
                                    
                                    <button 
                                        onClick={async () => {
                                            const amt = window.prompt("Enter amount to transfer to your Wallet from Earnings:");
                                            if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) return;
                                            
                                            try {
                                                const res = await apiFetch('/auth/team/transfer-earnings', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ amount: Number(amt) })
                                                });
                                                if (res.error) throw new Error(res.error);
                                                toast.success(res.message || "Transfer requested successfully");
                                                mutate();
                                            } catch (e: any) {
                                                toast.error(e.message || "Transfer failed");
                                            }
                                        }}
                                        className="mt-4 w-full py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors active:scale-95"
                                    >
                                        Request Transfer <ArrowRight size={14} />
                                    </button>
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
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'].map((doc) => {
                                    const docLabel = doc.replace('_', ' ');
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
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleUploadDoc} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                                                        <UploadCloud size={14} /> Upload
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadDoc} />
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
                                        Documents are reviewed by your Agent. Once all 4 documents are uploaded, they will be sent for review automatically.
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
                            <QrBookingForm onRefresh={() => mutate()} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function QrBookingForm({ onRefresh }: { onRefresh: () => void }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        address: '',
        city: '',
        pin_code: '',
        landmark: '',
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
            fd.append('address', form.address);
            fd.append('city', form.city);
            fd.append('pin_code', form.pin_code);
            fd.append('landmark', form.landmark);
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
            <p className="text-xs font-medium text-slate-500 mb-6">Order a standee QR code for your business location.</p>
            
            {/* Progress Bar */}
            <div className="flex items-center mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
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
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Landmark (Optional)</label>
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
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Select Security Deposit</label>
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
                            <h4 className="font-bold text-amber-900 text-sm">Pay Deposit Now directly from Wallet or UPI</h4>
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
