"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Info,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Upload,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/imageUtils";

interface GrowthPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: any[];
  walletBalance: number;
  vaultBalance: number;
  isVaultSubmitting: boolean;
  upiId: string;
  onSubmit: (
    planDetails: any,
    amount: number,
    paymentMethod: "WALLET" | "UPI" | "VAULT",
    proofScreenshot: File | null
  ) => Promise<void>;
}

export default function GrowthPlanModal({
  isOpen,
  onClose,
  rates,
  walletBalance,
  vaultBalance,
  isVaultSubmitting,
  upiId,
  onSubmit,
}: GrowthPlanModalProps) {
  const [growthPlanStep, setGrowthPlanStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [growthPlanAmount, setGrowthPlanAmount] = useState<number>(0);
  const [growthPaymentMethod, setGrowthPaymentMethod] = useState<"WALLET" | "UPI" | "VAULT" | null>(null);
  const [growthProofScreenshot, setGrowthProofScreenshot] = useState<File | null>(null);
  const [growthProofPreview, setGrowthProofPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePlans = rates || [];
  const currentPlan =
    activePlans.find((p: any) => p.id === selectedPlanId) ||
    activePlans[0] ||
    {};

  // Set default plan if not set
  if (activePlans.length > 0 && !selectedPlanId) {
    setSelectedPlanId(activePlans[0].id);
    setGrowthPlanAmount(Math.round(parseFloat(activePlans[0].min_amount)));
  }

  const handleClose = () => {
    setGrowthPlanStep(1);
    setGrowthProofScreenshot(null);
    setGrowthProofPreview(null);
    setGrowthPaymentMethod(null);
    onClose();
  };

  const handleFormSubmit = async () => {
    if (growthPaymentMethod === "UPI" && !growthProofScreenshot) {
      toast.error("Please upload your payment screenshot proof.");
      return;
    }

    let proofToSubmit = growthProofScreenshot;
    if (proofToSubmit) {
      const compressedBlob = await compressImage(proofToSubmit);
      proofToSubmit = new File([compressedBlob], proofToSubmit.name, { type: compressedBlob.type });
    }
    
    await onSubmit(currentPlan, growthPlanAmount, growthPaymentMethod!, proofToSubmit);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative my-4 md:my-8 text-slate-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition-colors z-50"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {growthPlanStep === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center pt-2">
              <div className="inline-flex p-3 bg-[#6246EA]/10 border border-[#6246EA]/20 rounded-2xl text-[#6246EA] mb-3">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">
                Select Growth Plan
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                Accelerate Your Wealth JIT
              </p>
            </div>

            {/* Horizontal Plan Selector Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activePlans.map((plan: any) => {
                const isSelected = selectedPlanId === plan.id;
                const lockLabel = `${plan.tenure_days} Days`;
                const rateLabel = `+${parseFloat(parseFloat(plan.rate_percent).toFixed(1))}% ${
                  plan.rate_frequency === "DAILY" ? "Daily" : "Monthly"
                }`;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setGrowthPlanAmount(Math.round(parseFloat(plan.min_amount)));
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[104px] transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? "border-[#6246EA] bg-[#6246EA]/5 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-[#6246EA] text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {lockLabel}
                      </span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6246EA] animate-ping" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-900 truncate">
                        {plan.title}
                      </h4>
                      <p className="text-[9px] font-black text-[#6246EA] mt-0.5">
                        {rateLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Amount Increments Selector Bar */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Select Plan Amount
                </span>
                <span className="text-[9px] font-black text-[#6246EA] uppercase tracking-widest">
                  {Math.round(parseFloat(currentPlan.min_amount || "0")).toLocaleString("en-IN")}{" "}
                  -{" "}
                  {Math.round(parseFloat(currentPlan.max_amount || "0")).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {(() => {
                  const min = Math.round(parseFloat(currentPlan.min_amount || "0")) || 0;
                  const max = Math.round(parseFloat(currentPlan.max_amount || "0")) || 0;
                  if (min === max) return [min];
                  const step = (max - min) / 3;
                  const chips = [
                    min,
                    min + Math.round((step * 1) / 100) * 100,
                    min + Math.round((step * 2) / 100) * 100,
                    max,
                  ];
                  return chips.map((amt) => {
                    const isAmtSelected = growthPlanAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGrowthPlanAmount(amt)}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all active:scale-95 duration-200 ${
                          isAmtSelected
                            ? "bg-[#6246EA] text-white shadow-md"
                            : "bg-white hover:bg-slate-100 text-slate-650 border border-slate-100"
                        }`}
                      >
                        {amt.toLocaleString("en-IN")}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Custom Manual Input */}
              <div className="pt-3 border-t border-slate-200/50 flex gap-3 items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                  Custom Amount:
                </span>
                <input
                  type="number"
                  min={Math.round(parseFloat(currentPlan.min_amount || "0"))}
                  max={Math.round(parseFloat(currentPlan.max_amount || "0"))}
                  value={growthPlanAmount || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setGrowthPlanAmount(val);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:border-[#6246EA] transition-all"
                  placeholder="Enter custom amount..."
                />
              </div>
            </div>

            {/* Live Returns Calculation Cards */}
            {(() => {
              const parsedAmount = growthPlanAmount || 0;
              const rate = parseFloat(currentPlan.rate_percent || "0");
              const dailyGrowth = (parsedAmount * rate) / 100 / 30;
              const tenureDays = currentPlan.tenure_days || 0;
              const totalYield = dailyGrowth * tenureDays;
              const maturityTotal = parsedAmount + totalYield;

              return (
                <div className="bg-gradient-to-br from-[#6246EA]/5 to-slate-50 border border-[#6246EA]/10 p-5 rounded-[2.2rem] space-y-4">
                  <p className="text-[9px] font-black text-[#6246EA] uppercase tracking-widest text-center border-b border-slate-200/50 pb-2">
                    Incremental Growth Calculation
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">
                        Daily cashback
                      </p>
                      <p className="text-[13px] font-black text-[#6246EA] mt-1">
                        +{dailyGrowth.toFixed(1).replace(/\.0$/, "")}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">
                        Growth Period
                      </p>
                      <p className="text-[13px] font-black text-slate-705 mt-1">
                        {tenureDays} Days
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">
                        Total Cashback
                      </p>
                      <p className="text-[13px] font-black text-emerald-605 mt-1">
                        +{totalYield.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                      Maturity Payback
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {Math.round(maturityTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Early Withdrawal Rule Disclosure Box */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-left">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-amber-750 uppercase tracking-widest mb-1">
                  Early Withdrawal Penalty Notice
                </p>
                <p className="text-[9px] text-slate-550 leading-relaxed font-bold">
                  If you request your money back before maturity, a penalty of{" "}
                  <span className="text-amber-600 font-black">
                    {Math.round(parseFloat(currentPlan.penalty_daily_charge || "0"))} daily charge
                  </span>{" "}
                  for each remaining day applies, plus a{" "}
                  <span className="text-amber-600 font-black">
                    {Math.round(parseFloat(currentPlan.penalty_cancellation_fee || "0"))} cancellation fee
                  </span>
                  .{" "}
                  {currentPlan.collapse_increment_on_penalty
                    ? "Any daily cashback already earned during this period will be clawed back."
                    : "Accrued daily yields will be preserved."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const min = parseFloat(currentPlan.min_amount || "0");
                const max = parseFloat(currentPlan.max_amount || "0");
                if (growthPlanAmount < min || growthPlanAmount > max) {
                  toast.error(
                    `Please enter an amount between ${Math.round(min).toLocaleString("en-IN")} and ${Math.round(max).toLocaleString("en-IN")}`
                  );
                  return;
                }
                // Auto-select best payment method
                if (vaultBalance >= growthPlanAmount) {
                  setGrowthPaymentMethod("VAULT");
                } else {
                  setGrowthPaymentMethod("WALLET");
                }
                setGrowthPlanStep(2);
              }}
              className="w-full py-4 bg-[#6246EA] hover:bg-[#5037d3] active:scale-95 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              PROCEED TO PAYMENT <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setGrowthPlanStep(1)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Back to plan selection
              </span>
            </div>

            <div className="text-center pt-2">
              <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">
                Complete Deposit
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                Select Payment Method
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                  Selected Plan
                </span>
                <span className="text-[11px] font-black text-[#6246EA] uppercase">
                  {currentPlan.title}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                  Tenure Lock
                </span>
                <span className="text-[11px] font-black text-slate-700 uppercase">
                  {currentPlan.tenure_days} Days
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                  Total Amount
                </span>
                <span className="text-[13px] font-black text-slate-900 italic">
                  {growthPlanAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Payment Source Selection */}
            <div className={`grid gap-4 ${vaultBalance > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
              {vaultBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setGrowthPaymentMethod("VAULT")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                    growthPaymentMethod === "VAULT"
                      ? "border-[#c5a059] bg-[#c5a059]/5 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg w-fit text-[#c5a059]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      Vault Card
                    </p>
                    <p className="text-[11px] font-black text-[#c5a059] mt-0.5">
                      {vaultBalance.toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setGrowthPaymentMethod("WALLET")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                  growthPaymentMethod === "WALLET"
                    ? "border-[#6246EA] bg-[#6246EA]/5 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50"
                }`}
              >
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg w-fit text-slate-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    Pay from Wallet
                  </p>
                  <p className="text-[11px] font-black text-slate-900 mt-0.5">
                    {walletBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGrowthPaymentMethod("UPI")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                  growthPaymentMethod === "UPI"
                    ? "border-[#6246EA] bg-[#6246EA]/5 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50"
                }`}
              >
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg w-fit text-slate-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    Add Money / UPI
                  </p>
                  <p className="text-[11px] font-black text-[#6246EA] mt-0.5">
                    Instant Transfer
                  </p>
                </div>
              </button>
            </div>

            {/* Conditional Payment UI */}
            {growthPaymentMethod === "VAULT" ? (
              <div className="space-y-4">
                {vaultBalance < growthPlanAmount ? (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">
                        Insufficient Vault Balance
                      </p>
                      <p className="text-[9px] text-slate-550 leading-normal font-bold">
                        You need{" "}
                        <span className="text-slate-900 font-black">
                          {(growthPlanAmount - vaultBalance).toLocaleString("en-IN")}
                        </span>{" "}
                        more in your vault card. Top up first or use UPI.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#c5a059]/5 border border-[#c5a059]/10 p-4 rounded-2xl flex gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-1">
                        Vault Card Funds Available
                      </p>
                      <p className="text-[9px] text-slate-550 leading-normal font-bold">
                        {growthPlanAmount.toLocaleString("en-IN")} will be locked from your vault card balance of {vaultBalance.toLocaleString("en-IN")} to activate this growth plan.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isVaultSubmitting || vaultBalance < growthPlanAmount}
                  className="w-full py-4 bg-[#c5a059] hover:bg-[#b8933f] active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isVaultSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" />
                  ) : (
                    "Activate from Vault Card"
                  )}
                </button>
              </div>
            ) : growthPaymentMethod === "WALLET" ? (
              <div className="space-y-4">
                {walletBalance < growthPlanAmount ? (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">
                        Insufficient Wallet Balance
                      </p>
                      <p className="text-[9px] text-slate-500 leading-normal font-bold">
                        You need{" "}
                        <span className="text-slate-900 font-black">
                          {(growthPlanAmount - walletBalance).toLocaleString("en-IN")}
                        </span>{" "}
                        more to activate this plan directly from your wallet balance. Please select UPI to pay.
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
                      <p className="text-[9px] text-slate-500 leading-normal font-bold">
                        You have sufficient funds to activate this plan instantly. Clicking the button below will deduct the amount and start the tenure immediately.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isVaultSubmitting || walletBalance < growthPlanAmount}
                  className="w-full py-4 bg-[#6246EA] hover:bg-[#5037d3] active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isVaultSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                  ) : (
                    "Confirm & Activate Plan"
                  )}
                </button>
              </div>
            ) : growthPaymentMethod === "UPI" ? (
              <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-3xl shadow-2xl mb-4 border border-slate-100">
                    <QRCodeSVG
                      value={`upi://pay?pa=${upiId}&pn=Flip%20Flops&am=${growthPlanAmount}&tn=Vault%20Growth%20Plan%20Deposit`}
                      size={150}
                      level="M"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 flex items-center justify-between gap-4 w-full max-w-[280px] mb-4">
                    <div className="text-left">
                      <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none">
                        UPI Address
                      </p>
                      <p className="text-[11px] font-black text-slate-805 italic mt-1">
                        {upiId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(upiId);
                        toast.success("UPI ID copied to clipboard!");
                      }}
                      className="p-2 bg-white hover:bg-slate-100 rounded-lg text-[#6246EA] active:scale-90 transition-all border border-slate-100"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Upload screenshot proof */}
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Upload Payment Screenshot
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-[#6246EA]/50 rounded-2xl p-6 transition-all bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setGrowthProofScreenshot(file);
                          setGrowthProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {growthProofPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={growthProofPreview}
                          alt="Screenshot proof preview"
                          className="h-28 object-contain rounded-lg border border-slate-105"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGrowthProofScreenshot(null);
                            setGrowthProofPreview(null);
                          }}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 mt-1"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <Upload className="w-8 h-8 text-[#6246EA]/60" />
                        <p className="text-[10px] font-black text-slate-500 uppercase">
                          Click or Drag to Upload Screenshot
                        </p>
                        <p className="text-[8px] text-slate-400 font-bold">
                          JPEG, PNG, or WebP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isVaultSubmitting || !growthProofScreenshot}
                  className="w-full py-4 bg-[#6246EA] hover:bg-[#5037d3] active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isVaultSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                  ) : (
                    "Confirm & Start Growing"
                  )}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
