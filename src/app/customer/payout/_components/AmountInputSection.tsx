"use client";

import { Send, Clock, Landmark, XCircle } from "lucide-react";

interface AmountInputSectionProps {
  amount: string;
  setAmount: (val: string) => void;
  isSubmitting: boolean;
  withdrawalRule: any;
  onPayoutSubmit: () => void;
}

export default function AmountInputSection({
  amount,
  setAmount,
  isSubmitting,
  withdrawalRule,
  onPayoutSubmit,
}: AmountInputSectionProps) {
  const parsedAmount = parseFloat(amount || "0");

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm relative overflow-hidden">
      <label className="flex items-center gap-2 text-[10px] font-black text-[#6246EA] uppercase tracking-[0.2em] mb-3 ml-1">
        <div className="w-5 h-5 bg-[#6246EA]/10 rounded-full flex items-center justify-center">
          <Send size={9} className="text-[#6246EA]" strokeWidth={2.5} />
        </div>
        Transfer Amount
      </label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-lg font-black text-slate-900 focus:ring-1 focus:ring-[#6246EA]/20 focus:border-[#6246EA]/20 focus:bg-white placeholder:text-slate-400 outline-none transition-all font-sans"
          />
        </div>
        <button
          onClick={onPayoutSubmit}
          disabled={isSubmitting || !amount || parsedAmount <= 0}
          className="w-14 h-14 shrink-0 bg-[#6246EA] hover:bg-[#5037d3] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-[#6246EA]/10"
        >
          <Send size={18} strokeWidth={2.5} className="mr-0.5 mt-0.5" />
        </button>
      </div>
      {withdrawalRule && amount && parsedAmount > 0 && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  parsedAmount > (withdrawalRule.max_charge_amount || 0)
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : parsedAmount < (withdrawalRule.min_charge_amount || 0)
                      ? "bg-slate-300"
                      : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                }`}
              ></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                {parsedAmount > (withdrawalRule.max_charge_amount || 0)
                  ? "Priority Duty-Free Payout"
                  : parsedAmount < (withdrawalRule.min_charge_amount || 0)
                    ? "Invalid Amount"
                    : "Standard Withdrawal (Paid Tier)"}
              </span>
            </div>
            <div className="text-[10px] font-black text-slate-800">
              {(() => {
                const minAmt = withdrawalRule.min_charge_amount || 0;
                const maxAmt = withdrawalRule.max_charge_amount || 0;

                if (parsedAmount < minAmt) return "Fee: -";
                if (parsedAmount > maxAmt) return "Fee: 0";

                return `Fee: ${withdrawalRule.charge_percent || 0}%`;
              })()}
            </div>
          </div>

          <div className="h-px bg-slate-200/60"></div>

          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock size={10} strokeWidth={3} />
              <span>Daily Withdraw 1,000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Landmark size={10} strokeWidth={3} />
              <span>
                Tier Range:{" "}
                {(withdrawalRule.min_charge_amount || 0).toLocaleString()}{" "}
                -{" "}
                {(withdrawalRule.max_charge_amount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {parsedAmount < (withdrawalRule.min_charge_amount || 0) && (
            <div className="mt-1 flex items-center gap-2 text-rose-500 animate-pulse text-[9px] font-black uppercase tracking-tighter">
              <XCircle size={12} />
              <span>Minimum payout is {withdrawalRule.min_charge_amount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
