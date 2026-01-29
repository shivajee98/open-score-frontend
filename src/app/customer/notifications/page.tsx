'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, ArrowLeft, CheckCircle2, AlertCircle, Clock, Wallet, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                // Fetching transactions as notifications for now since there's no dedicated table
                const res = await apiFetch('/wallet/transactions?limit=20');
                setNotifications(res.data || []);
            } catch (e) {
                console.error("Failed to fetch notifications", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    const getIcon = (type: string, status: string) => {
        if (status === 'COMPLETED') return <CheckCircle2 className="text-emerald-500" size={20} />;
        if (status === 'FAILED') return <AlertCircle className="text-rose-500" size={20} />;
        if (type === 'CREDIT') return <Wallet className="text-blue-500" size={20} />;
        return <Clock className="text-amber-500" size={20} />;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-4 pt-14 pb-8 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 z-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-95 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Notifications</h1>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none mt-1">Activity & Updates</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative">
                        <Bell size={20} className="text-white/40" />
                        {notifications.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 -mt-6 relative z-20">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[60vh]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Fetching Updates...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Bell className="text-slate-200" size={32} />
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg">No Notifications</h3>
                            <p className="text-slate-500 text-sm mt-2">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((notif, i) => (
                                <div key={i} className="p-4 hover:bg-slate-50/50 transition-colors flex gap-4 active:bg-slate-50">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                        {getIcon(notif.type, notif.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-slate-900 text-[13px] truncate uppercase tracking-tight">
                                                {notif.description || (notif.type === 'CREDIT' ? 'Funds Received' : 'Payment Sent')}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[11px] leading-tight line-clamp-2">
                                            {notif.type === 'CREDIT' ? 'Received' : 'Sent'} ₹{notif.amount} {notif.status === 'COMPLETED' ? 'successfully' : 'pending'}. ID: #{notif.id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="px-6 py-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security Tips</h3>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                        <p className="text-emerald-800 text-[11px] font-medium leading-normal">
                            Always verify the merchant name before completing any payment.
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                        <Zap className="text-blue-600 shrink-0" size={20} />
                        <p className="text-blue-800 text-[11px] font-medium leading-normal">
                            Enable 2FA and Biometric login for enhanced account security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
