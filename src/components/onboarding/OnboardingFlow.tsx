import React, { useState, useEffect } from 'react';
import SplashStep from './SplashStep';
import StepContainer from './StepContainer';
import AuthEntry from './AuthEntry';
import { 
    CreditCard, 
    ShoppingCart, 
    Percent, 
    QrCode, 
    Smartphone, 
    ShieldCheck, 
    Lock, 
    CheckCircle2, 
    Zap,
    Banknote,
    ArrowRightLeft
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
    
    const TOTAL_STEPS = 4;

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
            return (
                <StepContainer
                    stepIndex={0}
                    totalSteps={TOTAL_STEPS}
                    title="💳 Unlock ₹10K–₹50K Instantly"
                    subtitle="No Credit Score Needed!"
                    footer="🚀 Start with Open Score Today"
                    ctaText="Next"
                    onNext={nextStep}
                    onSkip={skipOnboarding}
                >
                    <div className="relative group animate-in zoom-in duration-700">
                        <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
                            <CreditCard className="w-24 h-24 text-blue-600 opacity-10" strokeWidth={1.5} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
                                    <CreditCard className="w-32 h-32 text-blue-600 drop-shadow-xl animate-[float_3s_ease-in-out_infinite]" strokeWidth={1} />
                                    <Banknote className="w-16 h-16 text-green-500 absolute -bottom-4 -right-4 drop-shadow-lg animate-[float_4s_ease-in-out_infinite_500ms]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </StepContainer>
            );
        case 2:
            return (
                <StepContainer
                    stepIndex={1}
                    totalSteps={TOTAL_STEPS}
                    title="🛒 On Every Transfer, Earn Up to 2%!"
                    ctaText="Next"
                    onNext={nextStep}
                    onSkip={skipOnboarding}
                >
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                                <ShoppingCart className="w-10 h-10 text-blue-600" />
                            </div>
                            <ArrowRightLeft className="w-6 h-6 text-slate-300 animate-pulse" />
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center shadow-inner">
                                <Percent className="w-10 h-10 text-purple-600" />
                            </div>
                        </div>
                        <ListItem text="Instant Value Transfer" />
                        <ListItem text="Merchant Rewards up to 2% on Collections" />
                        <ListItem text="Fast Transfers – No Deductions" />
                    </div>
                </StepContainer>
            );
        case 3:
            return (
                <StepContainer
                    stepIndex={2}
                    totalSteps={TOTAL_STEPS}
                    title="Open Score, get instant Demand Credit Voucher"
                    footer="🚀 Your Financial Upgrade Starts Here!"
                    ctaText="Next"
                    onNext={nextStep}
                    onSkip={skipOnboarding}
                >
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-slate-50 animate-in slide-in-from-bottom-8 duration-700">
                                    <QrCode className="w-16 h-16 text-slate-800" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white animate-bounce pointer-events-none">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <ListItem text="Use via QR Transfer" />
                        <ListItem text="Transfer open score User" />
                        <ListItem text="Earn Cashback Daily" />
                    </div>
                </StepContainer>
            );
        case 4:
            return (
                <StepContainer
                    stepIndex={3}
                    totalSteps={TOTAL_STEPS}
                    title="🔐 100% Secure | Verified | Transparent"
                    footer="📲 Smart & Secure Finance for Everyone"
                    ctaText="Get Started"
                    onNext={nextStep}
                    onSkip={skipOnboarding}
                >
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-center mb-10">
                            <div className="relative">
                                <ShieldCheck className="w-32 h-32 text-green-500 drop-shadow-xl animate-[float_3s_ease-in-out_infinite]" strokeWidth={1} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Lock className="w-10 h-10 text-yellow-500" />
                                </div>
                            </div>
                        </div>
                        <ListItem text="Full KYC Protection" />
                        <ListItem text="Safe Wallet System" />
                        <ListItem text="Trusted Financial Partners" />
                    </div>
                </StepContainer>
            );
        default:
            return null;
    }
}
