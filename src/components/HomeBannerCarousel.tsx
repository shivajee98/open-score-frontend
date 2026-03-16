'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface HomeBannerCarouselProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HomeBannerCarousel({ isOpen, onClose }: HomeBannerCarouselProps) {
    const [activeBanner, setActiveBanner] = useState(0);

    const banners = [
        {
            id: 1,
            color: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700",
            content: (
                <div className="flex flex-col h-full justify-center text-white px-2">
                    <h3 className="text-3xl font-black leading-tight mb-2">
                        Transfer & Get <br />
                        <span className="text-yellow-300">Heavy Discounts</span>
                    </h3>
                    <p className="text-lg text-blue-100 font-bold opacity-90 tracking-tight">at Restaurants & Merchant Shops</p>
                </div>
            )
        },
        {
            id: 2,
            color: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700",
            content: (
                <div className="flex flex-col h-full justify-center text-white px-2">
                    <h3 className="text-3xl font-black leading-tight mb-2">
                        Scan QR & Fulfill <br />
                        <span className="text-yellow-300">Your Daily Needs</span>
                    </h3>
                    <div className="flex justify-center">
                        <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/10">Exclusive Discounts</span>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            color: "bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500",
            content: (
                <div className="flex flex-col h-full justify-center text-white px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black leading-none tracking-tight">Scan QR for Daily Needs</h3>
                        <p className="text-lg font-bold text-white/90">Pay Less. Get More.</p>
                    </div>
                    <div className="mt-4 bg-white/10 rounded-xl p-2.5 border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-widest font-black text-yellow-200 mb-0.5">Smart Savings</p>
                        <p className="text-base font-bold leading-tight">Transfer Instantly. Save More.</p>
                    </div>
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
    }, [isOpen, banners.length]);

    if (!isOpen) return null;

    const banner = banners[activeBanner];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[310px] z-10 animate-[scale-in_0.2s_ease-out]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform hover:bg-white/20"
                >
                    <X size={20} />
                </button>

                <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50 border border-white/10">
                    <div
                        className={`w-full ${banner.color} p-6 relative overflow-hidden flex flex-col justify-center items-center text-center h-56`}
                    >
                        {/* Fancy Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                        {/* Circuit Elements */}
                        <svg className="absolute right-0 bottom-0 w-48 h-48 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                            <path d="M10,90 Q40,90 40,60 T70,30" fill="none" stroke="white" strokeWidth="2" />
                            <circle cx="70" cy="30" r="3" fill="white" />
                            <path d="M30,90 Q60,90 60,60" fill="none" stroke="white" strokeWidth="2" />
                        </svg>

                        {banner.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
