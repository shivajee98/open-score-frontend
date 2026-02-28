'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { apiFetch, clearAuthState } from '@/lib/api';
import { User, Mail, Briefcase, Phone, ArrowLeft, Shield, Edit2, Lock, Headphones, Bell, ArrowRight, LogOut, ShieldCheck, FileText, Lightbulb, HelpCircle, Share, Trophy, AlertTriangle, Camera, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import PinModal from '@/components/PinModal';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useApi } from '@/hooks/useApi';
import TutorialPlayer from '@/components/TutorialPlayer';
import BackButton from '@/components/BackButton';

export default function Profile() {
    const { data: user, error: userError, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: pinData, mutate: mutatePin } = useApi('/wallet/check-pin');

    const [isEditing, setIsEditing] = useState(false);
    const initialDataLoaded = useRef(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        business_segment: '',
        business_type: '',
        business_nature: '',
        customer_segment: '',
        daily_turnover: '',
        map_location_url: '',
        shop_images: '[]',
        business_name: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: ''
    });
    const [newShopImages, setNewShopImages] = useState<File[]>([]);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'SET' | 'VERIFY'>('VERIFY');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const hasPin = pinData?.has_pin || false;
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        const saved = localStorage.getItem('audio_enabled');
        if (saved === 'true') setNotificationsEnabled(true);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('editBank=true')) {
            setIsEditing(true);
            setTimeout(() => {
                const element = document.getElementById('bank-details-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all');
                    setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all'), 3000);
                }
            }, 500);
        }
    }, []);

    // Synchronize form data with user data when it arrives
    useEffect(() => {
        if (user) {
            // Populate if not editing, or if editing but we haven't loaded initial data yet
            if (!isEditing || !initialDataLoaded.current) {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bank_name: user.bank_name || '',
                    account_number: user.account_number || '',
                    ifsc_code: user.ifsc_code || '',
                    account_holder_name: user.account_holder_name || '',
                    business_segment: user.business_segment || '',
                    business_type: user.business_type || '',
                    business_nature: user.business_nature || '',
                    customer_segment: user.customer_segment || '',
                    daily_turnover: user.daily_turnover || '',
                    map_location_url: user.map_location_url || '',
                    shop_images: Array.isArray(user.shop_images) ? JSON.stringify(user.shop_images) : (user.shop_images || '[]'),
                    business_name: user.business_name || '',
                    street_address: user.business_address || '',
                    city: user.city || '',
                    state: user.state || '',
                    postal_code: user.pincode || ''
                });
                initialDataLoaded.current = true;
            }
        }
    }, [user, isEditing]);

    const toggleNotifications = async () => {
        if (typeof window === 'undefined') return;

        const platform = Capacitor.getPlatform();
        const isNative = platform !== 'web';

        console.log(`[PushDebug] Platform detected: ${platform}, isNative: ${isNative}`);

        if (isNative) {
            try {
                const { PushNotifications } = await import('@capacitor/push-notifications');

                // If we are turning it OFF
                if (notificationsEnabled) {
                    console.log('[PushDebug] Disabling notifications');
                    setNotificationsEnabled(false);
                    localStorage.setItem('audio_enabled', 'false');
                    toast.success("Notifications Disabled");
                    return;
                }

                // If we are turning it ON
                console.log('[PushDebug] Attempting native push registration...');
                let perm = await PushNotifications.checkPermissions();

                if (perm.receive === 'prompt' || perm.receive === 'denied') {
                    perm = await PushNotifications.requestPermissions();
                }

                const granted = perm.receive === 'granted';
                if (granted) {
                    setNotificationsEnabled(true);
                    localStorage.setItem('audio_enabled', 'true');
                    toast.success("Notifications Enabled (Native)");
                    try {
                        await PushNotifications.register();
                    } catch (regErr) {
                        console.error("[PushDebug] Registration failed", regErr);
                    }
                } else {
                    toast.error(`Permission denied: ${perm.receive}`);
                }
            } catch (e) {
                console.error("[PushDebug] Native Error:", e);
                toast.error("Native push error. Ensure you are using the installed App.");
            }
            return;
        }

        // Standard Browser logic (Fallback for web)
        console.log('[PushDebug] Using Web Push fallback logic');
        if (!("Notification" in window)) {
            const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobileBrowser) {
                toast.error(`Mobile browsers don't support web push. Open the installed App.`);
            } else {
                toast.error(`Notifications not supported in this browser (${platform})`);
            }
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
                    toast.error("Permission denied");
                }
            } catch (e) {
                toast.error("Failed to request permission");
            }
        } else {
            toast.error("Notifications are blocked in browser settings.");
        }
    };

    const [showNameMismatch, setShowNameMismatch] = useState(false);

    const handleBack = () => {
        if (user?.role === 'ADMIN') router.push('/admin');
        else router.push('/customer'); // Unified dashboard
    };

    const handleUpdateProfile = async () => {
        // Issue 7: Name matching validation
        const profileName = formData.name.trim().toLowerCase();
        const bankName = formData.account_holder_name.trim().toLowerCase();

        if (bankName && profileName !== bankName) {
            setShowNameMismatch(true);
            return;
        }

        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('business_name', formData.business_name);
            uploadData.append('business_nature', formData.business_nature);
            uploadData.append('customer_segment', formData.customer_segment);
            uploadData.append('daily_turnover', formData.daily_turnover);
            uploadData.append('business_address', formData.street_address);
            uploadData.append('city', formData.city);
            uploadData.append('state', formData.state);
            uploadData.append('pincode', formData.postal_code);
            uploadData.append('map_location_url', formData.map_location_url);

            // Bank details
            if (!user?.account_number) {
                uploadData.append('bank_name', formData.bank_name);
                uploadData.append('account_number', formData.account_number);
                uploadData.append('ifsc_code', formData.ifsc_code);
                uploadData.append('account_holder_name', formData.account_holder_name);
            }

            let currentImages: string[] = [];
            try {
                if (typeof formData.shop_images === 'string') {
                    currentImages = JSON.parse(formData.shop_images);
                }
            } catch (e) { currentImages = []; }

            currentImages.forEach((img) => {
                uploadData.append('retained_shop_images[]', img);
            });

            newShopImages.forEach((file) => {
                uploadData.append('shop_images[]', file);
            });

            const res = await apiFetch('/auth/update-profile', {
                method: 'POST',
                body: uploadData
            });
            if (res.error) throw new Error(res.error);
            await mutateUser(); // Refresh user data
            setIsEditing(false);
            setNewShopImages([]);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setNewShopImages(prev => [...prev, file]);
        toast.success("Image selected for upload");

        // Optionally add a temporary local preview to shop_images string
        const previewUrl = URL.createObjectURL(file);
        let currentImages: string[] = [];
        try {
            currentImages = formData.shop_images ? JSON.parse(formData.shop_images) : [];
        } catch (err) { currentImages = []; }

        const updatedImages = [...currentImages, previewUrl];
        setFormData(prev => ({ ...prev, shop_images: JSON.stringify(updatedImages) }));
    };

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    if (userError) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Profile</h3>
                    <p className="text-slate-500 text-sm mb-6">{userError.message || "Please check your internet connection."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={async () => { await clearAuthState(); window.location.href = '/'; }}
                        className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userLoading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-xs animate-pulse">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-12 pb-24 px-4 relative overflow-hidden shadow-2xl`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10 max-w-2xl mx-auto pt-4">
                    <BackButton
                        className="mb-8 flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </BackButton>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Security & Profile</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Identity Protocol</p>
                        </div>
                        <div className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white`}>
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
                <div className="bg-white rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-slate-300/50 border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl -mr-16 -mt-16`}></div>

                    <div className="relative text-center mb-12">
                        <div className="w-32 h-32 mx-auto bg-slate-900 border-4 border-white text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl mb-6 overflow-hidden relative group">
                            {user.profile_image ? (
                                <img src={user.profile_image} className="w-full h-full object-cover" alt={user.name} />
                            ) : (
                                <span>{user.name?.[0]}</span>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`text-xl font-medium text-slate-900 tracking-tight mb-2 text-center bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                />
                                {formData.name.trim().toLowerCase() !== formData.account_holder_name.trim().toLowerCase() && formData.account_holder_name && (
                                    <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tighter animate-pulse">
                                        ⚠️ Must match account holder name
                                    </p>
                                )}
                            </>
                        ) : (
                            <h2 className="text-xl font-medium text-slate-900 tracking-tight mb-2">{user.name}</h2>
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
                                <p className="text-sm font-medium text-slate-900">+91 {user.mobile_number}</p>
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
                                        className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 truncate" title={user.email}>{user.email || 'Not verified'}</p>
                                )}
                            </div>
                        </div>

                        {isMerchant && (
                            <>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Briefcase className="w-5 h-5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business Name</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.business_name}
                                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="Enter Business Name"
                                            />
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.business_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Customer Segment</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.customer_segment}
                                                onChange={(e) => setFormData({ ...formData, customer_segment: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Segment</option>
                                                <option value="Wholesale">Wholesale</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Distributor">Distributor</option>
                                                <option value="Super Distributor">Super Distributor</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Supplier">Supplier</option>
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900 capitalize">{user.customer_segment?.replace('_', ' ') || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Business Nature</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.business_nature}
                                                onChange={(e) => setFormData({ ...formData, business_nature: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="e.g. Grocery, Electronics, Garment"
                                            />
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.business_nature || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Daily Turnover</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.daily_turnover}
                                                onChange={(e) => setFormData({ ...formData, daily_turnover: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Turnover</option>
                                                <option value="1k-5k">₹1,000 - ₹5,000</option>
                                                <option value="5k-10k">₹5,000 - ₹10,000</option>
                                                <option value="10k-20k">₹10,000 - ₹20,000</option>
                                                <option value="20k-50k">₹20,000 - ₹50,000</option>
                                                <option value="50k-1l">₹50,000 - ₹1,00,000</option>
                                                <option value="1l-2l">₹1,00,000 - ₹2,00,000</option>
                                                <option value="2l-5l">₹2,00,000 - ₹5,00,000</option>
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.daily_turnover || 'Not Set'}</p>
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
                                                    className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
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

                                {/* Address Section */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business Address</p>

                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">Street Address</p>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.street_address}
                                                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full min-h-[60px] resize-none`}
                                                placeholder="Building, Street, Area"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-900">{user.address || 'Not Set'}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">City</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="City"
                                                />
                                            ) : (
                                                <p className="text-sm font-semibold text-slate-900">{user.city || 'Not Set'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">State</p>
                                            {isEditing ? (
                                                <select
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                >
                                                    <option value="">Select State</option>
                                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                    <option value="Assam">Assam</option>
                                                    <option value="Bihar">Bihar</option>
                                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                                    <option value="Goa">Goa</option>
                                                    <option value="Gujarat">Gujarat</option>
                                                    <option value="Haryana">Haryana</option>
                                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                    <option value="Jharkhand">Jharkhand</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Kerala">Kerala</option>
                                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Manipur">Manipur</option>
                                                    <option value="Meghalaya">Meghalaya</option>
                                                    <option value="Mizoram">Mizoram</option>
                                                    <option value="Nagaland">Nagaland</option>
                                                    <option value="Odisha">Odisha</option>
                                                    <option value="Punjab">Punjab</option>
                                                    <option value="Rajasthan">Rajasthan</option>
                                                    <option value="Sikkim">Sikkim</option>
                                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                                    <option value="Telangana">Telangana</option>
                                                    <option value="Tripura">Tripura</option>
                                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                    <option value="Uttarakhand">Uttarakhand</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                    <option value="Andaman and Nicobar Islands">Andaman & Nicobar</option>
                                                    <option value="Chandigarh">Chandigarh</option>
                                                    <option value="Dadra and Nagar Haveli and Daman and Diu">DNH & DD</option>
                                                    <option value="Delhi">Delhi</option>
                                                    <option value="Jammu and Kashmir">J&K</option>
                                                    <option value="Ladakh">Ladakh</option>
                                                    <option value="Lakshadweep">Lakshadweep</option>
                                                    <option value="Puducherry">Puducherry</option>
                                                </select>
                                            ) : (
                                                <p className="text-sm font-semibold text-slate-900">{user.state || 'Not Set'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">PIN Code</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={formData.postal_code}
                                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '') })}
                                                className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="6 digits"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-900">{user.pincode || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Shop Images Section */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Shop Images</p>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <label className={`cursor-pointer bg-${themeColor}-100 text-${themeColor}-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 hover:bg-${themeColor}-200 transition-colors`}>
                                                    <ImageIcon size={14} />
                                                    Gallery
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>

                                                <label className={`cursor-pointer bg-${themeColor}-100 text-${themeColor}-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 hover:bg-${themeColor}-200 transition-colors`}>
                                                    <Camera size={14} />
                                                    Camera
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {(() => {
                                            let images: string[] = [];
                                            try {
                                                images = formData.shop_images ? JSON.parse(formData.shop_images) : [];
                                            } catch (e) { images = []; }

                                            if (images.length === 0) {
                                                if (user?.profile_image) {
                                                    images = [user.profile_image];
                                                } else {
                                                    return <p className="text-xs text-slate-400 italic">No images added</p>;
                                                }
                                            }

                                            return images.map((img: string, idx: number) => (
                                                <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={img} className="w-full h-full object-cover" alt="Shop" />
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => {
                                                                const imgUrl = images[idx];
                                                                if (imgUrl.startsWith('blob:')) {
                                                                    const firstBlobIndex = images.findIndex((i: string) => i.startsWith('blob:'));
                                                                    const newShopImageIndex = idx - firstBlobIndex;
                                                                    setNewShopImages(prev => prev.filter((_, i) => i !== newShopImageIndex));
                                                                }
                                                                const updated = images.filter((_, i) => i !== idx);
                                                                setFormData(prev => ({ ...prev, shop_images: JSON.stringify(updated) }));
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                                                        >
                                                            <LogOut className="w-3 h-3 rotate-45" /> {/* X icon workaround */}
                                                        </button>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}

                        <div id="bank-details-section" className="mt-8 mb-4 rounded-3xl p-2 transition-all duration-500">
                            <h3 className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bank Details (For Payouts)</h3>
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
                                                className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="e.g. HDFC Bank"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.bank_name || 'Not Set'}</p>
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
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setFormData({ ...formData, account_number: val });
                                                }}
                                                className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="Enter account number"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.account_number || 'Not Set'}</p>
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
                                                className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="HDFC0001234"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 uppercase truncate">{user.ifsc_code || 'Not Set'}</p>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">A/C Holder Name</p>
                                        {isEditing && !user.account_number ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.account_holder_name}
                                                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                                                    className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="As per bank records"
                                                />
                                                {formData.name.trim().toLowerCase() !== formData.account_holder_name.trim().toLowerCase() && (
                                                    <p className="text-rose-500 text-[8px] font-bold mt-1 uppercase animate-pulse">
                                                        ⚠️ Mismatch with profile name
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.account_holder_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="mt-8 mb-4">
                            <div className="flex items-center justify-between px-1 mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Settings</h3>
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
                                    <span className="text-xs font-medium text-slate-700">Profile</span>
                                </div>

                                {/* Tutorial */}
                                <div onClick={() => setIsTutorialOpen(true)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <Lightbulb className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">Tutorial</span>
                                </div>

                                {/* Help */}
                                <div onClick={() => router.push('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">Help</span>
                                </div>

                                {/* T&C */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 shadow-sm">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">T&C</span>
                                </div>

                                {/* Privacy */}
                                <div onClick={() => router.push('/privacy-policy')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">Privacy</span>
                                </div>

                                {/* Share & Earn */}
                                <div onClick={() => router.push('/customer/referral')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">Share & Earn</span>
                                </div>

                                {/* Contact Us */}
                                <div onClick={() => router.push('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">Contact Us</span>
                                </div>
                            </div>

                            {/* Notifications Toggle */}
                            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleNotifications}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm"><Bell className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
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
                                    <button onClick={handleUpdateProfile} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                        Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex-1 bg-white border border-slate-200 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                            <button onClick={handleChangePinClick} className={`flex-1 bg-${themeColor}-500 text-white py-3 rounded-xl font-bold hover:bg-${themeColor}-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-${themeColor}-500/20`}>
                                <Lock className="w-4 h-4" /> Change PIN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 space-y-3">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Member since {new Date(user.created_at).getFullYear()}</p>
                </div>
            </div>

            <TutorialPlayer
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />

            {/* Name Mismatch Modal */}
            {showNameMismatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNameMismatch(false)}></div>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl border-2 border-rose-500 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Name Mismatch</h3>
                        <p className="text-rose-600 text-center font-bold text-sm leading-relaxed mb-8">
                            Customer Profile Name and Bank Account Holder Name must be exactly the same.
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                <p className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-1">Mismatch detected</p>
                                <p className="text-xs font-bold text-rose-700">Profile: <span className="underline">{formData.name}</span></p>
                                <p className="text-xs font-bold text-rose-700">Bank Record: <span className="underline">{formData.account_holder_name}</span></p>
                            </div>
                            <button
                                onClick={() => setShowNameMismatch(false)}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                Close & Fix
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
