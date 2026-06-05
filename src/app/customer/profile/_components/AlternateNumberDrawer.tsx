"use client";

import { X, Smartphone, ShieldCheck, Check } from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface AlternateNumberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  alternatePhone: string;
  setAlternatePhone: (phone: string) => void;
  altOtp: string;
  setAltOtp: (otp: string) => void;
  altOtpSent: boolean;
  setAltOtpSent: (sent: boolean) => void;
  isAltOtpSending: boolean;
  isAltOtpVerifying: boolean;
  handleRequestAltOtp: () => void;
  handleVerifyAltOtp: () => void;
}

export default function AlternateNumberDrawer({
  isOpen,
  onClose,
  user,
  alternatePhone,
  setAlternatePhone,
  altOtp,
  setAltOtp,
  altOtpSent,
  setAltOtpSent,
  isAltOtpSending,
  isAltOtpVerifying,
  handleRequestAltOtp,
  handleVerifyAltOtp,
}: AlternateNumberDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-2xl mx-auto rounded-t-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-500 border-t border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Alternate Number
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Manage your backup contact
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-12 bg-white">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden group">
            {user?.has_verified_alternate_number && (
              <div className="absolute top-0 right-0 p-2 text-emerald-500">
                <ShieldCheck size={16} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                <Smartphone className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <p
                  className="text-[10px] uppercase font-bold text-slate-400 tracking-widest cursor-pointer hover:text-indigo-600 transition-colors select-none"
                  onClick={() => {
                    if (!user?.has_verified_alternate_number) {
                      const randomTestNumber =
                        "999" +
                        Math.floor(1000000 + Math.random() * 9000000);
                      setAlternatePhone(randomTestNumber);
                      toast.success(
                        "Generated test alternate number: " +
                          randomTestNumber,
                      );
                    }
                  }}
                  title="Click to generate a test alternate number"
                >
                  Alternate Mobile Number
                </p>
                <div className="mt-1">
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) =>
                      !user?.has_verified_alternate_number &&
                      setAlternatePhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="Enter alternate number"
                    disabled={
                      user?.has_verified_alternate_number || altOtpSent
                    }
                    className={`text-sm font-bold text-slate-900 bg-transparent border-b-2 ${user?.has_verified_alternate_number ? "border-transparent" : "border-slate-200 focus:border-indigo-500"} focus:outline-none w-full disabled:opacity-70`}
                  />
                </div>
                {!user?.has_verified_alternate_number && !altOtpSent && (
                  <button
                    onClick={handleRequestAltOtp}
                    disabled={
                      isAltOtpSending || alternatePhone.length !== 10
                    }
                    className="mt-3 w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] py-2.5 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10"
                  >
                    {isAltOtpSending ? "Sending OTP..." : "Verify Number"}
                  </button>
                )}
                {altOtpSent && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                      Enter 6-Digit OTP
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={altOtp}
                          onChange={(e) =>
                            setAltOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          placeholder="000 000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black tracking-[0.5em] text-center focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => setAltOtpSent(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-rose-500"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <button
                        onClick={handleVerifyAltOtp}
                        disabled={isAltOtpVerifying || altOtp.length !== 6}
                        className="w-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] py-3 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                      >
                        {isAltOtpVerifying
                          ? "Verifying..."
                          : "Confirm Verification"}
                      </button>
                    </div>
                  </div>
                )}
                {user?.has_verified_alternate_number && (
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Check size={10} /> Verified & Secure
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
