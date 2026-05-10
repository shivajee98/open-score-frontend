"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Megaphone, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CampaignBanner() {
    const [campaign, setCampaign] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await apiFetch('/campaigns/active');
                if (res.data) {
                    setCampaign(res.data);
                }
            } catch (e) {
                console.error('Failed to fetch campaign banner:', e);
            }
        };

        fetchCampaign();
    }, []);

    if (!campaign || !isVisible) return null;

    const handleAction = () => {
        if (campaign.link) {
            if (campaign.link.startsWith('http')) {
                window.open(campaign.link, '_blank');
            } else {
                router.push(campaign.link);
            }
        }
    };

    return (
        <div className="relative w-full bg-indigo-600 overflow-hidden z-[40]">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x opacity-50" />
            
            <div className="max-w-7xl mx-auto px-4 py-2 relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Megaphone className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-0.5">
                            Active Campaign
                        </p>
                        <p className="text-sm font-bold text-white truncate leading-tight">
                            {campaign.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleAction}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-50 transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                        View Details
                        <ArrowRight size={12} />
                    </button>
                    {/* Optional: Close button if user wants to hide the banner for the session */}
                    {/* <button onClick={() => setIsVisible(false)} className="p-1 text-white/50 hover:text-white">
                        <X size={14} />
                    </button> */}
                </div>
            </div>
        </div>
    );
}
