import React from 'react';
import { Info, ArrowRight, Shield, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroDashboardProps {
  walletBalance: string | number;
  vaultBalance: string | number;
}

export default function HeroDashboard({ walletBalance, vaultBalance }: HeroDashboardProps) {
  return (
    <section className="px-5 py-2 grid grid-cols-2 gap-3 ">

      {/* Left Card: Elite Credit Value */}
      <div className="w-full h-[125px] rounded-[16px] p-2 relative overflow-hidden shadow-[0_10px_30px_rgba(138,43,226,0.3)] flex flex-col"
           style={{ backgroundImage: 'url("/shield_bg.png")', backgroundSize: 'contain', backgroundPosition: 'right' }}>
        <div className="relative z-10 flex flex-col h-full">

          <h4 className="flex items-center gap-1 text-[6.5px] font-black text-white/90 uppercase tracking-widest leading-tight">
            ELITE CREDIT
            <Info size={8} className="opacity-80 shrink-0" />
          </h4>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-baseline gap-0.5">
              <h2 className="text-[18px] font-black text-white tracking-tighter leading-none truncate">
                {Number(walletBalance).toLocaleString('en-IN')}
                <span className="text-[9px] text-white/90">.82</span>
              </h2>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex flex-col p-1.5 rounded-lg shadow-inner w-full">
              <span className="text-[5px] font-bold text-white/80 uppercase tracking-widest mb-0.5">TOTAL SPENT</span>
              <span className="text-[9px] font-black text-white tracking-wider">12,833</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card: Vault Card */}
      <div className="w-full h-[125px] rounded-[16px] p-2 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100/60 flex flex-col"
           style={{ backgroundImage: 'url("/locker_bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded bg-violet-50 text-[#8A2BE2] flex items-center justify-center border border-violet-100 shadow-sm shrink-0">
                <Shield size={7} strokeWidth={2.5} />
              </div>
              <span className="text-[6.5px] font-black text-slate-800 uppercase tracking-widest leading-tight">VAULT CARD</span>
          </div>

          <div className="flex flex-col gap-0.5 pb-1 mt-1">
              <button className="text-[5.5px] font-black text-[#8A2BE2] uppercase w-fit bg-violet-50 px-1.5 py-0.5 rounded-sm">
                METAL ASSET
              </button>
              <button className="text-[5.5px] font-black text-slate-400 uppercase w-fit px-1.5 py-0.5 hover:bg-slate-50 rounded-sm transition-colors">
                DIGITAL ASSET
              </button>
          </div>

          <div className="mt-auto">
            <span className="text-[5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 block">ASSET VALUE</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[14px] font-black tracking-tight text-slate-800 leading-none truncate">
                ₹{parseFloat(String(vaultBalance)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
