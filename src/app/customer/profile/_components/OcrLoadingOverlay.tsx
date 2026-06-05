"use client";

import { ShieldCheck } from "lucide-react";

interface OcrLoadingOverlayProps {
  isLoading: boolean;
}

export default function OcrLoadingOverlay({
  isLoading,
}: OcrLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-3000 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute inset-10 bg-blue-500/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute inset-20 bg-blue-500/15 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

        <div className="relative w-28 h-36 bg-slate-800 rounded-2xl border-[3px] border-slate-700 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-linear-to-tr from-slate-900 via-slate-800 to-slate-900" />
          <div className="p-5 space-y-4 pt-10 relative z-10">
            <div className="h-1.5 bg-white/5 rounded-full w-full" />
            <div className="h-1.5 bg-white/5 rounded-full w-5/6" />
            <div className="h-1.5 bg-white/5 rounded-full w-4/6" />
            <div className="h-1.5 bg-white/5 rounded-full w-full" />
            <div className="h-1.5 bg-white/5 rounded-full w-3/4" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-blue-400 shadow-[0_0_15px_2px_rgba(59,130,246,0.8)] z-20 animate-[scanVertical_2.5s_ease-in-out_infinite]" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-blue-500/20 to-transparent z-10 opacity-0 animate-[scanVerticalPulse_2.5s_ease-in-out_infinite]" />
        </div>

        <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-blue-600 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-2xl animate-[bounce_2s_infinite]">
          <ShieldCheck className="text-white" size={24} />
        </div>
      </div>

      <div className="text-center space-y-3 relative z-30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
            Secure Processor
          </span>
        </div>
        <h2 className="text-white text-xl font-black uppercase tracking-[0.4em]">
          Analyzing
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          Validating document authenticity
        </p>
      </div>

      <style jsx>{`
        @keyframes scanVertical {
          0%,
          100% {
            top: 10%;
          }
          50% {
            top: 90%;
          }
        }
        @keyframes scanVerticalPulse {
          0%,
          100% {
            top: -10%;
            opacity: 0;
          }
          50% {
            top: 70%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
