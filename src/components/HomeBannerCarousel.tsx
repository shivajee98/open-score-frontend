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
        '/splash-images/ss-1.png',
        '/splash-images/ss-2.png',
        '/splash-images/ss-3.png'
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
            <div className="relative w-full max-w-[400px] max-h-[85vh] z-10 animate-in zoom-in-95 fade-in duration-300 flex justify-center items-center">
                <div className="relative rounded-2xl w-full h-full overflow-hidden flex justify-center bg-transparent">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:bg-black/60 z-20"
                    >
                        <X size={16} />
                    </button>

                    <img
                        key={activeBanner}
                        src={banner}
                        alt={`Offer Banner ${activeBanner + 1}`}
                        className="w-full max-h-[85vh] object-contain animate-in fade-in duration-500 rounded-2xl"
                    />
                </div>
            </div>
        </div>
    );
}
