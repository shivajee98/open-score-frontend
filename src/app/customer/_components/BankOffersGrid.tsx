'use client';
import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BankOffersGridProps {
  isBankVerified?: boolean;
}

export default function BankOffersGrid({ isBankVerified = false }: BankOffersGridProps) {
  const carouselRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isBankVerified || !carouselRef.current) return;

    let index = 0;
    const interval = setInterval(() => {
      index++;
      const el = carouselRef.current;
      if (el) {
        el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });

        if (index === 3) {
          setTimeout(() => {
            if (!carouselRef.current) return;
            index = 0;
            carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
          }, 500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isBankVerified]);

  return (
    <section
      ref={carouselRef}
      className={`px-2 py-2 gap-3 pb-2 ${isBankVerified ? 'flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'grid grid-cols-2'}`}
    >

      {isBankVerified ? (
        <>
          {/* Card 1: Cashback Card */}
          <div
            className="min-w-full snap-center rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-end p-4 sm:p-5"
            style={{
              aspectRatio: '700/230',
              backgroundImage: 'url("/card-image/cd-1.1.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </div>

          {/* Card 2: Secure Transactions Card */}
          <div
            className="min-w-full snap-center rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-end p-4 sm:p-5"
            style={{
              aspectRatio: '700/230',
              backgroundImage: 'url("/card-image/cd-2.1.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </div>

          {/* Card 3: Experience Premium Card */}
          <div
            className="min-w-full snap-center rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-end p-4 sm:p-5"
            style={{
              aspectRatio: '700/230',
              backgroundImage: 'url("/card-image/cd-3.1.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </div>

          {/* Clone of Card 1 for seamless loop */}
          <div
            className="min-w-full snap-center rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-end p-4 sm:p-5"
            style={{
              aspectRatio: '700/230',
              backgroundImage: 'url("/card-image/cd-1.1.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </div>
        </>
      ) : (
        <>
          {/* Conditional Setup Bank / Transfer Cashback Card */}
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

          {/* Credit at 0% Interest Card */}
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
        </>
      )}
    </section>
  );
}
