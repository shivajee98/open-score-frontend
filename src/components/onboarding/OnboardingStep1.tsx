import React from 'react';
import { Users, ShieldCheck, BarChart3, IndianRupee } from 'lucide-react';

interface OnboardingStepProps {
    onNext: () => void;
    onSkip?: () => void;
}

export default function OnboardingStep1({ onNext }: OnboardingStepProps) {
    return (
        <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#F8F6FF] via-[#F2EEFF] to-[#E9E1FC] overflow-hidden flex flex-col items-center animate-in fade-in duration-500">
            {/* Top Header Area */}
            <div className="flex flex-col items-center mt-12 z-20">
                {/* App Icon */}
                <div className="w-[76px] h-[76px] rounded-[20px] shadow-[inset_0_-4px_10px_rgba(255,215,0,0.2),0_10px_25px_rgba(11,22,56,0.4)] flex items-center justify-center mb-3 relative" style={{ backgroundImage: 'linear-gradient(180deg, #1C336D, #0B1638)' }}>
                    <div className="absolute inset-0 rounded-[20px] border border-white/10"></div>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.8 32.5L4 7.5H11.5L20.5 24.5L29.5 7.5H37L22.2 32.5C21.4 33.8 19.6 33.8 18.8 32.5Z" fill="url(#paint0_linear)"/>
                        <defs>
                            <linearGradient id="paint0_linear" x1="20.5" y1="7.5" x2="20.5" y2="33.2" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FFD700"/>
                                <stop offset="1" stopColor="#FFA500"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Logo Text */}
                <h1 className="font-outfit text-[34px] font-bold tracking-tight text-[#111636] leading-none mb-1">
                    Open<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #6B3CE2, #A855F7)' }}>Score</span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-[14px] text-[#4A4B68] font-medium mt-1">Scheme Budget Support</p>
                
                {/* Small dot-dash separator */}
                <div className="flex items-center justify-center space-x-1 mt-2.5">
                    <div className="w-[6px] h-[6px] bg-[#6B3CE2] rounded-full"></div>
                    <div className="w-[20px] h-[4px] bg-[#A888F3] rounded-full"></div>
                </div>

                {/* Tagline */}
                <p className="text-center text-[13px] text-[#5A5B7A] mt-5 leading-snug">
                    Smart financial support for<br/>
                    a <span className="text-[#6B3CE2] font-semibold">stronger tomorrow</span>
                </p>
            </div>

            {/* Features Icons */}
            <div className="w-full px-5 mt-6 flex justify-between z-20 max-w-sm">
                <div className="flex flex-col items-center w-[22%]">
                    <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B3CE2] mb-2">
                        <Users className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] text-center text-[#6A6A8B] font-medium leading-tight">Financial<br/>Support</span>
                </div>
                <div className="flex flex-col items-center w-[22%]">
                    <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B3CE2] mb-2">
                        <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] text-center text-[#6A6A8B] font-medium leading-tight">Secure<br/>Transactions</span>
                </div>
                <div className="flex flex-col items-center w-[22%]">
                    <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B3CE2] mb-2">
                        <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] text-center text-[#6A6A8B] font-medium leading-tight">Track &<br/>Manage</span>
                </div>
                <div className="flex flex-col items-center w-[22%]">
                    <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B3CE2] mb-2">
                        <IndianRupee className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] text-center text-[#6A6A8B] font-medium leading-tight">Grow Your<br/>Business</span>
                </div>
            </div>

            {/* CSS-based 3D Hero Scene */}
            <div className="relative flex-1 w-full max-w-sm mt-4 flex justify-center" style={{ perspective: '1000px' }}>
                {/* City Skyline Background */}
                <div className="absolute bottom-6 w-full h-[180px] flex items-end justify-center opacity-30 z-0 px-4 space-x-1">
                    <div className="w-[15%] h-[40%] bg-[#A898D7] rounded-t-sm"></div>
                    <div className="w-[20%] h-[70%] bg-[#A898D7] rounded-t-sm"></div>
                    <div className="w-[10%] h-[50%] bg-[#A898D7] rounded-t-sm"></div>
                    <div className="w-[25%] h-[85%] bg-[#A898D7] rounded-t-sm relative">
                        <div className="absolute top-2 left-2 w-[4px] h-[20px] bg-white/20"></div>
                    </div>
                    <div className="w-[15%] h-[60%] bg-[#A898D7] rounded-t-sm"></div>
                    <div className="w-[15%] h-[45%] bg-[#A898D7] rounded-t-sm"></div>
                </div>

                {/* 1. Bank Building */}
                <div className="absolute right-[20px] bottom-[110px] z-10 w-[140px] flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[70px] border-r-[70px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#D8C7F9]"></div>
                    <div className="w-[130px] h-[8px] bg-[#BFA3F3] shadow-sm"></div>
                    <div className="absolute top-[-25px] left-[25px] w-[2px] h-[30px] bg-[#A181E5]"></div>
                    <div className="absolute top-[-25px] left-[27px] w-[20px] h-[12px] bg-[#D8C7F9] rounded-r-sm"></div>
                    <div className="flex justify-between w-[100px] mt-[2px]">
                        <div className="w-[16px] h-[55px] bg-[#D8C7F9] shadow-[2px_0_4px_rgba(0,0,0,0.05)] rounded-sm"></div>
                        <div className="w-[16px] h-[55px] bg-[#D8C7F9] shadow-[2px_0_4px_rgba(0,0,0,0.05)] rounded-sm"></div>
                        <div className="w-[16px] h-[55px] bg-[#D8C7F9] shadow-[2px_0_4px_rgba(0,0,0,0.05)] rounded-sm"></div>
                        <div className="w-[16px] h-[55px] bg-[#D8C7F9] shadow-[2px_0_4px_rgba(0,0,0,0.05)] rounded-sm"></div>
                    </div>
                    <div className="w-[140px] h-[12px] bg-[#BFA3F3] mt-[2px] rounded-sm"></div>
                    <div className="w-[150px] h-[6px] bg-[#A181E5] rounded-sm"></div>
                </div>

                {/* 2. Phone */}
                <div className="absolute bottom-[40px] z-20 w-[156px] h-[280px] bg-[#EBE4FC] rounded-[32px] shadow-[0_15px_30px_rgba(107,60,226,0.2)] border-[5px] border-[#6A3CE2] flex flex-col items-center overflow-hidden">
                    <div className="w-[60px] h-[12px] bg-[#6A3CE2] rounded-b-[10px] z-10"></div>
                    <div className="w-full h-full p-3 flex flex-col pt-4 relative">
                        <div className="w-full h-[85px] bg-white rounded-[14px] shadow-sm mb-3 flex items-center p-2.5">
                            <div className="w-[45px] h-[45px] rounded-full border-[8px] border-[#6A3CE2] border-r-[#FFD700] border-t-[#FFD700]"></div>
                            <div className="ml-3 flex flex-col space-y-1.5 w-full">
                                <div className="w-[70%] h-2.5 bg-[#E2D8F9] rounded-full"></div>
                                <div className="w-[100%] h-2.5 bg-[#F3F0FC] rounded-full"></div>
                                <div className="w-[50%] h-2.5 bg-[#F3F0FC] rounded-full"></div>
                            </div>
                        </div>
                        <div className="w-full flex-1 bg-white rounded-[14px] shadow-sm flex flex-col p-3 relative">
                            <div className="w-7 h-7 rounded-full bg-[#6A3CE2] text-white flex items-center justify-center text-[14px] font-bold mb-2 shadow-md">₹</div>
                            <div className="w-[60%] h-2.5 bg-[#E2D8F9] rounded-full mb-1.5"></div>
                            <div className="w-[40%] h-2.5 bg-[#F3F0FC] rounded-full mb-4"></div>
                            <div className="flex items-end justify-between absolute bottom-3 left-3 right-3 h-[50px]">
                                <div className="w-[18%] h-[40%] bg-[#E2D8F9] rounded-t-sm"></div>
                                <div className="w-[18%] h-[65%] bg-[#E2D8F9] rounded-t-sm"></div>
                                <div className="w-[18%] h-[100%] bg-[#6A3CE2] rounded-t-sm"></div>
                                <div className="w-[18%] h-[55%] bg-[#E2D8F9] rounded-t-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Wallet */}
                <div className="absolute left-[15px] bottom-[50px] z-30">
                    <div className="w-[90px] h-[85px] bg-[#6A3CE2] rounded-xl shadow-xl relative overflow-hidden border-b-4 border-[#4D27B3]">
                        <div className="absolute top-2 left-[-15px] w-[85px] h-[75px] bg-[#5326BE] rounded-xl"></div>
                        <div className="absolute right-0 top-[25px] w-[30px] h-[35px] bg-[#1a1a1a] rounded-l-lg flex items-center justify-end pr-1 border-y-2 border-l-2 border-[#333]">
                             <div className="w-[20px] h-1.5 bg-[#4CAF50] rounded-sm"></div>
                        </div>
                    </div>
                    <div className="absolute top-[10px] left-[35px] w-[95px] h-[55px] bg-white rounded-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.15)] flex items-center p-2.5 z-40 transform rotate-[8deg]">
                        <div className="w-9 h-9 bg-[#EBE4FC] rounded-full flex items-center justify-center text-[#6A3CE2]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="ml-2.5 flex flex-col space-y-1.5 w-full">
                            <div className="w-[90%] h-1.5 bg-[#C5B3F1] rounded-full"></div>
                            <div className="w-[100%] h-1.5 bg-[#E2D8F9] rounded-full"></div>
                            <div className="w-[60%] h-1.5 bg-[#E2D8F9] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* 4. Shield */}
                <div className="absolute bottom-[35px] right-[100px] z-40 w-[65px] h-[75px] bg-gradient-to-b from-[#8C5EFA] to-[#6A3CE2] shadow-[0_10px_20px_rgba(107,60,226,0.4)] flex items-center justify-center border-[4px] border-[#BFA3F3]" style={{ borderRadius: '10px 10px 35px 35px', transform: 'rotate(-5deg)' }}>
                    <div className="absolute inset-0 bg-white/10" style={{ borderRadius: '6px 6px 31px 31px', clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
                    <svg className="w-9 h-9 text-white z-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>

                {/* 5. Coins Stack */}
                <div className="absolute bottom-[20px] right-[40px] z-30 flex flex-col items-center">
                    {[1,2,3,4].map((_, i) => (
                        <div key={i} className={`relative w-[50px] h-[22px] ${i < 3 ? 'mb-[-12px]' : ''}`}>
                            <div className="absolute inset-0 bg-[#FFD700] rounded-[50%] border-[2px] border-[#D4AF37] z-30"></div>
                            <div className="absolute top-[10px] w-full h-[12px] bg-[#E5C100] rounded-b-[50%] z-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}></div>
                        </div>
                    ))}
                </div>

                {/* 6. Plant */}
                <div className="absolute bottom-[65px] right-[15px] z-20 flex flex-col items-center">
                    <div className="relative w-[50px] h-[45px] mb-[-15px] z-10 flex justify-center">
                        <div className="absolute bottom-1 left-[5px] w-[20px] h-[35px] bg-[#4CAF50] shadow-inner rounded-t-[20px] rounded-br-[20px] transform -rotate-[35deg]"></div>
                        <div className="absolute bottom-1 right-[5px] w-[20px] h-[35px] bg-[#43A047] shadow-inner rounded-t-[20px] rounded-bl-[20px] transform rotate-[35deg]"></div>
                        <div className="absolute bottom-[5px] w-[22px] h-[40px] bg-[#66BB6A] shadow-inner rounded-t-[20px] rounded-b-[5px]"></div>
                    </div>
                    <div className="w-[45px] h-[35px] bg-[#8C5EFA] rounded-b-[12px] border-t-[6px] border-[#6A3CE2] shadow-[0_5px_10px_rgba(107,60,226,0.3)] relative">
                        <div className="absolute top-0 right-0 w-[15px] h-full bg-white/10 rounded-br-[12px]"></div>
                    </div>
                </div>
            </div>

            {/* Call to Action Button */}
            <div className="w-full flex justify-center max-w-sm mt-4 px-6 relative z-40">
                <button onClick={onNext} className="w-full h-[56px] rounded-full text-white font-semibold text-[16px] flex items-center justify-center shadow-[0_8px_20px_rgba(107,60,226,0.35)] hover:scale-[1.02] transition-transform" style={{ backgroundImage: 'linear-gradient(90deg, #6B3CE2, #A855F7)' }}>
                    Get Started
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex space-x-2 mt-5 mb-4 z-40">
                <div className="w-[18px] h-[6px] bg-[#6B3CE2] rounded-full"></div>
                <div className="w-[6px] h-[6px] bg-[#D4C4F7] rounded-full"></div>
                <div className="w-[6px] h-[6px] bg-[#D4C4F7] rounded-full"></div>
                <div className="w-[6px] h-[6px] bg-[#D4C4F7] rounded-full"></div>
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
