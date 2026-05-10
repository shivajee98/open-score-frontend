'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { X, ArrowRight, ExternalLink, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import ContestParticipation from './ContestParticipation';

export default function CampaignPopup() {
    const [campaign, setCampaign] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showContest, setShowContest] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            try {
                const res = await apiFetch('/campaigns/active');
                if (res.data) {
                    setCampaign(res.data);
                    setIsOpen(true);
                }
            } catch (e) {
                console.error('Failed to fetch campaign', e);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveCampaign();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleAction = () => {
        if (campaign?.link) {
            if (campaign.link.startsWith('http')) {
                window.open(campaign.link, '_blank');
            } else {
                router.push(campaign.link);
            }
        }
        handleClose();
    };

    if (!isOpen || !campaign) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-700">
            <div
                className={cn(
                    "relative w-full bg-white rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    showContest ? "max-w-[800px] max-h-[90vh] overflow-y-auto" : "max-w-[420px]"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Header Accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-50 w-11 h-11 bg-white/80 hover:bg-white backdrop-blur-xl rounded-full flex items-center justify-center text-slate-900 border border-slate-200 transition-all hover:scale-110 active:scale-90 shadow-lg"
                >
                    <X size={22} strokeWidth={2.5} />
                </button>

                {showContest ? (
                    <div className="p-8 md:p-12">
                        <ContestParticipation 
                            campaign={campaign} 
                            onRegistered={(reg) => {
                                setCampaign({ ...campaign, registration: reg });
                            }} 
                        />
                    </div>
                ) : (
                    <>
                        {/* Campaign Visual Area */}
                        {campaign.image_url ? (
                            <div className="relative aspect-[4/5] w-full overflow-hidden group">
                                <img
                                    src={campaign.image_url}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-100 h-1/2 bottom-0 top-auto" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-t-[2.5rem]" />
                            </div>
                        ) : (
                            <div className="pt-20 px-10 pb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                                    <Megaphone size={40} strokeWidth={2.5} className="-rotate-12" />
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "px-10 pb-12",
                            campaign.image_url ? "pt-0 -mt-20 relative z-10 bg-white/95 backdrop-blur-md rounded-t-[3rem]" : "pt-2"
                        )}>
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-indigo-100/50">
                                    Exclusive Offer
                                </span>
                                <div className="h-1 w-8 bg-slate-100 rounded-full" />
                            </div>

                            <h3 className="text-3xl font-black text-slate-950 leading-[1.1] mb-4 tracking-tight italic">
                                {campaign.title}
                            </h3>
                            <p className="text-slate-500 font-medium text-base leading-relaxed mb-10 opacity-80">
                                {campaign.body}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowContest(true)}
                                    className="w-full h-[72px] bg-slate-950 hover:bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] active:scale-[0.97] group italic"
                                >
                                    <span>Explore Now</span>
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </button>

                                <button
                                    onClick={handleClose}
                                    className="w-full text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-slate-900 transition-colors py-2"
                                >
                                    Skip for later
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {/* Bottom Detail */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
