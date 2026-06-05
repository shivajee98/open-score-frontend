"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  isAddingMoney: boolean;
  upiId: string;
  onSubmit: (
    amount: number,
    source: "WALLET" | "UPI",
    proof: File | null
  ) => Promise<void>;
}

export default function AddMoneyModal({
  isOpen,
  onClose,
  walletBalance,
  isAddingMoney,
  upiId,
  onSubmit,
}: AddMoneyModalProps) {
  const [addMoneyAmount, setAddMoneyAmount] = useState<string>("");
  const [addMoneySource, setAddMoneySource] = useState<"WALLET" | "UPI" | null>(null);
  const [addMoneyProof, setAddMoneyProof] = useState<File | null>(null);
  const [addMoneyProofPreview, setAddMoneyProofPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setAddMoneyAmount("");
    setAddMoneySource(null);
    setAddMoneyProof(null);
    setAddMoneyProofPreview(null);
    onClose();
  };

  const handleFormSubmit = async () => {
    const amountNum = Number(addMoneyAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!addMoneySource) {
      toast.error("Please select a payment source.");
      return;
    }
    if (addMoneySource === "WALLET" && walletBalance < amountNum) {
      toast.error("Insufficient wallet balance.");
      return;
    }
    if (addMoneySource === "UPI" && !addMoneyProof) {
      toast.error("Please upload payment screenshot proof.");
      return;
    }

    await onSubmit(amountNum, addMoneySource, addMoneyProof);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-black tracking-tight uppercase">
              Top Up Vault
            </h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
              Add funds to your reserve
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Amount to Add
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[1000, 2000, 3000, 4000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAddMoneyAmount(val.toString())}
                className={`py-2 px-3 rounded-xl border text-[12px] font-black tracking-widest transition-all ${
                  addMoneyAmount === val.toString()
                    ? "border-[#6246EA] bg-[#6246EA]/10 text-[#6246EA]"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {val.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <input
              type="number"
              value={addMoneyAmount}
              onChange={(e) => setAddMoneyAmount(e.target.value)}
              placeholder="Enter custom amount (Min 5,000)"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-xl font-black text-slate-900 focus:border-[#6246EA] outline-none transition-all placeholder:text-slate-300 placeholder:text-sm focus:bg-white"
            />
            {Number(addMoneyAmount) > 0 &&
              Number(addMoneyAmount) < 5000 &&
              ![1000, 2000, 3000, 4000].includes(Number(addMoneyAmount)) && (
                <p className="text-rose-500 text-[10px] font-bold mt-1 absolute -bottom-5">
                  Custom amounts must be 5,000 or above.
                </p>
              )}
          </div>
        </div>

        {Number(addMoneyAmount) > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Select Payment Source
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAddMoneySource("WALLET")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                  addMoneySource === "WALLET"
                    ? "border-[#6246EA] bg-[#6246EA]/5 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50"
                }`}
              >
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg w-fit text-slate-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    From Wallet
                  </p>
                  <p className="text-[11px] font-black text-slate-900 mt-0.5">
                    ₹{walletBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAddMoneySource("UPI")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                  addMoneySource === "UPI"
                    ? "border-[#6246EA] bg-[#6246EA]/5 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50"
                }`}
              >
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg w-fit text-slate-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    UPI Top Up
                  </p>
                  <p className="text-[11px] font-black text-[#6246EA] mt-0.5">
                    Instant Transfer
                  </p>
                </div>
              </button>
            </div>

            {addMoneySource === "WALLET" && (
              <div className="mt-4 animate-in fade-in duration-300">
                {walletBalance < Number(addMoneyAmount) ? (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">
                        Insufficient Balance
                      </p>
                      <p className="text-[9px] text-slate-500 font-semibold">
                        You need{" "}
                        <span className="text-slate-900 font-bold">
                          {(Number(addMoneyAmount) - walletBalance).toLocaleString("en-IN")}
                        </span>{" "}
                        more to add directly from your wallet. Please use UPI.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        Available in Wallet
                      </p>
                      <p className="text-[9px] text-slate-500 font-semibold">
                        Funds will be instantly transferred from your main wallet to your Vault Card.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {addMoneySource === "UPI" && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-xl mb-3 border border-slate-100">
                    <QRCodeSVG
                      value={`upi://pay?pa=${upiId}&pn=Flip%20Flops&am=${addMoneyAmount}&tn=Vault%20Card%20TopUp`}
                      size={120}
                      level="M"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 flex items-center justify-between gap-3 w-full max-w-[240px]">
                    <div className="text-left">
                      <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none">
                        UPI Address
                      </p>
                      <p className="text-[10px] font-black text-slate-700 italic mt-0.5">
                        {upiId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(upiId);
                        toast.success("UPI ID copied to clipboard!");
                      }}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg text-[#6246EA] active:scale-90 transition-all border border-slate-100"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Upload Payment Screenshot
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-[#6246EA]/50 rounded-2xl p-5 transition-all bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddMoneyProof(file);
                          setAddMoneyProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {addMoneyProofPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={addMoneyProofPreview}
                          alt="Screenshot proof preview"
                          className="h-24 object-contain rounded-lg border border-slate-100"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddMoneyProof(null);
                            setAddMoneyProofPreview(null);
                          }}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <Upload className="w-6 h-6 text-[#6246EA]/60" />
                        <p className="text-[9px] font-black text-slate-500 uppercase">
                          Upload Screenshot
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={
                isAddingMoney ||
                !addMoneySource ||
                (addMoneySource === "WALLET" && walletBalance < Number(addMoneyAmount)) ||
                (addMoneySource === "UPI" && !addMoneyProof)
              }
              className="w-full py-4 mt-2 bg-[#6246EA] hover:bg-[#5037d3] active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isAddingMoney ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
              ) : (
                "Confirm & Add Money"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
