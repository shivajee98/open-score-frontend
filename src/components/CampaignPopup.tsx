'use client';

import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import ContestParticipation from './ContestParticipation';

export default function CampaignPopup() {
    const [campaign, setCampaign] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showContest, setShowContest] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const fetchActiveCampaign = async () => {
        try {
            const res = await apiFetch('/campaigns/active');
            console.log('[CampaignPopup] API Response:', res.data ? `ID: ${res.data.id}` : 'NULL');
            if (res.data) {
                setCampaign(res.data);
                // Don't show popup if already registered
                if (res.data.registration) {
                    console.log('[CampaignPopup] User already registered, hiding popup');
                    setIsOpen(false);
                } else if (!isOpen) {
                    console.log('[CampaignPopup] Showing popup for active campaign:', res.data.id);
                    setIsOpen(true);
                }
            } else {
                if (isOpen) console.log('[CampaignPopup] Closing popup - no active targeted campaign');
                setCampaign(null);
                setIsOpen(false);
            }
        } catch (e) {
            console.error('[CampaignPopup] Fetch failed:', e);
            // Close popup on error to be safe (e.g. 401 Unauthorized)
            setIsOpen(false);
        }
    };

    useEffect(() => {
        fetchActiveCampaign();

        // Polling every 30 seconds to ensure immediate UI sync if campaign is deleted
        const interval = setInterval(fetchActiveCampaign, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Note: sessionStorage restriction removed per user request to show "each time"
    };

    if (!isOpen || !campaign) return null;

    const bannerImage = campaign.image_url || '/vendor/11.webp';
    const guideImage = '/vendor/22.webp'; // Keep guide as fallback or use another field

    if (showContest) {
        return (
            <div className="fixed inset-0 z-[120] overflow-hidden bg-[#041226] animate-in fade-in duration-500">
                <ContestParticipation
                    campaign={campaign}
                    onRegistered={(reg) => setCampaign({ ...campaign, registration: reg })}
                    onBack={() => setShowContest(false)}
                    onClose={handleClose}
                />
            </div>
        );
    }

    if (showGuide) {
        return (
            <div className="fixed inset-0 z-[120] bg-[#041226] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden animate-in slide-in-from-right duration-500">
                {/* Navigation buttons with INLINE STYLES to guarantee clickability */}
                <button
                    onClick={() => setShowGuide(false)}
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
                    onClick={handleClose}
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
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
                    <X size={24} className="text-white" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[120] bg-[#041226] text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden animate-in fade-in duration-500">
            <button
                onClick={() => setShowContest(true)}
                className="relative w-full shrink-0 active:scale-[0.98] transition-transform"
            >
                <img
                    src={bannerImage}
                    alt={campaign.title}
                    className="w-full h-auto block"
                />
            </button>
            <div className="w-full relative z-10 mt-4 pb-4">
                <div className="flex flex-col items-center px-6 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                        {campaign.body ? 'Limited Time Offer' : 'Ultimate Reward'}
                    </span>
                    <div className="relative">
                        <h2
                            className="text-3xl font-black uppercase tracking-tighter"
                            style={{
                                background: 'linear-gradient(to bottom, #FFDF73, #D4AF37, #997A15)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 4px 10px rgba(212,175,55,0.2))'
                            }}
                        >
                            {campaign.title || 'WIN UP TO 20 LAKHS'}
                        </h2>
                        {campaign.body && (
                            <p className="mt-2 text-xs font-bold text-slate-300 uppercase tracking-wide px-4">
                                {campaign.body}
                            </p>
                        )}
                        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1 opacity-50"></div>
                    </div>
                </div>

                <div className="w-full h-auto flex flex-col gap-4 px-6 mt-8 mb-8">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="w-full py-4 rounded-2xl font-black text-[#041226] text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all active:scale-95"
                        style={{ background: 'linear-gradient(to right, #FAD961, #F76B1C)' }}
                    >
                        How to participate
                    </button>
                    <button
                        onClick={() => {
                            if (campaign.link && campaign.link.startsWith('http')) {
                                window.location.href = campaign.link;
                            } else {
                                setShowContest(true);
                            }
                        }}
                        className="w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(21,67,140,0.3)] transition-all active:scale-95 border border-[#15438C]"
                        style={{ background: 'linear-gradient(to bottom, #15438C, #0B1E3B)' }}
                    >
                        Join Contest & win
                    </button>
                </div>
            </div>

            {/* X button with INLINE STYLES to guarantee z-index and clickability */}
            <button
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
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
                <X size={24} className="text-white" />
            </button>
        </div>
    );
}
