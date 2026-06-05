import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Headset, X, ArrowRight, Wallet, Landmark, Banknote, MapPin, Send, Zap, QrCode } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: any;
  liveCount: number;
}

const SEARCH_LINKS = [
  { name: 'Transfer Money', path: '/customer/transfer', icon: Send, color: 'text-blue-500', bg: 'bg-blue-100' },
  { name: 'Add Money to Wallet', path: '/customer/add-money', icon: Wallet, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { name: 'Vault & Growth', path: '/customer/payout', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-100' },
  { name: 'Loans & Credit', path: '/customer/loan', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { name: 'Merchant Locator', path: '/customer/merchant-locator', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-100' },
  { name: 'Rewards & Cashback', path: '/customer/rewards', icon: Zap, color: 'text-violet-500', bg: 'bg-violet-100' },
];

export default function DashboardHeader({ user, liveCount }: DashboardHeaderProps) {
  const name = (user?.name || user?.email?.split('@')[0] || 'FAIZ').split(' ')[0];
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const filteredLinks = SEARCH_LINKS.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <header className="flex items-center justify-between px-2 pb-2 bg-white sticky top-0 z-50 pt-[max(env(safe-area-inset-top),10px)]">

      {/* Left: User Profile */}
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 rounded-full bg-linear-to-br from-[#8A2BE2] to-[#D946EF] text-white flex items-center justify-center font-normal text-base shadow-[0_4px_15px_rgba(138,43,226,0.3)] shrink-0"
          aria-label="User Profile"
        >
          {name.charAt(0).toUpperCase()}
        </button>
        <div className="flex flex-col justify-center">
          <p className="text-[9px] text-slate-500 font-medium tracking-wide mb-0.5">Welcome back,</p>
          <h2 className="font-black text-[13px] flex items-center gap-1.5 text-slate-900 uppercase tracking-tight leading-none">
            {name} <span className="text-[12px]">👋</span>
          </h2>
        </div>
      </div>

      {/* Middle: Live Count Pill */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf4] rounded-full border border-[#dcfce7] ml-2 mr-auto shadow-sm shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-[#10b981] shrink-0"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        <span className="font-bold text-[8px] text-[#10b981] tracking-widest whitespace-nowrap">{liveCount?.toLocaleString()} LIVE USERS</span>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => setIsSearchOpen(true)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition-colors">
          <Search size={16} strokeWidth={2} />
        </button>
        <Link href="/customer/notifications">
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] relative hover:bg-slate-50 transition-colors">
            <Bell size={16} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-[#ef4444] border-2 border-white rounded-full"></span>
          </button>
        </Link>
        <Link href="/customer/support">
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition-colors">
            <Headset size={16} strokeWidth={2} />
          </button>
        </Link>
      </div>

    </header>

    {/* Search Modal Overlay */}
    {isSearchOpen && (
      <div className="fixed inset-0 z-[100] flex flex-col bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSearchOpen(false)}>
        <div className="w-full bg-white rounded-b-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 pt-[max(env(safe-area-inset-top),16px)]" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search features, payments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shrink-0">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredLinks.length > 0 ? (
              <div className="flex flex-col gap-1">
                <span className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Features & Quick Links</span>
                {filteredLinks.map((link, i) => (
                  <Link href={link.path} key={i} onClick={() => setIsSearchOpen(false)}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${link.bg} ${link.color} flex items-center justify-center shadow-sm`}>
                          <link.icon size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{link.name}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                  <Search size={24} />
                </div>
                <p className="text-sm font-bold text-slate-500">No results found for "{searchQuery}"</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Try another keyword</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
