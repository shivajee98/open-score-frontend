"use client";

import { ArrowRightLeft, Gift, Wallet } from "lucide-react";

interface BalanceCardsProps {
  isMerchant: boolean;
  balance: number;
  cashbackBalance: number;
  isSubmitting: boolean;
  onAddAmount: (val: string) => void;
  onSettlementClick: () => void;
  onTransferClick: () => void;
}

export default function BalanceCards({
  isMerchant,
  balance,
  cashbackBalance,
  isSubmitting,
  onAddAmount,
  onSettlementClick,
  onTransferClick,
}: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {/* Available Balance Card */}
      <div className="bg-gradient-to-br from-[#4D37A7] to-[#1E1451] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group h-36 flex flex-col justify-between border border-white/[0.04]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex items-center gap-2 opacity-90">
          <Wallet size={13} strokeWidth={2.5} className="text-[#A294F9]" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            Available
          </span>
        </div>
        <div className="my-1">
          <span className="text-[26px] font-black tracking-tight leading-none">
            {balance.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {[100, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => onAddAmount(val.toString())}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 border border-white/10 rounded-full text-[8px] font-black transition-colors whitespace-nowrap"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incremental Cashback Card */}
      <div className="bg-gradient-to-br from-[#FD853A] to-[#D83A00] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group h-36 flex flex-col justify-between border border-white/[0.04]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex items-center gap-2 opacity-95">
          <Gift size={13} strokeWidth={2.5} className="text-[#FFE5D9]" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            Incremental
          </span>
        </div>
        <div className="my-1">
          <span className="text-[26px] font-black tracking-tight leading-none">
            {cashbackBalance.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="bg-white/15 backdrop-blur-md rounded-full py-1.5 px-3 border border-white/10 w-fit">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/95 leading-tight">
              Reward Holdings
            </p>
          </div>
          <button
            onClick={onTransferClick}
            disabled={isSubmitting}
            className="w-7 h-7 bg-white text-[#D83A00] hover:bg-slate-50 rounded-full transition-all active:scale-90 disabled:opacity-50 flex items-center justify-center shadow-md border border-white/10 shrink-0"
          >
            <ArrowRightLeft size={12} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
