'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';

export default function HomeBannerCarousel() {
    const [activeBanner, setActiveBanner] = useState(0);

    const banners = [
        {
            id: 1,
            color: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700",
            content: (
                <div className="flex flex-col h-full justify-center text-white">
                    <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                            <h3 className="text-lg font-black leading-tight mb-1">Transfer & Get <br /><span className="text-yellow-300">Heavy Discounts</span></h3>
                            <p className="text-xs text-blue-100 font-medium">at Restaurants & Merchant Shops</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            color: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700",
            content: (
                <div className="flex flex-col h-full justify-center text-white">
                    <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                            <h3 className="text-lg font-black leading-tight mb-1">Scan QR & Fulfill <br /><span className="text-yellow-300">Your Daily Needs</span></h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">Exclusive Discounts</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            color: "bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500",
            content: (
                <div className="flex flex-col h-full justify-center text-white">
                    <div className="flex items-start gap-3 mb-1">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                            <h3 className="text-lg font-black leading-tight">Scan QR for Daily Needs</h3>
                            <p className="text-sm font-bold text-white/90">Pay Less. Get More.</p>
                        </div>
                    </div>
                    <div className="mt-2 bg-white/10 rounded-lg p-2 border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-yellow-200 mb-0.5">Smart Savings</p>
                        <p className="text-xs leading-tight">Transfer Instantly. Save More.</p>
                    </div>
                </div>
            )
        }
    ];

    // Auto Slide
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    return (
        <div className="relative w-full mb-8 px-4 overflow-hidden group">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/50">
                <div
                    className="flex transition-transform duration-500 ease-out h-40"
                    style={{ transform: `translateX(-${activeBanner * 100}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`w-full flex-shrink-0 ${banner.color} p-5 relative overflow-hidden`}
                        >
                            {/* Fancy Background Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                            {/* Circuit Elements */}
                            <svg className="absolute right-0 bottom-0 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                                <path d="M10,90 Q40,90 40,60 T70,30" fill="none" stroke="white" strokeWidth="2" />
                                <circle cx="70" cy="30" r="3" fill="white" />
                                <path d="M30,90 Q60,90 60,60" fill="none" stroke="white" strokeWidth="2" />
                            </svg>

                            {banner.content}
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={() => setActiveBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 active:scale-95"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => setActiveBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 active:scale-95"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {banners.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === activeBanner ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
