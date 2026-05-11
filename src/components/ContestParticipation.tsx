"use client";

import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';


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


    return (
        <div className="min-h-screen bg-[#041226] flex flex-col font-sans overflow-x-hidden text-white">
            {/* Back Button Overlay */}
            <button 
                onClick={onBack} 
                className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all active:scale-90"
            >
                <X size={20} className="text-white" />
            </button>

            {/* Main Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {/* Full Screen Image Container */}
                <div className="relative w-full">
                    <Image 
                        src="/customer/11.png" 
                        alt="contest image" 
                        width={700} 
                        height={900} 
                        className="w-full h-auto object-cover"
                        priority
                    />
                </div>

                {/* Buttons Container Beneath the Image */}
                <div className="px-6 py-10 flex flex-col gap-4">
                    <button 
                        onClick={handleParticipate}
                        disabled={loading || !!campaign.registration}
                        className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95 disabled:opacity-50" 
                        style={{ background: 'linear-gradient(to right, #FAD961, #F76B1C)' }}
                    >
                        {campaign.registration ? 'ENTRY ACTIVE' : (loading ? 'PROCESSING...' : 'VIEW CONTEST')}
                    </button>
                    
                    <button 
                        className="w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(21,67,140,0.3)] transition-all active:scale-95 border border-[#15438C]" 
                        style={{ background: 'linear-gradient(to bottom, #15438C, #0B1E3B)' }}
                    >
                        CHOOSE PLAN
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
