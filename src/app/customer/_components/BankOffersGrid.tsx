import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BankOffersGrid() {
  return (
    <section className="px-5 py-2 grid grid-cols-2 gap-3 pb-6">

      {/* Setup Bank Account Card */}
      <div className="w-full h-[190px] rounded-[24px] p-4 relative overflow-hidden bg-white shadow-[0_10px_30px_rgba(138,43,226,0.3)] flex flex-col"
           style={{ backgroundImage: 'url("/bank_bg_1.png")', backgroundSize: 'cover', backgroundPosition: 'calc(100% + 30px) center' }}>
        <div className="flex gap-1.5 items-center mb-2 relative z-10">
          <h3 className="text-[8px] font-black text-white tracking-widest uppercase leading-tight">
            SET UP BANK ACCOUNT
          </h3>
        </div>

        <p className="text-[9px] font-bold text-white/90 relative z-10 leading-snug uppercase tracking-wider mt-1">
          Send & Receive Money<br />
          Directly from Bank
        </p>

        <Link href="/customer/add-money" className="mt-auto inline-flex items-center gap-1 bg-white text-violet-600 text-[8px] font-black uppercase tracking-wider py-1.5 px-3 rounded-full hover:bg-slate-50 transition-colors shadow-lg relative z-10 w-fit">
          Set Up Now <ChevronRight size={12} strokeWidth={3} />
        </Link>
      </div>

      {/* Credit at 0% Interest Card */}
      <div className="w-full h-[190px] rounded-[24px] p-4 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-blue-100 flex flex-col"
           style={{ backgroundImage: 'url("/wallet_bg_1.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>

        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest relative z-10">First User Advantage</p>
        <h3 className="text-[11px] font-black text-slate-800 mt-1 mb-2 uppercase tracking-tight relative z-10 leading-tight">Credit at 0% Interest</h3>

        <div className="mt-auto mb-3 relative z-10">
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">LIMIT UP TO</p>
          <h2 className="text-[18px] font-black text-violet-700 tracking-tight leading-none">₹5,00,000</h2>
        </div>

        <Link href="/customer/loan" className="inline-flex items-center gap-1 bg-violet-600 text-white text-[8px] font-black uppercase tracking-wider py-1.5 px-3 rounded-full hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/30 relative z-10 w-fit">
          Apply Now <ChevronRight size={12} strokeWidth={3} />
        </Link>
      </div>
    </section>
  );
}
