"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, clearAuthState } from '@/lib/api';
import AuthGuard from './AuthGuard';
import { toast } from '@/components/ui/Toast';
import { Volume2, VolumeX, Bell, BellOff, Home, Smartphone, QrCode, Receipt, LogOut, ChevronRight, Headphones, Ban } from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import { useStore } from '@/store/useStore';
import SupportModal from './SupportModal';
import BackButton from './BackButton';
import { usePathname } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export default function DashboardLayout({
    children,
    title,
    navItems
}: {
    children: React.ReactNode;
    title: string;
    navItems: NavItem[];
}) {
    const { data: user, mutate: mutateUser } = useApi('/auth/me');
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [showLogoutHint, setShowLogoutHint] = useState(false);
    const pathname = usePathname();
    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLogoutHint(true);
        }, 6000);
        return () => clearTimeout(timer);
    }, []);

    // Load audio preference with Default ON logic
    useEffect(() => {
        const saved = localStorage.getItem('audio_enabled');
        if (saved === 'true') {
            setIsAudioEnabled(true);
        } else if (saved === 'false') {
            setIsAudioEnabled(false);
        } else {
            // Default ON for everyone on first load
            setIsAudioEnabled(true);
            localStorage.setItem('audio_enabled', 'true');
        }
    }, []);

    // Save audio preference
    useEffect(() => {
        if (isAudioEnabled !== null) {
            localStorage.setItem('audio_enabled', isAudioEnabled.toString());
        }
    }, [isAudioEnabled]);

    const router = useRouter();
    const lastTxRef = React.useRef<string | null>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const { setTransactions } = useStore();

    useEffect(() => {
        const handleFirstInteraction = () => {
            initAudio();
        };
        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);
        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    // Initialize AudioContext on first interaction
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // UNLOCK SpeechSynthesis: On many mobile browsers, we must speak
        // at least once during a user gesture to "prime" the engine.
        if (window.speechSynthesis && !window.speechSynthesis.speaking) {
            const silent = new SpeechSynthesisUtterance("");
            silent.volume = 0;
            window.speechSynthesis.speak(silent);
        }
    };

    const [availability, setAvailability] = useState<any>(null);

    const checkNewTransactions = async () => {
        try {
            const res = await apiFetch('/wallet/transactions?limit=10');
            if (res && res.data && res.data.length > 0) {
                const transactions = res.data;
                const latestTx = transactions[0];

                // Sync with global store for real-time history updates
                setTransactions(transactions);

                if (lastTxRef.current && latestTx.id > lastTxRef.current) {
                    const lastId = lastTxRef.current;
                    // Filter for all new credits since the last seen ID
                    const newCredits = transactions.filter((tx: any) =>
                        tx.type === 'CREDIT' &&
                        tx.id > lastId &&
                        tx.amount > 0
                    );

                    if (newCredits.length > 0) {
                        const totalAmount = newCredits.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
                        const sender = newCredits[0].counterparty_name || 'Customer';
                        const formattedAmount = Math.floor(totalAmount); // Remove decimals for cleaner speech

                        console.log(`New payment detected: ₹${totalAmount}`);

                        if (isAudioEnabled) {
                            playNotificationSound(`Rupees ${formattedAmount} received on Open Score`);
                        }

                        toast.success(`Received ₹${totalAmount} from ${sender}`);
                    }
                }

                lastTxRef.current = latestTx.id;
            }
        } catch (e) {
            // silent fail
        }
    };

    useEffect(() => {
        // Fetch Support Availability - only on mount
        apiFetch('/support/availability')
            .then(data => setAvailability(data))
            .catch(err => console.error("Failed to fetch availability", err));

        // Initial check
        checkNewTransactions();

        // Listen for real-time wallet updates to refresh transaction history
        const handleWalletStateUpdate = () => {
            console.log("[DashboardLayout] Wallet state update received, refreshing transactions");
            checkNewTransactions();
        };

        window.addEventListener('walletStateUpdate', handleWalletStateUpdate);
        return () => {
            window.removeEventListener('walletStateUpdate', handleWalletStateUpdate);
        };
    }, [router]);

    const playNotificationSound = (text: string) => {
        if (typeof window === 'undefined') return;

        // Ensure AudioContext and SpeechSynthesis are ready
        initAudio();

        // 1. Play high-frequency Tech Beep
        if (audioContextRef.current) {
            try {
                const ctx = audioContextRef.current;
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(1200, ctx.currentTime);
                o.connect(g);
                g.connect(ctx.destination);
                g.gain.setValueAtTime(0, ctx.currentTime);
                g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                o.start();
                o.stop(ctx.currentTime + 0.4);
            } catch (e) {
                console.error("Tech beep failed", e);
            }
        }

        // 2. Clear out existing speech and try to speak
        if (window.speechSynthesis) {
            // Cancel any pending speech to ensure the new one starts immediately
            window.speechSynthesis.cancel();

            const speak = () => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                const voices = window.speechSynthesis.getVoices();

                // Prioritize Premium or Native sounding voices if available
                const betterVoice =
                    voices.find(v => v.lang.includes('en-IN') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.includes('en-IN')) ||
                    voices.find(v => v.lang.includes('en-GB')) ||
                    voices.find(v => v.lang.includes('en-US'));

                if (betterVoice) utterance.voice = betterVoice;

                // Mobile robustness: sometimes utterance needs a tiny delay after cancel
                setTimeout(() => {
                    window.speechSynthesis.speak(utterance);
                }, 100);
            };

            // Voices often load asynchronously or might be empty on mobile initially
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = speak;
            } else {
                speak();
            }
        }
    };

    const toggleAudio = () => {
        initAudio();
        if (!isAudioEnabled) {
            playNotificationSound("Voice alerts enabled");
            setIsAudioEnabled(true);
            toast.success("Sound notifications turned ON");
        } else {
            setIsAudioEnabled(false);
            toast.error("Sound notifications turned OFF");
        }
    };

    const handleLogout = async () => {
        await clearAuthState();
        mutateUser(null, false);
        if (typeof window !== 'undefined') window.location.href = '/';
    };

    return (
        <AuthGuard>
            <div className={cn(
                "flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900",
                user?.status === 'SUSPENDED' && "pointer-events-none select-none blur-[1px]"
            )}>
                {/* Suspension Overlay */}
                {user?.status === 'SUSPENDED' && (
                    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto">
                        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border border-rose-100 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Ban className="w-10 h-10 text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Account Suspended</h2>
                            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                                Your access has been restricted by the administrator. Please contact your supervisor to resolve this.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
                            >
                                <LogOut size={20} />
                                Logout Securely
                            </button>
                        </div>
                    </div>
                )}
                {/* Desktop Sidebar */}
                <aside className="w-72 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-xl z-20">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                                <img src="/logo.svg" alt="OpenScore" className="w-full h-full" />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900">OpenScore</h1>
                        </div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-11">Powered by MSME Shakti</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-slate-500 font-bold",
                                    `hover:text-${themeColor}-600 group`
                                )}
                            >
                                <span className="group-hover:scale-110 transition-transform text-lg">
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>


                    <div className="p-4 border-t border-slate-100">
                        <Link href="/customer/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className={`w-10 h-10 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform`}>
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate text-slate-900">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.vpa || user?.mobile_number || 'Guest'}</p>
                            </div>
                        </Link>
                    </div>
                </aside >

                {/* Main Content */}
                < main className="flex-1 flex flex-col overflow-hidden relative pb-[5.5rem] md:pb-0 bg-slate-50" >
                    <header className="px-4 pt-12 pb-2.5 md:py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl md:bg-transparent sticky top-0 z-30 border-b md:border-none border-slate-200">
                        <div className="flex items-center gap-3">
                            {!['/customer', '/admin', '/'].includes(pathname) && (
                                <BackButton
                                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                                    fallback="/customer"
                                />
                            )}
                            <h2 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 truncate min-w-0">{title}</h2>
                            {!pathname.includes('/support') && (
                                <>
                                    <button
                                        onClick={toggleAudio}
                                        className={cn(
                                            "p-2 rounded-full transition-all active:scale-95 border",
                                            isAudioEnabled
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}
                                        title={isAudioEnabled ? "Click to Mute" : "Click to Enable Audio Alerts"}
                                    >
                                        {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                    </button>
                                    <Link href="/customer/notifications">
                                        <button
                                            className="p-2 rounded-full bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 relative"
                                            title="Notifications"
                                        >
                                            <Bell size={18} />
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                                        </button>
                                    </Link>
                                    <Link href="/customer/support">
                                        <button
                                            className="p-2 rounded-full bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 transition-all active:scale-95"
                                            title="Help & Support"
                                        >
                                            <Headphones size={18} />
                                        </button>
                                    </Link>
                                </>
                            )}

                            {availability && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-right-4 duration-500 scale-90 sm:scale-100 origin-left flex-shrink-0">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                                        {availability.message}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <Link href="/customer/profile">
                                <div className={`w-9 h-9 rounded-full bg-${themeColor}-100 flex items-center justify-center text-${themeColor}-600 font-black text-sm border border-${themeColor}-200 cursor-pointer active:scale-90 transition-transform`}>
                                    {user?.name?.[0] || 'U'}
                                </div>
                            </Link>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar scroll-smooth">
                        {user ? children : (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 p-6 text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verifying Session...</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Please wait a moment</p>
                                </div>

                                {showLogoutHint && (
                                    <div className="mt-8 pt-6 border-t border-slate-100 max-w-xs animate-in fade-in slide-in-from-top-4 duration-500">
                                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-3">Login taking too long?</p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                        >
                                            Logout & Relogin
                                        </button>
                                        <p className="mt-3 text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">This clears stuck sessions and fixes buffering</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="py-8 text-center opacity-50">
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Powered by MSME Shakti</p>
                        </div>
                    </div>
                </main >
            </div >
        </AuthGuard>
    );
}
