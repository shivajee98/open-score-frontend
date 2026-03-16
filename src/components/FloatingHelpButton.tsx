'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/loanUtils';

export default function FloatingHelpButton({ onClick }: { onClick: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3 px-1 pb-1">
            {/* Tooltip/Label */}
            {isOpen && (
                <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest">Support Help</p>
                </div>
            )}

            <button
                onClick={onClick}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className={cn(
                    "w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all duration-300 group border-4 border-white/10 backdrop-blur-md",
                    "before:absolute before:inset-0 before:rounded-full before:bg-indigo-600 before:animate-ping before:opacity-20"
                )}
            >
                <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
            </button>
        </div>
    );
}
