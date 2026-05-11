"use client";

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGENT_PLANS = [
    { id: 'A', image: '/contest/a-plan.jpeg' },
    { id: 'B', image: '/contest/b-plan.jpeg' },
    { id: 'C', image: '/contest/c-plan.jpeg' },
    { id: 'D', image: '/contest/d-plan.jpeg' },
    { id: 'E', image: '/contest/e-plan.jpeg' },
    { id: 'F', image: '/contest/f-plan.jpeg' },
];

export default function ContestParticipation({ campaign, onRegistered, onBack }: { campaign: any, onRegistered: (reg: any) => void, onBack?: () => void }) {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(campaign.registration?.selected_plan || null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(campaign.registration ? 2 : 1);

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

    if (step === 2) {
        return (
            <div className="min-h-screen bg-[#041226] flex flex-col font-sans overflow-x-hidden text-white">
                <button 
                    onClick={() => campaign.registration ? onBack?.() : setStep(1)} 
                    className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all active:scale-90"
                >
                    <X size={20} className="text-white" />
                </button>

                <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-[#D4AF37]">CHOOSE YOUR PLAN</h2>
                        <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase">Select your target to enter the contest</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AGENT_PLANS.map((plan) => (
                            <div 
                                key={plan.id}
                                onClick={() => !campaign.registration && setSelectedPlanId(plan.id)}
                                className={cn(
                                    "relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2",
                                    selectedPlanId === plan.id 
                                        ? "border-[#D4AF37] scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                                        : "border-transparent hover:border-white/10"
                                )}
                            >
                                <Image 
                                    src={plan.image} 
                                    alt={`Plan ${plan.id}`} 
                                    width={400} 
                                    height={400} 
                                    className="w-full h-auto object-cover"
                                />
                                {selectedPlanId === plan.id && (
                                    <div className="absolute top-3 right-3 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg z-10 animate-in zoom-in">
                                        <Check size={18} className="text-[#041226] stroke-[3px]" />
                                    </div>
                                )}
                                {campaign.registration?.selected_plan === plan.id && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-[#D4AF37]/90 backdrop-blur-sm py-2 text-center text-[#041226] font-black text-xs tracking-widest uppercase">
                                        ACTIVE ENROLLMENT
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {!campaign.registration && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#041226] via-[#041226] to-transparent pointer-events-none">
                        <div className="pointer-events-auto max-w-md mx-auto">
                            <button 
                                onClick={handleParticipate}
                                disabled={loading || !selectedPlanId}
                                className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100" 
                                style={{ background: 'linear-gradient(to right, #FAD961, #F76B1C)' }}
                            >
                                {loading ? 'CONFIRMING...' : 'CONFIRM SELECTION'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#041226] flex flex-col font-sans overflow-x-hidden text-white">
            <button 
                onClick={onBack} 
                className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all active:scale-90"
            >
                <X size={20} className="text-white" />
            </button>

            <div className="flex-1 overflow-y-auto">
                <div className="relative w-full">
                    <Image 
                        src="/contest/11.png" 
                        alt="contest image" 
                        width={700} 
                        height={900} 
                        className="w-full h-auto object-cover"
                        priority
                    />
                </div>

                <div className="px-6 py-10 flex flex-col gap-4">
                    <button 
                        onClick={() => setStep(2)}
                        className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95" 
                        style={{ background: 'linear-gradient(to right, #FAD961, #F76B1C)' }}
                    >
                        {campaign.registration ? 'VIEW MY PLAN' : 'VIEW PLANS & RULES'}
                    </button>
                    
                    <button 
                        onClick={onBack}
                        className="w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(21,67,140,0.3)] transition-all active:scale-95 border border-[#15438C]" 
                        style={{ background: 'linear-gradient(to bottom, #15438C, #0B1E3B)' }}
                    >
                        MAYBE LATER
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        ⭐ Limited Time Offer • Join Now ⭐
                    </p>

                    <div className="mt-8 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                           Ultimate Reward
                        </span>
                        <div className="relative">
                            <h2 
                              className="text-2xl font-black uppercase tracking-tighter"
                              style={{
                                background: 'linear-gradient(to bottom, #FFDF73, #D4AF37, #997A15)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 4px 10px rgba(212,175,55,0.2))'
                              }}
                            >
                              WIN UP TO 15 LAKHS
                            </h2>
                            <div className="h-0.5 w-12 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1 opacity-50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
