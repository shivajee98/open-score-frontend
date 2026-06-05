'use client';

import React from 'react';
import { Shield, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TermsComingSoon() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] rounded-full bg-sky-600/5 blur-[60px] pointer-events-none" />

      {/* Floating Sparkles decoration */}
      <div className="absolute top-1/3 left-10 animate-bounce duration-[4s] opacity-40">
        <Sparkles size={24} className="text-cyan-500" />
      </div>
      <div className="absolute bottom-1/3 right-10 animate-bounce duration-[5s] opacity-30">
        <Sparkles size={18} className="text-sky-400" />
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center text-center z-10">
        {/* Animated Icon container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-600/20 to-sky-600/20 blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 scale-110" />
          <div className="relative w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-xl">
            <Shield size={38} className="text-cyan-600 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* Subtitle / Category */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 mb-4 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600">
            Terms & Privacy
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black uppercase tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          Coming Soon
        </h1>

        {/* Description */}
        <p className="text-[12px] font-medium leading-relaxed text-slate-500 px-6 mb-10 max-w-[320px]">
          Read our privacy guidelines, terms of use, and security disclosures to understand how your data is protected.
        </p>

        {/* Return CTA */}
        <Link href="/customer/profile" className="w-full">
          <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 active:scale-[0.98] hover:shadow-cyan-600/35 transition-all flex items-center justify-center gap-2 border border-cyan-500/30 cursor-pointer">
            <ArrowLeft size={14} strokeWidth={2.5} />
            Back to Profile
          </button>
        </Link>
      </div>
    </div>
  );
}
