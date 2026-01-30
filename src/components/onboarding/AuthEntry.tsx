import React from 'react';
import { Smartphone, LogIn } from 'lucide-react';
import { Logo, Tagline, Watermark } from './BrandComponents';

interface AuthEntryProps {
    onMobileLogin: () => void;
    onEmailLogin: () => void;
}

export default function AuthEntry({ onMobileLogin, onEmailLogin }: AuthEntryProps) {
    return (
        <div className="fixed inset-0 z-40 bg-white flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Watermark />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <Logo className="mb-2 scale-110" />
                <Tagline className="mb-12" />

                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={onMobileLogin}
                        className="w-full brand-gradient text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
                    >
                        <Smartphone className="w-5 h-5" />
                        Continue with Mobile Number
                    </button>

                    <button
                        onClick={onEmailLogin}
                        className="w-full bg-white text-primary border-2 border-slate-100 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-brand"
                    >
                        <LogIn className="w-5 h-5" />
                        Login
                    </button>

                    <p className="text-center text-slate-400 text-sm px-4 mt-6">
                        Low CIBIL? You may still qualify under <span className="text-primary font-bold">MSME schemes</span>.
                    </p>
                </div>
            </div>

            <div className="py-6 text-center relative z-10">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    Designed for MSMEs • Scheme Budget Support
                </p>
            </div>
        </div>
    );
}
