'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function QrRedirectContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        // Log for debugging if needed, though internal scans should strip this
        console.log('External QR scan detected for ID:', id);

        // Redirect to Play Store
        // Using window.location.replace for a cleaner history
        window.location.replace('https://play.google.com/store/apps/details?id=com.openscore.sbs');
    }, [id]);

    return (
        <div className="min-h-screen bg-[#0F3935] flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-100">
                Open Score
            </h1>
            <p className="text-emerald-200/60 font-black text-xs uppercase tracking-[0.2em] mb-8">
                Redirecting to Play Store...
            </p>
            
            <div className="max-w-xs space-y-4">
                <p className="text-[10px] text-emerald-400/50 font-bold uppercase tracking-widest leading-relaxed">
                    If you are not redirected automatically, please click the button below.
                </p>
                <a 
                    href="https://play.google.com/store/apps/details?id=com.openscore.sbs"
                    className="block w-full py-4 bg-emerald-500 text-[#0F3935] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/40 hover:bg-emerald-400 transition-all active:scale-95"
                >
                    Get the App
                </a>
            </div>

            <div className="mt-12 opacity-30">
                <p className="text-[8px] font-black uppercase tracking-[0.3em]">MSME SHAKTI</p>
            </div>
        </div>
    );
}

export default function QrRedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0F3935] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <QrRedirectContent />
        </Suspense>
    );
}
