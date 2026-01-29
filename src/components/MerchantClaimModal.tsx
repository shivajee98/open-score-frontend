'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Store, Briefcase, Users, TrendingUp, MapPin, ArrowRight, CheckCircle2, Lock, ChevronDown, X } from 'lucide-react';

interface MerchantClaimModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function MerchantClaimModal({ isOpen, onClose, onSuccess }: MerchantClaimModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        business_nature: '',
        customer_segment: '',
        daily_turnover: '',
        business_address: '',
        pincode: '',
        pin: '',
        confirm_pin: ''
    });

    if (!isOpen) return null;

    const turnoverOptions = [
        { label: "₹1,00,000 - ₹5,00,000", sub: "Cashback: ₹500 - ₹2,000", value: "1l-5l" },
        { label: "₹5,00,000 - ₹10,00,000", sub: "Cashback: ₹2,000 - ₹5,000", value: "5l-10l" },
        { label: "₹10,00,000 - ₹20,00,000", sub: "Cashback: ₹5,000 - ₹10,000", value: "10l-20l" },
        { label: "₹20,00,000 - ₹50,00,000", sub: "Cashback: ₹10,000 - ₹25,000", value: "20l-50l" },
        { label: "₹50,00,000+", sub: "Cashback: ₹25,000+", value: "50l+" },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/auth/complete-merchant-profile', {
                method: 'POST',
                body: JSON.stringify({
                    business_name: formData.business_name,
                    business_nature: formData.business_nature,
                    customer_segment: formData.customer_segment,
                    daily_turnover: formData.daily_turnover,
                    business_address: formData.business_address,
                    pincode: formData.pincode,
                    pin: formData.pin,
                    pin_confirmation: formData.confirm_pin
                })
            });
            onSuccess(res.user);
        } catch (error: any) {
            alert(error.message); // Simple alert for now, or use toast if available passed in props
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mb-4 ring-4 ring-amber-50">
                        <TrendingUp size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Claim Your Bonus</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Complete Profile to Unlock ₹250</p>
                </div>

                {/* Step 1: Business Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Shop Name"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.business_name}
                                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Nature of Business (e.g. Garment)"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.business_nature}
                                    onChange={e => setFormData({ ...formData, business_nature: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.customer_segment}
                                    onChange={e => setFormData({ ...formData, customer_segment: e.target.value })}
                                >
                                    <option value="">Select Work Segment</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Super Distributor">Super Distributor</option>
                                    <option value="Manufacturer">Manufacturer</option>
                                    <option value="Supplier">Supplier</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <button
                            disabled={!formData.business_name || !formData.business_nature || !formData.customer_segment}
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Next Step
                        </button>
                    </div>
                )}

                {/* Step 2: Address & Turnover */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative">
                                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.daily_turnover}
                                    onChange={e => setFormData({ ...formData, daily_turnover: e.target.value })}
                                >
                                    <option value="">Select Daily Turnover</option>
                                    {turnoverOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-[1.125rem] text-slate-400" size={18} />
                                <textarea
                                    placeholder="Business Address"
                                    rows={2}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none resize-none"
                                    value={formData.business_address}
                                    onChange={e => setFormData({ ...formData, business_address: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Postal PIN Code"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    value={formData.pincode}
                                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm">Back</button>
                            <button
                                disabled={!formData.daily_turnover || !formData.business_address || formData.pincode.length !== 6}
                                onClick={() => setStep(3)}
                                className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Transaction PIN */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                            <p className="text-blue-700 text-xs font-bold leading-relaxed">
                                Set a secure 6-digit PIN for your wallet transactions.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Set 6-Digit PIN"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none text-center tracking-[0.5em]"
                                    value={formData.pin}
                                    onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Confirm PIN"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none text-center tracking-[0.5em]"
                                    value={formData.confirm_pin}
                                    onChange={e => setFormData({ ...formData, confirm_pin: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>
                        {formData.pin && formData.confirm_pin && formData.pin !== formData.confirm_pin && (
                            <p className="text-[10px] text-rose-500 font-bold text-center uppercase tracking-widest">PINs do not match</p>
                        )}
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm">Back</button>
                            <button
                                disabled={loading || formData.pin.length !== 6 || formData.pin !== formData.confirm_pin}
                                onClick={handleSubmit}
                                className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Claim ₹250'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
