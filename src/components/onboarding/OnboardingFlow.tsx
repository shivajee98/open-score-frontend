import React, { useState, useEffect } from 'react';
import SplashStep from './SplashStep';
import StepContainer from './StepContainer';
import AuthEntry from './AuthEntry';
import { BrandBadge } from './BrandComponents';
import { Package, ShieldCheck, TrendingUp, Zap, Building2 } from 'lucide-react';

interface OnboardingFlowProps {
    onComplete: (mode: 'login' | 'signup') => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState<'splash' | number | 'auth'>('splash');
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const seen = localStorage.getItem('hasSeenOnboarding') === 'true';
        setHasSeenOnboarding(seen);
        if (seen) {
            setStep('auth');
        }
    }, []);

    const nextStep = () => {
        if (typeof step === 'number') {
            if (step < 5) {
                setStep(step + 1);
            } else {
                setStep('auth');
            }
        }
    };

    const skipOnboarding = () => {
        setStep('auth');
    };

    if (hasSeenOnboarding === null) return null;

    if (step === 'splash') {
        return <SplashStep onComplete={() => setStep(hasSeenOnboarding ? 'auth' : 1)} />;
    }

    if (step === 'auth') {
        return (
            <AuthEntry
                onMobileLogin={() => onComplete('signup')}
                onEmailLogin={() => onComplete('login')}
            />
        );
    }

    // Onboarding Steps
    switch (step) {
        case 1:
            return (
                <StepContainer
                    stepIndex={0}
                    totalSteps={5}
                    title="Running a Business Needs Cash, Not Stress"
                    subtitle="Daily expenses shouldn’t wait for approvals or high interest."
                    ctaText="Next"
                    onNext={nextStep}
                >
                    <div className="relative group">
                        <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
                            <Building2 className="w-24 h-24 text-blue-600 opacity-10" />
                            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                                <Package className="w-16 h-16 text-blue-500 absolute -top-4 -left-4 animate-[float_3s_ease-in-out_infinite]" />
                                <Zap className="w-12 h-12 text-purple-500 absolute top-1/2 -right-8 animate-[float_4s_ease-in-out_infinite_500ms]" />
                                <ShieldCheck className="w-14 h-14 text-blue-600 absolute -bottom-4 left-1/2 animate-[float_3.5s_ease-in-out_infinite_1s]" />
                            </div>
                        </div>
                    </div>
                </StepContainer>
            );
        case 2:
            return (
                <StepContainer
                    stepIndex={1}
                    totalSteps={5}
                    title="Get Credit at 0% Interest"
                    subtitle="Open Score provides scheme-based budget support for MSMEs."
                    ctaText="Next"
                    onNext={nextStep}
                >
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-7xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent animate-[outline-to-solid_1s_ease-out_forwards]">
                            0%
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <BrandBadge text="0% Interest" />
                            <BrandBadge text="Fast Disbursal" />
                            <BrandBadge text="Trusted Schemes" />
                        </div>
                    </div>
                </StepContainer>
            );
        case 3:
            return (
                <StepContainer
                    stepIndex={2}
                    totalSteps={5}
                    title="Low CIBIL? Still Eligible."
                    subtitle="Your business performance matters more than your past credit score."
                    ctaText="Next"
                    onNext={nextStep}
                >
                    <div className="w-full max-w-[240px] space-y-4">
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-full opacity-30" />
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600 w-2/3 rounded-full animate-[grow-width_1.5s_ease-out_forwards]" />
                            <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-lg" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Muted</span>
                            <span>Growth Potential</span>
                        </div>
                    </div>
                </StepContainer>
            );
        case 4:
            return (
                <StepContainer
                    stepIndex={3}
                    totalSteps={5}
                    title="Simple. Transparent. Reliable."
                    subtitle="Applying for credit has never been this straightforward."
                    ctaText="Next"
                    onNext={nextStep}
                >
                    <div className="w-full space-y-8 pl-4">
                        {[
                            { step: 1, text: "Apply for credit" },
                            { step: 2, text: "Get approved instantly" },
                            { step: 3, text: "Spend via Open Score wallet" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 relative">
                                {i < 2 && <div className="absolute top-8 left-4 w-0.5 h-8 bg-slate-100" />}
                                <div className="w-8 h-8 rounded-full brand-gradient text-white flex items-center justify-center text-xs font-bold shrink-0 animate-in zoom-in duration-300" style={{ animationDelay: `${i * 300}ms` }}>
                                    {item.step}
                                </div>
                                <p className="font-bold text-slate-700">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </StepContainer>
            );
        case 5:
            return (
                <StepContainer
                    stepIndex={4}
                    totalSteps={5}
                    title="Designed for MSMEs"
                    subtitle="Powerful tools to help your business scale without the weight of high debt."
                    ctaText="Get Started"
                    onNext={nextStep}
                    onSkip={skipOnboarding}
                >
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {[
                            { icon: <ShieldCheck />, text: "No Hidden Charges" },
                            { icon: <TrendingUp />, text: "No Compound Interest" },
                            { icon: <Building2 />, text: "Built for Small Biz" },
                            { icon: <Package />, text: "Secure Wallet" }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 text-center animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="text-blue-600 w-6 h-6">{item.icon}</div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight leading-tight">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </StepContainer>
            );
        default:
            return null;
    }
}
