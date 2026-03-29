'use client';

import { ShieldCheck } from 'lucide-react';
import { clearAuthState } from '@/lib/api';

export default function SuspendedScreen() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center z-[9999] relative">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-10 shadow-2xl shadow-rose-500/10 border border-rose-100/50">
                <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-6 uppercase leading-tight">Access Restricted</h1>
            
            <div className="max-w-md bg-slate-50 border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-10">
                <p className="text-slate-600 font-bold leading-relaxed mb-8 italic">
                    "Your account has been suspended following a review of your recent onboarding/KYC process."
                </p>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] shadow-sm">
                    Please contact our support team to resolve this issue.
                </div>
            </div>

            <div className="flex flex-col gap-5 w-full max-w-xs">
                <button 
                    onClick={() => window.location.href = 'https://wa.me/910000000000'}
                    className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] py-6 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Contact Support Team
                </button>
                <button 
                    onClick={async () => {
                        await clearAuthState();
                        window.location.replace('/');
                    }}
                    className="w-full bg-white text-slate-400 font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl border border-slate-100 hover:text-rose-500 active:scale-95 transition-all"
                >
                    Logout from Device
                </button>
            </div>
        </div>
    );
}
