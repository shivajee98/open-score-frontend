'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User, Mail, Briefcase, Phone, ArrowLeft, Shield, Edit2, Lock, Headphones, Bell, ArrowRight, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import PinModal from '@/components/PinModal';
import SupportModal from '@/components/SupportModal';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: ''
    });
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'SET' | 'VERIFY'>('VERIFY');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        const saved = localStorage.getItem('audio_enabled');
        if (saved === 'true') setNotificationsEnabled(true);
    }, []);

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

    useEffect(() => {
        apiFetch('/auth/me').then(data => {
            setUser(data);
            setFormData({
                name: data.name,
                email: data.email || '',
                bank_name: data.bank_name || '',
                account_number: data.account_number || '',
                ifsc_code: data.ifsc_code || '',
                account_holder_name: data.account_holder_name || ''
            });
        }).catch(console.error);

        apiFetch('/wallet/check-pin').then(data => {
            setHasPin(data.has_pin);
        }).catch(() => setHasPin(false));
    }, []);

    const handleBack = () => {
        if (user?.role === 'ADMIN') router.push('/admin');
        else router.push('/customer'); // Unified dashboard
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await apiFetch('/auth/update-profile', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (res.error) throw new Error(res.error);
            setUser({ ...user, ...formData });
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
                setHasPin(true);
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

                        {user.business_name && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Briefcase className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business Name</p>
                                    <p className="text-base font-black text-slate-900">{user.business_name}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 mb-4">
                            <h3 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bank Details (For Payouts)</h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Bank Name</p>
                                        {isEditing ? (
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
                                        {isEditing ? (
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
                                        {isEditing ? (
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
                                        {isEditing ? (
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

                        {/* Support Section */}
                        <div className="mt-8 mb-4">
                            <h3 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Support & Settings</h3>

                            <div className="space-y-3">
                                <div
                                    onClick={() => setSupportOpen(true)}
                                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform"><Headphones className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Help & Support</p>
                                            <p className="text-[10px] font-bold text-slate-400">help@openscore.in • +91 98765 43210</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                </div>

                                <div
                                    onClick={toggleNotifications}
                                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform"><Bell className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Notifications</p>
                                            <p className="text-[10px] font-bold text-slate-400">Manage your alerts</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-5 ${notificationsEnabled ? `bg-${themeColor}-600` : 'bg-slate-200'} rounded-full relative shadow-inner transition-colors duration-200`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-rose-50 hover:border-rose-100 transition-colors group"
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                        if ((window as any).ReactNativeWebView) {
                                            (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGOUT' }));
                                        }
                                        router.push('/');
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform"><LogOut className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 group-hover:text-rose-600">Log Out</p>
                                            <p className="text-[10px] font-bold text-slate-400 group-hover:text-rose-400">Sign out of your account</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-rose-200">
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                                    </div>
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
            <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
        </div>
    );
}
