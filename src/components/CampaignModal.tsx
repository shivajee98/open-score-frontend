'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, ArrowRight } from 'lucide-react';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: string;
}

export default function CampaignModal({ isOpen, onClose, role }: CampaignModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    const isAgent = role === 'AGENT';
    const isMerchant = role === 'MERCHANT';
    
    // Fallback if not specifically agent/merchant
    const posterSrc = isAgent ? '/campaign/agent-contest.png' : '/campaign/vendor-contest.png';
    const title = isAgent ? 'Agent Contest 2024' : 'Vendor Contest 2024';

    return (
        <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className={`relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all active:scale-90"
                >
                    <X size={20} />
                </button>

                <div className="relative aspect-[4/5] w-full">
                    <img 
                        src={posterSrc} 
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                                <Calendar size={10} /> 13 Apr - 23 Apr
                            </div>
                            <div className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-white/20">
                                <Trophy size={10} className="text-yellow-400" /> Big Prizes
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="w-full max-w-xs bg-white text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-100 active:scale-95 transition-all"
                        >
                            Start Now <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
