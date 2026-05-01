'use client';

import { useState } from 'react';
import { Search, X, CheckCircle, CreditCard, ArrowRight, User, Smartphone, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface VirtualCardProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VirtualCardProcessModal({ isOpen, onClose }: VirtualCardProcessModalProps) {
    const [mobile, setMobile] = useState('');
    const [checking, setChecking] = useState(false);
    const [customer, setCustomer] = useState<{ name: string; type: string; user_id: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleCheckUser = async () => {
        if (mobile.length !== 10) {
            toast.error('Enter valid 10-digit mobile number');
            return;
        }
        setChecking(true);
        setCustomer(null);
        try {
            const res = await apiFetch(`/vault-cards/check-user?mobile=${mobile}`);
            if (res.error) throw new Error(res.error);
            setCustomer(res);
        } catch (err: any) {
            toast.error(err.message || 'User not found');
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async () => {
        if (!customer) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/vault-cards/request', {
                method: 'POST',
                body: JSON.stringify({ customer_number: mobile }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.error) throw new Error(res.error);
            toast.success('Virtual card request registered successfully!');
            onClose();
            setCustomer(null);
            setMobile('');
        } catch (err: any) {
            toast.error(err.message || 'Failed to register request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <CreditCard size={28} />
                    </div>
                    <h3 className="text-2xl font-[950] tracking-tight uppercase leading-none">Process Virtual Card</h3>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mt-2">Initiate Activation Request</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        {/* Mobile Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Mobile Number</label>
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    maxLength={10}
                                    placeholder="Enter 10 digit number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {!customer ? (
                            <button
                                onClick={handleCheckUser}
                                disabled={checking || mobile.length !== 10}
                                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {checking ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Search size={14} strokeWidth={3} />
                                )}
                                Check User Availability
                            </button>
                        ) : (
                            <div className="animate-in slide-in-from-top-4 duration-500">
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">User Detected</p>
                                            <h4 className="text-base font-black text-slate-900">{customer.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                                                    {customer.type}
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                                                    <CheckCircle size={10} /> Registered
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Submit Activation Request <ArrowRight size={14} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                            By submitting, you initiate a virtual card activation request. <br />
                            <span className="text-indigo-400">Final activation requires admin approval.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
