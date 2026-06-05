"use client";

import { useState } from "react";
import {
  XCircle,
  AlertCircle,
  Zap,
  Landmark,
  Loader2,
  ArrowRight,
  ArrowRightLeft,
  Lock,
  ChevronDown,
  Clock,
} from "lucide-react";

// 1. Transfer Rewards Modal
interface TransferRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferAmountValue: string;
  setTransferAmountValue: (val: string) => void;
  cashbackBalance: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function TransferRewardsModal({
  isOpen,
  onClose,
  transferAmountValue,
  setTransferAmountValue,
  cashbackBalance,
  isSubmitting,
  onConfirm,
}: TransferRewardsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative text-slate-900">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Transfer Rewards
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full"
          >
            <XCircle className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
            Transfer Amount
          </label>
          <input
            type="number"
            value={transferAmountValue}
            onChange={(e) => setTransferAmountValue(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-lg font-black text-slate-900 focus:ring-1 focus:ring-slate-900/5 outline-none font-sans"
          />
        </div>

        <button
          onClick={onConfirm}
          disabled={
            isSubmitting ||
            !transferAmountValue ||
            parseFloat(transferAmountValue) > cashbackBalance
          }
          className="w-full py-4 bg-[#6246EA] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#5037d3] transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-indigo-100"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            "Confirm Transfer"
          )}
        </button>
      </div>
    </div>
  );
}

// 2. Source Selection Modal
interface SourceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  vaultBalance: number;
  onSelectWallet: () => void;
  onSelectVault: () => void;
}

export function SourceSelectionModal({
  isOpen,
  onClose,
  balance,
  vaultBalance,
  onSelectWallet,
  onSelectVault,
}: SourceSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative text-slate-900">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Choose Source
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full"
          >
            <XCircle className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSelectWallet}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left border border-slate-100 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-black text-slate-900">Wallet</p>
              <p className="text-[10px] font-bold text-slate-500">
                Balance: ₹{balance.toLocaleString()}
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </button>

          <button
            onClick={onSelectVault}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left border border-slate-100 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-black text-slate-900">Vault Card</p>
              <p className="text-[10px] font-bold text-slate-500">
                Balance: ₹{vaultBalance.toLocaleString()}
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Rule Error Modal
interface RuleErrorModalProps {
  ruleError: string | null;
  onClose: () => void;
  onViewTiers: () => void;
}

export function RuleErrorModal({
  ruleError,
  onClose,
  onViewTiers,
}: RuleErrorModalProps) {
  if (!ruleError) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative text-center text-slate-900">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertCircle size={32} strokeWidth={2.5} />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">
          Limits Exceeded
        </h3>

        <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6">
          {ruleError}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onViewTiers}
            className="flex-1 py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            View Tiers
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Verification Modal
interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  onVerify,
}: VerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative text-center text-slate-900">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-[#6246EA] mx-auto mb-4">
          <Zap size={32} strokeWidth={2.5} />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">
          Verification Required
        </h3>

        <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6 px-2">
          Fast bank settlements require a one-time active verification to protect your account.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Close
          </button>
          <button
            onClick={onVerify}
            className="flex-1 py-3.5 bg-[#6246EA] hover:bg-[#5037d3] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-100"
          >
            Verify Now
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Confirm Withdrawal Modal
interface ConfirmWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  chargeAmount: string;
  bankName: string;
  accountNumber: string;
  cashbackDeduction: number;
  isMerchant: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function ConfirmWithdrawalModal({
  isOpen,
  onClose,
  amount,
  chargeAmount,
  bankName,
  accountNumber,
  cashbackDeduction,
  isMerchant,
  isSubmitting,
  onConfirm,
}: ConfirmWithdrawalModalProps) {
  const [isRefundInfoOpen, setIsRefundInfoOpen] = useState(false);

  if (!isOpen) return null;

  const amt = parseFloat(amount) || 0;
  const feeAmt = parseFloat(chargeAmount) || 0;
  const netPayout = amt - feeAmt;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Confirm Settlement
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full"
          >
            <XCircle className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Gross Amount</span>
            <span className="text-slate-900 font-black">
              ₹{amt.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Processing Fee</span>
            <span className="text-rose-500 font-black">
              {feeAmt > 0 ? `-₹${feeAmt.toLocaleString("en-IN")}` : "₹0"}
            </span>
          </div>

          <div className="h-px bg-slate-200/50"></div>

          <div
            className={`p-4 rounded-xl shadow-md border flex justify-between items-center ${
              isMerchant
                ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-200"
                : "bg-slate-900 border-slate-800 text-white shadow-slate-200"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
              Net Cred-out
            </span>
            <span className="text-lg font-black">
              ₹{netPayout.toLocaleString("en-IN")}
            </span>
          </div>

          {cashbackDeduction > 0 && (
            <div className="mt-6 px-1 space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest leading-none">
                  Cashback Expired Due To Withdraw
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                Withdrawal will reduce your cashback,{" "}
                <span className="text-rose-500 font-extrabold">
                  {cashbackDeduction.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRefundInfoOpen(!isRefundInfoOpen)}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
                >
                  How to save cashback?
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${isRefundInfoOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isRefundInfoOpen && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl animate-in slide-in-from-top-1 fade-in duration-300">
                    <p className="text-[10px] font-bold text-slate-500 leading-normal">
                      Avoid withdrawals. Use app transfers for full benefits.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bank Account Preview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Settlement Destination
            </span>
          </div>
          <p className="text-xs font-black text-slate-950">
            {bankName || "N/A"}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            A/C:{" "}
            {"*".repeat(Math.max(0, accountNumber.length - 4)) +
              accountNumber.slice(-4)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="py-3.5 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
          >
            <AlertCircle size={14} />
            Confirm
          </button>
          <button
            onClick={onClose}
            className="py-3.5 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. Settlement Wallet Modal
interface SettlementWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (days: number) => void;
}

export function SettlementWalletModal({
  isOpen,
  onClose,
  onSelectTier,
}: SettlementWalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-slate-900">
      <div className="bg-white w-full max-w-[300px] rounded-[1.5rem] p-5 shadow-2xl relative">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Green Wallet Settlement
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-50 rounded-full"
          >
            <XCircle className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-3">
          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">
            Transfer to Vault
          </p>
          <p className="text-[9px] font-bold text-emerald-700 leading-tight">
            Select a settlement tier. Funds will be transferred from your main wallet to your Vault Card.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            Values (Per 1000)
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { t: 3, label: "60 - 120" },
              { t: 7, label: "140 - 280" },
              { t: 10, label: "200 - 400" },
              { t: 15, label: "300 - 600" },
              { t: 30, label: "600 - 1200" },
            ].map((tier) => (
              <button
                key={tier.t}
                onClick={() => onSelectTier(tier.t)}
                className="px-3 py-2 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 bg-white flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <Clock size={14} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-700 group-hover:text-emerald-700">
                      T{tier.t} Plan
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {tier.label}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-300 group-hover:text-emerald-500"
                  strokeWidth={3}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Late Withdrawal Error Minimalist Dialogue
interface LateWithdrawalErrorModalProps {
  errorMsg: string | null;
  onClose: () => void;
}

export function LateWithdrawalErrorModal({
  errorMsg,
  onClose,
}: LateWithdrawalErrorModalProps) {
  if (!errorMsg) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[280px] rounded-2xl p-5 shadow-2xl shadow-slate-900/20 border border-slate-100 animate-in zoom-in-95 duration-200 text-slate-900 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle size={20} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Request Could Not Be Completed
            </h4>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              {errorMsg}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-2 w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
