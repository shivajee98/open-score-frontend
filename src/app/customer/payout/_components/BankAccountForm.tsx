"use client";

import { Landmark, AlertCircle, Search } from "lucide-react";

interface BankAccountFormProps {
  isVerified: boolean;
  bankName: string;
  setBankName: (val: string) => void;
  showBankSuggestions: boolean;
  setShowBankSuggestions: (val: boolean) => void;
  bankSuggestions: string[];
  accountNumber: string;
  setAccountNumber: (val: string) => void;
  confirmAccountNumber: string;
  setConfirmAccountNumber: (val: string) => void;
  ifscCode: string;
  setIfscCode: (val: string) => void;
  showIfscSuggestions: boolean;
  setShowIfscSuggestions: (val: boolean) => void;
  ifscSuggestions: any[];
  accountHolderName: string;
  setAccountHolderName: (val: string) => void;
  isSubmitting: boolean;
  amount: string;
  balance: number;
  isMerchant: boolean;
  withdrawalRule: any;
  onPayoutSubmit: () => void;
}

export default function BankAccountForm({
  isVerified,
  bankName,
  setBankName,
  showBankSuggestions,
  setShowBankSuggestions,
  bankSuggestions,
  accountNumber,
  setAccountNumber,
  confirmAccountNumber,
  setConfirmAccountNumber,
  ifscCode,
  setIfscCode,
  showIfscSuggestions,
  setShowIfscSuggestions,
  ifscSuggestions,
  accountHolderName,
  setAccountHolderName,
  isSubmitting,
  amount,
  balance,
  isMerchant,
  withdrawalRule,
  onPayoutSubmit,
}: BankAccountFormProps) {
  const inputClass =
    "w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:ring-1 focus:ring-[#6246EA]/25 focus:border-[#6246EA]/25 focus:bg-white placeholder:text-slate-350 disabled:opacity-60 outline-none transition-all";

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-[0.15em] ml-1">
          <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Landmark size={12} className="text-blue-600" />
          </div>
          Settlement Bank Account
        </label>
        {isVerified && (
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
            Locked & Secured
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Bank Name */}
        <div>
          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            Bank Name
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isVerified}
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                setShowBankSuggestions(true);
              }}
              onFocus={() => setShowBankSuggestions(true)}
              placeholder="Search or Enter Bank"
              className={inputClass}
            />
            <Search
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            {showBankSuggestions && bankSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {bankSuggestions.map((bank, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setBankName(bank);
                      setShowBankSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {bank}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* IFSC Code + Holder Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              IFSC Code
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={isVerified}
                value={ifscCode}
                onChange={(e) => {
                  setIfscCode(e.target.value.toUpperCase());
                  setShowIfscSuggestions(true);
                }}
                onFocus={() => setShowIfscSuggestions(true)}
                placeholder="SBIN000XXXX"
                className={inputClass}
              />
              {showIfscSuggestions && ifscSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {ifscSuggestions.map((item: any, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setIfscCode(item.ifsc);
                        setBankName(item.bank);
                        setShowIfscSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <span className="font-black text-slate-900">
                        {item.ifsc}
                      </span>{" "}
                      - {item.bank} ({item.branch})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Holder Name
            </label>
            <input
              type="text"
              disabled={isVerified}
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Enter Holder Name"
              className={inputClass}
            />
          </div>
        </div>

        {/* Account Number + Confirm */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Account Number
            </label>
            <input
              type="password"
              disabled={isVerified}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter A/C Number"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Confirm Number
            </label>
            <input
              type="text"
              disabled={isVerified}
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              placeholder="Confirm A/C Number"
              className={`${inputClass} ${
                confirmAccountNumber &&
                confirmAccountNumber !== accountNumber
                  ? "ring-1 ring-rose-500/30 border-rose-500/20 bg-rose-50/20"
                  : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[9px] font-bold text-blue-600 italic leading-normal">
          {isVerified
            ? "To update bank details, please contact help desk for manual verification."
            : "Settlements are processed instantly to verified bank accounts."}
        </p>
      </div>

      <button
        onClick={onPayoutSubmit}
        disabled={
          isSubmitting ||
          !amount ||
          parseFloat(amount) <
            (withdrawalRule?.min_charge_amount || 0) ||
          parseFloat(amount) > balance
        }
        className={`w-full py-4 ${
          isMerchant
            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            : "bg-gradient-to-r from-[#6246EA] to-[#7C5CFC] hover:from-[#5037d3] hover:to-[#6246EA]"
        } text-white rounded-2xl font-black text-sm disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-[#6246EA]/10 mt-4 group`}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            Verify & Withdraw
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </>
        )}
      </button>
    </div>
  );
}
