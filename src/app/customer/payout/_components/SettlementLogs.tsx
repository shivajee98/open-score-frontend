"use client";

import { useState } from "react";
import { ChevronRight, FileText, Loader2, ArrowRight } from "lucide-react";

interface SettlementLogsProps {
  vaultLogs: any[];
  isLoading?: boolean;
}

export default function SettlementLogs({ vaultLogs, isLoading }: SettlementLogsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] p-5 border border-slate-100/80 shadow-sm space-y-4 mt-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Settlement Logs
        </h3>
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-50 border border-slate-100/50 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Compact header row button matching reference */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group shadow-sm transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <FileText size={15} className="text-[#FD853A]" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black text-slate-850 uppercase tracking-[0.15em]">
            Settlement Logs
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
            Settlement Tracker
          </span>
          <ChevronRight size={10} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} strokeWidth={3} />
        </div>
      </button>

      {/* Expanded Logs List */}
      {isExpanded && (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 py-1 animate-in fade-in slide-in-from-top-2 duration-250">
          {!vaultLogs || vaultLogs.length === 0 ? (
            <div className="bg-white/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                No Settlement Logs
              </p>
              <p className="text-[8px] text-slate-400 font-bold">
                Your settlement timeline will appear here.
              </p>
            </div>
          ) : (
            vaultLogs.map((log: any) => {
              const isUpcoming = log.status === "PENDING" || log.status === "ACTIVE";
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border bg-white shadow-sm transition-all ${
                    isUpcoming
                      ? "border-amber-100 hover:border-amber-250"
                      : "border-slate-100 hover:border-slate-200 opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isUpcoming
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-900">
                      ₹{parseFloat(log.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                    <span>Ref: {log.reference_id || log.id || "N/A"}</span>
                    <span>
                      {new Date(log.created_at || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Show fee breakdown if present */}
                  {parseFloat(log.charge_amount || 0) > 0 && (
                    <div className="flex items-center justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-1.5 rounded-lg border border-slate-100 leading-none mb-2">
                      <span>Gross: ₹{Number(log.amount).toLocaleString()}</span>
                      <span className="text-amber-600">
                        Fee: -₹{Number(log.charge_amount).toLocaleString()}
                      </span>
                      <span className="text-slate-900 font-bold">
                        Net: ₹{Number(log.net_amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Bank Account Details */}
                  <div className="pt-2 border-t border-slate-100/50 flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                      <span>{log.bank_name || "Settlement Bank"}</span>
                    </div>
                    <span>
                      A/C: *{log.account_number?.slice(-4) || "****"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
