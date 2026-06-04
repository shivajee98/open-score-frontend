import React from 'react';
import { Search, Bell, Headset } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  liveCount: number;
}

export default function DashboardHeader({ user, liveCount }: DashboardHeaderProps) {
  const name = (user?.name || user?.email?.split('@')[0] || 'FAIZ').split(' ')[0];

  return (
    <header className="flex items-center justify-between px-2 py-4 bg-white sticky top-0 z-50">

      {/* Left: User Profile */}
      <div className="flex items-center gap-3">
        <button
          className="w-12 h-12 rounded-full bg-linear-to-br from-[#8A2BE2] to-[#D946EF] text-white flex items-center justify-center font-normal text-xl shadow-[0_4px_15px_rgba(138,43,226,0.3)] shrink-0"
          aria-label="User Profile"
        >
          {name.charAt(0).toUpperCase()}
        </button>
        <div className="flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Welcome back,</p>
          <h2 className="font-black text-[15px] flex items-center gap-1.5 text-slate-900 uppercase tracking-tight leading-none">
            {name} <span className="text-[14px]">👋</span>
            <span className="bg-[#8A2BE2] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] ml-0.5 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          </h2>
        </div>
      </div>

      {/* Middle: Live Count Pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] rounded-full border border-[#dcfce7] ml-2 mr-auto shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#10b981]"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        <span className="font-bold text-[9px] text-[#10b981] tracking-widest">{liveCount?.toLocaleString()} LIVE</span>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition-colors">
          <Search size={16} strokeWidth={2} />
        </button>
        <button className="w-9 h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] relative hover:bg-slate-50 transition-colors">
          <Bell size={16} strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] border-2 border-white rounded-full"></span>
        </button>
        <button className="w-9 h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition-colors">
          <Headset size={16} strokeWidth={2} />
        </button>
      </div>

    </header>
  );
}
