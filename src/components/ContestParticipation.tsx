"use client";

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Check, Trophy, Car, Bike, Plane, Star, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

const AGENT_PLANS = [
    { id: 'A', name: 'SUPER DRIVE', loans: 100, onboarding: 400, product: 'Mahindra Scorpio', cost: '13 L', prize: '1st Prize', icon: Car, color: 'from-amber-400 to-amber-600' },
    { id: 'B', name: 'POWER MOVE', loans: 60, onboarding: 300, product: 'Tata Punch', cost: '5.5 L', prize: '2nd Prize', icon: Car, color: 'from-slate-300 to-slate-500' },
    { id: 'C', name: 'SMART MOVE', loans: 40, onboarding: 200, product: 'Tata Tiago', cost: '4.7 L', prize: '3rd Prize', icon: Car, color: 'from-orange-400 to-orange-600' },
    { id: 'D', name: 'QUICK MOVE', loans: 20, onboarding: 40, product: 'S-Presso', cost: '3.5 L', prize: '4th Prize', icon: Car, color: 'from-blue-400 to-blue-600' },
    { id: 'E', name: 'BIKE MOVE', loans: 15, onboarding: 30, product: 'Harley Davidson', cost: '2.35 L', prize: '5th Prize', icon: Bike, color: 'from-purple-400 to-purple-600' },
    { id: 'F', name: 'LIFESTYLE MOVE', loans: 10, onboarding: 30, product: 'Domestic Tour', cost: '1.5 L', prize: '6th Prize', icon: Plane, color: 'from-green-400 to-green-600' },
];

export default function ContestParticipation({ campaign, onRegistered }: { campaign: any, onRegistered: (reg: any) => void }) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(campaign.registration?.selected_plan || null);
    const [loading, setLoading] = useState(false);

    const handleParticipate = async (planId: string) => {
        if (campaign.registration) return;
        
        setLoading(true);
        try {
            const res = await apiFetch(`/campaigns/${campaign.id}/register`, {
                method: 'POST',
                body: JSON.stringify({ selected_plan: planId })
            });
            setSelectedPlan(planId);
            onRegistered(res.data);
            toast.success('You have successfully entered the contest!');
        } catch (e: any) {
            toast.error(e.message || 'Participation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">AGENT CONTEST PLAN</h2>
                <p className="text-sm text-slate-500 font-medium italic">Choose your plan & enter the contest!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGENT_PLANS.map((plan) => (
                    <div 
                        key={plan.id}
                        className={cn(
                            "relative group rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer",
                            selectedPlan === plan.id 
                                ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-500/10" 
                                : "border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow-md"
                        )}
                        onClick={() => !campaign.registration && setSelectedPlan(plan.id)}
                    >
                        {selectedPlan === plan.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg z-10 animate-in zoom-in duration-300">
                                <Check size={14} className="text-white stroke-[4px]" />
                            </div>
                        )}

                        <div className="p-4 flex gap-4">
                            <div className={cn(
                                "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-inner shrink-0",
                                plan.color
                            )}>
                                <plan.icon className="text-white" size={32} />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-black italic">PLAN {plan.id}</span>
                                    <h3 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{plan.name}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500 italic">
                                    <div className="flex justify-between"><span>Loans:</span> <span className="text-slate-900">{plan.loans}</span></div>
                                    <div className="flex justify-between"><span>Onboarding:</span> <span className="text-slate-900">{plan.onboarding}</span></div>
                                    <div className="flex justify-between"><span>Cost:</span> <span className="text-slate-900">{plan.cost}</span></div>
                                    <div className="flex justify-between"><span>Prize:</span> <span className="text-slate-900">{plan.prize}</span></div>
                                </div>
                            </div>
                        </div>

                        {selectedPlan === plan.id && !campaign.registration && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                <button 
                                    disabled={loading}
                                    onClick={(e) => { e.stopPropagation(); handleParticipate(plan.id); }}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'CONFIRMING...' : 'CONFIRM PARTICIPATION'}
                                </button>
                            </div>
                        )}
                        
                        {campaign.registration?.selected_plan === plan.id && (
                            <div className="px-4 pb-4">
                                <div className="w-full py-2 bg-emerald-500/10 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest text-center border border-emerald-500/20">
                                    ENROLLED IN {plan.id}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Trophy className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 italic">HOW TO PARTICIPATE?</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            Choose your target plan. Once confirmed, you will be eligible for the rewards based on your chosen plan. Complete the targets within the contest period (13 April - 23 April) to win!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
