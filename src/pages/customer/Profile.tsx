'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearAuthState } from '@/lib/api';
import { User, Mail, Briefcase, Phone, ArrowLeft, Shield, Edit2, Lock, Headphones, Bell, ArrowRight, LogOut, ShieldCheck, FileText, Lightbulb, HelpCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import PinModal from '@/components/PinModal';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useApi } from '@/hooks/useApi';

export default function Profile() {
    const { data: user, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: pinData, mutate: mutatePin } = useApi('/wallet/check-pin');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        business_segment: '',
        business_type: '',
        map_location_url: '',
        shop_images: '[]'
    });
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'SET' | 'VERIFY'>('VERIFY');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const hasPin = pinData?.has_pin || false;
    const navigate = useNavigate();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        const saved = localStorage.getItem('audio_enabled');
        if (saved === 'true') setNotificationsEnabled(true);
    }, []);

    // Synchronize form data with user data when it arrives
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bank_name: user.bank_name || '',
                account_number: user.account_number || '',
                ifsc_code: user.ifsc_code || '',
                account_holder_name: user.account_holder_name || '',
                business_segment: user.business_segment || '',
                business_type: user.business_type || '',
                map_location_url: user.map_location_url || '',
                shop_images: user.shop_images || '[]'
            });
        }
    }, [user]);

    const toggleNotifications = async () => {
        if (typeof window === 'undefined') return;

        // Check for WebView
        const isWebView = !!(window as any).ReactNativeWebView;

        if (isWebView) {
            // Forward request to native side
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'REQUEST_NOTIFICATION_PERMISSION'
            }));

            // Optimistic toggle for local experience
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);
            localStorage.setItem('audio_enabled', newState.toString());
            toast.success(newState ? "Notifications Enabled" : "Notifications Disabled");
            return;
        }

        // Standard Browser logic
        if (!("Notification" in window)) {
            toast.error("Browser does not support notifications");
            return;
        }

        if (Notification.permission === "granted") {
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);
            localStorage.setItem('audio_enabled', newState.toString());
            toast.success(newState ? "Notifications Enabled" : "Notifications Disabled");
        } else if (Notification.permission !== "denied") {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    setNotificationsEnabled(true);
                    localStorage.setItem('audio_enabled', 'true');
                    toast.success("Notifications Enabled");
                } else {
                    toast.error("Notification permission denied");
                }
            } catch (e) {
                toast.error("Failed to request permission");
            }
        } else {
            toast.error("Notifications are blocked. Please enable in browser settings.");
        }
    };

    const handleBack = () => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else navigate('/customer'); // Unified dashboard
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await apiFetch('/auth/update-profile', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (res.error) throw new Error(res.error);
            await mutateUser(); // Refresh user data
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to update profile');
        }
    };

    const handleChangePinClick = () => {
        if (hasPin) {
            setPinModalMode('VERIFY');
            setIsPinModalOpen(true);
        } else {
            setPinModalMode('SET');
            setIsPinModalOpen(true);
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (pinModalMode === 'VERIFY') {
            try {
                const res = await apiFetch('/wallet/verify-pin', {
                    method: 'POST',
                    body: JSON.stringify({ pin })
                });
                if (res.valid) {
                    setIsPinModalOpen(false);
                    setTimeout(() => {
                        setPinModalMode('SET');
                        setIsPinModalOpen(true);
                    }, 200);
                } else {
                    toast.error('Incorrect PIN');
                }
            } catch (e) {
                toast.error('Failed to verify PIN');
            }
        } else {
            // Set new PIN
            try {
                await apiFetch('/auth/set-pin', {
                    method: 'POST',
                    body: JSON.stringify({
                        pin,
                        pin_confirmation: pin
                    })
                });
                toast.success('PIN updated successfully!');
                mutatePin(); // Refresh pin status
                setIsPinModalOpen(false);
            } catch (e: any) {
                toast.error(e.message || 'Failed to update PIN');
            }
        }
    };

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    if (!isAuthenticated || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-xs animate-pulse">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 selection:bg-blue-100 selection:text-blue-900 font-sans">
            <div className="max-w-2xl mx-auto">
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500/10 rounded-full blur-3xl -mr-16 -mt-16`}></div>

                    <div className="relative text-center mb-12">
                        <div className="w-32 h-32 mx-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl mb-6">
                            {user.name?.[0]}
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`text-2xl font-black text-slate-900 tracking-tight mb-2 text-center bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                            />
                        ) : (
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h2>
                        )}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${themeColor}-50 text-${themeColor}-600 rounded-full font-bold text-xs uppercase tracking-wide`}>
                            <Shield className="w-3 h-3" /> {user.role} Account
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Phone className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Mobile Number</p>
                                <p className="text-base font-black text-slate-900">+91 {user.mobile_number}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Mail className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                    />
                                ) : (
                                    <p className="text-base font-black text-slate-900 truncate" title={user.email}>{user.email || 'Not verified'}</p>
                                )}
                            </div>
                        </div>

                        {isMerchant && (
                            <>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Briefcase className="w-5 h-5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business Name</p>
                                        <p className="text-base font-black text-slate-900">{user.business_name}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Business Segment</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.business_segment}
                                                onChange={(e) => setFormData({ ...formData, business_segment: e.target.value })}
                                                className={`text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Segment</option>
                                                <option value="retailer">Retailer</option>
                                                <option value="wholesaler">Wholesaler</option>
                                                <option value="distributor">Distributor</option>
                                                <option value="super_distributor">Super Distributor</option>
                                            </select>
                                        ) : (
                                            <p className="text-base font-black text-slate-900 capitalize">{user.business_segment?.replace('_', ' ') || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Business Type</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.business_type}
                                                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                                className={`text-sm font-bold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="e.g. Grocery, Electronics"
                                            />
                                        ) : (
                                            <p className="text-base font-black text-slate-900">{user.business_type || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Google Maps Link</p>
                                        {isEditing ? (
                                            <div>
                                                <input
                                                    type="url"
                                                    value={formData.map_location_url}
                                                    onChange={(e) => setFormData({ ...formData, map_location_url: e.target.value })}
                                                    className={`text-sm font-bold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="https://maps.google.com/..."
                                                />
                                                <a
                                                    href="https://www.google.com/maps"
                                                    target="_blank"
                                                    className="text-[10px] text-blue-500 font-bold mt-1 inline-block"
                                                >
                                                    Open Google Maps to copy link
                                                </a>
                                            </div>
                                        ) : (
                                            <a
                                                href={user.map_location_url}
                                                target="_blank"
                                                className={`text-sm font-bold text-${themeColor}-600 underline truncate block`}
                                            >
                                                {user.map_location_url || 'Not Set'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Shop Images Section */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Shop Images</p>
                                        {isEditing && (
                                            <label className={`cursor-pointer bg-${themeColor}-100 text-${themeColor}-700 px-2 py-1 rounded text-[10px] font-bold uppercase`}>
                                                + Add Image
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;

                                                        const uploadToCloudinary = async () => {
                                                            try {
                                                                toast.info("Uploading image...");
                                                                const uploadData = new FormData();
                                                                uploadData.append('file', file);
                                                                uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET!);
                                                                uploadData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME!);

                                                                const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                                                                    method: 'POST',
                                                                    body: uploadData
                                                                });
                                                                const data = await res.json();
                                                                if (data.secure_url) {
                                                                    const currentImages = formData.shop_images ? JSON.parse(formData.shop_images) : [];
                                                                    const newImages = [...currentImages, data.secure_url];
                                                                    setFormData(prev => ({ ...prev, shop_images: JSON.stringify(newImages) }));
                                                                    toast.success("Image uploaded!");
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                toast.error("Upload failed");
                                                            }
                                                        };
                                                        uploadToCloudinary();
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {formData.shop_images && JSON.parse(formData.shop_images).map((img: string, idx: number) => (
                                            <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={img} className="w-full h-full object-cover" alt="Shop" />
                                                {isEditing && (
                                                    <button
                                                        onClick={() => {
                                                            const current = JSON.parse(formData.shop_images);
                                                            const updated = current.filter((_: any, i: number) => i !== idx);
                                                            setFormData(prev => ({ ...prev, shop_images: JSON.stringify(updated) }));
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                                                    >
                                                        <LogOut className="w-3 h-3 rotate-45" /> {/* X icon workaround */}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {(!formData.shop_images || JSON.parse(formData.shop_images).length === 0) && (
                                            <p className="text-xs text-slate-400 italic">No images added</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="mt-8 mb-4">
                            <h3 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bank Details (For Payouts)</h3>
                            {user.account_number && (
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-4 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-800">Bank details are verified and locked. Contact support to update.</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Bank Name</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.bank_name}
                                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                className={`text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="e.g. HDFC Bank"
                                            />
                                        ) : (
                                            <p className="text-base font-black text-slate-900">{user.bank_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Account Number</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.account_number}
                                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                                className={`text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="Enter account number"
                                            />
                                        ) : (
                                            <p className="text-base font-black text-slate-900">{user.account_number || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">IFSC Code</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.ifsc_code}
                                                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                                                className={`text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="HDFC0001234"
                                            />
                                        ) : (
                                            <p className="text-base font-black text-slate-900 uppercase">{user.ifsc_code || 'Not Set'}</p>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">A/C Holder Name</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.account_holder_name}
                                                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                                                className={`text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="As per bank records"
                                            />
                                        ) : (
                                            <p className="text-base font-black text-slate-900 truncate">{user.account_holder_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="mt-8 mb-4">
                            <div className="flex items-center justify-between px-1 mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Settings</h3>
                                <button
                                    onClick={async () => {
                                        await clearAuthState();
                                        toast.success("Logged out successfully");
                                        setTimeout(() => { window.location.href = '/'; }, 500);
                                    }}
                                    className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Profile */}
                                <div onClick={() => setIsEditing(true)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Profile</span>
                                </div>

                                {/* Tutorial */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <Lightbulb className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Tutorial</span>
                                </div>

                                {/* Help */}
                                <div onClick={() => navigate('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Help</span>
                                </div>

                                {/* T&C */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 shadow-sm">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">T&C</span>
                                </div>

                                {/* Privacy */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Privacy</span>
                                </div>

                                {/* Contact Us */}
                                <div onClick={() => navigate('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">Contact Us</span>
                                </div>
                            </div>

                            {/* Notifications Toggle */}
                            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleNotifications}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm"><Bell className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Notifications</p>
                                        <p className="text-[10px] font-bold text-slate-400">Manage alerts</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 ${notificationsEnabled ? `bg-${themeColor}-600` : 'bg-slate-200'} rounded-full relative shadow-inner transition-colors duration-200`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            {isEditing ? (
                                <>
                                    <button onClick={handleUpdateProfile} className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                        Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-300 transition-colors">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex-1 bg-white border border-slate-200 text-slate-900 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                            <button onClick={handleChangePinClick} className={`flex-1 bg-${themeColor}-500 text-white py-2.5 rounded-lg font-bold hover:bg-${themeColor}-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-${themeColor}-500/20`}>
                                <Lock className="w-4 h-4" /> Change PIN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 space-y-3">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Member since {new Date(user.created_at).getFullYear()}</p>
                </div>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onComplete={handlePinComplete}
                mode={pinModalMode}
                title={pinModalMode === 'VERIFY' ? 'Enter Current PIN' : 'Set New PIN'}
            />
        </div>
    );
}
