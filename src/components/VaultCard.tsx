'use client';

import React, { useState } from 'react';
import { Lock, Eye, CheckCircle2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface VaultRate {
    id: number | string;
    tenure_days: number | string;
    interest_rate: string | number;
}

interface VaultDeposit {
    amount: string | number;
    interest_rate: string | number;
    tenure_days: string | number;
    rate_frequency: string;
    total_earned_interest?: string | number;
}

interface VaultCardProps {
    vault: {
        card_number?: string;
        expiry_date?: string;
        cvc?: string;
        balance: number;
        payment_verified: boolean;
        card_status?: string;
    };
    rates?: VaultRate[];
    activeDeposit?: VaultDeposit | null;
    userName?: string;

    // View State (Optional, falls back to internal state)
    isFlipped?: boolean;
    setIsFlipped?: (flipped: boolean) => void;
    isMaximized?: boolean;
    setIsMaximized?: (maximized: boolean) => void;

    // Visibility Toggles (Optional, falls back to internal state)
    showCardNumber?: boolean;
    setShowCardNumber?: (show: boolean) => void;
    showCvc?: boolean;
    setShowCvc?: (show: boolean) => void;

    // Optional Quick Action callbacks
    onDepositClick?: () => void;
    onWithdrawClick?: () => void;
}

export default function VaultCard({
    vault,
    rates = [],
    activeDeposit = null,
    userName = 'Rahul Kumar',
    isFlipped: controlledFlipped,
    setIsFlipped: controlledSetFlipped,
    isMaximized: controlledMaximized,
    setIsMaximized: controlledSetMaximized,
    showCardNumber: controlledShowCardNumber,
    setShowCardNumber: controlledSetShowCardNumber,
    showCvc: controlledShowCvc,
    setShowCvc: controlledSetShowCvc,
    onDepositClick,
    onWithdrawClick,
}: VaultCardProps) {
    // Fallback internal states if parent doesn't provide them
    const [internalFlipped, setInternalFlipped] = useState(false);
    const [internalMaximized, setInternalMaximized] = useState(false);
    const [internalShowCardNumber, setInternalShowCardNumber] = useState(false);
    const [internalShowCvc, setInternalShowCvc] = useState(false);

    // Resolve controlled vs uncontrolled
    const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
    const setIsFlipped = (val: boolean) => {
        if (controlledSetFlipped) controlledSetFlipped(val);
        setInternalFlipped(val);
    };

    const isMaximized = controlledMaximized !== undefined ? controlledMaximized : internalMaximized;
    const setIsMaximized = (val: boolean) => {
        if (controlledSetMaximized) controlledSetMaximized(val);
        setInternalMaximized(val);
    };

    const showCardNumber = controlledShowCardNumber !== undefined ? controlledShowCardNumber : internalShowCardNumber;
    const setShowCardNumber = (val: boolean) => {
        if (controlledSetShowCardNumber) controlledSetShowCardNumber(val);
        setInternalShowCardNumber(val);
    };

    const showCvc = controlledShowCvc !== undefined ? controlledShowCvc : internalShowCvc;
    const setShowCvc = (val: boolean) => {
        if (controlledSetShowCvc) controlledSetShowCvc(val);
        setInternalShowCvc(val);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isMaximized) {
            setIsMaximized(true);
        } else {
            setIsFlipped(!isFlipped);
        }
    };

    return (
        <div
            className={`relative w-full max-w-[320px] h-[195px] perspective-1000 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${
                isMaximized ? 'scale-[1.2] md:scale-[1.35] shadow-2xl z-30' : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
            onClick={handleCardClick}
        >
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE */}
                <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'pointer-events-none' : ''}`}>
                    <div className="bg-[#0f1113] rounded-xl px-5 py-3 text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col justify-between group">
                        {/* Brushed Metal Texture Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#1a1d21] to-[#2a2d33]" />
                            <div
                                className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)`,
                                }}
                            />
                            <div
                                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                }}
                            />
                            {/* Large Background Logo Accent */}
                            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full border-[12px] border-[#c5a059]/10 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border-[1px] border-[#c5a059]/5" />
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            {/* Header Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black tracking-[0.1em] text-[#c5a059] uppercase leading-none">Open Score</span>
                                            <span className="text-[5px] font-bold text-[#c5a059]/60 uppercase tracking-widest mt-0.5">Smart Value</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-2">
                                        {/* Action buttons if callbacks provided */}
                                        {(onDepositClick || onWithdrawClick) && (
                                            <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                {onDepositClick && (
                                                    <button
                                                        onClick={onDepositClick}
                                                        className="p-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                    >
                                                        <ArrowDownToLine size={9} className="text-[#c5a059]" />
                                                    </button>
                                                )}
                                                {onWithdrawClick && (
                                                    <button
                                                        onClick={onWithdrawClick}
                                                        className="p-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors shadow-inner"
                                                    >
                                                        <ArrowUpFromLine size={9} className="text-[#c5a059]" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <span className="text-[6px] font-black text-[#c5a059]/80 uppercase tracking-[0.2em] leading-none mt-0.5">Premium Metal Card</span>
                                    </div>
                                    <div className="h-[1px] w-12 bg-gradient-to-l from-[#c5a059]/40 to-transparent mt-0.5" />
                                </div>
                            </div>

                            {/* Chip & Active Badges Row */}
                            <div className="flex items-center justify-between mt-0.5">
                                <div className="flex items-center gap-2">
                                    {/* Gold Chip */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-7 bg-gradient-to-br from-[#e6c07b] via-[#c5a059] to-[#8e6e36] rounded-md shadow-inner relative overflow-hidden border border-[#8e6e36]/30">
                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                                                {[...Array(9)].map((_, i) => (
                                                    <div key={i} className="border-[0.5px] border-black/20" />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-[2px]">
                                            <div className="w-[1px] h-3 bg-[#c5a059]/40" />
                                            <div className="w-[1px] h-3 bg-[#c5a059]/30" />
                                            <div className="w-[1px] h-3 bg-[#c5a059]/20" />
                                        </div>
                                    </div>
                                </div>

                                {/* Active Deposit Badges */}
                                {activeDeposit && (
                                    <div className="flex items-center gap-1.5">
                                        {/* Locked In Amount */}
                                        <div className="flex items-center gap-1 bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-1 rounded-md shadow-sm shrink-0">
                                            <Lock size={8} className="text-[#c5a059]" />
                                            <span className="text-[9px] font-black tracking-tighter text-[#fef9f3] leading-none">
                                                {Number(activeDeposit.amount).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                                            </span>
                                        </div>

                                        {/* Total Earned Value */}
                                        <div className="flex items-center gap-1 bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-1 rounded-md shadow-sm shrink-0">
                                            <span className="text-[8px] font-black tracking-tighter text-[#c5a059] leading-none">+</span>
                                            <span className="text-[9px] font-black tracking-tighter text-[#fef9f3] leading-none">
                                                {Number(activeDeposit.total_earned_interest || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Available Balance & Daily Yield Row */}
                            <div className="mt-0.5 mb-1 flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-[#c5a059]/80 mb-0.5">Available Value</span>
                                    <span className="text-xl font-black tracking-tighter text-[#fef9f3] leading-none">
                                        {Number(Math.max(0, (vault.balance || 0) - (activeDeposit ? Number(activeDeposit.amount) : 0))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right gap-1">
                                    {activeDeposit && (
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black uppercase tracking-widest text-[#c5a059]/80 mb-0.5">Daily</span>
                                            <span className="text-sm font-black tracking-tighter text-[#fef9f3] leading-none">
                                                +{(() => {
                                                    const rate = Number(activeDeposit.interest_rate);
                                                    const amt = Number(activeDeposit.amount);
                                                    const daily = (amt * rate) / 100 / 30;
                                                    return daily.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Number & Verifying Status */}
                            <div className="py-0.5 flex items-center justify-between w-full gap-2" onClick={(e) => e.stopPropagation()}>
                                <p className={`font-mono text-sm sm:text-base tracking-[0.06em] sm:tracking-[0.1em] drop-shadow-sm font-medium leading-none ${
                                    vault.payment_verified === false ? 'text-[#fef9f3]/40' : 'text-[#fef9f3]'
                                }`}>
                                    {showCardNumber
                                        ? vault.card_number?.replace(/(.{4})/g, '$1 ').trim()
                                        : <>•••• •••• •••• {vault.card_number?.slice(-4)}</>}
                                </p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {vault.payment_verified === false ? (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                            <Lock size={8} className="text-amber-500" />
                                            <span className="text-[6px] font-black text-amber-500 uppercase tracking-widest">Verifying</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                            <CheckCircle2 size={8} className="text-emerald-400" />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCardNumber(!showCardNumber);
                                        }}
                                        className="p-1 hover:bg-white/10 rounded-md transition-all"
                                    >
                                        <Eye size={12} className={showCardNumber ? 'text-amber-400' : 'text-[#c5a059]/80'} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer Details Row */}
                            <div className="flex items-end justify-between pt-0.5">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[5px] font-bold uppercase tracking-widest text-[#c5a059]/60 leading-none">Valid Thru</span>
                                            <span className="text-[9px] font-mono text-[#fef9f3] mt-0.5 leading-none">
                                                {showCardNumber ? (vault.expiry_date || '12/29') : '••/••'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[5px] font-bold uppercase tracking-widest text-[#c5a059]/60 leading-none">Card Holder</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.05em] text-[#fef9f3]/90 mt-0.5 leading-none truncate max-w-[120px]">
                                                {userName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end shrink-0">
                                    <CheckCircle2 size={12} className="text-emerald-400 mt-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK SIDE — Security & Info */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 ${!isFlipped ? 'pointer-events-none' : ''}`}>
                    <div className="bg-[#0f1113] rounded-xl text-white h-full relative overflow-hidden border-[#2a2d33] border-[0.5px] shadow-2xl flex flex-col group">
                        {/* Black Magnetic Strip */}
                        <div className="w-full h-8 bg-[#000] mt-4 shadow-inner" />

                        <div className="px-5 py-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <div className="w-16 h-4 bg-white/5 rounded-sm border border-white/5 flex items-center justify-center">
                                        <span className="text-[5px] font-black text-white/30 uppercase tracking-widest italic">Authorized Signature</span>
                                    </div>
                                    <div className="w-28 h-7 bg-white/5 rounded flex items-center justify-between px-2 border border-white/10">
                                        <div className="flex flex-col items-start">
                                            <span className="text-[4px] font-bold text-[#c5a059] uppercase leading-none mb-0.5">CVV / Secure</span>
                                            <span className="text-[10px] font-mono text-[#f9e37a] tracking-widest leading-none mt-0.5">
                                                {showCvc ? (vault.cvc || '•••') : '•••'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {vault.payment_verified === false && (
                                                <Lock size={8} className="text-amber-500/50 shrink-0" />
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowCvc(!showCvc);
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-md transition-colors shrink-0"
                                            >
                                                <Eye size={12} className={showCvc ? 'text-amber-400' : 'text-white/30'} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[7px] font-black tracking-[0.2em] text-[#c5a059] uppercase leading-none">Vault Matrix</span>
                                    <div className="flex items-center gap-1 opacity-20 justify-end mt-1">
                                        <Lock size={8} />
                                        <span className="text-[5px] font-black uppercase tracking-widest">Encrypted</span>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Rates List or Active Plan Details */}
                            {activeDeposit ? (
                                <div className="flex-1 bg-gradient-to-r from-emerald-500/[0.08] to-teal-500/[0.03] border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-emerald-500/20 rounded-md flex items-center justify-center text-emerald-400">
                                                <CheckCircle2 size={10} strokeWidth={3} />
                                            </div>
                                            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Active Plan Secured</span>
                                        </div>
                                        <span className="text-[7px] font-black text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                            T{activeDeposit.tenure_days} Plan
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                                        <div className="flex flex-col">
                                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">Lock Duration</span>
                                            <span className="text-[10px] font-black text-white mt-0.5">{activeDeposit.tenure_days} Days</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">Increment</span>
                                            <span className="text-[10px] font-black text-emerald-400 mt-0.5">
                                                +{parseFloat(parseFloat(String(activeDeposit.interest_rate)).toFixed(1))}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[5px] font-black text-[#c5a059]/80 uppercase tracking-widest">Total Increment</span>
                                            <span className="text-[10px] font-black text-[#c5a059] mt-0.5">
                                                +{(() => {
                                                    const rate = Number(activeDeposit.interest_rate);
                                                    const amt = Number(activeDeposit.amount);
                                                    const days = Number(activeDeposit.tenure_days);
                                                    const total = (amt * rate / 100 / 30) * days;
                                                    return total.toLocaleString('en-IN', { maximumFractionDigits: 1 });
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-wrap gap-1.5 py-1" onClick={(e) => e.stopPropagation()}>
                                    {rates.slice(0, 4).map((r) => (
                                        <div
                                            key={r.id}
                                            className="bg-white/[0.03] border border-white/[0.04] px-2 py-1.5 rounded-md flex flex-col hover:bg-white/[0.07] transition-all min-w-[60px]"
                                        >
                                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">{r.tenure_days} Days</span>
                                            <span className="text-[10px] font-black text-[#c5a059] leading-none">
                                                {parseFloat(parseFloat(String(r.interest_rate)).toFixed(1))}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-1 flex items-center justify-between border-t border-white/[0.03] pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[5px] font-serif italic text-white/10 uppercase tracking-widest">Secured by Open Score protocol</span>
                                    <span className="text-[4px] font-bold text-white/5 uppercase mt-0.5">This card remains the property of the issuer.</span>
                                </div>
                                <div className="flex gap-[1px] h-2 items-end opacity-10">
                                    {[1, 3, 1, 5, 2, 4, 1, 6].map((w, i) => (
                                        <div key={i} className="bg-white" style={{ width: `${w}px`, height: '100%' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
