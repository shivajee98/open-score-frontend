'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

function InfoContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [button, setButton] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }
        const fetchContent = async () => {
            try {
                const data = await apiFetch(`/dynamic-buttons/${slug}`);
                setButton(data);
            } catch (error) {
                console.error('Failed to fetch content', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Content...</p>
            </div>
        );
    }

    if (!button) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                    <Info size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Notice Not Found</h1>
                <p className="text-sm text-slate-500 mb-8">The requested information is no longer available.</p>
                <BackButton className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20">
                    Go Back
                </BackButton>
            </div>
        );
    }

    const titleWords = button.name.split(' ');
    const firstPart = titleWords.slice(0, titleWords.length - 1).join(' ');
    const lastWord = titleWords[titleWords.length - 1];

    return (
        <div className="min-h-screen selection:bg-[oklch(0.7_0.15_160)] selection:text-white" style={{ backgroundColor: button.bg_color || '#f8fafc' }}>
            {/* Compact Header - Height limited to ~15% of screen */}
            <div className="bg-[oklch(0.15_0.02_240)] pt-6 pb-12 rounded-b-[2rem] relative overflow-hidden h-[18vh] min-h-[140px] flex flex-col justify-end px-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.7_0.15_160/0.05)] rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto w-full relative z-10 space-y-4">
                    <BackButton
                        className="group inline-flex items-center gap-2 text-[oklch(0.6_0.02_240)] font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all cursor-pointer"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </BackButton>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 shrink-0" style={{ color: button.text_color }}>
                            <Info className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-black text-white tracking-tight truncate">
                                {firstPart} <span className="text-[oklch(0.7_0.15_160)]">{lastWord}</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Full Width Card (Removed horizontal margins) */}
            <div className="relative z-20 -mt-4">
                <div className="bg-white rounded-t-[2.5rem] p-6 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-[oklch(0.95_0.01_240)]">
                    <div 
                        className="prose prose-slate max-w-none prose-img:rounded-2xl prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-slate-900 prose-ul:list-disc prose-ol:list-decimal"
                        dangerouslySetInnerHTML={{ __html: button.content }} 
                    />
                </div>
            </div>

            {/* Float Action Button */}
            <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none">
                <BackButton className="pointer-events-auto bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Close Notice
                </BackButton>
            </div>
        </div>
    );
}

export default function InfoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initializing...</p>
            </div>
        }>
            <InfoContent />
        </Suspense>
    );
}
