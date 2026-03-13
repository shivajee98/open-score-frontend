'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { CapacitorReferrer } from '@leochaddad/capacitor-referrer';
import toast from 'react-hot-toast';

export default function ReferralHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleReferral = async (urlStr?: string) => {
            console.log('[ReferralHandler] handleReferral starting. URL:', urlStr || 'N/A');
            let refCode: string | null = null;
            
            if (urlStr) {
                try {
                    const url = new URL(urlStr);
                    refCode = url.searchParams.get('ref') || url.searchParams.get('referral');
                } catch (e) {
                    console.error('[ReferralHandler] URL parse error:', e);
                }
            }

            if (!refCode) {
                const nextRef = searchParams.get('ref') || searchParams.get('referral');
                if (nextRef) refCode = nextRef;
            }

            if (!refCode && typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                refCode = urlParams.get('ref') || urlParams.get('referral');
            }

            // Fallback to native
            if (!refCode && Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
                try {
                    const result = await CapacitorReferrer.getReferrerDetails();
                    if (result?.referrerUrl) {
                        const params = new URLSearchParams(result.referrerUrl.includes('?') ? result.referrerUrl.split('?')[1] : result.referrerUrl);
                        refCode = params.get('referral_code') || params.get('ref') || params.get('referral');
                    }
                } catch (err) {
                    console.warn('[ReferralHandler] Native referrer failed:', err);
                }
            }

            if (refCode) {
                console.log('[ReferralHandler] Capturing referral code:', refCode);
                localStorage.setItem('referral_code', refCode);
                toast.success(`Referral code detected: ${refCode}`, { id: 'ref-toast' });
                window.dispatchEvent(new Event('referral_code_updated'));
            }
        };

        // Standard checks
        handleReferral();

        // Native Listeners
        let appUrlListener: any;
        if (Capacitor.isNativePlatform()) {
            App.getLaunchUrl().then(ret => {
                if (ret?.url) handleReferral(ret.url);
            });
            App.addListener('appUrlOpen', (data: { url: string }) => {
                handleReferral(data.url);
            }).then(l => appUrlListener = l);
        }

        (window as any).triggerReferralCheck = () => handleReferral();

        return () => {
            if (appUrlListener) appUrlListener.remove();
        };
    }, [searchParams]); // Re-run standard checks if searchParams change

    return null;
}
