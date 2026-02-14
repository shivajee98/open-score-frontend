'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, Megaphone, Heart } from 'lucide-react';

interface WelcomeBonusPopupProps {
    isOpen: boolean;
    onClose: () => void;
    amount?: number;
}

export default function WelcomeBonusPopup({ isOpen, onClose, amount = 0 }: WelcomeBonusPopupProps) {
    const [phase, setPhase] = useState<'idle' | 'portal' | 'card' | 'shatter'>('idle');

    useEffect(() => {
        if (isOpen) {
            setPhase('portal');
            // Transition from Portal to Card emergence
            const timer = setTimeout(() => setPhase('card'), 1000); // 1s portal build up
            return () => clearTimeout(timer);
        } else {
            if (phase !== 'shatter') setPhase('idle');
        }
    }, [isOpen]);

    const handleAction = () => {
        // Trigger exit animation
        setPhase('shatter');
        // Wait for animation to finish then close
        setTimeout(() => {
            onClose();
            setPhase('idle');
        }, 800);
    };

    if (phase === 'idle' && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden font-sans">
            {/* The Void - Matte Black with slight noise or gradient */}
            <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${phase === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>
                {/* God Rays / Volumetric Light simulation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.03)_20deg,transparent_40deg,rgba(255,215,0,0.03)_60deg,transparent_80deg)] animate-spin-slow duration-[20s]"></div>
            </div>

            {/* Main Stage */}
            <div className={`relative perspective-[2000px] z-10 flex flex-col items-center justify-center w-full h-full`}>

                {/* Portal Effect (Only visible during portal/card phase) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] transition-all duration-1000 ${phase === 'portal' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#fbbf24,transparent,#fbbf24)] animate-spin blur-3xl opacity-40"></div>
                    <div className="absolute inset-10 rounded-full border border-yellow-500/30 animate-ping"></div>
                    <div className="absolute inset-[100px] rounded-full border border-yellow-200/50 animate-pulse"></div>
                </div>

                {/* The Flying Card Container */}
                <div
                    className={`
                        relative w-[340px] aspect-[3/4.5] transition-all duration-1000 ease-out preserve-3d
                        ${phase === 'portal' ? 'scale-0 rotate-y-180 translate-z-[-500px]' : ''}
                        ${phase === 'card' ? 'scale-100 rotate-y-0 translate-z-0' : ''}
                        ${phase === 'shatter' ? 'scale-[20] opacity-0 rotate-x-12 translate-z-[1000px] duration-700 ease-in' : ''}
                    `}
                >
                    {/* Megaphones (Floating alongside) */}
                    <div className={`absolute top-1/3 -left-20 text-yellow-500 transition-all duration-700 delay-500 ${phase === 'card' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <Megaphone size={48} className="drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] -rotate-12 animate-pulse" />
                        <div className="absolute right-0 top-1/2 w-20 h-20 border-r-4 border-yellow-500/50 rounded-full -translate-y-1/2 animate-ping"></div>
                    </div>
                    <div className={`absolute top-1/3 -right-20 text-yellow-500 transition-all duration-700 delay-500 ${phase === 'card' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <Megaphone size={48} className="drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] rotate-12 animate-pulse scale-x-[-1]" />
                        <div className="absolute left-0 top-1/2 w-20 h-20 border-l-4 border-yellow-500/50 rounded-full -translate-y-1/2 animate-ping"></div>
                    </div>

                    {/* Confetti Explosion (CSS Particles) */}
                    {phase === 'card' && (
                        <>
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute left-1/2 top-1/2 w-2 h-4 bg-gradient-to-b from-yellow-300 to-amber-600 animate-out fade-out zoom-out slide-out-to-top duration-[2000ms] fill-mode-forwards"
                                    style={{
                                        transform: `rotate(${Math.random() * 360}deg) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
                                        animationDelay: `${Math.random() * 0.5}s`
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* The CARD Itself */}
                    <div
                        onClick={handleAction}
                        className="
                            w-full h-full bg-slate-950 rounded-3xl border-2 border-amber-500/50 overflow-hidden cursor-pointer
                            shadow-[0_0_60px_-10px_rgba(251,191,36,0.5)] 
                            relative flex flex-col items-center justify-between p-6
                            hover:shadow-[0_0_100px_-10px_rgba(251,191,36,0.8)] hover:scale-105 transition-transform duration-300
                            group
                        "
                    >
                        {/* Metallic / Glossy Overlay effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                        <div className="absolute -inset-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>

                        {/* Top Corner Suite */}
                        <div className="self-start flex flex-col items-center">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-500 to-rose-700 drop-shadow-lg">A</span>
                            <Heart className="fill-rose-600 text-rose-700 w-6 h-6 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                        </div>

                        {/* Center Content */}
                        <div className="flex flex-col items-center gap-4 z-10 w-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20"></div>
                                <Trophy size={64} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                            </div>

                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-yellow-400 to-amber-600 drop-shadow-sm">
                                    Welcome Bonus
                                </h2>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60 font-medium">One-time Offer</div>
                            </div>

                            <div className="w-full py-6 relative flex items-center justify-center">
                                {/* Glowing Text Amount */}
                                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-amber-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110 group-hover:scale-125 transition-transform duration-300">
                                    ₹{amount}
                                </span>
                                <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
                            </div>
                        </div>

                        {/* Bottom Corner Suite */}
                        <div className="self-end flex flex-col items-center rotate-180">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-500 to-rose-700 drop-shadow-lg">A</span>
                            <Heart className="fill-rose-600 text-rose-700 w-6 h-6 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                        </div>

                        {/* CTA / Tap hint */}
                        <div className="absolute bottom-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                            Tap to Claim
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated Glass Shards on Exit (Simple CSS shapes) */}
            {phase === 'shatter' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[110]">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white/30 backdrop-blur-md animate-out fade-out zoom-out duration-500"
                            style={{
                                left: `${50 + (Math.random() * 50 - 25)}%`,
                                top: `${50 + (Math.random() * 50 - 25)}%`,
                                width: `${Math.random() * 200 + 50}px`,
                                height: `${Math.random() * 200 + 50}px`,
                                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shard shape
                                transform: `rotate(${Math.random() * 360}deg) translate(${Math.random() * 1000 - 500}px, ${Math.random() * 1000 - 500}px)`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Add these to your global CSS or styles layer if needed for the preserve-3d
// .preserve-3d { transform-style: preserve-3d; }
// .rotate-y-180 { transform: rotateY(180deg); }
// .translate-z-[-500px] { transform: translateZ(-500px); }

