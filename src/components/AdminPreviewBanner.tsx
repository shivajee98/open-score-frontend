'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function AdminPreviewBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAdminPreview = localStorage.getItem('admin_preview') === 'true';
            setIsVisible(isAdminPreview);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-500">
            <div className="bg-slate-900 text-white px-4 py-2 shadow-2xl flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none mb-1">System Insight</span>
                        <p className="text-xs font-bold leading-none">Admin Preview Active</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => {
                        localStorage.removeItem('admin_preview');
                        setIsVisible(false);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Dismiss Preview Banner"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>
            
            {/* Subtle glow effect */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
        </div>
    );
}
