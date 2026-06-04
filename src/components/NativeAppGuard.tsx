'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  Smartphone, 
  Shield, 
  Activity, 
  Sparkles, 
  Users, 
  Wallet, 
  Coins, 
  Lock, 
  CheckCircle, 
  TrendingUp, 
  Gift, 
  Menu, 
  ArrowRight, 
  Download, 
  UserPlus, 
  LogIn, 
  Headphones, 
  X, 
  Check, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';

/**
 * NativeAppGuard blocks the entire UI from rendering in regular browsers.
 * Only Capacitor WebView (Android/iOS) and developer bypass are allowed.
 */

const BYPASS_KEY = 'DEVELOPER_BYPASS';

function isCapacitorNative(): boolean {
    try {
        return Capacitor.isNativePlatform();
    } catch {
        return false;
    }
}

function hasDeveloperBypass(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const params = new URLSearchParams(window.location.search);
        const urlSecret = params.get('dev_bypass');
        if (urlSecret && urlSecret.length > 8) {
            localStorage.setItem(BYPASS_KEY, urlSecret);
            params.delete('dev_bypass');
            const cleanSearch = params.toString();
            const cleanUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
            window.history.replaceState(null, '', cleanUrl);
            return true;
        }
    } catch {}

    const secret = localStorage.getItem(BYPASS_KEY);
    return !!secret && secret.length > 8;
}

export default function NativeAppGuard({ children }: { children: React.ReactNode }) {
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [showBypassModal, setShowBypassModal] = useState<boolean>(false);
    const [bypassSecretInput, setBypassSecretInput] = useState<string>('');
    const [bypassError, setBypassError] = useState<string>('');
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);

    useEffect(() => {
        const checkAccess = async () => {
            const isNative = isCapacitorNative();
            const hasBypass = hasDeveloperBypass();

            const params = new URLSearchParams(window.location.search);
            const hasAdminBridge = !!params.get('token') && params.get('admin_preview') === 'true';

            const path = window.location.pathname.replace(/\/$/, '');
            const isPublicRoute = path.startsWith('/public') 
                || path.startsWith('/privacy-policy')
                || path.startsWith('/qr-update')
                || path === '/qr'
                || path.startsWith('/info')
                || path.startsWith('/p-policy')
                || path.startsWith('/t-and-c');

            if (isNative || hasBypass || hasAdminBridge || isPublicRoute) {
                setAllowed(true);
                return;
            }

            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.msmeloan.sbs/api';
                const res = await fetch(`${apiBase}/check-dev-bypass`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.bypass && data.secret) {
                        localStorage.setItem(BYPASS_KEY, data.secret);
                        setAllowed(true);
                        return;
                    }
                }
            } catch {}

            setAllowed(false);
        };

        checkAccess();
    }, []);

    const handleBypassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bypassSecretInput.trim()) {
            setBypassError('Bypass secret is required');
            return;
        }

        setIsValidating(true);
        setBypassError('');

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.msmeloan.sbs/api';
            const res = await fetch(`${apiBase}/check-dev-bypass`, {
                method: 'GET',
                headers: {
                    'Developer-Bypass-Secret': bypassSecretInput,
                    'DEVELOPER-BYPASS-SECRET': bypassSecretInput,
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.bypass) {
                    localStorage.setItem(BYPASS_KEY, bypassSecretInput);
                    window.location.reload();
                    return;
                }
            }
            setBypassError('Invalid bypass secret. Please verify your token.');
        } catch (err) {
            setBypassError('Connection error. Please try again.');
        } finally {
            setIsValidating(false);
        }
    };

    if (allowed === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030816]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-t-[#c5a029] border-r-[#c5a029] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-transparent border-b-indigo-500 border-l-indigo-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                </div>
            </div>
        );
    }

    if (!allowed) {
        return (
            <div className="min-h-screen w-full bg-[#030816] text-[#e2e8f0] overflow-y-auto font-sans relative selection:bg-[#c5a029] selection:text-[#030816]">
                
                {/* Font Loading & Custom Styling */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                
                <style>{`
                    .font-display { font-family: 'Outfit', sans-serif; }
                    .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
                    
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-12px) rotate(1.5deg); }
                    }
                    @keyframes float-medium {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-8px) rotate(-1deg); }
                    }
                    @keyframes float-fast {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-5px); }
                    }
                    @keyframes glow-pulse {
                        0%, 100% { opacity: 0.15; transform: scale(1); filter: blur(80px); }
                        50% { opacity: 0.35; transform: scale(1.15); filter: blur(100px); }
                    }
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
                    .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
                    .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
                    .animate-glow-pulse { animation: glow-pulse 6s ease-in-out infinite; }
                    .shimmer-text {
                        background: linear-gradient(90deg, #c5a029 0%, #f7e38a 25%, #c5a029 50%, #f7e38a 75%, #c5a029 100%);
                        background-size: 200% auto;
                        color: transparent;
                        -webkit-background-clip: text;
                        background-clip: text;
                        animation: shimmer 5s linear infinite;
                    }
                `}</style>

                {/* Glowing Backdrops */}
                <div className="absolute top-[10%] left-[20%] w-[45vw] h-[45vw] bg-indigo-600 rounded-full animate-glow-pulse pointer-events-none z-0" />
                <div className="absolute top-[30%] right-[10%] w-[50vw] h-[50vw] bg-[#c5a029] rounded-full animate-glow-pulse pointer-events-none z-0" style={{ animationDelay: '-3s' }} />

                {/* Navigation Header */}
                <header className="sticky top-0 w-full z-50 backdrop-blur-md border-b border-indigo-950/40 bg-[#030816]/75 px-4 md:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a029] via-[#f7e38a] to-[#c5a029] p-[1.5px] shadow-lg shadow-yellow-500/10">
                            <div className="w-full h-full rounded-xl bg-[#030816] flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#c5a029]">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-white via-indigo-100 to-[#c5a029] bg-clip-text text-transparent">
                            OPEN SCORE
                        </span>
                    </div>

                    <button 
                        onClick={() => setShowBypassModal(true)} 
                        className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#c5a029]/30 bg-[#c5a029]/5 text-xs font-bold text-[#c5a029] hover:bg-[#c5a029]/15 hover:border-[#c5a029]/50 transition-all duration-300 active:scale-95 shadow-md shadow-yellow-500/5 cursor-pointer"
                    >
                        <Lock size={12} className="group-hover:rotate-12 transition-transform" />
                        <span>BYPASS</span>
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="relative max-w-7xl mx-auto px-6 pt-10 md:pt-16 pb-20 z-10 flex flex-col items-center">
                    
                    {/* Welcome Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-[#c5a029] font-display font-semibold text-xs tracking-[0.18em] uppercase mb-6 shadow-inner shadow-indigo-500/5">
                        <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
                        <span>Welcome To Open Score</span>
                        <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
                    </div>

                    {/* Slogan & Title */}
                    <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-center leading-tight tracking-tight max-w-4xl mb-4">
                        <span className="text-white">OPEN </span>
                        <span className="shimmer-text">SCORE</span>
                    </h1>
                    
                    <p className="font-display font-semibold text-base sm:text-xl md:text-2xl text-center text-[#c5a029] tracking-wider mb-3">
                        Earn More • Grow Faster • Stay Connected
                    </p>

                    <p className="font-body text-sm sm:text-base text-indigo-200/75 text-center max-w-2xl leading-relaxed mb-12">
                        One Platform for Digital Services, Rewards & Growth Opportunities.
                    </p>

                    {/* Interactive Graphics Showcase */}
                    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 px-2">
                        
                        {/* Orbit Feature Left */}
                        <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
                            <div className="p-5 rounded-2xl border border-indigo-950/60 bg-[#060c1f]/60 backdrop-blur-md flex gap-4 hover:border-[#c5a029]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/50 flex items-center justify-center text-[#c5a029] border border-indigo-900/30 shrink-0">
                                    <Shield size={22} />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-base mb-1">Secure & Trusted</h3>
                                    <p className="font-body text-xs text-indigo-200/60 leading-relaxed">Enterprise-grade device bindings & data encryption.</p>
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-2xl border border-indigo-950/60 bg-[#060c1f]/60 backdrop-blur-md flex gap-4 hover:border-[#c5a029]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/50 flex items-center justify-center text-emerald-400 border border-indigo-900/30 shrink-0">
                                    <Activity size={22} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-base mb-1">Fast & Easy</h3>
                                    <p className="font-body text-xs text-indigo-200/60 leading-relaxed">Lightning quick verification, payout and tracking.</p>
                                </div>
                            </div>
                        </div>

                        {/* Showcase Centerpiece Smartphone */}
                        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 py-8 relative">
                            {/* Reflex base platform */}
                            <div className="absolute bottom-[-10px] w-72 md:w-80 h-12 bg-gradient-to-t from-[#c5a029]/20 to-transparent blur-md rounded-full pointer-events-none" />
                            
                            {/* Gold rings base */}
                            <div className="absolute bottom-0 w-64 md:w-72 h-4 border border-[#c5a029]/20 rounded-full z-0 transform rotate-x-45 flex items-center justify-center">
                                <div className="w-56 h-3 border border-[#c5a029]/30 rounded-full animate-pulse" />
                            </div>

                            {/* Floating Phone Model */}
                            <div className="relative w-64 sm:w-72 aspect-[9/18.5] bg-[#02050f] rounded-[40px] border-4 border-slate-800 p-2.5 shadow-[0_20px_50px_rgba(3,8,22,0.9)] animate-float-slow z-10 before:content-[''] before:absolute before:top-2 before:left-1/2 before:-translate-x-1/2 before:w-20 before:h-4 before:bg-slate-800 before:rounded-full">
                                
                                {/* Inner Screen Grid Wallpaper */}
                                <div className="w-full h-full rounded-[30px] overflow-hidden bg-[#030816] flex flex-col p-3 relative border border-slate-900 select-none">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#14244a_0%,transparent_70%)] pointer-events-none" />
                                    
                                    {/* Mock App Header */}
                                    <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2 mb-3 mt-1.5 z-10">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded bg-[#c5a029]/10 flex items-center justify-center">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#c5a029]">
                                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <span className="font-display font-extrabold text-[8px] text-white tracking-widest">OPEN SCORE</span>
                                        </div>
                                        <Menu size={10} className="text-indigo-400" />
                                    </div>

                                    {/* App Balance Board Card */}
                                    <div className="relative w-full rounded-2xl border border-[#c5a029]/30 bg-gradient-to-br from-[#060c1f] via-[#091535] to-[#040a1c] p-3.5 shadow-inner shadow-[#c5a029]/5 mb-3 overflow-hidden z-10">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#c5a029]/10 to-transparent blur-md rounded-full pointer-events-none" />
                                        <p className="font-body font-bold text-[8px] text-indigo-400 uppercase tracking-widest mb-0.5">Total Balance</p>
                                        <p className="font-display font-black text-lg text-[#c5a029] mb-3"> 25,680.00</p>
                                        
                                        <div className="flex justify-between border-t border-indigo-950/60 pt-2 gap-1">
                                            <div>
                                                <p className="font-body text-[6px] text-indigo-300/60 leading-none">Wallet Balance</p>
                                                <p className="font-display font-bold text-[9px] text-white"> 15,430.00</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-body text-[6px] text-indigo-300/60 leading-none">Reward Balance</p>
                                                <p className="font-display font-bold text-[9px] text-[#c5a029]"> 10,250.00</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Mock */}
                                    <div className="grid grid-cols-2 gap-2 mb-3.5 z-10">
                                        <div className="rounded-xl border border-indigo-950 bg-indigo-950/20 p-2 flex flex-col items-center justify-center gap-1">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-900/40 flex items-center justify-center text-[#c5a029]">
                                                <TrendingUp size={11} />
                                            </div>
                                            <span className="font-display font-bold text-[6px] text-white">Deposit Growth</span>
                                        </div>
                                        <div className="rounded-xl border border-indigo-950 bg-indigo-950/20 p-2 flex flex-col items-center justify-center gap-1">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                                                <Gift size={11} />
                                            </div>
                                            <span className="font-display font-bold text-[6px] text-white">My Rewards</span>
                                        </div>
                                    </div>

                                    {/* Mock Transaction List */}
                                    <div className="flex-1 flex flex-col z-10 overflow-hidden">
                                        <p className="font-display font-bold text-[7px] text-indigo-300 uppercase tracking-widest mb-1.5">Recent Activity</p>
                                        <div className="space-y-1.5 flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#060c1f]/80 border border-indigo-950/40">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-4 h-4 rounded bg-[#c5a029]/10 flex items-center justify-center text-[#c5a029] text-[7px]"></div>
                                                    <div>
                                                        <p className="font-display font-bold text-[7px] text-white">Bonus Earning</p>
                                                        <p className="font-body text-[5px] text-indigo-300/40">Today, 10:22 AM</p>
                                                    </div>
                                                </div>
                                                <span className="font-display font-bold text-[7px] text-emerald-400">+500.00</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#060c1f]/80 border border-indigo-950/40 opacity-70">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400"><TrendingDown size={8} /></div>
                                                    <div>
                                                        <p className="font-display font-bold text-[7px] text-white">Wallet Withdrawal</p>
                                                        <p className="font-body text-[5px] text-indigo-300/40">Yesterday, 4:15 PM</p>
                                                    </div>
                                                </div>
                                                <span className="font-display font-bold text-[7px] text-indigo-200">-2,000.00</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* App Access Warning Overlay inside mockup */}
                                    <div className="absolute inset-0 bg-[#030816]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 animate-fade-in">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-2.5 animate-bounce">
                                            <Smartphone size={16} />
                                        </div>
                                        <p className="font-display font-black text-[12px] text-white leading-tight mb-1">APP ONLY</p>
                                        <p className="font-body text-[7px] text-indigo-200/70 max-w-[140px] leading-relaxed">Please access via our official application</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating decorative items (wallet and shield in mockup) */}
                            {/* Blue Leather Wallet floating left */}
                            <div className="absolute left-[0%] top-[45%] w-24 h-24 rounded-2xl border border-indigo-950 bg-gradient-to-br from-[#0c1836] to-[#04081c] p-3 shadow-2xl animate-float-medium flex flex-col justify-between z-20">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[#c5a029]">
                                    <Wallet size={16} />
                                </div>
                                <div>
                                    <p className="font-display font-black text-xs text-white">Wallet</p>
                                    <p className="font-body text-[8px] text-indigo-300/60">Digital Treasury</p>
                                </div>
                            </div>

                            {/* Gold Shield floating right */}
                            <div className="absolute right-[0%] top-[25%] w-24 h-24 rounded-2xl border border-[#c5a029]/30 bg-gradient-to-br from-[#121c0e] to-[#040803] p-3 shadow-2xl animate-float-slow flex flex-col justify-between z-20" style={{ animationDelay: '-1.5s' }}>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#c5a029]">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <p className="font-display font-black text-xs text-emerald-400">Verified</p>
                                    <p className="font-body text-[8px] text-emerald-500/60">Safe & Insured</p>
                                </div>
                            </div>
                        </div>

                        {/* Orbit Feature Right */}
                        <div className="lg:col-span-3 flex flex-col gap-6 order-3">
                            <div className="p-5 rounded-2xl border border-indigo-950/60 bg-[#060c1f]/60 backdrop-blur-md flex gap-4 hover:border-[#c5a029]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/50 flex items-center justify-center text-[#c5a029] border border-indigo-900/30 shrink-0">
                                    <Headphones size={22} />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-base mb-1">24/7 Support</h3>
                                    <p className="font-body text-xs text-indigo-200/60 leading-relaxed">Dedicated expert support is always one tap away.</p>
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-2xl border border-indigo-950/60 bg-[#060c1f]/60 backdrop-blur-md flex gap-4 hover:border-[#c5a029]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/30 shrink-0">
                                    <Users size={22} />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-base mb-1">Trusted Platform</h3>
                                    <p className="font-body text-xs text-indigo-200/60 leading-relaxed">Empowering active users nationwide with absolute trust.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WHY CHOOSE OPEN SCORE Divider */}
                    <div className="w-full flex items-center justify-center gap-4 mb-16">
                        <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#c5a029]" />
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#c5a029] tracking-[0.25em] uppercase text-center shrink-0">
                            ♦ WHY CHOOSE OPEN SCORE? ♦
                        </span>
                        <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#c5a029]" />
                    </div>

                    {/* Cards Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-24 px-2">
                        {[
                            {
                                title: 'EASY REGISTRATION',
                                text: 'Quick sign up and start your journey in minutes.',
                                icon: <UserPlus size={20} className="text-[#c5a029]" />,
                                colorClass: 'hover:border-[#c5a029]'
                            },
                            {
                                title: 'SECURE PLATFORM',
                                text: 'Advanced security to protect your account & data.',
                                icon: <Lock size={20} className="text-[#c5a029]" />,
                                colorClass: 'hover:border-[#c5a029]'
                            },
                            {
                                title: 'EARN MORE',
                                text: 'Multiple earning opportunities to grow your income.',
                                icon: <TrendingUp size={20} className="text-[#c5a029]" />,
                                colorClass: 'hover:border-[#c5a029]'
                            },
                            {
                                title: 'TEAM & REFERRALS',
                                text: 'Invite, connect and earn more together.',
                                icon: <Users size={20} className="text-[#c5a029]" />,
                                colorClass: 'hover:border-[#c5a029]'
                            },
                            {
                                title: 'REWARDS & OFFERS',
                                text: 'Exciting rewards and offers for active members.',
                                icon: <Gift size={20} className="text-[#c5a029]" />,
                                colorClass: 'hover:border-[#c5a029]'
                            }
                        ].map((card, idx) => (
                            <div 
                                key={idx}
                                className={`p-6 rounded-2xl border border-indigo-950/60 bg-[#060c1f]/40 backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 ${card.colorClass} group`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/40 flex items-center justify-center border border-indigo-900/30 mb-4 group-hover:scale-110 transition-transform">
                                    {card.icon}
                                </div>
                                <h4 className="font-display font-black text-xs text-white tracking-widest uppercase mb-2">{card.title}</h4>
                                <p className="font-body text-xs text-indigo-200/50 leading-relaxed">{card.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Stats Counter Row */}
                    <div className="w-full max-w-5xl rounded-3xl border border-indigo-950/80 bg-[#060c1f]/35 backdrop-blur-md p-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 px-4 shadow-xl">
                        {[
                            { num: '50K+', label: 'Active Users' },
                            { num: '1M+', label: 'Transactions' },
                            { num: '25Cr+', label: 'Wallet Loaded' },
                            { num: '99.9%', label: 'Trust & Safety' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <span className="font-display font-black text-2xl sm:text-4xl text-[#c5a029] mb-1">{stat.num}</span>
                                <span className="font-body text-[10px] sm:text-xs text-indigo-200/50 tracking-wider uppercase font-semibold">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA Block */}
                    <div className="w-full max-w-4xl rounded-3xl bg-gradient-to-b from-indigo-950/50 to-indigo-900/10 border border-indigo-500/20 p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a029] to-transparent" />
                        
                        <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
                            READY TO GET <span className="text-[#c5a029]">STARTED?</span>
                        </h2>
                        
                        <p className="font-body text-sm text-indigo-200/70 max-w-lg mb-8 leading-relaxed">
                            Create your account now and unlock unlimited digital opportunities. Download our official Android app to secure your access.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                            {/* Gradient Play Store download Button */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.openscore.sbs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#c5a029] via-[#f7e38a] to-[#c5a029] text-[#030816] rounded-xl font-display font-extrabold text-sm tracking-widest uppercase hover:brightness-105 transition-all active:scale-95 shadow-lg shadow-yellow-500/10 cursor-pointer"
                            >
                                <Download size={16} strokeWidth={2.5} />
                                <span>DOWNLOAD APP</span>
                            </a>

                            {/* White Outline Bypass/Login Trigger Button */}
                            <button
                                onClick={() => setShowBypassModal(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-indigo-500/30 text-indigo-200 rounded-xl font-display font-bold text-sm tracking-widest uppercase hover:bg-indigo-950/30 hover:border-indigo-500/60 transition-all active:scale-95 cursor-pointer"
                            >
                                <Lock size={15} />
                                <span>DEVELOPER LOGIN</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Footer section */}
                <footer className="w-full border-t border-indigo-950/60 bg-[#01040d] py-6 px-12 text-center flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <p className="font-body text-[10px] text-indigo-300/40">
                        &copy; 2026 Open Score Services. All Rights Reserved.
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        {[
                            { icon: <Shield size={11} />, text: 'Safe & Secure' },
                            { icon: <Activity size={11} />, text: 'Instant Access' },
                            { icon: <Headphones size={11} />, text: 'Best Support' },
                            { icon: <CheckCircle size={11} />, text: 'Trusted Platform' }
                        ].map((item, key) => (
                            <div key={key} className="flex items-center gap-1.5 text-indigo-300/40">
                                {item.icon}
                                <span className="font-body text-[9px] font-bold tracking-wider uppercase leading-none">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </footer>

                {/* Sleek Glassmorphic Developer Bypass Password Modal */}
                {showBypassModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030816]/80 backdrop-blur-md animate-fade-in">
                        <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/25 bg-gradient-to-b from-[#0a1435] to-[#04081c] p-6 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a029] to-transparent" />
                            
                            {/* Modal Close */}
                            <button 
                                onClick={() => {
                                    setShowBypassModal(false);
                                    setBypassError('');
                                }}
                                className="absolute top-4 right-4 text-indigo-400 hover:text-white hover:bg-indigo-950/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex flex-col items-center text-center mt-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-950/50 flex items-center justify-center border border-indigo-900/30 text-[#c5a029] mb-4">
                                    <Lock size={22} className="animate-pulse" />
                                </div>
                                <h3 className="font-display font-black text-xl text-white mb-2">Developer Access</h3>
                                <p className="font-body text-xs text-indigo-200/50 leading-relaxed mb-6">
                                    Please enter your Developer Bypass Secret. If valid, you will be granted standard browser access.
                                </p>

                                <form onSubmit={handleBypassSubmit} className="w-full">
                                    <div className="relative w-full mb-4">
                                        <input 
                                            type="password" 
                                            value={bypassSecretInput}
                                            onChange={(e) => setBypassSecretInput(e.target.value)}
                                            placeholder="Enter bypass secret key..."
                                            className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#030816]/70 text-white placeholder-indigo-300/30 text-sm font-semibold outline-none focus:border-[#c5a029]/50 transition-all font-body"
                                            disabled={isValidating}
                                            autoFocus
                                        />
                                    </div>

                                    {bypassError && (
                                        <p className="font-body text-xs font-semibold text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg text-left">
                                            {bypassError}
                                        </p>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={isValidating}
                                        className="w-full py-3 bg-[#c5a029] text-[#030816] rounded-xl font-display font-extrabold text-xs tracking-widest uppercase hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isValidating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[#030816] border-t-transparent rounded-full animate-spin" />
                                                <span>VALIDATING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>VERIFY & ACCESS</span>
                                                <ArrowRight size={14} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
}

