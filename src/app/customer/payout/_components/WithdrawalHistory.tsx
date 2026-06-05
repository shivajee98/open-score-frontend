"use client";

import { useState } from "react";
import { ChevronRight, Clock, Loader2 } from "lucide-react";

interface WithdrawalHistoryProps {
  withdrawals: any[];
  lastWithdrawalRef: any;
  isValidating: boolean;
}

export default function WithdrawalHistory({
  withdrawals,
  lastWithdrawalRef,
  isValidating,
}: WithdrawalHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* Compact header row button matching reference */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group shadow-sm transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Clock size={15} className="text-[#6246EA]" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black text-slate-850 uppercase tracking-[0.15em]">
            Withdrawal History
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
            Activity Log
          </span>
          <ChevronRight size={10} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} strokeWidth={3} />
        </div>
      </button>

      {/* Expanded Logs List */}
      {isExpanded && (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 py-1 animate-in fade-in slide-in-from-top-2 duration-250">
          {!withdrawals || withdrawals.length === 0 ? (
            <div className="bg-white/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                No Withdrawal History
              </p>
              <p className="text-[8px] text-slate-400 font-bold">
                Your past payouts will appear here.
              </p>
            </div>
          ) : (
            withdrawals.map((w: any, index: number) => {
              const isLast = index === withdrawals.length - 1;
              return (
                <div
                  key={w.id}
                  ref={isLast ? lastWithdrawalRef : null}
                  className="p-4 bg-white border border-slate-100 hover:border-slate-250 rounded-2xl transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        w.status === "PENDING"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : w.status === "SUCCESS" || w.status === "PAID"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      {w.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-900">
                      ₹{parseFloat(w.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                    <span>Ref: {w.reference_id || w.id || "N/A"}</span>
                    <span>
                      {new Date(w.created_at || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Show fee breakdown if present */}
                  {parseFloat(w.charge_amount || 0) > 0 && (
                    <div className="flex items-center justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-1.5 rounded-lg border border-slate-100 leading-none mb-2">
                      <span>Gross: ₹{Number(w.amount).toLocaleString()}</span>
                      <span className="text-amber-600">
                        Fee: -₹{Number(w.charge_amount).toLocaleString()}
                      </span>
                      <span className="text-slate-900 font-bold">
                        Net: ₹{Number(w.net_amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Bank Account Details */}
                  <div className="pt-2 border-t border-slate-100/50 flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                      <span>{w.bank_name || "Settlement Bank"}</span>
                    </div>
                    <span>
                      A/C: *{w.account_number?.slice(-4) || "****"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {isValidating && (
            <div className="py-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
