'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft as ArrowLeftIcon, Loader2 as Loader2Icon, Info as InfoIcon } from 'lucide-react';
import BackButton from '@/components/BackButton';

function InfoContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [button, setButton] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
                <Loader2Icon className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Content...</p>
            </div>
        );
    }

    if (!button) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                    <InfoIcon size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Notice Not Found</h1>
                <p className="text-sm text-slate-500 mb-8">The requested information is no longer available.</p>
                <BackButton className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20">
                    Go Back
                </BackButton>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-12">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <BackButton className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-slate-900" />
                    </BackButton>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">{button.name}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Open Score Information</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div 
                    className="prose prose-slate prose-img:rounded-[2rem] prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: button.content }} 
                />
            </div>

            <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none">
                <BackButton className="pointer-events-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all">
                    Dismiss
                </BackButton>
            </div>
        </div>
    );
}

export default function InfoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <Loader2Icon className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initializing...</p>
            </div>
        }>
            <InfoContent />
        </Suspense>
    );
}
