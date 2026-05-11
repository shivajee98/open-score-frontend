"use client";

import { X, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface SplashScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SplashScreen({
  isVisible,
  onClose,
}: SplashScreenProps) {
  const [showGuide, setShowGuide] = useState(false);

  if (!isVisible) return null;

  if (showGuide) {
    return (
      <div className="fixed inset-0 z-1000 bg-[#041226] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
        <button
          onClick={() => setShowGuide(false)}
          className="absolute top-6 left-6 z-1010 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-1010 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
        >
          <X size={24} className="text-white" />
        </button>
        <div className="relative w-full shrink-0">
          <img
            src="/vendor/22.png"
            alt="Guide"
            className="w-full h-auto block"
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <span>Select Your Plan</span>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col">
                <span>Plan A</span>
                <span>Super drive</span>
            </button>
            <button className="flex flex-col">
                <span>Plan B</span>
                <span>Power Move</span>
            </button>
            <button className="flex flex-col">
                <span>Plan C</span>
                <span>Smart Move</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-1000 bg-[#041226] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-1010 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
      >
        <X size={24} className="text-white" />
      </button>
      <div className="relative w-full shrink-0">
        <img
          src="/vendor/11.png"
          alt="Splash"
          className="w-full h-auto block"
        />
      </div>
      <div className="w-full relative z-10 mt-4 pb-4">
        <div className="flex flex-col items-center px-6 text-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
            Ultimate Reward
          </span>
          <div className="relative">
            <h2
              className="text-3xl font-black uppercase tracking-tighter"
              style={{
                background:
                  "linear-gradient(to bottom, #FFDF73, #D4AF37, #997A15)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0px 4px 10px rgba(212,175,55,0.2))",
              }}
            >
              WIN UP TO 20 LAKHS
            </h2>
            <div className="h-0.5 w-12 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1 opacity-50"></div>
          </div>
        </div>

        <div className="w-full h-auto flex flex-col gap-4 px-6 mt-8 mb-8">
          <button
            onClick={() => setShowGuide(true)}
            className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95"
            style={{
              background: "linear-gradient(to right, #FAD961, #F76B1C)",
            }}
          >
            How to participate
          </button>
          <button
            className="w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(21,67,140,0.3)] transition-all active:scale-95 border border-[#15438C]"
            style={{
              background: "linear-gradient(to bottom, #15438C, #0B1E3B)",
            }}
          >
            Join Contest & win
          </button>
        </div>
      </div>
    </div>
  );
}
