"use client";

import { X, Target, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SplashScreenProps {
  onClose: () => void;
}

export default function SplashScreen({ onClose }: SplashScreenProps) {
  const [showParticipationGuide, setShowParticipationGuide] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  if (showPlanSelection) {
    return (
      <div className="fixed inset-0 z-120 bg-[#000814] overflow-y-auto custom-scrollbar">
        <button
          onClick={() => setShowPlanSelection(false)}
          className="fixed top-4 right-4 z-130 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
        >
          <X size={24} className="text-white" />
        </button>

        <div className="mt-8">
            <img src={"/contest/33.png"} alt=""
            className="w-full h-auto object-contain object-top"
            />
          </div>

        <div className="flex flex-col items-center w-full px-4 py-8 gap-6">

          {['a', 'b', 'c', 'd', 'e', 'f'].map((p) => (
            <div key={p} className="w-full relative rounded-3xl overflow-hidden shadow-2xl transition-all active:scale-[0.98] border border-white/10 group">
              <img
                src={`/contest/${p}-plan.jpeg`}
                alt={`Plan ${p}`}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
        `}</style>
      </div>
    );
  }

  if (showParticipationGuide) {
    return (
      <div className="fixed inset-0 z-100 bg-[#041226] overflow-y-auto">
        <button
          onClick={() => setShowParticipationGuide(false)}
          className="fixed top-6 right-6 z-110 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
        >
          <X size={24} className="text-white" />
        </button>

        <div className="flex flex-col items-center w-full min-h-screen">
          <div className="relative w-full">
            <img
              src="/contest/22.png"
              alt="How to participate"
              className="w-full h-auto object-contain object-top"
            />
          </div>

          {/* Action Button from Image */}
          <div className="w-full px-6 mt-[10px] relative z-10">
            <button
              onClick={() => {
                setShowParticipationGuide(false);
                setShowPlanSelection(true);
              }}
              className="w-full relative group overflow-hidden rounded-full p-[2px] transition-all active:scale-95 shadow-[0_10px_40px_rgba(34,197,94,0.3)]"
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-600 via-green-500 to-emerald-600"></div>
              <div className="relative bg-linear-to-r from-emerald-700 to-green-600 rounded-full py-1.5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner">
                     <Target className="text-emerald-600" size={22} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-white font-black text-base leading-tight uppercase tracking-tight">Abhi Plan Select Kare</span>
                    <span className="text-emerald-100 text-[9px] font-bold uppercase tracking-widest">Aur Contest Join Kare!</span>
                  </div>
                </div>
                <ChevronRight className="text-white opacity-50 group-hover:opacity-100 transition-opacity" size={22} />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-slate-900 flex justify-center overflow-y-auto">
      <div className="w-full max-w-lg bg-[#041226] text-white flex flex-col font-sans pb-24 relative overflow-hidden shadow-2xl">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all active:scale-90"
      >
        <X size={20} className="text-white" />
      </button>

     <div>
        <Image src={"/contest/11.1.png"} alt ="" width={800} height={600}  />
     </div>

 <div className="mt-8 flex flex-col items-center px-6 text-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
           Ultimate Reward
        </span>
        <div className="relative">
            <h2
              className="text-3xl font-black uppercase tracking-tighter"
              style={{
                background: 'linear-gradient(to bottom, #FFDF73, #D4AF37, #997A15)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0px 4px 10px rgba(212,175,55,0.2))'
              }}
            >
              WIN UP TO 15 LAKHS
            </h2>
            <div className="h-0.5 w-12 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1 opacity-50"></div>
        </div>
     </div>

     <div className="w-full h-auto flex flex-col gap-4 px-6 mt-8">
        <button
          onClick={() => setShowParticipationGuide(true)}
          className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95"
          style={{ background: 'linear-gradient(to right, #FAD961, #F76B1C)' }}
        >
          How to participate
        </button>
        <button
          onClick={() => setShowPlanSelection(true)}
          className="w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(21,67,140,0.3)] transition-all active:scale-95 border border-[#15438C]"
          style={{ background: 'linear-gradient(to bottom, #15438C, #0B1E3B)' }}
        >
           Join Contest & win
        </button>
     </div>
      </div>
    </div>
  );
}
