import { ArrowRight, ChevronRight, Info, Shield } from 'lucide-react';
import Link from 'next/link';

interface HeroDashboardProps {
  walletBalance: string | number;
  vaultBalance: string | number;
  isVaultEnabled?: boolean;
  onVaultClick?: () => void;
}

export default function HeroDashboard({ walletBalance, vaultBalance, isVaultEnabled = false, onVaultClick }: HeroDashboardProps) {
  return (
    <section className={`px-2 grid ${isVaultEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>

      {/* Left Card: Elite Credit Value */}
      <div className="w-full h-[125px] rounded-[16px] p-2 relative overflow-hidden shadow-[0_10px_30px_rgba(138,43,226,0.3)] flex flex-col"
           style={{ backgroundImage: 'url("/shield_bg.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="relative z-10 flex flex-col h-full">

          <h4 className="flex items-center gap-1 text-[10px] font-black text-white/90 uppercase tracking-widest leading-tight">
            ELITE VALUE
            <Info size={8} className="opacity-80 shrink-0" />
          </h4>

          <div className="flex flex-col items-baseline gap-1 mt-4">
            <div className="flex items-baseline flex-col gap-0.5">
              <h2 className="text-[24px] font-bold text-white tracking-tighter leading-none truncate">
                {Number(walletBalance).toLocaleString('en-IN')}
              </h2>
              <p className="text-[9px] font-semibold text-white/80 uppercase tracking-tighter">
                Total Value
              </p>
            </div>
          </div>

          <Link href="/customer/add-money" className="inline-flex items-center gap-1 bg-white text-violet-600 text-[8px] font-black uppercase tracking-wider py-0.5 px-1 rounded-full hover:bg-slate-50 transition-colors shadow-md relative z-10 w-fit mt-auto">
            View Details <ArrowRight size={10} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* Right Card: Vault Card Preview */}
      {isVaultEnabled && (
        <div 
          className="w-full h-[125px] rounded-[16px] p-2 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100/60 flex flex-col cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
          style={{ backgroundImage: 'url("/locker_bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
          onClick={onVaultClick}
        >

          <div className="relative z-10 flex flex-col h-full pointer-events-none">
            <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded bg-violet-50 text-[#8A2BE2] flex items-center justify-center border border-violet-100 shadow-sm shrink-0">
                  <Shield size={7} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-tight">VAULT CARD</span>
            </div>

            <div className="flex flex-col gap-0.5 pb-1 mt-1">
                <div className="text-[5.5px] font-black text-[#8A2BE2] uppercase w-fit bg-violet-50 px-1.5 py-0.5 rounded-sm">
                  METAL ASSET
                </div>
                <div className="text-[5.5px] font-black text-slate-400 uppercase w-fit px-1.5 py-0.5 rounded-sm">
                  DIGITAL ASSET
                </div>
            </div>

            <div className="mt-auto">
              <span className="text-[5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 block">ASSET VALUE</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[14px] font-black tracking-tight text-slate-800 leading-none truncate">
                  {parseFloat(String(vaultBalance)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
