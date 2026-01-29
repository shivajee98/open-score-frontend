import React from 'react';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 animate-bounce">
                    <span className="text-4xl font-black text-white">O</span>
                </div>
                <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-xl animate-pulse"></div>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                OpenScore
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
                Powered by MSME Shakti
            </p>

            <div className="absolute bottom-10 w-full flex justify-center">
                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-600 origin-left animate-[grow_1s_ease-in-out]"></div>
                </div>
            </div>
        </div>
    );
}
