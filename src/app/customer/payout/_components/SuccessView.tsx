"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessViewProps {
  amount: string;
  onBack: () => void;
}

export default function SuccessView({ amount, onBack }: SuccessViewProps) {
  const formattedAmount = parseFloat(amount || "0").toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
        Withdrawal Requested
      </h2>
      <p className="text-slate-500 font-bold text-sm max-w-xs mb-8">
        Your request for {formattedAmount} has been
        submitted successfully and is under verification.
      </p>
      <button
        onClick={onBack}
        className="w-full max-w-xs py-4 bg-[#6246EA] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#5037d3] transition-all active:scale-95 shadow-lg shadow-[#6246EA]/25"
      >
        Back to Payments
      </button>
    </div>
  );
}
