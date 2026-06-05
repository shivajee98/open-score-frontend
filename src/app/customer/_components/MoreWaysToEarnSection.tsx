import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MoreWaysToEarnSection() {
  const ways = [
    { id: 1, title: 'Refer & Earn', sub: 'Earn upto', value: '500', image: '/mwe/mwe-1.png', href: '/customer/referral' },
    { id: 2, title: 'Pay Bills', sub: 'Get upto', value: '50', image: '/mwe/mwe-2.png', href: '#', comingSoon: true },
    { id: 3, title: 'Recharge', sub: 'Get upto', value: '30', image: '/mwe/mwe-3.png', href: '#', comingSoon: true },
    { id: 4, title: 'Scan & Pay', sub: 'Get upto', value: '20', image: '/mwe/mwe-4.png', href: '/customer/pay/?scan=true' },
  ];

  return (
    <section className="px-2 py-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-black text-slate-800 tracking-tight">More Ways to Earn</h2>
          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 origin-left">Coming Soon</span>
        </div>
        <Link href="#" className="text-[9px] font-black text-violet-600 tracking-wider flex items-center hover:text-violet-700 transition-colors bg-violet-50 px-2.5 py-1 rounded-full">
          View All <ChevronRight size={10} strokeWidth={3} className="ml-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-1.5 pb-3">
        {ways.map(way => (
          <Link 
            key={way.id} 
            href={way.href} 
            onClick={way.comingSoon ? (e) => e.preventDefault() : undefined}
            className={`bg-white border border-slate-100/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)] rounded-[12px] p-1.5 flex flex-col items-center justify-center min-h-[72px] group transition-all relative overflow-hidden ${
              way.comingSoon ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {way.comingSoon && (
              <div className="absolute top-1.5 right-1.5 text-[6px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-1 py-0.5 rounded uppercase leading-none z-20">Soon</div>
            )}
            <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10 mb-1">
              <img src={way.image} alt={way.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-center justify-center w-full z-10 mt-0.5">
              <h4 className="text-[9px] font-black text-slate-700 tracking-tight leading-tight whitespace-nowrap mb-0.5">{way.title}</h4>
              <p className="text-[7px] font-bold text-slate-400 leading-none whitespace-nowrap">{way.sub} <span className="text-[9px] font-black text-violet-600">{way.value}</span></p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
