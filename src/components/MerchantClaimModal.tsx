'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Store, Briefcase, Users, TrendingUp, MapPin, ArrowRight, CheckCircle2, Lock, ChevronDown, X, Upload } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface MerchantClaimModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
    bonusAmount?: number;
    user?: any; // Add user prop definition
}

export default function MerchantClaimModal({ isOpen, onClose, onSuccess, bonusAmount = 250, user }: MerchantClaimModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Initialize form data, prioritizing user data if available passed as prop
    const [formData, setFormData] = useState({
        business_name: user?.business_name || '',
        business_nature: user?.business_nature || '',
        customer_segment: user?.customer_segment || '',
        daily_turnover: user?.daily_turnover || '',
        business_address: user?.business_address || '',
        pincode: user?.pincode || ''
    });

    const [panFile, setPanFile] = useState<File | null>(null);
    const [panPreview, setPanPreview] = useState<string | null>(null);
    const [aadharFile, setAadharFile] = useState<File | null>(null);
    const [aadharPreview, setAadharPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pan' | 'aadhar') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File too large (max 10MB)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 1200;
                    let w = img.width;
                    let h = img.height;
                    if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
                    else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFile = new File([blob], `${type}_${Date.now()}.jpg`, { type: 'image/jpeg' });
                            if (type === 'pan') { setPanFile(newFile); setPanPreview(URL.createObjectURL(newFile)); }
                            else { setAadharFile(newFile); setAadharPreview(URL.createObjectURL(newFile)); }
                        }
                    }, 'image/jpeg', 0.8);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    // Effect to update formData when the user prop changes (e.g. data is loaded later)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev, // Keep any user edits if they started typing before data loaded (unlikely, but good practice)
                business_name: prev.business_name || user.business_name || '',
                business_nature: prev.business_nature || user.business_nature || '',
                customer_segment: prev.customer_segment || user.customer_segment || '',
                daily_turnover: prev.daily_turnover || user.daily_turnover || '',
                business_address: prev.business_address || user.business_address || '',
                pincode: prev.pincode || user.pincode || ''
            }));
        }
    }, [user]);

    if (!isOpen) return null;

    const turnoverOptions = [
        { label: "2,000 - 5,000", sub: "Cashback: 10 - 50", value: "2-5k" },
        { label: "5,000 - 10,000", sub: "Cashback: 50 - 200", value: "5k-10k" },
        { label: "10,000 - 20,000", sub: "Cashback: 200 - 400", value: "10k-20k" },
        { label: "20,000 - 50,000", sub: "Cashback: 500 - 1,000", value: "20k-50k" },
        { label: "50,000 - 1,00,000", sub: "Cashback: 1,000 - 2,000", value: "50k-1l" },
        { label: "1,00,000 - 2,00,000", sub: "Cashback: 2,000 - 4,000", value: "1l-2l" },
        { label: "2,00,000 - 5,00,000", sub: "Cashback: 3,000 - 5,000", value: "2l-5l" },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('business_name', formData.business_name);
            formDataObj.append('business_nature', formData.business_nature);
            formDataObj.append('customer_segment', formData.customer_segment);
            formDataObj.append('daily_turnover', formData.daily_turnover);
            formDataObj.append('business_address', formData.business_address);
            formDataObj.append('pincode', formData.pincode);
            
            if (panFile) formDataObj.append('pan_image', panFile);
            if (aadharFile) formDataObj.append('aadhar_image', aadharFile);

            const res = await apiFetch('/auth/complete-merchant-profile', {
                method: 'POST',
                body: formDataObj
            });

            // Update token to prevent session expired error
            if (res.access_token) {
                localStorage.setItem('token', res.access_token);
            }

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
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Complete Profile to Unlock {bonusAmount}</p>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2 animate-pulse">
                        please update your adhar and pan to get this reward
                    </p>
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
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.business_nature}
                                    onChange={e => setFormData({ ...formData, business_nature: e.target.value })}
                                >
                                    <option value="">Select Nature of Business</option>
                                    <option value="Retailer">Retailer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Service">Service</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Distribution">Distribution</option>
                                    <option value="Food & Beverage">Food & Beverage</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Technology/IT">Technology/IT</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
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

                            {/* KYC Uploads */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${panPreview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                    {panPreview ? (
                                        <div className="relative w-full aspect-video">
                                            <img src={panPreview} alt="PAN" className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload size={16} className="mx-auto mb-1 text-slate-400" />
                                            <p className="text-[8px] font-black uppercase text-slate-500">PAN Card</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                                </label>
                                <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${aadharPreview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                    {aadharPreview ? (
                                        <div className="relative w-full aspect-video">
                                            <img src={aadharPreview} alt="Aadhar" className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload size={16} className="mx-auto mb-1 text-slate-400" />
                                            <p className="text-[8px] font-black uppercase text-slate-500">Aadhar Card</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhar')} />
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm">Back</button>
                            <button
                                disabled={loading || !formData.daily_turnover || !formData.business_address || formData.pincode.length !== 6 || !panFile || !aadharFile}
                                onClick={handleSubmit}
                                className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : `Claim ${bonusAmount}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
