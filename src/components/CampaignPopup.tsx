'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { X, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CampaignPopup() {
    const [campaign, setCampaign] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
            <div 
                className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 ease-out"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                >
                    <X size={20} />
                </button>

                {/* Campaign Image */}
                {campaign.image_url ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img 
                            src={campaign.image_url} 
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="pt-16 px-8 pb-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-6 rotate-3">
                            <ArrowRight size={32} className="-rotate-45" />
                        </div>
                    </div>
                )}

                <div className={cn(
                    "px-8 pb-10",
                    campaign.image_url ? "pt-6 -mt-10 relative z-10 bg-white rounded-t-[2rem]" : "pt-2"
                )}>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
                        {campaign.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                        {campaign.body}
                    </p>

                    <button
                        onClick={handleAction}
                        className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                    >
                        Check Details
                        {campaign.link?.startsWith('http') ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                    >
                        Dismiss for now
                    </button>
                </div>
            </div>
        </div>
    );
}
