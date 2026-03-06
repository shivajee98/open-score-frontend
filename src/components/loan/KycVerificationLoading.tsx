'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, UserCheck, CheckCircle2, Lock, Globe, Check } from 'lucide-react';

export default function KycVerificationLoading() {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0);

    const phases = [
        { title: 'Neural Handshake', info: 'Establishing secure gateway...', icon: Globe },
        { title: 'Aadhar Retrieval', info: 'Connecting to CIDR vaults...', icon: Shield },
        { title: 'Biometric Cross-check', info: 'Validating facial markers...', icon: UserCheck },
        { title: 'Credit Bureau Sync', info: 'Analyzing history points...', icon: Database },
        { title: 'Final Authorization', info: 'Generating unique token...', icon: Lock },
    ];

    useEffect(() => {
        const duration = 30000;
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
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 font-sans overflow-hidden">
            <div className="w-full max-w-[360px] flex flex-col items-center">

                {/* Realistic Book Logo Section */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="book-wrapper mb-6 relative w-[100px] h-[70px]">
                        {/* Stack depth effect */}
                        <div className="page-stack page-stack-left absolute top-[5px] left-[calc(50%-46px)] w-[46px] h-[60px] bg-white border border-[#dcdcdc] rounded-[4px_2px_2px_4px] border-r-0" style={{ transform: 'translate(-2px, 1px)', background: 'linear-gradient(to right, #fff 80%, #f0f0f0 100%)' }}></div>
                        <div className="page-stack page-stack-right absolute top-[5px] left-1/2 w-[46px] h-[60px] bg-white border border-[#dcdcdc] rounded-[2px_4px_4px_2px] border-l-0" style={{ transform: 'translate(2px, 1px)', background: 'linear-gradient(to left, #fff 80%, #f0f0f0 100%)' }}></div>

                        {/* Main Base */}
                        <div className="page-stack page-stack-left absolute top-[5px] left-[calc(50%-46px)] w-[46px] h-[60px] bg-white border border-[#dcdcdc] rounded-[4px_2px_2px_4px] border-r-0" style={{ background: 'linear-gradient(to right, #fff 80%, #f0f0f0 100%)' }}></div>
                        <div className="page-stack page-stack-right absolute top-[5px] left-1/2 w-[46px] h-[60px] bg-white border border-[#dcdcdc] rounded-[2px_4px_4px_2px] border-l-0" style={{ background: 'linear-gradient(to left, #fff 80%, #f0f0f0 100%)' }}></div>

                        <div className="book-spine absolute left-1/2 -translate-x-1/2 w-[6px] h-full bg-gradient-to-r from-[#d1d1d1] via-[#e0e0e0] to-[#d1d1d1] rounded-[3px] z-10 shadow-sm"></div>

                        {/* Animated Pages with Content */}
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="page absolute top-[5px] left-1/2 w-[46px] h-[60px] bg-[#fdfdfd] border border-[#dcdcdc] rounded-[2px_4px_4px_2px] origin-left animate-flip-page p-1.5 flex flex-col gap-1" style={{ animationDelay: `${i * 0.2}s`, zIndex: 5 - i }}>
                                <div className="page-circle w-3 h-3 rounded-full bg-[#f0f0f0] mb-1" style={i === 1 ? { background: '#e0f7fa' } : {}}></div>
                                <div className="page-line h-[3px] bg-[#f0f0f0] rounded-[2px] w-full" style={i === 1 ? { background: '#e0f7fa' } : {}}></div>
                                <div className="page-line h-[3px] bg-[#f0f0f0] rounded-[2px] w-full"></div>
                                <div className="page-line h-[3px] bg-[#f0f0f0] rounded-[2px] w-[60%]"></div>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">
                        Securely Processing
                    </h2>
                </div>

                {/* Progress Tracking */}
                <div className="w-full mb-10 px-2">
                    <div className="progress-track h-1.5 bg-[#f5f5f5] rounded-xl overflow-hidden shadow-inner">
                        <div
                            className="progress-bar h-full bg-gradient-to-r from-[#00b8d4] to-[#26c6da] relative transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-3">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-800 leading-none">{Math.floor(progress)}%</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Completion</span>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] font-bold uppercase tracking-widest block px-2 py-1 rounded transition-colors duration-500 ${progress >= 100 ? 'text-white bg-emerald-500' : 'text-[#00b8d4] bg-cyan-50'}`}>
                                {progress >= 100 ? 'Verification Success' : 'Link Secured'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Phases List */}
                <div className="w-full space-y-7 px-2">
                    {phases.map((p, i) => {
                        const Icon = p.icon;
                        const isActive = i === phase;
                        const isPast = i < phase;

                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-5 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' :
                                        isPast ? 'opacity-40 translate-y-0' : 'opacity-20 translate-y-4'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-500 ${isActive ? 'border-[#00b8d4] bg-cyan-50 shadow-[0_0_15px_5px_rgba(0,184,212,0.1)] scale-105' :
                                        isPast ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'
                                    }`}>
                                    {isPast ? (
                                        <Check size={20} className="text-emerald-600" strokeWidth={3} />
                                    ) : (
                                        <Icon size={20} className={isActive ? 'text-[#00b8d4]' : 'text-gray-300'} />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <span className={`text-xs font-bold uppercase tracking-wide truncate transition-colors duration-500 ${isActive ? 'text-gray-900 font-extrabold' :
                                            isPast ? 'text-emerald-600' : 'text-gray-400'
                                        }`}>
                                        {p.title}
                                    </span>
                                    <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'h-3.5 opacity-100' : 'h-0 opacity-0'}`}>
                                        <span className="text-[10px] text-cyan-600 font-semibold block mt-0.5">{p.info}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Security Footer */}
                <div className="mt-14 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-gray-500">
                        <Shield size={14} className="text-emerald-500" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                    <p className="text-[9px] text-gray-300 font-medium tracking-tight">Verified by RBI Regulated Entity</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes flipPage {
                    0% { transform: rotateY(0deg); box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1); background: #fff; }
                    50% { background: #f5f5f5; }
                    80%, 100% { transform: rotateY(-180deg); box-shadow: -4px 4px 10px rgba(0, 0, 0, 0.1); background: #fff; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-flip-page {
                    animation: flipPage 2.2s infinite cubic-bezier(0.445, 0.05, 0.55, 0.95);
                    backface-visibility: hidden;
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
}
