"use client";

import { Loader2 } from "lucide-react";

interface ProcessingViewProps {
  isMerchant: boolean;
}

export default function ProcessingView({ isMerchant }: ProcessingViewProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-[#6246EA] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            className={`w-8 h-8 animate-pulse ${isMerchant ? "text-emerald-500" : "text-[#6246EA]"}`}
          />
        </div>
      </div>
      <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">
        Processing Settlement
      </h2>
      <p className="text-slate-500 font-bold text-xs text-center max-w-xs">
        Please wait while we verify your bank details and process the
        withdrawal...
      </p>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#6246EA] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
