import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Watermark } from './BrandComponents';

interface StepContainerProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
    ctaText: string;
    onNext: () => void;
    onSkip?: () => void;
    stepIndex: number;
    totalSteps: number;
}

export default function StepContainer({
    title,
    subtitle,
    children,
    ctaText,
    onNext,
    onSkip,
    stepIndex,
    totalSteps
}: StepContainerProps) {
    return (
        <div className="fixed inset-0 z-40 bg-white flex flex-col p-6 overflow-hidden animate-in fade-in slide-in-from-right-10 duration-500">
            <Watermark />

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="flex gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === stepIndex ? 'w-10 brand-gradient' : 'w-2 bg-slate-100'}`}
                        />
                    ))}
                </div>
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="text-slate-400 font-bold text-xs uppercase tracking-widest px-2 py-1"
                    >
                        Skip
                    </button>
                ) || <div className="w-10" />}
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
                <h2 className="text-3xl font-black text-primary leading-tight mb-4 transition-brand">
                    {title}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                    {subtitle}
                </p>

                <div className="flex-1 min-h-[200px] flex items-center justify-center mb-8">
                    {children}
                </div>
            </div>

            <div className="mt-auto relative z-10">
                <button
                    onClick={onNext}
                    className="w-full brand-gradient text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 group transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20"
                >
                    {ctaText}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Powered by MSME Shakti</p>
                </div>
            </div>
        </div>
    );
}
