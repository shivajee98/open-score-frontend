'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastEvent extends CustomEvent {
    detail: {
        message: string;
        type: ToastType;
        duration?: number;
    };
}

// Global dispatcher
export const toast = {
    success: (message: string, duration = 3000) => dispatchToast(message, 'success', duration),
    error: (message: string, duration = 4000) => dispatchToast(message, 'error', duration),
    info: (message: string, duration = 3000) => dispatchToast(message, 'info', duration),
};

function dispatchToast(message: string, type: ToastType, duration: number) {
    const event = new CustomEvent('toast', { detail: { message, type, duration } });
    window.dispatchEvent(event);
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastsRef = useRef<Toast[]>([]);

    useEffect(() => {
        toastsRef.current = toasts;
    }, [toasts]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        const handleToast = (e: Event) => {
            const detail = (e as ToastEvent).detail;

            // Rate Limiting & Deduplication: Don't show the exact same message if it's already visible
            const isDuplicate = toastsRef.current.some(t => t.message === detail.message);
            if (isDuplicate) return;

            const id = Date.now();
            const newToast = { id, ...detail };

            setToasts((prev) => {
                // Limit to 3 toasts at any given time to prevent flooding
                const next = [...prev, newToast];
                if (next.length > 3) return next.slice(1);
                return next;
            });

            setTimeout(() => {
                removeToast(id);
            }, detail.duration || 3000);
        };

        window.addEventListener('toast', handleToast);
        return () => window.removeEventListener('toast', handleToast);
    }, [removeToast]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 w-full max-w-[360px] px-6 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
                        relative overflow-hidden pointer-events-auto group
                        flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border backdrop-blur-xl 
                        animate-in fade-in zoom-in slide-in-from-top-4 duration-300
                        ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' : ''}
                        ${t.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-900' : ''}
                        ${t.type === 'info' ? 'bg-slate-900/90 border-slate-700/50 text-white' : ''}
                    `}
                >
                    {/* Background glow effect */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${t.type === 'success' ? 'bg-emerald-500' :
                            t.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                        }`} />

                    <div className={`p-1.5 rounded-xl ${t.type === 'success' ? 'bg-emerald-500/20 text-emerald-600' :
                            t.type === 'error' ? 'bg-rose-500/20 text-rose-600' :
                                'bg-white/10 text-white'
                        }`}>
                        {t.type === 'success' && <CheckCircle2 size={18} strokeWidth={2.5} />}
                        {t.type === 'error' && <AlertCircle size={18} strokeWidth={2.5} />}
                        {t.type === 'info' && <Zap size={18} strokeWidth={2.5} className="fill-current" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-0.5">
                            {t.type === 'success' ? 'Confirmed' : t.type === 'error' ? 'Attention' : 'System Alert'}
                        </p>
                        <p className="text-[13px] font-bold leading-tight tracking-tight">{t.message}</p>
                    </div>

                    <button
                        onClick={() => removeToast(t.id)}
                        className="p-1 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>

                    {/* Progress bar at bottom */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-black/5">
                        <div
                            className={`h-full opacity-40 animate-toast-progress ${t.type === 'success' ? 'bg-emerald-500' :
                                    t.type === 'error' ? 'bg-rose-500' : 'bg-white'
                                }`}
                            style={{ animationDuration: `${t.duration || 3000}ms` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
