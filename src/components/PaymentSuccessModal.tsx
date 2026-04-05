'use client';

import { Check, X, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    amount: string;
    payeeName: string;
    date: string;
    transactionId: string | number;
    referenceId?: string;
    onClose: () => void;
    isMerchant?: boolean;
    merchantId?: number | string;
}

export default function PaymentSuccessModal({ isOpen, amount, payeeName, date, transactionId, referenceId, onClose, isMerchant, merchantId }: PaymentSuccessModalProps) {
    const [animate, setAnimate] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [comment, setComment] = useState("");
    const [rated, setRated] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSuccessSound = () => {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextClass();
            }
            const ctx = audioContextRef.current!;
            
            const playNote = (freq: number, startTime: number, duration: number, vol: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                osc.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            playNote(987.77, now, 0.4, 0.15); // B5
            playNote(1318.51, now + 0.12, 0.6, 0.15); // E6
        } catch (e) {
            console.warn("Chime failed", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            playSuccessSound();
            setTimeout(() => setAnimate(true), 50);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-500">
            <style jsx>{`
                .popup-container {
                    background: #FFFFFF;
                    width: 100%;
                    max-width: 440px;
                    border-radius: 32px 32px 0 0;
                    padding: 40px 24px 24px;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
                    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                @media (min-width: 640px) {
                    .popup-container {
                        border-radius: 32px;
                        margin-bottom: 0;
                    }
                }

                .success-animation-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .confetti-piece {
                    position: absolute;
                    top: 50%; 
                    left: 50%;
                    opacity: 0;
                    transform-origin: center;
                    z-index: 15;
                    filter: drop-shadow(0 0 5px currentColor);
                }

                /* Shapes and Colors */
                .c-blue { background-color: #1A73E8; border-color: #1A73E8; color: #1A73E8; }
                .c-red { background-color: #EA4335; border-color: #EA4335; color: #EA4335; }
                .c-yellow { background-color: #FBBC04; border-color: #FBBC04; color: #FBBC04; }
                .c-green { background-color: #34A853; border-color: #34A853; color: #34A853; }

                .shape-circle { width: 10px; height: 10px; border-radius: 50%; }
                .shape-rect { width: 6px; height: 14px; border-radius: 2px; }
                .shape-star { width: 14px; height: 14px; clip-path: polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%); }
                .shape-macaroni { width: 14px; height: 14px; background-color: transparent !important; border: 4px solid currentColor; border-top-color: inherit; border-right-color: inherit; border-radius: 50%; }

                .popConfetti {
                    animation: popConfettiAnim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.15s;
                }

                @keyframes popConfettiAnim {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
                    15% { opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(var(--rot)); opacity: 1; }
                }

                .success-icon {
                    width: 90px;
                    height: 90px;
                    position: relative;
                    z-index: 10;
                    filter: drop-shadow(0 4px 12px rgba(26, 115, 232, 0.3));
                }

                .success-icon circle {
                    fill: #1A73E8;
                    transform-origin: center;
                    transform: scale(0);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                .success-icon path {
                    fill: none;
                    stroke: white;
                    stroke-width: 5;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: 60;
                    stroke-dashoffset: 60;
                    animation: drawCheck 0.4s ease-out 0.3s forwards;
                }

                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes drawCheck {
                    0% { stroke-dashoffset: 60; }
                    100% { stroke-dashoffset: 0; }
                }

                .vibrant-float {
                    animation: vibrantFloatAnim 3s ease-in-out infinite alternate;
                }

                @keyframes vibrantFloatAnim {
                    0% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(1); }
                    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) - 10px)) rotate(calc(var(--rot) + 15deg)) scale(1.1); filter: drop-shadow(0 0 10px currentColor); }
                }
            `}</style>

            <div className={`popup-container ${animate ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="success-animation-container">
                    {/* Confetti Pieces with CSS Variables for placement */}
                    {[
                        { s: 'rect', c: 'red', tx: '-20px', ty: '-85px', r: '25deg', d: '0.1s' },
                        { s: 'circle', c: 'green', tx: '25px', ty: '-90px', r: '0deg', d: '0.15s' },
                        { s: 'macaroni', c: 'blue', tx: '65px', ty: '-55px', r: '45deg', d: '0.2s' },
                        { s: 'star', c: 'yellow', tx: '85px', ty: '-10px', r: '15deg', d: '0.25s' },
                        { s: 'circle', c: 'blue', tx: '75px', ty: '45px', r: '0deg', d: '0.3s' },
                        { s: 'macaroni', c: 'red', tx: '45px', ty: '80px', r: '145deg', d: '0.35s' },
                        { s: 'star', c: 'yellow', tx: '-10px', ty: '95px', r: '-20deg', d: '0.4s' },
                        { s: 'macaroni', c: 'red', tx: '-55px', ty: '75px', r: '225deg', d: '0.45s' },
                        { s: 'rect', c: 'blue', tx: '-85px', ty: '35px', r: '-45deg', d: '0.5s' },
                        { s: 'circle', c: 'yellow', tx: '-95px', ty: '-5px', r: '0deg', d: '0.55s' },
                        { s: 'star', c: 'green', tx: '-75px', ty: '-55px', r: '10deg', d: '0.6s' },
                    ].map((item, idx) => (
                        <div 
                            key={idx}
                            className={`confetti-piece shape-${item.s} c-${item.c} ${animate ? 'popConfetti vibrant-float' : ''}`}
                            style={{ 
                                '--tx': item.tx, 
                                '--ty': item.ty, 
                                '--rot': item.r,
                                transitionDelay: item.d
                            } as any}
                        />
                    ))}

                    <svg className="success-icon" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="25" />
                        <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>

                <div className={`text-center space-y-2 mb-8 transition-all duration-700 delay-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Transfer Successful</h3>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className={`w-full bg-slate-50 rounded-3xl p-6 mb-8 space-y-4 border border-slate-100 transition-all duration-700 delay-600 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Paid to</span>
                        <span className="text-slate-900 font-black">{payeeName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date & Time</span>
                        <span className="text-slate-900 font-black text-[11px] font-mono">
                            {new Date(date).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                            }).replace(',', '')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reference</span>
                        <span className="text-slate-600 font-bold font-mono text-[11px]">
                            {referenceId || `REF-ID-${transactionId}`}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Transfer ID</span>
                        <span className="text-slate-600 font-bold font-mono text-[11px]">
                            {`TRN-ID-${String(transactionId).padStart(8, '0')}`}
                        </span>
                    </div>
                    <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Transfer From</span>
                        <span className="text-slate-900 font-black">Elite Credit Value</span>
                    </div>
                </div>

                {isMerchant && !rated && (
                    <div className={`w-full bg-amber-50 rounded-3xl p-6 mb-8 border border-amber-100 transition-all duration-700 delay-700 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <p className="text-[10px] font-black text-amber-700 text-center uppercase tracking-widest mb-4">Rate your experience with this merchant</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className={`transition-all duration-300 ${userRating >= star ? 'text-amber-400 scale-125' : 'text-slate-300 hover:text-amber-200'} ${submittingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={submittingRating}
                                    >
                                        <Star size={24} fill={userRating >= star ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                placeholder="Add a quick feedback (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={submittingRating}
                                className="w-full p-3 bg-white border border-amber-100 rounded-xl text-xs focus:ring-2 focus:ring-amber-200 outline-none min-h-[60px] font-bold text-slate-700"
                            />
                            <button 
                                disabled={submittingRating || userRating === 0}
                                onClick={async () => {
                                    if (userRating === 0) return;
                                    setSubmittingRating(true);
                                    try {
                                        await apiFetch(`/merchants/${merchantId}/rate`, {
                                            method: 'POST',
                                            body: JSON.stringify({ rating: userRating, comment })
                                        });
                                        toast.success("Rating submitted successfully!");
                                        setRated(true);
                                    } catch (e: any) {
                                        toast.error(e.message || "Failed to submit rating");
                                    } finally {
                                        setSubmittingRating(false);
                                    }
                                }}
                                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${submittingRating || userRating === 0 ? 'bg-slate-200 text-slate-400' : 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20 active:scale-95'}`}
                            >
                                {submittingRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                )}

                {rated && (
                    <div className="w-full bg-emerald-50 rounded-3xl p-4 mb-4 border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Rating Submitted! Thank You</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transition: 'all 0.4s ease 0.8s' }}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
