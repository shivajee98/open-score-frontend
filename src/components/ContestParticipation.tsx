"use client";

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import { X, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGENT_PLANS = [
    { id: 'A', image: '/contest/a-plan.webp' },
    { id: 'B', image: '/contest/b-plan.webp' },
    { id: 'C', image: '/contest/c-plan.webp' },
    { id: 'D', image: '/contest/d-plan.webp' },
    { id: 'E', image: '/contest/e-plan.webp' },
    { id: 'F', image: '/contest/f-plan.webp' },
];

export default function ContestParticipation({ campaign, onRegistered, onBack, onClose }: { campaign: any, onRegistered: (reg: any) => void, onBack?: () => void, onClose?: () => void }) {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(campaign.registration?.selected_plan || null);
    const [loading, setLoading] = useState(false);

    const handleParticipate = async () => {
        if (!selectedPlanId || campaign.registration) return;

        setLoading(true);
        console.log('[ContestParticipation] Registering for campaign:', campaign.id, 'with plan:', selectedPlanId);
        try {
            const res = await apiFetch(`/campaigns/${campaign.id}/register`, {
                method: 'POST',
                body: JSON.stringify({ selected_plan: selectedPlanId })
            });
            console.log('[ContestParticipation] Registration success:', res.data);
            onRegistered(res.data);
            toast.success('Successfully entered the contest!');
        } catch (e: any) {
            console.error('[ContestParticipation] Registration error:', e);
            toast.error(e.message || 'Participation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-[#041226] flex flex-col h-full overflow-hidden text-white font-sans">
            <div className="flex-1 overflow-y-auto overscroll-contain">
            <button 
                onClick={() => {}}
                className="relative w-full shrink-0 active:scale-[0.98] transition-transform cursor-default"
            >
                <img
                    src="/vendor/22.webp"
                    alt="Plans Header"
                    className="w-full h-auto block"
                />
            </button>

            <div className="flex-1 px-4 py-8 pb-32">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-widest text-[#D4AF37]">CHOOSE YOUR PLAN</h2>
                    <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase">Select your target to enter the contest</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AGENT_PLANS.map((plan) => (
                        <button 
                            key={plan.id}
                            onClick={() => !campaign.registration && setSelectedPlanId(plan.id)}
                            className={cn(
                                "relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 text-left",
                                selectedPlanId === plan.id 
                                    ? "border-[#D4AF37] scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                                    : "border-transparent hover:border-white/10"
                            )}
                        >
                            <img 
                                src={plan.image} 
                                alt={`Plan ${plan.id}`} 
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
                        </button>
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

            {campaign.registration && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#041226] via-[#041226] to-transparent">
                    <div className="max-w-md mx-auto py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest text-center border-2 border-emerald-500/30 bg-emerald-500/10">
                        ACTIVE ENROLLMENT
                    </div>
                </div>
            )}
            </div>

            {/* Navigation buttons with INLINE STYLES to guarantee clickability */}
            <button 
                onClick={onBack} 
                style={{
                    position: 'fixed',
                    top: '24px',
                    left: '24px',
                    zIndex: 99999,
                    width: '48px',
                    height: '48px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
                className="hover:bg-black/80 transition-all active:scale-90"
            >
                <ArrowLeft size={24} className="text-white" />
            </button>
            <button 
                onClick={(e) => {
                    console.log('[ContestParticipation] Close button clicked');
                    e.stopPropagation();
                    if (onClose) onClose();
                    else if (onBack) onBack();
                }} 
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 999999,
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
                className="hover:bg-black transition-all active:scale-90"
            >
                <X size={28} className="text-white" />
            </button>
        </div>
    );
}
