'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ReferralHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref') || searchParams.get('referral');
        if (refCode) {
            localStorage.setItem('referral_code', refCode);
        }
    }, [searchParams]);

    return null;
}
