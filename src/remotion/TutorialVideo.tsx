import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Sequence } from 'remotion';
import { Home, CreditCard, ShoppingBag, PieChart, ShieldCheck, Zap, Gift, Wallet, ArrowRight } from 'lucide-react';

const ScreenWrapper = ({ children, title, icon: Icon, color }: { children: React.ReactNode, title: string, icon: any, color: string }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const contentSpring = spring({ frame: frame - 10, fps, config: { damping: 10 } });

    return (
        <AbsoluteFill className="bg-slate-50 flex flex-col p-16">
            <div style={{ opacity: titleOpacity }} className="flex flex-col gap-6 mb-16 items-center text-center">
                <div className={`w-24 h-24 ${color} rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl`}>
                    <Icon size={48} />
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
            </div>
            <div style={{ transform: `translateY(${(1 - contentSpring) * 100}px)`, opacity: contentSpring }} className="flex-1">
                {children}
            </div>
        </AbsoluteFill>
    );
};

export const TutorialVideo = () => {
    return (
        <AbsoluteFill className="bg-white">
            <Sequence durationInFrames={150}>
                <HowToUse />
            </Sequence>
            <Sequence from={150} durationInFrames={150}>
                <Services />
            </Sequence>
            <Sequence from={300} durationInFrames={150}>
                <WhereToUse />
            </Sequence>
            <Sequence from={450} durationInFrames={150}>
                <WhySafe />
            </Sequence>
        </AbsoluteFill>
    );
};

const HowToUse = () => {
    const steps = [
        "Apply for credit",
        "Use Credit & Return As per plan",
        "Connect with registered businesses",
        "Purchase using credit & discounts",
        "Track transactions & earn rewards"
    ];

    return (
        <ScreenWrapper title="How to Use the App?" icon={Zap} color="bg-blue-600">
            <div className="space-y-10">
                {steps.map((step, i) => (
                    <StepItem key={i} index={i + 1} text={step} delay={30 + (i * 15)} />
                ))}
            </div>
        </ScreenWrapper>
    );
};

const Services = () => {
    const services = [
        "Discount services", "Cashback services", "Reward services",
        "Earning services", "Payout services", "Value-added services"
    ];

    return (
        <ScreenWrapper title="Services Available" icon={Gift} color="bg-emerald-600">
            <div className="space-y-8">
                {services.map((service, i) => (
                    <CardItem key={i} text={service} delay={30 + (i * 10)} />
                ))}
            </div>
        </ScreenWrapper>
    );
};

const WhereToUse = () => {
    const uses = [
        "Daily needs & shopping", "Business & bulk purchases",
        "Food & utilities", "Professional services",
        "Business growth", "Buying from vendors"
    ];

    return (
        <ScreenWrapper title="Where can it be used?" icon={ShoppingBag} color="bg-amber-500">
            <div className="space-y-8">
                {uses.map((use, i) => (
                    <CardItem key={i} text={use} delay={30 + (i * 10)} />
                ))}
            </div>
        </ScreenWrapper>
    );
};

const WhySafe = () => {
    const points = [
        "Membership-only access", "Verified businesses",
        "Transparent system", "Secure transactions"
    ];

    return (
        <ScreenWrapper title="Why Is It Safe?" icon={ShieldCheck} color="bg-rose-600">
            <div className="space-y-10">
                {points.map((point, i) => (
                    <StepItem key={i} text={point} delay={30 + (i * 15)} isPoint />
                ))}
            </div>
        </ScreenWrapper>
    );
};

const StepItem = ({ index, text, delay, isPoint }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const spr = spring({ frame: frame - delay, fps, config: { damping: 12 } });

    return (
        <div style={{ transform: `scale(${spr})`, opacity: spr }} className="flex items-center gap-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md">
            {!isPoint && (
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-3xl">
                    {index}
                </div>
            )}
            {isPoint && (
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={32} />
                </div>
            )}
            <p className="text-3xl font-black text-slate-800 leading-tight">{text}</p>
        </div>
    );
};

const CardItem = ({ text, delay }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const spr = spring({ frame: frame - delay, fps, config: { damping: 12 } });

    return (
        <div style={{ transform: `scale(${spr})`, opacity: spr }} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md flex items-center gap-6">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <p className="text-3xl font-black text-slate-800 leading-tight">{text}</p>
        </div>
    );
};
