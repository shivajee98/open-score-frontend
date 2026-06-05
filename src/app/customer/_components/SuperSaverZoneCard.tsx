import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuperSaverZoneCard() {
  return (
    <section className="px-2 mb-6">
      <div className="relative rounded-[24px] p-4 flex items-center justify-between overflow-hidden shadow-[0_10px_30px_rgba(138,43,226,0.15)] border border-violet-100 bg-linear-to-r from-violet-100 to-indigo-50 ">

        <div className="relative z-10 w-[75%]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="text-[11px] font-black text-violet-900 tracking-tight uppercase">Super Saver Zone</h3>
            <span className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest animate-pulse shadow-sm shadow-rose-500/50">HOT</span>
          </div>
          <p className="text-[8px] font-bold text-violet-700/80 uppercase tracking-widest mb-3 leading-tight">Exclusive Offers & Extra Cashback</p>

          <Link href="/customer/rewards" className="inline-flex items-center gap-1 text-violet-700 bg-white hover:bg-slate-50 text-[8px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full transition-colors border border-violet-100 shadow-sm w-fit">
            Explore Offers <ArrowRight size={10} strokeWidth={3} />
          </Link>
        </div>

        {/* Ticket Graphic Placeholder */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-20 h-20 flex items-center justify-center drop-shadow-xl -rotate-12 translate-x-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
             <defs>
               <linearGradient id="ticketGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8A2BE2" />
                  <stop offset="100%" stopColor="#6366F1" />
               </linearGradient>
             </defs>
             <path d="M21 10V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10Z" fill="url(#ticketGrad)"/>
             <circle cx="9.5" cy="9.5" r="1.5" fill="white" />
             <circle cx="14.5" cy="14.5" r="1.5" fill="white" />
             <path d="M14.5 9.5L9.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

      </div>
    </section>
  );
}
