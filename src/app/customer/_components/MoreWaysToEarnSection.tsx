import React from 'react';
import { ChevronRight, Gift, FileText, Zap, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function MoreWaysToEarnSection() {
  const ways = [
    { id: 1, title: 'Refer & Earn', sub: 'Earn upto', value: '₹500', icon: <Gift size={14} className="text-violet-600" />, href: '/customer/referral', bg: 'bg-violet-50' },
    { id: 2, title: 'Pay Bills', sub: 'Get upto', value: '₹50', icon: <FileText size={14} className="text-blue-500" />, href: '/customer/pay', bg: 'bg-blue-50' },
    { id: 3, title: 'Recharge', sub: 'Get upto', value: '₹30', icon: <Zap size={14} className="text-emerald-500" />, href: '/customer/pay', bg: 'bg-emerald-50' },
    { id: 4, title: 'Scan & Pay', sub: 'Get upto', value: '₹20', icon: <QrCode size={14} className="text-fuchsia-500" />, href: '/customer/qr-payment', bg: 'bg-fuchsia-50' },
  ];

  return (
    <section className="px-5 py-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[12px] font-black text-slate-800 tracking-tight uppercase">More Ways to Earn</h2>
        <Link href="#" className="text-[9px] font-black text-violet-600 tracking-wider flex items-center hover:text-violet-700 transition-colors bg-violet-50 px-2 py-1 rounded-full">
          VIEW ALL <ChevronRight size={12} strokeWidth={3} />
        </Link>
      </div>
      
      <div className="grid grid-cols-4 gap-1.5 pb-3">
        {ways.map(way => (
          <Link key={way.id} href={way.href} className="bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-[16px] p-2 flex flex-col justify-between h-[90px] group transition-transform active:scale-95">
            <div className="flex flex-col gap-0.5">
              <h4 className="text-[7.5px] font-black text-slate-700 tracking-tight leading-none truncate">{way.title}</h4>
              <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">{way.sub}</p>
              <h3 className="text-[10px] font-black text-violet-700 tracking-tight leading-none truncate mt-0.5">{way.value}</h3>
            </div>
            <div className={`self-end ${way.bg} p-1 rounded-md group-hover:scale-110 transition-transform shadow-inner border border-white mt-auto`}>
              {way.icon}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
