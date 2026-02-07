'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, ArrowLeft, CheckCircle2, AlertCircle, Clock, Wallet, Zap, ShieldCheck, X, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedNotif, setSelectedNotif] = useState<any>(null);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
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
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-4 pt-14 pb-12 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 z-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-95 transition-all outline-none"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Notifications</h1>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none mt-1">Activity & Updates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 -mt-8 relative z-20">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[60vh]">
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
                                <div
                                    key={i}
                                    onClick={() => setSelectedNotif(notif)}
                                    className="p-4 hover:bg-slate-50/80 transition-colors flex gap-4 active:bg-slate-100 cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm text-slate-500">
                                        {getIcon(notif.type, notif.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-slate-900 text-[13px] truncate uppercase tracking-tight flex-1 pr-2">
                                                {notif.description || (notif.type === 'CREDIT' ? 'Funds Received' : 'Payment Sent')}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 font-bold bg-slate-50 px-2 py-1 rounded-full">
                                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-slate-500 text-[11px] leading-tight line-clamp-1">
                                                ID: #{notif.id} • {notif.status}
                                            </p>
                                            <span className={`text-xs font-black ${notif.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {notif.type === 'CREDIT' ? '+' : '-'} ₹{notif.amount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedNotif && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
                        <button
                            onClick={() => setSelectedNotif(null)}
                            className="absolute top-5 right-5 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center mb-4">
                                {getIcon(selectedNotif.type, selectedNotif.status)}
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                {selectedNotif.type === 'CREDIT' ? '+' : '-'} ₹{selectedNotif.amount}
                            </h3>
                            <p className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mt-2 ${selectedNotif.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                    selectedNotif.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {selectedNotif.status}
                            </p>
                        </div>

                        <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex justify-between items-start border-b border-slate-200/50 pb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Details</span>
                                <span className="text-slate-700 font-bold text-xs text-right max-w-[60%] leading-relaxed">
                                    {selectedNotif.description || 'Transaction'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Date</span>
                                <span className="text-slate-700 font-bold text-xs">
                                    {new Date(selectedNotif.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tx ID</span>
                                <span className="text-slate-700 font-mono font-bold text-xs">
                                    #{selectedNotif.id}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                <Receipt size={16} /> Share Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
