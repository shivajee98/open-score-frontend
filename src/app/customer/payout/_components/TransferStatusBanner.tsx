"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface TransferStatusBannerProps {
  transferStatus: any;
}

export default function TransferStatusBanner({ transferStatus }: TransferStatusBannerProps) {
  if (!transferStatus) return null;

  const statusConfig: Record<string, { icon: any; bg: string; border: string; text: string; label: string }> = {
    PENDING: { icon: Clock, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", label: "Transfer Under Process" },
    APPROVED: { icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", label: "Transfer Approved" },
    REJECTED: { icon: XCircle, bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600", label: "Transfer Rejected" },
  };

  const config = statusConfig[transferStatus.status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className={`w-full p-4 rounded-2xl border ${config.bg} ${config.border} flex items-center gap-3 shadow-sm`}>
      <Icon className={`w-5 h-5 ${config.text}`} />
      <div>
        <p className="text-xs font-black text-slate-900">{config.label}</p>
        <p className="text-[10px] font-bold text-slate-400">
          Bulk Pay {transferStatus.total_amount?.toLocaleString("en-IN")} •{" "}
          {transferStatus.count} recipients
        </p>
      </div>
    </div>
  );
}
