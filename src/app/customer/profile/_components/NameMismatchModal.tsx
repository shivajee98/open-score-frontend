"use client";

import { AlertTriangle } from "lucide-react";

interface NameMismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  bankAccountHolderName: string;
}

export default function NameMismatchModal({
  isOpen,
  onClose,
  profileName,
  bankAccountHolderName,
}: NameMismatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-4xl p-8 max-w-sm w-full relative z-10 shadow-2xl border-2 border-rose-500 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 text-center mb-2">
          Name Mismatch
        </h3>
        <p className="text-rose-600 text-center font-bold text-sm leading-relaxed mb-8">
          Customer Profile Name and Bank Account Holder Name must be exactly the same.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <p className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-1">
              Mismatch detected
            </p>
            <p className="text-xs font-bold text-rose-700">
              Profile: <span className="underline">{profileName}</span>
            </p>
            <p className="text-xs font-bold text-rose-700">
              Bank Record: <span className="underline">{bankAccountHolderName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Close & Fix
          </button>
        </div>
      </div>
    </div>
  );
}
