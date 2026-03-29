import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Sequence } from 'remotion';
import { Bell, Shield, Smartphone, Zap, MessageSquare, Speaker } from 'lucide-react';

const Screen = ({ children, title, subtitle, icon: Icon, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = spring({ frame, fps, config: { damping: 10 } });

    return (
        <AbsoluteFill className="bg-slate-900 flex flex-col items-center justify-center p-20 text-white">
            <div style={{ opacity, transform: `scale(${scale})` }} className="flex flex-col items-center text-center space-y-12">
                <div className={`p-8 rounded-[3rem] ${color} shadow-[0_0_80px_rgba(0,0,0,0.5)]`}>
                    <Icon size={100} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-7xl font-black tracking-tighter leading-none">{title}</h1>
                    <p className="text-3xl text-slate-400 font-medium max-w-4xl">{subtitle}</p>
                </div>
            </div>
            <div className="mt-20 w-full">
                {children}
            </div>
        </AbsoluteFill>
    );
};

export const PermissionVideo = () => {
    return (
        <AbsoluteFill className="bg-black">
            <Sequence durationInFrames={120}>
                <Intro />
            </Sequence>
            <Sequence from={120} durationInFrames={180}>
                <HowItWorks />
            </Sequence>
            <Sequence from={300} durationInFrames={180}>
                <WhyForeground />
            </Sequence>
            <Sequence from={480} durationInFrames={120}>
                <Conclusion />
            </Sequence>
        </AbsoluteFill>
    );
};

const Intro = () => (
    <Screen 
        title="Payment Alerts" 
        subtitle="Ensuring merchants never miss a payment, even when the phone is locked." 
        icon={Bell} 
        color="bg-blue-600" 
    />
);

const HowItWorks = () => {
    const frame = useCurrentFrame();
    const spr = spring({ frame, fps: 30 });
    return (
        <Screen 
            title="Real-time Voice Feedback" 
            subtitle="The app uses high-priority messaging to trigger instant voice alerts." 
            icon={Speaker} 
            color="bg-purple-600"
        >
            <div style={{ opacity: spr, transform: `translateY(${(1-spr)*50}px)` }} className="bg-white/10 p-10 rounded-3xl border border-white/20 text-2xl font-mono text-blue-300">
                // Logic: Server sends PUSH {'->'} App wakes up {'->'} Plays Audio
            </div>
        </Screen>
    );
};

const WhyForeground = () => (
    <Screen 
        title="Why Foreground Service?" 
        subtitle="Required to maintain audio playback and screen-wake integrity for critical financial notifications." 
        icon={Shield} 
        color="bg-emerald-600"
    />
);

const Conclusion = () => (
    <Screen 
        title="Google Play Compliance" 
        subtitle="This permission is used exclusively for time-critical, user-noticeable payment confirmations." 
        icon={Smartphone} 
        color="bg-slate-700" 
    />
);
