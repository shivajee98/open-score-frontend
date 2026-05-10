"use client";

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Calendar, Target, Car, Bike, Luggage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

const AGENT_PLANS = [
    { sn: 1, id: 'A', name: "PLAN A SUPER DRIVE", loans: 100, onboarding: 400, product: "Mahindra SCORPIO", cost: "13 L", prizeRank: "1st PRIZE", prizeValue: "SUV", image: '/contest/scorpio.png' },
    { sn: 2, id: 'B', name: "PLAN B POWER MOVE", loans: 60, onboarding: 300, product: "TATA PUNCH", cost: "5.5 L", prizeRank: "2nd PRIZE", prizeValue: "Compact SUV", image: '/contest/punch.png' },
    { sn: 3, id: 'C', name: "PLAN C SMART MOVE", loans: 40, onboarding: 200, product: "TATA TIAGO", cost: "4.7 L", prizeRank: "3rd PRIZE", prizeValue: "Hatchback", image: '/contest/tiago.png' },
    { sn: 4, id: 'D', name: "PLAN D QUICK MOVE", loans: 20, onboarding: 40, product: "MARUTI SUZUKI S-PRESSO", cost: "3.5 L", prizeRank: "4th PRIZE", prizeValue: "Micro Car", image: '/contest/spresso.png' },
    { sn: 5, id: 'E', name: "PLAN E BIKE MOVE", loans: 15, onboarding: 30, product: "HARDLEY", cost: "2.35 L", prizeRank: "5th PRIZE", prizeValue: "Bike", image: '/contest/harley.png' },
    { sn: 6, id: 'F', name: "PLAN F LIFESTYLE MOVE", loans: 10, onboarding: 30, product: "DOMESTIC TOUR PACKAGE", cost: "1.5 L", prizeRank: "6th PRIZE", prizeValue: "Tour Package", image: '/contest/tour.png' }
];

export default function ContestParticipation({ campaign, onRegistered, onBack }: { campaign: any, onRegistered: (reg: any) => void, onBack?: () => void }) {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(campaign.registration?.selected_plan || null);
    const [loading, setLoading] = useState(false);

    const handleParticipate = async () => {
        if (!selectedPlanId || campaign.registration) return;
        
        setLoading(true);
        try {
            const res = await apiFetch(`/campaigns/${campaign.id}/register`, {
                method: 'POST',
                body: JSON.stringify({ selected_plan: selectedPlanId })
            });
            onRegistered(res.data);
            toast.success('Successfully entered the contest!');
        } catch (e: any) {
            toast.error(e.message || 'Participation failed');
        } finally {
            setLoading(false);
        }
    };

    const selectedPlan = AGENT_PLANS.find(p => p.id === selectedPlanId);

    return (
        <div className="h-full bg-[#f0f4fa] flex flex-col font-sans overflow-hidden">
            {/* Hero Header */}
            <div className="bg-[#121826] p-6 pb-5 rounded-b-[2.5rem] shadow-xl shrink-0 relative">
                <button onClick={onBack} className="absolute top-6 left-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
                    <ArrowLeft size={16} className="text-white" />
                </button>
                
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white mb-4 border border-white/10">
                        🏆 AGENT CONTEST <span className="bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full text-[9px]">WIN PRIZES</span>
                    </div>
                    <h1 className="text-3xl font-black text-white leading-[1.1] tracking-tight mb-2 uppercase italic">Choose Plan<br />Win Big!</h1>
                    <p className="text-[11px] text-white/70 font-bold uppercase tracking-wide mb-6">✅ Short steps · Easy targets · Real rewards</p>
                    
                    <div className="w-full bg-white/5 rounded-[1.5rem] p-3 flex justify-between items-center text-[11px] font-black italic border border-white/5 text-white">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-yellow-400" /> START: 13 APRIL</div>
                        <div className="flex items-center gap-2"><Target size={14} className="text-emerald-400" /> END: 23 APRIL</div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Plan Selection */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[13px] font-black text-slate-900 uppercase italic flex items-center gap-2">
                            🎯 SELECT YOUR PLAN
                        </h2>
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-wider">⭐ 1 entry = 1 plan</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {AGENT_PLANS.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                                <div 
                                    key={plan.id}
                                    onClick={() => !campaign.registration && setSelectedPlanId(plan.id)}
                                    className={cn(
                                        "bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden cursor-pointer",
                                        isSelected 
                                            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-xl scale-[1.02]" 
                                            : "border-slate-100 shadow-sm hover:shadow-md"
                                    )}
                                >
                                    <div className="flex justify-between items-start p-5 pb-3">
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 leading-tight uppercase italic">{plan.name}</h3>
                                            <p className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block mt-2 uppercase">🏆 {plan.prizeRank}</p>
                                        </div>
                                        <div className="w-20 h-16 relative flex items-center justify-center shrink-0">
                                            <img src={plan.image} alt={plan.product} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 px-5 pb-4 mb-3 border-b border-slate-50">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">📋 LOAN PROCESS</p>
                                            <p className="text-xl font-black text-slate-900 italic leading-none">{plan.loans} <span className="text-[10px] not-italic text-slate-400">loans</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">👥 ONBOARDING</p>
                                            <p className="text-xl font-black text-slate-900 italic leading-none">{plan.onboarding} <span className="text-[10px] not-italic text-slate-400">users</span></p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 px-5 py-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                {plan.id === 'E' ? <Bike size={14} className="text-slate-600" /> : plan.id === 'F' ? <Luggage size={14} className="text-slate-600" /> : <Car size={14} className="text-slate-600" />}
                                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{plan.product}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full self-start">💰 {plan.cost}</span>
                                        </div>
                                        <button 
                                            className={cn(
                                                "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                                                isSelected 
                                                    ? "bg-blue-600 text-white shadow-lg" 
                                                    : "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {isSelected ? '✅ SELECTED' : 'SELECT'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Steps Section */}
                <section className="bg-slate-100/50 rounded-[2.5rem] p-6 border border-slate-200/50">
                    <h2 className="text-[13px] font-black text-slate-900 uppercase italic flex items-center gap-2 mb-6">
                        📋 <span>How to win? (Easy 5 steps)</span>
                    </h2>
                    <div className="space-y-5">
                        {[
                            { num: 1, text: "Choose Plan", sub: "Pick according to target" },
                            { num: 2, text: "Confirm Plan", sub: "Entry locked for contest" },
                            { num: 3, text: "Do Loan / Onboarding", sub: "As per plan target" },
                            { num: 4, text: "Complete in Period", sub: "13 to 23 April only" },
                            { num: 5, text: "Win Prize", sub: "Get your chosen plan reward!" }
                        ].map((step) => (
                            <div key={step.num} className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 text-blue-600 font-black text-sm shadow-sm">{step.num}</div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1 italic">{step.text}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-none">{step.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-[10px] font-bold text-blue-700 text-center italic border border-blue-100/50 leading-relaxed">
                        ✅ "Contest pura hote hi, winner ko uske chune hue plan ke anusar prize milega!"
                    </div>
                </section>

                {/* Footer Quote */}
                <footer className="py-8 text-center border-t border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                        🔥 Open for all agents | Contest only on Open Score <br /> Target as per plan → Prize assured
                    </p>
                </footer>
            </div>

            {/* Sticky Action Panel */}
            <div className="bg-white border-t border-slate-100 p-5 pb-10 shrink-0">
                <div className="bg-[#f8fafc] rounded-full p-2 flex items-center justify-between border border-slate-200 shadow-sm">
                    <div className="flex flex-col pl-5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SELECTED PLAN</span>
                        <p className="text-[11px] font-black italic text-slate-900 uppercase truncate max-w-[150px]">
                            {selectedPlan ? selectedPlan.name : '🤖 No plan selected'}
                        </p>
                    </div>
                    <button 
                        disabled={loading || !selectedPlanId || !!campaign.registration}
                        onClick={handleParticipate}
                        className={cn(
                            "px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all",
                            campaign.registration 
                                ? "bg-emerald-600 text-white shadow-lg" 
                                : selectedPlanId 
                                    ? "bg-slate-900 text-white shadow-xl active:scale-95 hover:bg-slate-800" 
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {campaign.registration ? '✓ ENTRY ACTIVE' : (loading ? 'CONFIRMING...' : '📌 Confirm Entry')}
                    </button>
                </div>
                {campaign.registration && (
                    <div className="mt-4 px-5 py-3 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 text-[10px] font-black text-emerald-700 italic text-center animate-in fade-in slide-in-from-bottom-2">
                        🎉 CONFIRMED! Complete targets before 23 April. Win {selectedPlan?.product} 🎁
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
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
