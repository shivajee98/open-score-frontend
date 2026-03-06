'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, UserCheck, CheckCircle2, Cpu, Lock, Globe } from 'lucide-react';

export default function KycVerificationLoading() {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0);
    const [scanActive, setScanActive] = useState(true);

    const phases = [
        { title: 'INITIALIZING UPLINK', info: 'Establishing secure neural bridge...', icon: Globe },
        { title: 'Aadhar SCANNING', info: 'Querying CIDR central database...', icon: Shield },
        { title: 'IDENTITY MATCH', info: 'Verifying facial biometrics & name...', icon: UserCheck },
        { title: 'CREDIT COMPLIANCE', info: 'Aggregating financial data points...', icon: Database },
        { title: 'FINALIZING SANCTION', info: 'Encrypting application payload...', icon: Lock },
    ];

    useEffect(() => {
        const duration = 7000;
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const p = (currentStep / steps) * 100;
            setProgress(p);

            const currentPhase = Math.min(Math.floor((p / 101) * phases.length), phases.length - 1);
            setPhase(currentPhase);

            if (p >= 100) {
                clearInterval(timer);
                setScanActive(false);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-center items-center justify-center overflow-hidden font-mono selection:bg-cyan-500/30">
            {/* Sci-fi Overlay Elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                <div className="absolute inset-0 animate-pulse bg-cyan-500/5" />
            </div>

            {/* Corner Brackets */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-cyan-500/50" />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
                <div className="relative mb-12 group">
                    <div className="absolute -inset-8 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-24 h-24 bg-black border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                        {scanActive && (
                            <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-20" />
                        )}
                        <Cpu className="text-cyan-400 w-10 h-10 animate-pulse" />
                    </div>
                    {/* Scanning Line */}
                    {scanActive && (
                        <div className="absolute -left-12 -right-12 top-0 h-0.5 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                </div>

                <div className="text-center w-full">
                    <h2 className="text-cyan-400 text-xs font-black tracking-[0.3em] uppercase mb-4 opacity-70">
                        Verification protocol active
                    </h2>

                    <div className="relative h-1 bg-slate-900 w-full rounded-full overflow-hidden mb-8 border border-white/5">
                        <div
                            className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="space-y-6">
                        {phases.map((p, idx) => {
                            const Icon = p.icon;
                            const isActive = idx === phase;
                            const isPast = idx < phase;

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' :
                                            isPast ? 'opacity-40 -translate-x-2' : 'opacity-10 translate-x-2'
                                        }`}
                                >
                                    <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center border ${isActive ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400' :
                                            isPast ? 'border-emerald-500/50 text-emerald-500' : 'border-white/5 text-white/20'
                                        }`}>
                                        {isPast ? <CheckCircle2 size={16} /> : <Icon size={16} className={isActive ? 'animate-pulse' : ''} />}
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-400' : isPast ? 'text-emerald-500' : 'text-white/20'
                                            }`}>
                                            {p.title}
                                        </p>
                                        {isActive && (
                                            <p className="text-[9px] text-cyan-400/60 font-bold mt-1 animate-pulse">
                                                {p.info}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Deco */}
                <div className="mt-16 flex items-center gap-2 text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                    <span>Secure Link: OK</span>
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="ml-4">Status: Analyzing</span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: -20px; opacity: 0; }
                    50% { top: 110px; opacity: 1; }
                }
            `}</style>
        </div>
    );
}
