"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  isMerchantVerified: boolean;
  onBackClick: () => void;
}

export default function Header({ isMerchantVerified, onBackClick }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={onBackClick}
        className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="text-right flex flex-col items-end">
        <div className="flex items-center gap-2">
          {isMerchantVerified && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-500">
              <CheckCircle2 size={10} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase tracking-tighter">
                Verified
              </span>
            </div>
          )}
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Cred-out
          </h1>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Bank Settlement
        </p>
      </div>
    </div>
  );
}
