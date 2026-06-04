import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BankOffersGridProps {
  isBankVerified?: boolean;
}

export default function BankOffersGrid({ isBankVerified = false }: BankOffersGridProps) {
  return (
    <section className={`px-2 py-2 grid ${isBankVerified ? 'grid-cols-1' : 'grid-cols-2'} gap-3 pb-6`}>

      {/* Conditional Setup Bank / Transfer Cashback Card */}
      {!isBankVerified ? (
        <div className="w-full h-[100px] rounded-lg p-3.5 relative overflow-hidden bg-white shadow-[0_10px_30px_rgba(138,43,226,0.15)] flex flex-col justify-between"
             style={{ backgroundImage: 'url("/bank_bg_1.png")', backgroundSize: '120%', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }}>
          <div className="relative z-10 flex flex-col gap-0.5 -ml-2">
            <h3 className="text-[10px] font-black text-white tracking-widest uppercase leading-tight">
              SET UP BANK ACCOUNT
            </h3>
            <p className="text-[8px] text-white/90 leading-snug uppercase tracking-wider mt-0.5">
              Get claim<br />
              verify bank account
            </p>
          </div>

          <Link href="/customer/profile/?editBank=true" className="inline-flex items-center gap-1 bg-white text-violet-600 text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full hover:bg-slate-50 transition-colors shadow-md relative z-10 w-fit -ml-2">
            Set Up Now <ChevronRight size={10} strokeWidth={3} />
          </Link>
        </div>
      ) : (
        <div className="w-full h-[100px] rounded-xl p-4 relative overflow-hidden shadow-sm border border-indigo-50 flex flex-col justify-between bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="absolute right-0 bottom-0 w-32 h-24 opacity-90" style={{ backgroundImage: 'url("/cashback_cards_bg.png")', backgroundSize: 'contain', backgroundPosition: 'bottom right', backgroundRepeat: 'no-repeat' }}></div>
          <div className="relative z-10 flex flex-col gap-0.5">
            <p className="text-[8px] font-black text-violet-600 uppercase tracking-widest leading-none">TRANSFER & GET DAILY</p>
            <h3 className="text-lg font-black text-indigo-900 leading-tight">Cashback</h3>
            <p className="text-[9px] font-bold text-slate-600">Upto <span className="text-violet-600">100</span> Cashback Everyday</p>
          </div>
          <Link href="/customer/transfer" className="inline-flex items-center gap-1 bg-violet-600 text-white text-[9px] font-black uppercase tracking-wider py-1.5 px-4 rounded-full hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/30 w-fit relative z-10 mt-1">
            TRANSFER NOW <ChevronRight size={12} strokeWidth={3} />
          </Link>
        </div>
      )}

      {/* Credit at 0% Interest Card */}
      {!isBankVerified && (
        <div className="w-full h-[100px] rounded-lg p-3.5 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-blue-100 flex flex-col justify-between"
             style={{ backgroundImage: 'url("/wallet_bg_1.png")', backgroundSize: '120%', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }}>

          <div className="relative z-10 flex flex-col gap-0.5 -ml-2">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight">Credit at 0% Interest</h3>
          </div>

          <div className="relative z-10 flex flex-col gap-1.5 mt-auto">
            <div className='-ml-2'>
              <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest leading-none">LIMIT UP TO</p>
              <h2 className="text-[14px] font-black text-violet-700 tracking-tight leading-none mt-0.5">5,00,000</h2>
            </div>
            <Link href="/customer/loan" className="inline-flex items-center gap-1 bg-violet-600 text-white text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/30 w-fit -ml-2">
              Apply <ChevronRight size={10} strokeWidth={3} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
