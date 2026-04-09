'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, X, ExternalLink, BellRing } from 'lucide-react';

interface BroadcastBannerProps {
    title: string;
    body: string;
    link?: string;
    onClose: () => void;
}

export default function BroadcastBanner({ title, body, link, onClose }: BroadcastBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        
        // Auto-dismiss after 15 seconds if it's a broadcast
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, 15000);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
    };

    return (
        <div className={`
            fixed top-0 left-0 right-0 z-[10001] p-4 flex justify-center pointer-events-none transition-all duration-500 ease-out
            ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}>
            <div className="w-full max-w-2xl pointer-events-auto">
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                    {/* Animated gradient border/glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative p-6 md:p-8 flex items-start gap-4 md:gap-6">
                        {/* Icon with pulsing ring */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-blue-500 rounded-2xl animate-ping opacity-20" />
                            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
                                <Megaphone className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20 rounded">Priority Broadcast</span>
                                <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">{title}</h3>
                            <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed opacity-90">{body}</p>
                            
                            {link && (
                                <div className="pt-2">
                                    <a 
                                        href={link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                                    >
                                        Access link now
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Close button */}
                        <button 
                            onClick={handleClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all group/close"
                        >
                            <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Bottom Progress Bar (Auto-dismiss timer) */}
                    <div className="h-1 bg-white/5 relative">
                        <div className="absolute top-0 left-0 h-full bg-blue-500/50 animate-[progress_15s_linear_forwards]" />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
