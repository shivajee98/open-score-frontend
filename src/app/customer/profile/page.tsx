'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { User, Mail, Briefcase, Phone, ArrowLeft, Shield, Edit2, Lock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import PinModal from '@/components/PinModal';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'SET' | 'VERIFY'>('VERIFY');
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        apiFetch('/auth/me').then(data => {
            setUser(data);
            setFormData({ name: data.name, email: data.email || '' });
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

    if (!isAuthenticated || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-xs animate-pulse">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 selection:bg-blue-100 selection:text-blue-900 font-sans">
            <div className="max-w-2xl mx-auto">
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="relative text-center mb-12">
                        <div className="w-32 h-32 mx-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl mb-6">
                            {user.name?.[0]}
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-2xl font-black text-slate-900 tracking-tight mb-2 text-center bg-transparent border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none w-full"
                            />
                        ) : (
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h2>
                        )}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wide">
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
                                        className="text-base font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none w-full"
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
                            <button onClick={handleChangePinClick} className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                <Lock className="w-4 h-4" /> Change PIN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 space-y-3">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Member since {new Date(user.created_at).getFullYear()}</p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');

                            if ((window as any).ReactNativeWebView) {
                                (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGOUT' }));
                            }

                            router.push('/');
                        }}
                        className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                    >
                        Sign Out
                    </button>
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
