'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { X, ArrowRight, Trophy, Star, Gift, TrendingUp, Medal, Crown, Calendar, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ContestParticipation from './ContestParticipation';

export default function CampaignPopup() {
    const [campaign, setCampaign] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showContest, setShowContest] = useState(false);

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            try {
                const res = await apiFetch('/campaigns/active');
                if (res.data) {
                    setCampaign(res.data);
                    const seen = sessionStorage.getItem(`campaign_${res.data.id}`);
                    if (!seen) {
                        setIsOpen(true);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch campaign', e);
            }
        };

        fetchActiveCampaign();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (campaign) sessionStorage.setItem(`campaign_${campaign.id}`, 'true');
    };

    if (!isOpen || !campaign) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div
                className={cn(
                    "relative w-full bg-[#020b1c] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    showContest 
                        ? "h-full md:h-[90vh] md:max-w-[420px] md:rounded-[3rem] overflow-hidden shadow-2xl" 
                        : "h-full md:h-[90vh] md:max-w-[420px] md:rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] mx-0 md:mx-4 flex flex-col border border-white/5"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                {!showContest && (
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:scale-110 active:scale-90"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                )}

                {showContest ? (
                    <ContestParticipation 
                        campaign={campaign} 
                        onRegistered={(reg) => {
                            setCampaign({ ...campaign, registration: reg });
                        }} 
                        onBack={() => setShowContest(false)}
                    />
                ) : (
                    <div className="flex flex-col h-full bg-[#020b1c] text-white overflow-y-auto custom-scrollbar">
                        {/* Header Section */}
                        <div className="relative pt-12 pb-8 px-8 flex flex-col items-center text-center shrink-0">
                            {/* Confetti/Star Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
                            
                            <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter mb-2 relative">
                                <span className="text-white drop-shadow-sm">AGENT</span><br/>
                                <span className="text-[#facc15] drop-shadow-[0_4px_12px_rgba(250,204,21,0.3)]">CONTEST</span>
                            </h1>

                            <div className="flex items-center gap-2 bg-[#be123c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                LIVE
                            </div>

                            <p className="text-[#facc15] font-black italic uppercase text-lg leading-none tracking-tight mb-8">
                                JITNA KAAM, UTNA REWARD!
                            </p>

                            <div className="relative w-40 h-40">
                                <div className="absolute -inset-4 bg-[#facc15]/10 blur-3xl rounded-full" />
                                <img 
                                    src="/contest/trophy.png" 
                                    alt="Trophy" 
                                    className="w-full h-full object-contain relative drop-shadow-[0_20px_40px_rgba(250,204,21,0.2)]"
                                    onError={(e) => {
                                        (e.target as any).src = 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Dates Section */}
                        <div className="px-6 py-4 bg-[#0a162e] border-y border-white/5">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Star size={12} className="text-[#facc15] fill-[#facc15]" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#facc15]">CONTEST OPEN SCORE</h3>
                                <Star size={12} className="text-[#facc15] fill-[#facc15]" />
                            </div>

                            <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="bg-white rounded-xl overflow-hidden w-20 shadow-xl">
                                        <div className="bg-[#1e40af] text-[10px] font-black py-1 text-center uppercase tracking-widest text-white">START</div>
                                        <div className="py-2 text-center">
                                            <div className="text-2xl font-black text-[#1e293b] leading-none">13</div>
                                            <div className="text-[10px] font-black text-[#64748b] uppercase">APRIL</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-10 h-10 bg-[#facc15] rounded-full flex items-center justify-center text-[#1e293b] font-black italic text-sm border-4 border-[#0a162e]">
                                    TO
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <div className="bg-white rounded-xl overflow-hidden w-20 shadow-xl">
                                        <div className="bg-[#1e40af] text-[10px] font-black py-1 text-center uppercase tracking-widest text-white">END</div>
                                        <div className="py-2 text-center">
                                            <div className="text-2xl font-black text-[#1e293b] leading-none">23</div>
                                            <div className="text-[10px] font-black text-[#64748b] uppercase">APRIL</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 pl-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-[#facc15]/20 rounded-full flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 bg-[#facc15] rounded-full" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-300 leading-tight">Plan Choose Karein & Contest Mein Entry Payein</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-[#facc15]/20 rounded-full flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 bg-[#facc15] rounded-full" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-300 leading-tight">Target Complete Karein & Reward Jeetein</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why Participate Section */}
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Star size={10} className="text-[#facc15] fill-[#facc15]" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">WHY PARTICIPATE?</h3>
                                <Star size={10} className="text-[#facc15] fill-[#facc15]" />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { icon: Gift, label: "Amazing\nPrizes", color: "#facc15" },
                                    { icon: TrendingUp, label: "Score More\nWin More", color: "#facc15" },
                                    { icon: Medal, label: "Top Agents\nGet Reward", color: "#facc15" },
                                    { icon: Crown, label: "Be a\nChampion", color: "#facc15" },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <item.icon size={20} className="text-[#facc15]" />
                                        </div>
                                        <span className="text-[8px] font-black text-center text-slate-400 uppercase leading-tight whitespace-pre-line tracking-wider">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 space-y-3 pb-8">
                            <button
                                onClick={() => setShowContest(true)}
                                className="w-full h-16 bg-[#facc15] text-[#1e293b] rounded-2xl flex items-center justify-between px-6 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                            >
                                <div className="flex items-center gap-4">
                                    <Gift size={24} className="group-hover:rotate-12 transition-transform" />
                                    <span className="text-sm font-black italic uppercase tracking-widest">VIEW CONTEST</span>
                                </div>
                                <ChevronRight size={20} />
                            </button>

                            <button
                                onClick={() => setShowContest(true)}
                                className="w-full h-16 bg-[#1e40af] text-white rounded-2xl flex items-center justify-between px-6 transition-all hover:scale-[1.02] active:scale-[0.98] group border border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <TrendingUp size={24} className="group-hover:translate-y-[-2px] transition-transform" />
                                    <span className="text-sm font-black italic uppercase tracking-widest">CHOOSE PLAN</span>
                                </div>
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Progress/Rank Card */}
                        <div className="px-6 pb-12 mt-auto">
                            <div className="bg-[#0f172a] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Crown size={64} className="text-[#facc15]" />
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[#1e40af]/30 rounded-full flex items-center justify-center border border-[#1e40af]/50">
                                        <User size={24} className="text-[#60a5fa]" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black italic uppercase text-white leading-none mb-1">Hello, Agent!</h4>
                                        <p className="text-[10px] font-bold text-slate-400 italic">Keep Going, You Can Win Big!</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="flex items-center gap-1 justify-end text-[#facc15]">
                                            <Crown size={12} className="fill-[#facc15]" />
                                            <span className="text-[10px] font-black uppercase">YOUR RANK</span>
                                        </div>
                                        <div className="text-3xl font-black italic text-[#facc15] leading-none">08</div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">TOP 10</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL SCORE</p>
                                        <p className="text-2xl font-black italic text-[#facc15]">1,365</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TARGET PROGRESS</p>
                                        <p className="text-2xl font-black italic text-emerald-400">65%</p>
                                    </div>
                                </div>

                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#facc15] to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                                        style={{ width: '65%' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">START: 0</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">(1365 / 2100)</span>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-white transition-colors"
                            >
                                REMIND ME LATER
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
