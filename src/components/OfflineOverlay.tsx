"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";

const OfflineOverlay = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Initial check
    if (!window.navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[oklch(0.1_0.02_240/0.85)] backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full mx-6 p-8 rounded-[2rem] bg-[oklch(0.2_0.02_240)] border border-[oklch(0.3_0.02_240)] shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[oklch(0.6_0.15_20)] flex items-center justify-center text-white shadow-[0_0_40px_oklch(0.6_0.15_20/0.3)] animate-pulse">
          <WifiOff size={40} strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[oklch(0.9_0.02_240)] tracking-tight">
            No Internet Connection
          </h2>
          <p className="text-[oklch(0.7_0.02_240)] text-sm leading-relaxed px-4">
            We couldn&apos;t connect to the server. Please check your network settings and try again.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="group flex items-center space-x-2 px-6 py-3 bg-[oklch(0.9_0.02_240)] text-[oklch(0.1_0.02_240)] rounded-full font-semibold hover:bg-[oklch(0.95_0.02_240)] transition-all duration-300 active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};

export default OfflineOverlay;
