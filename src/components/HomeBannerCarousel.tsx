'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Search, MoveRight } from 'lucide-react';

interface HomeBannerCarouselProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HomeBannerCarousel({ isOpen, onClose }: HomeBannerCarouselProps) {
    const [activeBanner, setActiveBanner] = useState(0);

    const banners = [
        {
            id: 1,
            color: "bg-gradient-to-br from-indigo-600 to-purple-800",
            content: (
                <div className="flex flex-col h-full justify-center text-white text-left px-1">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-white/90 uppercase tracking-[0.2em]">
                        <Zap size={10} className="fill-yellow-400 text-yellow-400" />
                        <span>Limited Offer</span>
                    </div>
                    <h3 className="text-2xl font-black leading-none tracking-tight mb-2">
                        Transfer & Get <br />
                        <span className="text-yellow-400">Heavy Discounts</span>
                    </h3>
                    <p className="text-[12px] font-medium text-indigo-100/80 mb-5">At Restaurants & Merchant Shops</p>
                    <button className="flex items-center justify-center gap-2 w-fit bg-indigo-500/30 border border-white/20 backdrop-blur-md px-5 py-2 rounded-xl text-sm font-black shadow-xl active:scale-95 transition-all">
                        Transfer Now <MoveRight size={16} />
                    </button>
                    <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl"></div>
                </div>
            )
        },
        {
            id: 2,
            color: "bg-gradient-to-br from-emerald-500 to-teal-800",
            content: (
                <div className="flex flex-col h-full justify-center text-white text-left px-1">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-white/90 uppercase tracking-[0.2em]">
                        <Search size={10} className="text-white" />
                        <span>Scan & Save</span>
                    </div>
                    <h3 className="text-2xl font-black leading-none tracking-tight mb-2">
                        Scan QR & Fulfill <br />
                        <span className="text-yellow-300">Your Daily Needs</span>
                    </h3>
                    <div className="mt-4">
                        <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 bg-white/10 backdrop-blur-sm">
                            Exclusive Discounts
                        </span>
                    </div>
                    <div className="absolute top-4 right-4 w-20 h-20 bg-teal-300/20 rounded-full blur-2xl"></div>
                </div>
            )
        },
        {
            id: 3,
            color: "bg-gradient-to-br from-rose-500 to-orange-600",
            content: (
                <div className="flex flex-col h-full justify-center text-white text-left px-1">
                    <h3 className="text-2xl font-black leading-tight mb-1">
                        Scan QR for <br />
                        Daily Needs
                    </h3>
                    <p className="text-[12px] font-bold text-white/80 mb-4 tracking-tight">Pay Less. Get More.</p>
                    
                    <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-3 shadow-lg max-w-[200px]">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">Smart Savings</p>
                        <p className="text-sm font-black leading-tight">Transfer Instantly. <br /> Save More.</p>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-400/30 rounded-full blur-3xl"></div>
                </div>
            )
        }
    ];

    // Pick random banner on open
    useEffect(() => {
        if (isOpen) {
            const randomIndex = Math.floor(Math.random() * banners.length);
            setActiveBanner(randomIndex);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const banner = banners[activeBanner];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[320px] z-10 animate-in zoom-in-95 fade-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 w-10 h-10 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all hover:bg-slate-700/50 hover:border-white/20"
                >
                    <X size={20} />
                </button>

                <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/5 group">
                    <div
                        className={`w-full ${banner.color} p-8 relative overflow-hidden flex flex-col justify-center items-start h-[320px] transition-all duration-500`}
                    >
                        {/* Decorative background gradients */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-12 -mt-12 pointer-events-none group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-[60px] -ml-12 -mb-12 pointer-events-none group-hover:bg-black/30 transition-all duration-700"></div>

                        {/* Subtle patterns */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                        {banner.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
