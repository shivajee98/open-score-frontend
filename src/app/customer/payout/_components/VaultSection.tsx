"use client";

import { ArrowRight, ArrowRightLeft, Lock, Plus, XCircle } from "lucide-react";
import VaultCard from "./VaultCard";

interface VaultSectionProps {
  vaultData: any;
  userData: any;
  activeDeposit: any;
  isVaultFlipped: boolean;
  setIsVaultFlipped: (val: boolean) => void;
  isVaultMaximized: boolean;
  setIsVaultMaximized: (val: boolean) => void;
  showVaultCardNumber: boolean;
  setShowVaultCardNumber: (val: boolean) => void;
  showVaultCvc: boolean;
  setShowVaultCvc: (val: boolean) => void;
  onAddMoneyClick: () => void;
  onWithdrawClick: () => void;
  onSettlementTenureClick: () => void;
}

export default function VaultSection({
  vaultData,
  userData,
  activeDeposit,
  isVaultFlipped,
  setIsVaultFlipped,
  isVaultMaximized,
  setIsVaultMaximized,
  showVaultCardNumber,
  setShowVaultCardNumber,
  showVaultCvc,
  setShowVaultCvc,
  onAddMoneyClick,
  onWithdrawClick,
  onSettlementTenureClick,
}: VaultSectionProps) {
  if (!vaultData?.vault) return null;

  return (
    <>
      {/* Card Layout Container with Placeholder */}
      <div className="min-w-full h-[195px] relative">
        {/* Placeholder to prevent layout shift */}
        {isVaultMaximized && (
          <div className="w-full h-full bg-slate-500/[0.03] rounded-xl border border-slate-500/10 border-dashed animate-pulse flex items-center justify-center">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 opacity-60">
              Vault card focused
            </span>
          </div>
        )}

        {/* The Actual Zoomable Card */}
        <div
          className={
            isVaultMaximized
              ? "fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-[#0a0c0e]/85 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default"
              : "absolute inset-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:scale-[1.03] hover:-translate-y-0.5"
          }
          onClick={() => {
            if (isVaultMaximized) {
              setIsVaultMaximized(false);
            } else {
              setIsVaultMaximized(true);
            }
          }}
        >
          {/* Floating Close Button when Maximized */}
          {isVaultMaximized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVaultMaximized(false);
              }}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all z-[110] active:scale-95"
            >
              <XCircle size={20} />
            </button>
          )}

          {isVaultMaximized && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMoneyClick();
                }}
                className="px-6 py-3 bg-[#c5a059] hover:bg-[#d6b571] text-[#0f1113] rounded-full font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16} /> Add Money
              </button>
            </div>
          )}

          <VaultCard
            vault={vaultData.vault}
            rates={vaultData.rates}
            activeDeposit={activeDeposit}
            userName={userData?.name}
            isFlipped={isVaultFlipped}
            setIsFlipped={setIsVaultFlipped}
            isMaximized={isVaultMaximized}
            setIsMaximized={setIsVaultMaximized}
            showCardNumber={showVaultCardNumber}
            setShowCardNumber={setShowVaultCardNumber}
            showCvc={showVaultCvc}
            setShowCvc={setShowVaultCvc}
            onAddMoneyClick={onAddMoneyClick}
            onWithdrawClick={onWithdrawClick}
          />

          {/* Hint Overlay / Close action when maximized */}
          {isVaultMaximized && (
            <div
              className="mt-8 flex flex-col items-center gap-3 text-center animate-fade-in z-[110]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                {isVaultFlipped
                  ? "Tap card to see front"
                  : "Tap card to see CVV & Rates"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVaultMaximized(false);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-black text-white transition-all uppercase tracking-widest active:scale-95"
              >
                Close View
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Settlement Plan Info Bar */}
      <div
        className="min-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {activeDeposit ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                <Lock size={16} strokeWidth={2.5} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Incremental Value
                </p>
                <p className="text-[8px] font-bold text-slate-500 mt-0.5">
                  T{activeDeposit.tenure_days} Plan Active
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-600 leading-none">
                +
                {(() => {
                  const rate = Number(activeDeposit.interest_rate);
                  const amt = Number(activeDeposit.amount);
                  const daily = (amt * rate) / 100 / 30;
                  return daily.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  });
                })()}
              </p>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Daily Increment Flat
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettlementTenureClick();
            }}
            className="w-full bg-white hover:bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between group shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <ArrowRightLeft size={16} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Growth Plan
                </p>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                  Enable auto-increment rewards
                </p>
              </div>
            </div>
            <div className="w-7 h-7 bg-slate-50 border border-slate-150 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#6246EA] group-hover:text-white transition-all">
              <ArrowRight size={14} strokeWidth={3} />
            </div>
          </button>
        )}
      </div>
    </>
  );
}
