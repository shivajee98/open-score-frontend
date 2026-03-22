import React from 'react';
import { Smartphone, LogIn, Zap } from 'lucide-react';
import { Logo, Tagline, Watermark } from './BrandComponents';

interface AuthEntryProps {
    onMobileLogin: () => void;
    onEmailLogin: () => void;
}

export default function AuthEntry({ onMobileLogin, onEmailLogin }: AuthEntryProps) {
    return (
        <div className="fixed inset-0 z-40 bg-white flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Watermark />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm animate-bounce">
                    <Zap className="w-8 h-8 text-blue-600" />
                </div>
                
                <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">
                    ⚡ Instant Voucher Power
                </h2>
                <p className="text-blue-600 font-bold mb-8">
                    from ₹10,000 to ₹50,000
                </p>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-10 w-full max-w-sm">
                    <p className="text-green-700 font-bold text-sm">
                        Zero Interest EMI (1–7 Days)
                    </p>
                    <p className="text-green-600/70 text-xs font-medium uppercase tracking-wider mt-1">
                        No Hidden Stress!
                    </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={onMobileLogin}
                        className="w-full brand-gradient text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
                    >
                        <Smartphone className="w-5 h-5" />
                        Continue with Mobile
                    </button>

                    <button
                        onClick={onEmailLogin}
                        className="w-full bg-white text-blue-600 border-2 border-slate-100 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    >
                        <LogIn className="w-5 h-5" />
                        Continue With Phone Number
                    </button>

                    <p className="text-center text-slate-400 text-xs px-4 mt-8 leading-relaxed">
                        By continuing, you agree to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>
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
