
import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    subMessage?: string;
}

export default function LoadingOverlay({ isVisible, message = "Processing Application", subMessage = "Verifying details with bank..." }: LoadingOverlayProps) {
    const [show, setShow] = useState(isVisible);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            // Cycle through "fake" steps for engagement
            const interval = setInterval(() => {
                setStep(s => (s + 1) % 4);
            }, 800);
            return () => clearInterval(interval);
        } else {
            const t = setTimeout(() => setShow(false), 500); // Fade out delay
            return () => clearTimeout(t);
        }
    }, [isVisible]);

    if (!show) return null;

    const messages = [
        "Verifying eligibility...",
        "Connecting to bank servers...",
        "Finalizing loan terms...",
        "Securing transaction..."
    ];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="text-center relative">
                {/* Pulse Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10 bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700 w-80">
                    <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 relative">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                        <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-ping"></div>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">
                        {message}
                    </h3>

                    <div className="h-6">
                        <p key={step} className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {messages[step]}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted & Secure
                </div>
            </div>
        </div>
    );
}
