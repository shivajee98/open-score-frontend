import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PromoBannerCard() {
  return (
    <section className="px-2 py-1.5">
      <div className="relative rounded-[12px] overflow-hidden p-2.5 flex flex-col justify-center min-h-[70px] shadow-sm shadow-violet-100/50 border border-violet-50 bg-linear-to-r from-indigo-50 to-purple-100">

        {/* Cashback Pill */}
        <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md rounded-lg p-0.5 px-1.5 flex flex-col items-center shadow-sm border border-white z-20">
          <div className="text-violet-700 font-black text-[9px] flex items-center gap-0.5">
            ₹ 100
          </div>
          <div className="text-[6px] font-black text-slate-600 uppercase tracking-widest mt-[1px] flex items-center gap-0.5">
            Cashback <CheckCircle2 size={7} className="text-emerald-500" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-2/3">
          <span className="text-[7.5px] font-black text-violet-600 uppercase tracking-widest mb-0.5 block">Transfer & Get Daily</span>
          <h2 className="text-[13px] font-black text-violet-800 tracking-tight leading-none mb-0.5">
            Cashback
          </h2>
          <p className="text-[7px] font-bold text-slate-600 mb-1.5">Upto <span className="text-violet-700">₹100</span> Cashback Everyday</p>

          <Link href="/customer/transfer" className="inline-flex items-center gap-1 bg-violet-600 text-white text-[8px] font-black uppercase tracking-wider py-1.5 px-3.5 mt-1 rounded-full hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/40 w-fit active:scale-95">
            Transfer Now
            <ChevronRight size={10} strokeWidth={3} />
          </Link>
        </div>

        {/* 3D Phone & Wallet Placeholder */}
        <div className="absolute right-0 bottom-0 w-16 h-16 flex items-end justify-center drop-shadow-sm z-0">
           <div className="relative w-full h-full">
             <div className="absolute bottom-1 right-1.5 w-8 h-12 bg-violet-600 rounded-md border-[1px] border-violet-400 shadow-inner rotate-6"></div>
             <div className="absolute bottom-1.5 right-4 w-10 h-6 bg-blue-500 rounded-sm shadow-md border border-blue-400 -rotate-6 z-10 flex items-center justify-center">
                 <div className="w-5 h-1.5 bg-blue-400 rounded-full"></div>
             </div>
             <div className="absolute bottom-1 right-1 flex gap-0.5 z-20">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-sm"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-sm -ml-1"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-sm -ml-1"></div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
