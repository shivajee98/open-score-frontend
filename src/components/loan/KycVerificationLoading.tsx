'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, UserCheck, CreditCard, Smile, Check, X } from 'lucide-react';

interface KycVerificationLoadingProps {
    loanAmount: number;
    onComplete: () => void;
}

export default function KycVerificationLoading({ loanAmount, onComplete }: KycVerificationLoadingProps) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [confetti, setConfetti] = useState<{ id: number; left: string; color: string; duration: string; opacity: number; boxShadow: string }[]>([]);

    const phases = [
        { title: 'Aadhaar Validation', info: 'Validating your Aadhaar details...', icon: Shield },
        { title: 'Income Validation', info: 'Validating your income sources...', icon: Database },
        { title: 'PAN Card Validation', info: 'Verifying PAN information...', icon: CreditCard },
        { title: 'Matching Details', info: 'Reconciling all provided data points...', icon: UserCheck },
        { title: 'Eligibility Check', info: 'Finalizing your loan eligibility...', icon: Smile },
    ];

    useEffect(() => {
        const duration = 30000; // 30 Seconds
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const p = (currentStep / steps) * 100;
            setProgress(p);

            const currentPhase = Math.min(Math.floor((p / 100) * phases.length), phases.length - 1);
            setPhase(currentPhase);

            if (p >= 100) {
                clearInterval(timer);
                // Show dark vibrant congrats message after 1.5 seconds gap
                setTimeout(() => {
                    setShowSuccess(true);
                    triggerDarkConfetti();
                }, 1500);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const triggerDarkConfetti = () => {
        const colors = ['#06b6d4', '#10b981', '#3b82f6', '#fcd34d'];
        const newConfetti = Array.from({ length: 70 }).map((_, i) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            return {
                id: i,
                left: `${Math.random() * 100}vw`,
                color: color,
                duration: `${Math.random() * 2 + 1.5}s`,
                opacity: Math.random() + 0.5,
                boxShadow: `0 0 10px ${color}`
            };
        });
        setConfetti(newConfetti);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',_sans-serif] overflow-hidden">
            {/* Dark & Vibrant Success Overlay */}
            <div
                className={`fixed inset-0 bg-[#050b14] z-[1000] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-800 overflow-hidden ${showSuccess ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Glowing Orbs */}
                <div className="absolute w-[300px] h-[300px] bg-cyan-500/15 rounded-full blur-[60px] -top-[50px] -left-[50px]"></div>
                <div className="absolute w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[70px] -bottom-[100px] -right-[50px]"></div>

                <div className={`relative bg-slate-900/40 backdrop-blur-3xl border border-cyan-500/20 rounded-[28px] px-6 py-10 w-full max-w-[360px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-[1s] z-10 ${showSuccess ? 'translate-y-0 scale-100' : 'translate-y-[30px] scale-[0.95]'
                    }`}>
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-float border-4 border-[#050b14]">
                        <Check size={40} className="text-white" strokeWidth={3} />
                    </div>

                    <h1 className="text-2xl font-black text-white mb-2 tracking-wide shadow-cyan-500/50 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">CONGRATULATIONS</h1>
                    <p className="text-cyan-100/70 font-medium mb-8 text-sm">Your profile has been verified successfully.</p>

                    <div className="bg-[#0b1325] border border-cyan-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 opacity-50"></div>
                        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 relative z-10">Approved Loan Amount</p>
                        <p className={`font-black text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] relative z-10 tracking-tight break-all ${loanAmount.toLocaleString().length > 7 ? 'text-3xl' : 'text-4xl'
                            }`}>{loanAmount.toLocaleString()}</p>
                    </div>

                    <button
                        onClick={onComplete}
                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-black text-lg py-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] active:translate-y-[2px] active:shadow-[0_5px_15px_-5px_rgba(16,185,129,0.4)] transition-all"
                    >
                        Get Money Now
                    </button>
                </div>

                {/* Confetti Elements */}
                {confetti.map((c) => (
                    <div
                        key={c.id}
                        className="absolute w-2 h-4 rounded-sm z-5 pointer-events-none"
                        style={{
                            left: c.left,
                            backgroundColor: c.color,
                            top: '-20px',
                            opacity: c.opacity,
                            boxShadow: c.boxShadow,
                            animation: `fall ${c.duration} cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
                        }}
                    />
                ))}
            </div>

            {/* Main Loading Content */}
            <div className="w-full max-w-[380px] flex flex-col items-center bg-white">

                {/* Lottie-Style Scanner Area */}
                <div className="relative flex items-center justify-center gap-4 h-[140px] w-full mb-6">
                    {/* Left Document (Turns Green) */}
                    <div className="doc-side doc-left relative w-[52px] h-[72px] border-2 border-slate-200 rounded-md flex flex-col p-1.5 gap-1.5 z-[1] bg-white animate-doc-left">
                        <div className="icon-bubble-left absolute -top-2 -right-2 w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center text-white scale-0 shadow-[0_2px_6px_rgba(16,185,129,0.4)] animate-icon-pop-left">
                            <Check size={12} strokeWidth={4} />
                        </div>
                        <div className="w-3.5 h-3.5 bg-current rounded-sm opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-full opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-full opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-[60%] opacity-20"></div>
                    </div>

                    {/* Center Document (Scanning) */}
                    <div className="doc-center relative w-[76px] h-[104px] background-[#f8fafc] border-[3px] border-slate-300 rounded-lg flex flex-col p-2.5 gap-2 z-[2] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-[#f8fafc]">
                        <div className="scan-line absolute left-[-12px] right-[-12px] h-1 bg-[#3b82f6] rounded-md shadow-[0_0_12px_2px_rgba(59,130,246,0.6)] z-10 top-0 animate-scan-move"></div>
                        <div className="w-6 h-6 bg-slate-300 rounded-md"></div>
                        <div className="h-1 bg-slate-300 rounded-[2px] w-full"></div>
                        <div className="h-1 bg-slate-300 rounded-[2px] w-full"></div>
                        <div className="h-1 bg-slate-300 rounded-[2px] w-full"></div>
                        <div className="h-1 bg-slate-300 rounded-[2px] w-[60%]"></div>
                    </div>

                    {/* Right Document (Turns Orange) */}
                    <div className="doc-side doc-right relative w-[52px] h-[72px] border-2 border-slate-200 rounded-md flex flex-col p-1.5 gap-1.5 z-[1] bg-white animate-doc-right">
                        <div className="icon-bubble-right absolute -top-2 -left-2 w-5 h-5 bg-[#f97316] rounded-full flex items-center justify-center text-white scale-0 shadow-[0_2px_6px_rgba(249,115,22,0.4)] animate-icon-pop-right">
                            <X size={12} strokeWidth={4} />
                        </div>
                        <div className="w-3.5 h-3.5 bg-current rounded-sm opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-full opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-[60%] opacity-20"></div>
                        <div className="line h-[3px] bg-current rounded-sm w-full opacity-20"></div>
                    </div>
                </div>

                <h2 className="text-xs font-black tracking-[0.25em] text-slate-800 uppercase mb-10">
                    Analyzing Eligibility
                </h2>

                {/* Progress Tracking */}
                <div className="w-full mb-10 px-4">
                    <div className="h-2 bg-slate-100 rounded-xl overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-3">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 leading-none">{Math.floor(progress)}%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Processing Profile</span>
                        </div>
                        <div className="text-right flex items-end">
                            <span className={`text-[11px] font-bold uppercase tracking-widest block px-3 py-1.5 rounded-md border transition-all duration-500 ${progress >= 100 ? 'text-white bg-emerald-500 shadow-md border-transparent' : 'text-cyan-600 bg-cyan-50 border-cyan-100'
                                }`}>
                                {progress >= 100 ? 'Complete' : 'Verifying Data'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Phases List */}
                <div className="w-full space-y-6 px-4">
                    {phases.map((p, i) => {
                        const Icon = p.icon;
                        const isActive = i === phase;
                        const isPast = i < phase;

                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-5 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' :
                                    isPast ? 'opacity-50 translate-y-0' : 'opacity-30 translate-y-3'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${isActive ? 'border-cyan-400 bg-cyan-50 shadow-[0_4px_15px_rgba(6,182,212,0.2)] scale-110 animate-soft-pulse' :
                                    isPast ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-white'
                                    }`}>
                                    {isPast ? (
                                        <Check size={22} className="text-emerald-500" strokeWidth={3} />
                                    ) : (
                                        <Icon size={22} className={isActive ? 'text-cyan-500' : 'text-slate-300'} strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <span className={`text-[13px] font-black uppercase tracking-wider truncate transition-colors duration-500 ${isActive ? 'text-slate-900' :
                                        isPast ? 'text-emerald-600 font-bold' : 'text-slate-400'
                                        }`}>
                                        {p.title}
                                    </span>
                                    <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'h-[18px] opacity-100' : 'h-0 opacity-0'}`}>
                                        <span className="text-[11px] text-cyan-600 font-bold block mt-1">{p.info}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Security Footer */}
                <div className="mt-14 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-200 shadow-sm">
                        <Shield size={16} className="text-emerald-500" strokeWidth={2.5} />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Safe & Secure Process</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Verified by RBI Regulated Entity</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes scanMove {
                    0%, 100% { transform: translateY(-10px); }
                    50% { transform: translateY(110px); }
                }
                @keyframes docLeftColor {
                    0%, 15%, 85%, 100% { border-color: #cbd5e1; background: #ffffff; color: #64748b; }
                    30%, 70% { border-color: #10b981; background: #ecfdf5; color: #10b981; }
                }
                @keyframes iconPopLeft {
                    0%, 15%, 85%, 100% { transform: scale(0); }
                    30%, 70% { transform: scale(1); }
                }
                @keyframes docRightColor {
                    0%, 35%, 100% { border-color: #cbd5e1; background: #ffffff; color: #64748b; }
                    50%, 85% { border-color: #f97316; background: #fff7ed; color: #f97316; }
                }
                @keyframes iconPopRight {
                    0%, 35%, 100% { transform: scale(0); }
                    50%, 85% { transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes soft-pulse { 
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.3); } 
                    50% { transform: scale(1.1); box-shadow: 0 0 20px 6px rgba(6, 182, 212, 0.15); } 
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fall { 
                    to { transform: translateY(110vh) rotate(720deg); } 
                }
                .animate-scan-move { animation: scanMove 2.5s infinite ease-in-out; }
                .animate-doc-left { animation: docLeftColor 2.5s infinite ease-in-out; }
                .animate-icon-pop-left { animation: iconPopLeft 2.5s infinite ease-in-out; }
                .animate-doc-right { animation: docRightColor 2.5s infinite ease-in-out; }
                .animate-icon-pop-right { animation: iconPopRight 2.5s infinite ease-in-out; }
                .animate-shimmer { animation: shimmer 1.5s infinite; }
                .animate-soft-pulse { animation: soft-pulse 2s infinite ease-in-out; }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
