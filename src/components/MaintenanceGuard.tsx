'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';

interface MaintenanceConfig {
    is_active: boolean;
    message: string;
    textColor: string;
    backgroundColor: string;
    fontFamily: string;
    end_time: string | null;
}

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<MaintenanceConfig | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const checkMaintenance = async () => {
        try {
            const data = await apiFetch('/maintenance', { skipAuthCheck: true }) as MaintenanceConfig;
            setConfig(data);
        } catch (error) {
            console.error('[MaintenanceGuard] Check failed:', error);
        }
    };

    useEffect(() => {
        checkMaintenance();
        // Poll every 10 minutes
        const pollInterval = setInterval(checkMaintenance, 10 * 60 * 1000);
        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (!config?.is_active || !config?.end_time) return;

        const updateTimer = () => {
            const end = new Date(config.end_time!).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                // Optional: Re-check maintenance status if timer hits zero
                checkMaintenance();
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [config]);

    if (config?.is_active) {
        return (
            <div
                className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700"
                style={{
                    backgroundColor: config.backgroundColor,
                    color: config.textColor,
                    fontFamily: config.fontFamily
                }}
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

                <div className="max-w-md w-full space-y-8 relative">
                    {/* Icon with Ring Animation */}
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-current opacity-10 animate-ping" />
                        <div className="absolute inset-2 rounded-full border border-current opacity-20" />
                        <ShieldAlert size={64} strokeWidth={1} />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                            System <br /> Maintenance
                        </h1>
                        <p className="text-lg md:text-xl opacity-80 leading-relaxed font-medium bg-white/5 py-4 px-6 rounded-2xl backdrop-blur-sm border border-current/10">
                            {config.message}
                        </p>
                    </div>

                    {config.end_time && (
                        <div className="pt-8 space-y-3">
                            <p className="text-xs uppercase tracking-[0.3em] font-black opacity-50 flex items-center justify-center gap-2">
                                <Clock size={14} /> Estimated Resumption In
                            </p>
                            <div className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums drop-shadow-2xl">
                                {timeLeft}
                            </div>
                        </div>
                    )}

                    <div className="pt-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-current/20 text-xs font-bold opacity-60">
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            Auto-refreshing in real-time
                        </div>
                    </div>
                </div>

                {/* Subtle Background Elements */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
            </div>
        );
    }

    return <>{children}</>;
}
