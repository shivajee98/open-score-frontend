import React from 'react';
import { ChevronRight, ShieldCheck, RefreshCcw, HandCoins, Tags } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceSection() {
  const categories = [
    { id: 1, name: 'Mobiles', offer: 'Upto 10% Off', imageSrc: '/assets/mobiles_img.png' },
    { id: 2, name: 'Electronics', offer: 'Upto 12% Off', imageSrc: '/assets/electronics_img.png' },
    { id: 3, name: 'Fashion', offer: 'Upto 15% Off', imageSrc: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=120&q=80' },
    { id: 4, name: 'Home & Kitchen', offer: 'Upto 10% Off', imageSrc: 'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=120&q=80' },
    { id: 5, name: 'Beauty', offer: 'Upto 8% Off', imageSrc: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&q=80' },
  ];

  const features = [
    { id: 1, title: 'Top Brands', desc: 'Best Deals', icon: <Tags size={14} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { id: 2, title: 'Secure Shopping', desc: '100% Safe', icon: <ShieldCheck size={14} className="text-violet-500" />, bg: 'bg-violet-50' },
    { id: 3, title: 'Easy Returns', desc: 'Hassle Free', icon: <RefreshCcw size={14} className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { id: 4, title: 'Extra Cashback', desc: 'On Every Order', icon: <HandCoins size={14} className="text-amber-500" />, bg: 'bg-amber-50' },
  ];

  return (
    <section className="px-2 py-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">Marketplace</h2>
          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 origin-left">Coming Soon</span>
        </div>
        <Link href="/customer/marketplace" className="text-[10px] font-black text-violet-600 tracking-wider flex items-center hover:text-violet-700 transition-colors bg-violet-50 px-2.5 py-1 rounded-full">
          VIEW ALL <ChevronRight size={14} strokeWidth={3} />
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-1 pb-2">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-[14px] p-1 flex flex-col items-center">
            <div className="w-11 h-11 rounded-[10px] overflow-hidden mb-1 bg-slate-50 flex items-center justify-center border border-slate-100/50 shrink-0">
              <img src={cat.imageSrc} alt={cat.name} className="w-full h-full object-cover mix-blend-multiply"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <h4 className="text-[8.5px] font-black text-slate-700 text-center leading-tight mb-1 tracking-tighter whitespace-nowrap">{cat.name}</h4>
            <p className="text-[7.5px] font-bold text-violet-600 tracking-tight text-center bg-violet-50 px-1 py-0.5 rounded whitespace-nowrap">{cat.offer}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 px-3 py-1 w-full rounded-xl bg-slate-50/50 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
        {features.map((feat) => (
          <div key={feat.id} className="flex flex-col items-center gap-1.5 text-center min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
              {feat.icon}
            </div>
            <div className="flex flex-col min-w-0 items-center w-full">
              <h5 className="text-[8px] font-black text-slate-800 leading-tight mb-0.5 w-full truncate">{feat.title}</h5>
              <p className="text-[7px] font-bold text-slate-500 leading-none w-full truncate">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
