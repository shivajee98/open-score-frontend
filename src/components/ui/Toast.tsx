'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastEvent extends CustomEvent {
    detail: {
        message: string;
        type: ToastType;
    };
}

export const toast = {
    success: (message: string) => dispatchToast(message, 'success'),
    error: (message: string) => dispatchToast(message, 'error'),
    info: (message: string) => dispatchToast(message, 'info'),
};

function dispatchToast(message: string, type: ToastType) {
    const event = new CustomEvent('toast', { detail: { message, type } });
    window.dispatchEvent(event);
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

    useEffect(() => {
        const handleToast = (e: Event) => {
            const detail = (e as ToastEvent).detail;
            const id = Date.now();
            setToasts((prev) => [...prev, { id, ...detail }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3000);
        };

        window.addEventListener('toast', handleToast);
        return () => window.removeEventListener('toast', handleToast);
    }, []);

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
            flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md pointer-events-auto transform transition-all animate-in slide-in-from-top-2
            ${t.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50 text-white' : ''}
            ${t.type === 'error' ? 'bg-rose-500/90 border-rose-400/50 text-white' : ''}
            ${t.type === 'info' ? 'bg-slate-800/90 border-slate-700/50 text-white' : ''}
          `}
                >
                    {t.type === 'success' && <CheckCircle size={18} />}
                    {t.type === 'error' && <AlertCircle size={18} />}
                    {t.type === 'info' && <AlertCircle size={18} />}
                    <p className="text-sm font-bold tracking-wide">{t.message}</p>
                </div>
            ))}
        </div>
    );
}
