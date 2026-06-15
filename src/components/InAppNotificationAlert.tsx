'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, X, CheckSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function InAppNotificationAlert() {
    const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
    const [currentNotification, setCurrentNotification] = useState<any | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const seenIdsRef = useRef<Set<number>>(new Set());
    const pollIntervalRef = useRef<any>(null);

    const fetchNotifications = async () => {
        if (typeof window !== 'undefined' && localStorage.getItem('admin_preview') === 'true') {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await apiFetch('/app-notifications');
            if (res && res.notifications) {
                // Filter down to unread notifications only
                const unread = res.notifications.filter((n: any) => !n.is_read);
                setUnreadNotifications(unread);

                if (unread.length > 0) {
                    // Pick the first unread one that we haven't seen in this session yet
                    const nextNotif = unread.find((n: any) => !seenIdsRef.current.has(n.id));
                    if (nextNotif && (!currentNotification || currentNotification.id !== nextNotif.id)) {
                        setIsAnimating(true);
                        setCurrentNotification(nextNotif);
                        seenIdsRef.current.add(nextNotif.id);
                    }
                } else {
                    setCurrentNotification(null);
                }
            }
        } catch (err) {
            console.error('[InAppNotification] Poll error:', err);
        }
    };

    const handleAcknowledge = async (id: number) => {
        try {
            await apiFetch(`/app-notifications/${id}/read`, {
                method: 'POST'
            });
            toast.success('Notification acknowledged');
            // Remove from local lists
            setUnreadNotifications(prev => prev.filter(n => n.id !== id));
            setCurrentNotification(null);
            // Fetch immediately to load the next one if any
            setTimeout(fetchNotifications, 300);
        } catch (err) {
            console.error('[InAppNotification] Acknowledge error:', err);
            toast.error('Failed to update status');
        }
    };

    useEffect(() => {
        // Fetch initially
        fetchNotifications();

        // Poll every 15 seconds
        pollIntervalRef.current = setInterval(fetchNotifications, 15000);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    if (!currentNotification) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
            <div className="relative w-full max-w-md bg-white/95 border border-slate-100 rounded-[2rem] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Background ambient light */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Glowing Icon Container */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <div className="absolute inset-0 bg-indigo-200/40 rounded-2xl animate-ping opacity-40" />
                        <Bell className="w-8 h-8 text-indigo-600 animate-bounce" />
                    </div>

                    {/* Sparkles / Dynamic Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/55 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>System Broadcast</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug mb-2">
                        {currentNotification.title}
                    </h3>

                    {/* Message Body */}
                    <div className="w-full max-h-48 overflow-y-auto px-1 py-1.5 scrollbar-thin text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                        {currentNotification.body}
                    </div>

                    {/* Footer Actions */}
                    <div className="w-full flex flex-col gap-2">
                        <button
                            onClick={() => handleAcknowledge(currentNotification.id)}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Got it, Mark as Read
                        </button>
                        
                        {unreadNotifications.length > 1 && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                + {unreadNotifications.length - 1} more pending update(s)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
