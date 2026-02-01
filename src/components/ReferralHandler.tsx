'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ReferralHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Method 1: Next.js Search Params
        let refCode = searchParams.get('ref') || searchParams.get('referral');

        // Method 2: Fallback to raw window location (in case of router race conditions)
        if (!refCode && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            refCode = urlParams.get('ref') || urlParams.get('referral');
        }

        if (refCode) {
            console.log('Referral Code Detected:', refCode);
            localStorage.setItem('referral_code', refCode);
            // Dispatch custom event for same-page listeners
            window.dispatchEvent(new Event('referral_code_updated'));
        }
    }, [searchParams]);

    return null;
}
