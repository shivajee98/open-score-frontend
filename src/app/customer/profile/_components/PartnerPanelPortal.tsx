"use client";

import { Briefcase } from "lucide-react";

interface PartnerPanelPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerPanelPortal({
  isOpen,
  onClose,
}: PartnerPanelPortalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0a0f1d] text-white p-4 flex items-center justify-between shadow-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-white/10">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Partner Panel</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-500/20"
        >
          Exit Portal
        </button>
      </div>
      <div className="flex-1 w-full h-full relative">
        <iframe
          src="https://agent.msmeloan.sbs"
          className="w-full h-full border-none"
          title="Partner Panel"
        />
      </div>
    </div>
  );
}
