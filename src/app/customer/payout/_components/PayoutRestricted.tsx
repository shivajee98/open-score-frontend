"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";

interface PayoutRestrictedProps {
  onCompleteReupload: () => void;
}

export default function PayoutRestricted({ onCompleteReupload }: PayoutRestrictedProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-8 text-center shadow-sm">
      <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <ShieldAlert className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
        Payout Restricted
      </h3>
      <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6 max-w-xs mx-auto">
        Your KYC documents require re-upload before you can withdraw funds.
        Complete the verification to unlock payouts.
      </p>
      <button
        onClick={onCompleteReupload}
        className="w-full py-4 bg-[#6246EA] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#5037d3] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#6246EA]/25"
      >
        Complete Verification
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
