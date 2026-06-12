import React, { useState } from 'react';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import SplashStep from './SplashStep';
import StepContainer from './StepContainer';
import AuthEntry from './AuthEntry';
import { 
    CheckCircle2, 
} from 'lucide-react';

// --- Reusable Content Component ---
const ListItem = ({ text }: { text: string }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3 animate-in slide-in-from-bottom-2 fade-in duration-500 w-full group hover:border-blue-200 transition-all">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <span className="text-slate-700 font-bold text-sm leading-tight">{text}</span>
    </div>
);

interface OnboardingFlowProps {
    onComplete: (mode: 'login' | 'signup') => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState<'splash' | number | 'auth'>('splash');
    
    const TOTAL_STEPS = 3;

    const nextStep = () => {
        if (typeof step === 'number') {
            if (step < TOTAL_STEPS) {
                setStep(step + 1);
            } else {
                setStep('auth');
            }
        }
    };

    const skipOnboarding = () => {
        setStep('auth');
    };

    if (step === 'splash') {
        return <SplashStep onComplete={() => setStep(1)} />;
    }

    if (step === 'auth') {
        return (
            <AuthEntry
                onMobileLogin={() => onComplete('signup')}
                onEmailLogin={() => onComplete('login')}
            />
        );
    }

    switch (step) {
        case 1:
            return <OnboardingStep1 onNext={nextStep} onSkip={skipOnboarding} />;
        case 2:
            return <OnboardingStep2 onNext={nextStep} onSkip={skipOnboarding} />;
        case 3:
            return <OnboardingStep3 onNext={nextStep} onSkip={skipOnboarding} />;
        default:
            return null;
    }
}
