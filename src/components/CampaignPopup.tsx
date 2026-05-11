'use client';

import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

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
       <></>
    );
}
