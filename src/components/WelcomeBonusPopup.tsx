'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';

interface WelcomeBonusPopupProps {
    isOpen: boolean;
    onClose: () => void;
    amount?: number;
}

export default function WelcomeBonusPopup({ isOpen, onClose, amount = 0 }: WelcomeBonusPopupProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative w-full max-w-sm transform transition-all duration-500 ease-out ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                {/* Playing Card Container */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-400 aspect-[3/4] flex flex-col items-center justify-center p-6 bg-[url('/patterns/damask-pattern.png')] bg-repeat bg-opacity-5">

                    {/* Decorative Corner Suit Symbols (Rummy Style) */}
                    <div className="absolute top-4 left-4 flex flex-col items-center">
                        <span className="text-3xl font-black text-rose-600">A</span>
                        <span className="text-2xl text-rose-600">♥</span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col items-center rotate-180">
                        <span className="text-3xl font-black text-rose-600">A</span>
                        <span className="text-2xl text-rose-600">♥</span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4 animate-in zoom-in-50 duration-700 delay-100">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2 relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                            <Trophy size={48} className="text-white drop-shadow-md" />
                            <Sparkles className="absolute -top-2 -right-2 text-yellow-200 w-8 h-8 animate-spin-slow" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">Welcome Bonus!</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">You received</p>
                        </div>

                        <div className="bg-slate-900 text-white px-8 py-4 rounded-xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform cursor-pointer">
                            <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                                ₹{amount}
                            </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-[200px]">
                            Use this bonus to start your journey with OpenScore.
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Confetti / Particle Effects would go here */}
                </div>
            </div>
        </div>
    );
}
