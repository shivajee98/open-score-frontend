import React from 'react';
import { ArrowRight, Zap, ShieldCheck, Clock, Rocket, ChevronRight } from 'lucide-react';

interface OnboardingStepProps {
    onNext: () => void;
    onSkip?: () => void;
}

export default function OnboardingStep2({ onNext, onSkip }: OnboardingStepProps) {
    return (
        <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#FCFBFF] via-[#F6F3FF] to-[#F1E8FC] overflow-hidden flex flex-col items-center animate-in fade-in duration-500">
            {/* Background decorative wave */}
            <svg className="absolute bottom-0 left-0 w-full z-0 opacity-40" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 150 C 100 250, 250 50, 400 150 L 400 300 L 0 300 Z" fill="#EBE4FC"/>
            </svg>

            {/* Top Navigation */}
            <div className="w-full px-6 flex justify-between items-center mt-12 z-20 max-w-sm">
                {/* Progress Indicators */}
                <div className="flex items-center space-x-1.5">
                    <div className="w-[6px] h-[6px] bg-[#DCD1FC] rounded-full"></div>
                    <div className="w-[28px] h-[6px] bg-[#6B3CE2] rounded-full"></div>
                    <div className="w-[6px] h-[6px] bg-[#DCD1FC] rounded-full"></div>
                    <div className="w-[6px] h-[6px] bg-[#DCD1FC] rounded-full"></div>
                </div>
                {/* Skip Button */}
                <button onClick={onSkip} className="bg-[#F0E9FC] hover:bg-[#E4D8F9] transition-colors text-[#6B3CE2] px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide flex items-center">
                    SKIP <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
                </button>
            </div>

            {/* Typography & Heading Section */}
            <div className="w-full px-6 mt-6 z-20 max-w-sm">
                {/* App Icon Mini + Unlock */}
                <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6B3CE2] to-[#3A1D85] rounded-xl shadow-md flex flex-col items-center justify-center relative overflow-hidden border border-[#A888F3]/50">
                        <div className="w-[80%] h-[3px] bg-[#FFD700] mb-1.5 mt-0.5 rounded-full"></div>
                        <div className="w-[60%] h-[2px] bg-[#E2D8F9] rounded-full opacity-80"></div>
                        <svg className="absolute bottom-[-5px] right-0 opacity-30" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="15" cy="15" r="10" stroke="white" strokeWidth="2"/></svg>
                    </div>
                    <h1 className="font-outfit text-[32px] font-extrabold text-[#15193B] leading-none tracking-tight">Unlock</h1>
                </div>
                
                {/* Amount & Text */}
                <h1 className="font-outfit text-[48px] font-black leading-[1.05] tracking-tight mb-1 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #5B21B6, #B026FF)' }}>10K–50K</h1>
                <h1 className="font-outfit text-[34px] font-extrabold text-[#15193B] leading-none tracking-tight mb-2">Instantly</h1>
                <p className="text-[15px] text-[#787895] font-medium mt-2">No Credit Score Needed!</p>
            </div>

            {/* Features Bar */}
            <div className="w-[88%] max-w-sm bg-white/60 backdrop-blur-md rounded-[18px] flex justify-between px-3 py-3.5 mt-6 z-20 shadow-[0_8px_20px_rgba(107,60,226,0.06)] border border-white">
                <div className="flex items-center space-x-2">
                    <div className="w-[26px] h-[26px] bg-[#6B3CE2] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <p className="text-[10px] font-bold text-[#15193B] leading-[1.2]">Instant<br/>Approval</p>
                </div>
                <div className="w-[1px] h-6 bg-[#EBE4FC] self-center"></div>
                <div className="flex items-center space-x-2">
                    <div className="w-[26px] h-[26px] bg-[#6B3CE2] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-bold text-[#15193B] leading-[1.2]">100% Safe<br/>& Secure</p>
                </div>
                <div className="w-[1px] h-6 bg-[#EBE4FC] self-center"></div>
                <div className="flex items-center space-x-2">
                    <div className="w-[26px] h-[26px] bg-[#6B3CE2] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-bold text-[#15193B] leading-[1.2]">Money in<br/>Minutes</p>
                </div>
            </div>

            {/* CSS 3D Scene Hero */}
            <div className="relative flex-1 w-full max-w-sm flex justify-center items-center mt-2 z-10" style={{ perspective: '800px' }}>
                {/* Large Back Circle */}
                <div className="absolute w-[260px] h-[260px] bg-gradient-to-b from-[#EBE4FC] to-[#F7F4FF] rounded-full z-0"></div>
                
                {/* Decorative Stars */}
                <svg className="absolute top-[30px] right-[50px] w-5 h-5 text-[#FFD700] z-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                <svg className="absolute top-[60px] left-[60px] w-4 h-4 text-[#A888F3] z-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                <svg className="absolute bottom-[80px] right-[30px] w-3 h-3 text-[#B026FF] z-0 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>

                {/* Coins Left (Behind Card) */}
                <div className="absolute left-[30px] bottom-[35px] z-10 flex flex-col items-center transform scale-90 rotate-[-10deg]">
                    {[1,2,3].map((_, i) => (
                        <div key={i} className={`relative w-[45px] h-[20px] ${i < 2 ? 'mb-[-12px]' : ''}`}>
                            <div className="absolute inset-0 bg-[#FFD700] rounded-[50%] border-[2px] border-[#D4AF37] z-30"></div>
                            <div className="absolute top-[8px] w-full h-[12px] bg-[#E5C100] rounded-b-[50%] z-20 shadow-[0_5px_10px_rgba(0,0,0,0.15)]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.15) 4px)' }}></div>
                        </div>
                    ))}
                </div>

                {/* Main 3D Credit Card */}
                <div className="absolute z-20 w-[180px] h-[115px] bg-gradient-to-br from-[#8055F8] to-[#6836E8] rounded-xl ml-[-50px] mb-[20px]" style={{ transform: 'rotateY(-15deg) rotateZ(-6deg) rotateX(10deg)', transformStyle: 'preserve-3d', boxShadow: '-15px 20px 30px rgba(107, 60, 226, 0.25), inset 2px 2px 5px rgba(255,255,255,0.4)', borderRight: '4px solid #4D27B3', borderBottom: '6px solid #4D27B3' }}>
                    <div className="w-full h-[24px] bg-[#2A2B4A] mt-[20px] shadow-inner"></div>
                    <div className="absolute bottom-[20px] left-[20px] w-[60px] h-[30px]">
                        <svg viewBox="0 0 100 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10,40 Q25,10 40,35 T60,20 T80,45" className="opacity-90"/>
                            <path d="M70,25 L95,20" className="opacity-90"/>
                        </svg>
                    </div>
                </div>

                {/* 3D Stack of Cash */}
                <div className="absolute z-30 right-[35px] bottom-[25px] flex flex-col drop-shadow-xl ml-[30px]">
                    <div className="w-[85px] h-[32px] bg-[#4CAF50] border-[1.5px] border-[#388E3C] rounded-[3px] relative z-30 flex items-center justify-center mb-[-20px] shadow-sm" style={{ transform: 'skewX(-15deg)' }}>
                        <div className="w-6 h-6 border-[1.5px] border-[#A5D6A7] rounded-full flex items-center justify-center bg-[#4CAF50] transform skewX(15deg)">
                            <span className="text-[#1B5E20] text-[13px] font-bold ml-[1px]">₹</span>
                        </div>
                        <div className="absolute left-[20px] w-[14px] h-full bg-[#1B5E20] opacity-90"></div>
                    </div>
                    <div className="w-[85px] h-[32px] bg-[#43A047] border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-[#2E7D32] rounded-b-[3px] relative z-20 mb-[-20px]" style={{ transform: 'skewX(-15deg)' }}>
                        <div className="absolute left-[20px] w-[14px] h-full bg-[#0A3D0C] opacity-95"></div>
                        <div className="absolute bottom-[4px] w-full h-[1px] bg-[#1B5E20] opacity-50"></div>
                        <div className="absolute bottom-[10px] w-full h-[1px] bg-[#1B5E20] opacity-50"></div>
                    </div>
                    <div className="w-[85px] h-[32px] bg-[#388E3C] border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-[#1B5E20] rounded-b-[3px] relative z-10 mb-[-20px]" style={{ transform: 'skewX(-15deg)' }}>
                        <div className="absolute left-[20px] w-[14px] h-full bg-[#052906] opacity-95"></div>
                        <div className="absolute bottom-[4px] w-full h-[1px] bg-[#1B5E20] opacity-50"></div>
                        <div className="absolute bottom-[10px] w-full h-[1px] bg-[#1B5E20] opacity-50"></div>
                    </div>
                    <div className="w-[85px] h-[32px] bg-[#2E7D32] border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-[#1B5E20] rounded-b-[3px] relative z-0 shadow-[0_10px_15px_rgba(0,0,0,0.15)]" style={{ transform: 'skewX(-15deg)' }}>
                        <div className="absolute left-[20px] w-[14px] h-full bg-[#000000] opacity-70"></div>
                        <div className="absolute bottom-[4px] w-full h-[1px] bg-[#1B5E20] opacity-50"></div>
                    </div>
                </div>

                {/* Coins Right (Front) */}
                <div className="absolute right-[25px] bottom-[5px] z-40 flex flex-col items-center transform scale-80 rotate-[15deg]">
                    <div className="relative w-[45px] h-[20px] mb-[-12px]">
                        <div className="absolute inset-0 bg-[#FFD700] rounded-[50%] border-[2px] border-[#D4AF37] z-30"></div>
                        <div className="absolute inset-0 z-40 flex items-center justify-center opacity-60 transform scale-y-75"><span className="text-[#B8860B] text-[12px] font-bold">₹</span></div>
                        <div className="absolute top-[8px] w-full h-[12px] bg-[#E5C100] rounded-b-[50%] z-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.15) 4px)' }}></div>
                    </div>
                    <div className="relative w-[45px] h-[20px]">
                        <div className="absolute inset-0 bg-[#FFD700] rounded-[50%] border-[2px] border-[#D4AF37] z-30"></div>
                        <div className="absolute inset-0 z-40 flex items-center justify-center opacity-60 transform scale-y-75"><span className="text-[#B8860B] text-[12px] font-bold">₹</span></div>
                        <div className="absolute top-[8px] w-full h-[12px] bg-[#E5C100] rounded-b-[50%] z-20 shadow-[0_5px_10px_rgba(0,0,0,0.2)]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.15) 4px)' }}></div>
                    </div>
                </div>
            </div>

            {/* Secondary CTA: Start with Open Score */}
            <div className="w-[88%] max-w-sm bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0E6FF] p-2.5 flex items-center justify-between z-40 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3.5">
                    <div className="w-[42px] h-[42px] bg-[#F4F0FF] rounded-xl flex items-center justify-center text-[#6B3CE2]">
                        <Rocket className="w-5 h-5 fill-[#EBE4FC]" strokeWidth={2} />
                    </div>
                    <p className="text-[14px] font-semibold text-[#15193B] tracking-tight">Start with <span className="text-[#6B3CE2]">Open Score</span> Today</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B3CE2] mr-1" strokeWidth={3} />
            </div>

            {/* Primary CTA: Next */}
            <div className="w-full px-6 max-w-sm relative z-40 mb-8">
                <button onClick={onNext} className="w-full h-[58px] rounded-2xl text-white font-semibold text-[17px] tracking-wide flex items-center justify-center shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:opacity-95 hover:scale-[1.01] transition-all" style={{ backgroundImage: 'linear-gradient(90deg, #7C3AED, #D946EF)' }}>
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                </button>
            </div>

            {/* Footer Logo/Text */}
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
