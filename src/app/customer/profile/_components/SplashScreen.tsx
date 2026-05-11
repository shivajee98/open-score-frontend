"use client";

import { X, ArrowLeft, Rocket, TrendingUp, Crown, Check } from "lucide-react";
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
  const [selectedPlan, setSelectedPlan] = useState<"A" | "B" | "C">("A");

  const PLAN_DETAILS = {
    A: {
      title: "PLAN A",
      subtitle: "SUPER DRIVE",
      image: "/vendor/a-content.jpeg",
      borderColor: "#0072FF",
      glowColor: "rgba(0, 114, 255, 0.4)",
      icon: Rocket,
      buttonGradient: "linear-gradient(to bottom, #00C6FF, #0072FF)",
      iconColor: "#0072FF",
      guideImage: "/vendor/blue.png",
    },
    B: {
      title: "PLAN B",
      subtitle: "POWER MOVE",
      image: "/vendor/b-content.jpeg",
      borderColor: "#38EF7D",
      glowColor: "rgba(56, 239, 125, 0.4)",
      icon: TrendingUp,
      buttonGradient: "linear-gradient(to bottom, #77B01A, #3D5B0E)",
      iconColor: "#3D5B0E",
      guideImage: "/vendor/green.png",
    },
    C: {
      title: "PLAN C",
      subtitle: "SMART MOVE",
      image: "/vendor/c-content.jpeg",
      borderColor: "#FAD961",
      glowColor: "rgba(250, 217, 97, 0.4)",
      icon: Crown,
      buttonGradient: "linear-gradient(to bottom, #FAD961, #F76B1C)",
      iconColor: "#F76B1C",
      guideImage: "/vendor/golden.png",
    },
  };

  if (!isVisible) return null;

  if (showGuide) {
    return (
      <div className="fixed inset-0 z-1000 bg-[#000814] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
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
        <div className="relative w-full shrink-0 mt-4">
          <img
            src={PLAN_DETAILS[selectedPlan].guideImage}
            alt="Guide"
            className="w-full h-auto block"
          />
        </div>

        <div className="w-full flex flex-col gap-6 px-6 py-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div
              className="h-px flex-1 opacity-50"
              style={{ background: `linear-gradient(to right, transparent, ${PLAN_DETAILS[selectedPlan].borderColor})` }}
            ></div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/90 whitespace-nowrap">
              Select Your Plan
            </h3>
            <div
              className="h-px flex-1 opacity-50"
              style={{ background: `linear-gradient(to left, transparent, ${PLAN_DETAILS[selectedPlan].borderColor})` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-3 px-2">
            {(["A", "B", "C"] as const).map((planId) => {
              const plan = PLAN_DETAILS[planId];
              const isActive = selectedPlan === planId;
              const Icon = plan.icon;

              // Specific styling for Plan C (Gold/Purple theme in image)
              const isPlanC = planId === "C";
              const activeBorderColor = isPlanC ? "#D4AF37" : plan.borderColor;
              const activeTopBg = isPlanC ? "bg-[#2D1B69]" : "bg-white/10";

              return (
                <button
                  key={planId}
                  onClick={() => setSelectedPlan(planId)}
                  className={`relative flex flex-col rounded-xl border-2 transition-all duration-300 ${
                    isActive
                      ? "scale-105 z-10"
                      : "border-white/10 bg-[#0B1E3B] opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isActive ? activeBorderColor : "rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive ? `0 0 20px ${isPlanC ? "rgba(212, 175, 55, 0.4)" : plan.glowColor}` : "none",
                  }}
                >
                  {/* Top Section: Plan Name */}
                  <div className={`w-full py-1 px-2 text-center border-b border-white/10 rounded-t-[9px] ${isActive ? activeTopBg : "bg-white/5"}`}>
                    <span className="text-sm font-black uppercase text-white tracking-wider">
                      {plan.title}
                    </span>
                  </div>

                  {/* Bottom Section: Icon & Subtitle */}
                  <div className="w-full p-2 flex items-center gap-2 bg-[#041226]/80 rounded-b-[9px]">
                    <div className="relative">
                      {isActive && isPlanC && (
                        <div className="absolute inset-0 bg-purple-600/30 blur-md rounded-full" />
                      )}
                      <Icon
                        size={16}
                        className={isActive ? "text-white" : "text-white/40"}
                        style={{ filter: isActive && isPlanC ? "drop-shadow(0 0 5px #8E2DE2)" : "none" }}
                      />
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-tight leading-tight text-left ${
                        isActive ? "text-white" : "text-white/40"
                      }`}
                    >
                        <span className="block">{plan.subtitle}</span>
                    </span>
                  </div>

                  {/* Active Badge (Top Right) - Positioned Outside */}
                  {isActive && (
                    <div
                      className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-2xl z-50 border-2 border-[#041226]"
                      style={{ background: "linear-gradient(135deg, #8E2DE2, #4A00E0)" }}
                    >
                      <Check size={14} strokeWidth={4} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 w-full h-full">
            <img
              src={PLAN_DETAILS[selectedPlan].image}
              alt={`${selectedPlan} Content`}
              className="w-full h-auto block transition-all duration-500"
            />
          </div>

          <button
            className="w-full py-3 rounded-full transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_2px_2px_rgba(255,255,255,0.3)] group"
            style={{
              background: PLAN_DETAILS[selectedPlan].buttonGradient,
            }}
          >
            <div className="relative flex items-center justify-center px-6 min-h-[44px]">
              <div className="text-center">
                <p className="text-lg font-black uppercase text-white leading-none">
                  {PLAN_DETAILS[selectedPlan].title} SELECT KARE
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/90 mt-1">
                  AUR CONTEST ME JOIN KARE
                </p>
              </div>
              <div className="absolute right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <div
                  className="w-2.5 h-2.5 border-t-[3px] border-r-[3px] rotate-45 ml-[-2px]"
                  style={{ borderColor: PLAN_DETAILS[selectedPlan].iconColor }}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-1000 bg-[#000814] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-1010 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/80 transition-all active:scale-90"
      >
        <X size={24} className="text-white" />
      </button>
      <div className="relative w-full shrink-0 mt-6">
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
