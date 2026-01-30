import React, { useEffect, useState } from 'react';
import { Logo, Tagline } from './BrandComponents';

export default function SplashStep({ onComplete }: { onComplete: () => void }) {
    const [animateLine, setAnimateLine] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimateLine(true);
        }, 800);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative flex flex-col items-center scale-95 animate-[scale-up_1.5s_ease-out_forwards]">
                <Logo className="mb-2" />
                <Tagline className="opacity-0 animate-[fade-in_1s_ease-out_500ms_forwards]" />

                <div className="absolute -bottom-2 left-0 right-0 h-[2px] overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-blue-600 to-purple-600 ${animateLine ? 'animate-draw-line' : 'w-0'}`} />
                </div>
            </div>

            <style jsx global>{`
                @keyframes scale-up {
                    from { transform: scale(0.98); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
