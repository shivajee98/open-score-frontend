import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Lock, CreditCard, Wallet, Handshake, Rocket } from 'lucide-react';

interface OnboardingStepProps {
    onNext: () => void;
    onSkip?: () => void;
}

export default function OnboardingStep3({ onNext, onSkip }: OnboardingStepProps) {
    return (
        <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#FCFBFF] via-[#F6F3FF] to-[#F1E8FC] overflow-hidden flex flex-col items-center animate-in fade-in duration-500">
            {/* Background city silhouette */}
            <div className="absolute bottom-[20%] w-full h-[300px] opacity-[0.03] z-0 flex items-end justify-center pointer-events-none">
                <div className="w-[10%] h-[40%] bg-black"></div>
                <div className="w-[15%] h-[60%] bg-black mx-1"></div>
                <div className="w-[12%] h-[80%] bg-black mx-1"></div>
                <div className="w-[20%] h-[100%] bg-black mx-1"></div>
                <div className="w-[15%] h-[70%] bg-black mx-1"></div>
                <div className="w-[10%] h-[50%] bg-black"></div>
            </div>

            {/* Top Navigation */}
            <div className="w-full px-6 flex justify-between items-center mt-12 z-20 max-w-sm">
                <div className="flex items-center space-x-1.5">
                    <div className="w-[6px] h-[6px] bg-[#DCD1FC] rounded-full"></div>
                    <div className="w-[6px] h-[6px] bg-[#DCD1FC] rounded-full"></div>
                    <div className="w-[28px] h-[6px] bg-[#6B3CE2] rounded-full"></div>
                </div>
                {onSkip && (
                    <button onClick={onSkip} className="bg-[#F0E9FC] hover:bg-[#E4D8F9] transition-colors text-[#6B3CE2] px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide flex items-center">
                        SKIP <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
                    </button>
                )}
            </div>

            {/* Typography & Heading Section */}
            <div className="w-full px-6 mt-6 z-20 max-w-sm text-center relative">
                <h1 className="font-outfit text-[32px] font-extrabold text-[#15193B] leading-[1.1] tracking-tight">
                    100% Secure |<br />Verified | Transparent
                </h1>
                <div className="absolute top-0 right-4 text-3xl animate-bounce-subtle">
                    🔑
                </div>
            </div>

            {/* 3D Shield Graphic */}
            <div className="relative flex-1 w-full max-w-sm flex justify-center items-center my-6 z-10" style={{ perspective: '1000px' }}>
                <div className="relative w-[180px] h-[200px] flex justify-center items-center animate-float">
                    {/* Shield Base */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8055F8] to-[#5326BE] shadow-[0_20px_40px_rgba(107,60,226,0.3)] border-[8px] border-[#FFD700] flex justify-center items-center" style={{ borderRadius: '20px 20px 100px 100px', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
                    </div>
                    {/* Golden Lock */}
                    <div className="z-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] w-[60px] h-[50px] rounded-lg mt-8 relative shadow-lg flex justify-center items-center border-b-4 border-[#D4AF37]">
                        <div className="absolute -top-6 w-[36px] h-[40px] border-[6px] border-[#FFD700] rounded-t-full border-b-0"></div>
                        <CheckCircle2 className="w-6 h-6 text-[#A06A00]" strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* List Items */}
            <div className="w-full px-6 max-w-sm z-20 space-y-3 mb-6">
                {[
                    { icon: '💳', title: 'Full KYC Protection' },
                    { icon: '👛', title: 'Safe Wallet System' },
                    { icon: '🤝', title: 'Trusted Financial Partners' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 flex items-center shadow-[0_4px_15px_rgba(107,60,226,0.05)] border border-[#EBE4FC] relative overflow-hidden">
                        <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center mr-3 shrink-0">
                            <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                        </div>
                        <div className="w-8 h-8 bg-[#F4F0FF] rounded-lg flex items-center justify-center text-xl mr-3 shadow-inner">
                            {item.icon}
                        </div>
                        <p className="font-semibold text-[#15193B] text-[15px] z-10">{item.title}</p>
                        <p className="absolute bottom-1 right-3 text-[9px] font-bold text-slate-200 uppercase tracking-widest pointer-events-none">
                            Open Score
                        </p>
                    </div>
                ))}
            </div>

            {/* Secondary CTA Note */}
            <div className="w-[88%] max-w-sm bg-[#F4F0FF] rounded-2xl shadow-sm border border-[#EBE4FC] p-3 flex items-center justify-center z-40 mb-4">
                <Rocket className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" />
                <p className="text-[13px] font-bold text-[#15193B] italic">Your Secure Financial Upgrade Starts Here!</p>
            </div>

            {/* Primary CTA */}
            <div className="w-full px-6 max-w-sm relative z-40 mb-8">
                <button onClick={onNext} className="w-full h-[58px] rounded-2xl text-white font-semibold text-[17px] tracking-wide flex items-center justify-center shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:opacity-95 hover:scale-[1.01] transition-all relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(90deg, #7C3AED, #D946EF)' }}>
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                    <div className="absolute top-2 right-4 text-white/30 text-2xl animate-pulse">✨</div>
                </button>
            </div>

            {/* Footer */}
            <div className="flex items-center text-[#6B3CE2] text-[10px] font-bold tracking-[0.15em] z-40 mb-8 px-4">
                <svg className="w-5 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 18C7 16 6 14 6 12C6 10 7 8 9 6" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 15C4 13.5 3.5 12 4 10" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                POWERED BY MSME SHAKTI
                <svg className="w-5 h-6 ml-3 transform scale-x-[-1]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 18C7 16 6 14 6 12C6 10 7 8 9 6" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 15C4 13.5 3.5 12 4 10" stroke="#6B3CE2" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>
        </div>
    );
}
