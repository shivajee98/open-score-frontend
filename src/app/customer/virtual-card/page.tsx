'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import {
    Shield,
    Camera,
    UploadCloud,
    X,
    Calendar,
    PiggyBank,
    Coins,
    Clock,
    Headphones,
    Award,
    ChevronRight,
    Crown,
    ChevronLeft,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    Smartphone,
    ArrowRight,
    Sparkles,
    Trophy,
    Gift,
    QrCode,
    Copy,
    Zap,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/loanUtils';
import { QRCodeSVG } from 'qrcode.react';

export default function VirtualCardActivationPage() {
    const router = useRouter();
    const { data: user } = useApi('/auth/me');
    const { data: requests, mutate } = useApi('/vault-cards/my-requests');
    
    const [step, setStep] = useState(1);
    const [paymentMode, setPaymentMode] = useState<'WALLET' | 'UPI' | null>(null);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeRequest = requests?.[0];

    useEffect(() => {
        if (requests && requests.length === 0) {
            router.push('/customer');
            return;
        }

        if (activeRequest) {
            if (activeRequest.status === 'PENDING_APPROVAL') {
                setStep(4);
                setPaymentMode('UPI'); 
            }
        }
    }, [requests, activeRequest, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleActivate = async () => {
        if (!paymentMode) return;
        if (paymentMode === 'UPI' && !proofImage) {
            toast.error('Please upload payment screenshot');
            return;
        }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('payment_mode', paymentMode);
            if (proofImage) fd.append('proof_image', proofImage);

            await apiFetch(`/vault-cards/${activeRequest.id}/activate`, {
                method: 'POST',
                body: fd
            });

            toast.success(paymentMode === 'WALLET' ? 'Card activated! Your exclusive asset is ready.' : 'Payment proof submitted! Awaiting verification.');
            mutate();
            setStep(4);
        } catch (err: any) {
            toast.error(err.message || 'Activation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const history = requests || [];
    const hasActiveRequest = activeRequest && ['INITIATED', 'PENDING_CHARGE', 'PENDING_PAYMENT', 'PENDING_APPROVAL'].includes(activeRequest.status);

    if (history.length === 0) {
        return (
            <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-white/20 mb-6">
                    <CreditCard size={32} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mb-2">No Active Cards</h2>
                <button 
                    onClick={() => router.push('/customer')}
                    className="px-8 py-4 bg-white text-[#020617] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!hasActiveRequest) {
        return (
            <div className="h-screen bg-[#020617] font-sans text-white overflow-hidden flex flex-col">
                <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-50">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60"><ArrowLeft size={20} /></button>
                    <h1 className="text-sm font-black uppercase tracking-widest text-white">Card History</h1>
                    <div className="w-10"></div>
                </div>

                <div className="px-6 max-w-md mx-auto space-y-4 flex-1 overflow-y-auto pb-20 scrollbar-hide">
                    {history.map((req: any) => (
                        <div key={req.id} className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        req.status === 'ACTIVATED' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                                    )}>
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Request ID</p>
                                        <p className="text-sm font-black text-white">#{req.id}</p>
                                    </div>
                                </div>
                                <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", req.status === 'ACTIVATED' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white")}>
                                    {req.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const upiId = "9161168840@uboi";
    const upiUrl = `upi://pay?pa=${upiId}&pn=Flip%20Flops&am=999&tn=Vault%20Card%20Activation`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("UPI ID copied!");
    };

    return (
        <div className="h-screen bg-[#020617] font-sans text-white overflow-hidden flex flex-col relative select-none">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[30%] right-[0%] w-[20%] aspect-square bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />

            {step === 1 && (
                <div className="flex-1 flex flex-col animate-in fade-in duration-700 relative overflow-hidden">
                    {/* Top Header */}
                    <div className="px-6 pt-10 pb-2 flex items-center justify-between shrink-0">
                        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 active:scale-90 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black tracking-widest shadow-[0_0_10px_rgba(37,99,235,0.4)]">NEW</div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">TITANIUM ELITE CARD</span>
                        </div>
                        <div className="w-8"></div>
                    </div>

                    {/* Content Container - Compact and non-scrolling if possible */}
                    <div className="flex-1 flex flex-col justify-between px-6 pb-6 pt-2 overflow-hidden">
                        
                        {/* Hero Headline */}
                        <div className="text-center mb-4">
                            <h1 className="text-3xl font-black italic tracking-tighter leading-none mb-1">
                                NEW CARDS.<br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">SMARTER</span> BENEFITS.
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wide">More Rewards. More Savings. Every Day.</p>
                        </div>

                        {/* Visual Card Pedestal Section */}
                        <div className="relative flex flex-col items-center justify-center flex-1 min-h-0 scale-90 sm:scale-100">
                            <div className="absolute w-[300px] h-12 bg-blue-600/10 bottom-[15%] rounded-[100%] blur-3xl" />
                            
                            {/* Floating "CLAIM NOW" Badge */}
                            <div className="absolute top-[5%] left-0 z-20 animate-bounce">
                                <div className="bg-[#0A0D1E] rounded-xl px-4 py-2 border border-[#FFD600]/30 shadow-[0_0_20px_rgba(255,214,0,0.3)] shadow-2xl rotate-[-4deg]">
                                    <p className="text-[8px] font-black text-indigo-400 tracking-widest mb-0.5 uppercase">CLAIM NOW</p>
                                    <h4 className="text-2xl font-black text-[#FFD600] italic leading-none">500</h4>
                                    <p className="text-[9px] font-black text-white tracking-widest uppercase">CASHBACK</p>
                                </div>
                            </div>

                            {/* Floating "YOUR NEW CARD" Badge */}
                            <div className="absolute top-[10%] right-[-5%] z-20 animate-pulse">
                                <div className="bg-gradient-to-r from-[#FFD600] to-[#FFB800] rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(255,214,0,0.4)] border border-yellow-400/50">
                                    <p className="text-[9px] font-black text-black uppercase tracking-widest italic">YOUR NEW CARD</p>
                                </div>
                            </div>

                            {/* The Card */}
                            <div className="relative z-10 w-[220px] aspect-[1.586/1] bg-[#1a1c1e] rounded-xl p-5 text-white shadow-2xl border border-white/5 transform rotate-[-8deg]">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={14} className="text-indigo-400" fill="currentColor" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black tracking-[0.2em] leading-none">VAULT</span>
                                            <span className="text-[5px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Titanium Series</span>
                                        </div>
                                    </div>
                                    <div className="px-1.5 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30">
                                        <p className="text-[6px] font-black uppercase tracking-widest text-indigo-300">Elite</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-center">
                                    <div className="w-8 h-6 bg-yellow-500/40 rounded-sm border border-yellow-500/10"></div>
                                </div>
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="max-w-[80px]">
                                        <p className="text-[5px] text-white/30 uppercase tracking-widest mb-0.5 leading-none">Card Holder</p>
                                        <p className="text-[9px] font-black uppercase truncate">{user?.name || 'Rahul Kumar'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-widest">•••• 8840</p>
                                        <p className="text-[6px] font-black text-slate-500 tracking-widest mt-0.5 uppercase">DEBIT</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pedestal Top */}
                            <div className="absolute bottom-[5%] w-[260px] h-16 bg-gradient-to-b from-blue-900/40 to-[#020617] border-t border-blue-600/30 rounded-[100%] z-0" />
                            
                            <div className="absolute bottom-[-10px] flex items-center gap-2">
                                <Sparkles size={10} className="text-[#FFD600]" />
                                <p className="text-[10px] font-bold text-white italic">Better Hai Pehle Cashback Lo!</p>
                                <Sparkles size={10} className="text-[#FFD600]" />
                            </div>
                        </div>

                        {/* Benefits Grid - Compact */}
                        <div className="space-y-4 mb-4 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
                                <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">AMAZING BENEFITS</h4>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-[#0A0D1E] rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                    <Calendar className="text-blue-500 mb-2" size={18} />
                                    <p className="text-[8px] font-bold text-slate-500 mb-0.5">Daily</p>
                                    <h5 className="text-[11px] font-black leading-none">100 - 200</h5>
                                </div>
                                <div className="bg-[#0A0D1E] rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                    <PiggyBank className="text-purple-500 mb-2" size={18} />
                                    <p className="text-[8px] font-bold text-slate-500 mb-0.5">Yearly Upto</p>
                                    <h5 className="text-[11px] font-black leading-none">75,000</h5>
                                </div>
                                <div className="bg-[#0A0D1E] rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                    <ShieldCheck className="text-blue-400 mb-2" size={18} />
                                    <p className="text-[8px] font-bold text-slate-500 mb-0.5">Smart Card</p>
                                    <h5 className="text-[11px] font-black leading-none italic">Smarter!</h5>
                                </div>
                            </div>
                        </div>

                        {/* Savings & Pricing Unified */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between mb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <Trophy className="text-yellow-500" size={20} />
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-bold text-slate-400 leading-none mb-0.5">Save Daily.</p>
                                    <p className="text-[11px] font-black text-yellow-500 tracking-tight leading-none italic">Bigger Savings Tomorrow.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-l border-white/10 pl-4 text-right">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-slate-600 line-through leading-none mb-0.5 italic">2,999</p>
                                    <p className="text-[16px] font-black text-blue-500 tracking-tighter leading-none italic">999</p>
                                </div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest max-w-[40px] leading-tight italic">ONE TIME PAY</p>
                            </div>
                        </div>

                        {/* CTA Section - Fixed Height at Bottom */}
                        <div className="relative shrink-0">
                            <div className="relative z-10">
                                <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-[#FFD600] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl border border-yellow-400 z-20 whitespace-nowrap">
                                    <Clock size={10} className="text-black" />
                                    <span className="text-[8px] font-black text-black uppercase tracking-widest italic">LIMITED OFFER – TODAY ONLY</span>
                                </div>
                                
                                {/* Floating Coins Decoration */}
                                <div className="absolute -top-4 -right-2 w-6 h-6 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-bounce z-0 flex items-center justify-center border border-yellow-300">
                                    <Coins size={12} className="text-yellow-900" />
                                </div>
                                <div className="absolute top-6 -left-4 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse z-0 border border-yellow-200" />
                                <div className="absolute -bottom-2 -right-4 w-5 h-5 bg-yellow-600 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.4)] animate-float z-0 border border-yellow-400" />

                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full h-16 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500 flex items-center justify-between px-6 text-white shadow-[0_0_35px_rgba(37,99,235,0.5)] group active:scale-95 transition-all relative z-10 italic border border-white/10"
                                >
                                    <div className="flex flex-col items-start">
                                        <h4 className="text-base font-black tracking-tighter uppercase leading-none italic">CLAIM <span className="text-xl">500</span> & GET CARD</h4>
                                        <p className="text-[8px] font-bold text-white/70 mt-0.5 uppercase tracking-widest italic">⚡ Instant Cashback on Activation ⚡</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                        <ArrowRight size={20} strokeWidth={3} />
                                    </div>
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <p className="text-[9px] font-bold text-emerald-500 italic tracking-wide">Safe. Secure. 100% Yours.</p>
                            </div>
                            
                            {/* Trust Footer - Micro */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 opacity-30">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={10} />
                                    <span className="text-[7px] font-black uppercase tracking-widest italic">100% Secure</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={10} />
                                    <span className="text-[7px] font-black uppercase tracking-widest italic">Exclusive</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Headphones size={10} />
                                    <span className="text-[7px] font-black uppercase tracking-widest italic">24x7 Help</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 relative overflow-y-auto pb-20 scrollbar-hide">
                    {/* Background Glows */}
                    <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Header */}
                    <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md shrink-0">
                        <button onClick={() => setStep(1)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 italic">Activate Your Card</h1>
                        <div className="w-10" />
                    </header>

                    <main className="max-w-xl mx-auto px-6 flex-1">
                        
                        {/* Hero Section */}
                        <section className="text-center mt-4 relative mb-12">
                            <h2 className="text-3xl italic font-black leading-tight tracking-tight text-white">
                                ACTIVATE NOW & <br />
                                GET AMAZING <br />
                                <span className="text-5xl uppercase bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                                    CASHBACK!
                                </span>
                            </h2>
                            
                            <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-purple-200/60 uppercase tracking-widest font-black italic">
                                <Zap className="w-3 h-3 fill-purple-400 text-purple-400" />
                                More Rewards. More Savings. Every Day.
                                <Zap className="w-3 h-3 fill-purple-400 text-purple-400" />
                            </div>

                            {/* Floating Card Visual */}
                            <div className="relative mt-16 mb-20 perspective-1000">
                                {/* The Pedestal */}
                                <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-56 h-14 bg-purple-900/40 rounded-full blur-2xl animate-pulse" />
                                <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 w-64 h-14 bg-gradient-to-b from-purple-600/40 to-transparent rounded-[50%] border-t border-purple-500/30 shadow-[0_-15px_30px_rgba(168,85,247,0.2)]" />
                                
                                {/* The Badge on Pedestal */}
                                <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 z-20 bg-[#020617] border border-purple-500/50 px-5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                    <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[8px] font-black tracking-widest uppercase text-purple-200 italic">Exclusive. Premium. Elite.</span>
                                </div>

                                {/* The Card */}
                                <div className="relative z-10 w-72 h-44 mx-auto bg-neutral-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden transform rotate-[-12deg] animate-float transition-transform duration-700 ease-out group">
                                    {/* Card Texture Overlay */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
                                    
                                    <div className="relative p-6 h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                                                    <Zap className="w-4 h-4 fill-white text-white" />
                                                </div>
                                                <div className="leading-none text-left">
                                                    <p className="text-[11px] font-black tracking-tighter text-white">VAULT</p>
                                                    <p className="text-[7px] text-cyan-400 font-bold uppercase tracking-widest">Titanium Series</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/10 px-2 py-1 rounded text-[8px] font-black border border-white/20 text-white italic tracking-widest">ELITE</div>
                                        </div>

                                        <div className="mt-4">
                                            {/* Chip */}
                                            <div className="w-9 h-7 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-md shadow-inner mb-4 flex items-center justify-center">
                                                <div className="grid grid-cols-2 gap-px w-full h-full p-1 opacity-50">
                                                    <div className="border-r border-b border-black/20" />
                                                    <div className="border-b border-black/20" />
                                                    <div className="border-r border-black/20" />
                                                    <div />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-left">
                                                    <p className="text-[13px] font-mono tracking-[0.2em] text-white/90">•••• •••• •••• 8840</p>
                                                    <div className="mt-3">
                                                        <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Card Holder</p>
                                                        <p className="text-[11px] font-black text-white uppercase italic">{user?.name || 'Valued Member'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-black text-white/30 tracking-widest uppercase italic">Debit</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Pricing Banner */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between mb-10 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-500" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight italic">One Time</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Asset Charge</p>
                                </div>
                            </div>
                            <div className="text-right border-l border-white/10 pl-6">
                                <p className="text-3xl font-black text-white italic">999</p>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">Safe Transaction</p>
                            </div>
                        </section>

                        {/* Activation Section Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300 whitespace-nowrap italic">Choose how you want to activate</h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                        </div>

                        {/* Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            
                            {/* Wallet Card */}
                            <div 
                                onClick={() => setPaymentMode('WALLET')}
                                className={cn(
                                    "relative group cursor-pointer transition-all h-full",
                                    paymentMode === 'WALLET' ? "scale-[1.02]" : "hover:scale-[1.01]"
                                )}
                            >
                                {/* Badge */}
                                <div className="absolute -top-1 -right-1 z-20 overflow-hidden rounded-bl-xl rounded-tr-xl">
                                   <div className="bg-[#39ff14] text-black text-[7px] font-black px-4 py-1.5 uppercase rotate-45 translate-x-4 -translate-y-1">Best For You</div>
                                </div>
                                
                                <div className={cn(
                                    "bg-black border-2 rounded-3xl p-6 relative overflow-hidden transition-all flex flex-col h-full",
                                    paymentMode === 'WALLET' ? "border-[#39ff14] shadow-[0_0_30px_rgba(57,255,20,0.15)]" : "border-[#39ff14]/30 hover:border-[#39ff14]"
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/5 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <div className="flex items-center gap-3 mb-6 text-left">
                                        <div className="p-3 bg-[#39ff14]/20 rounded-2xl border border-[#39ff14]/30">
                                            <Wallet className="w-6 h-6 text-[#39ff14]" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 uppercase font-black italic">Activate via</p>
                                            <p className="font-black text-[#39ff14] uppercase tracking-wider text-lg">Wallet</p>
                                        </div>
                                    </div>

                                    <div className="mb-6 text-left">
                                        <p className="text-sm text-gray-400 font-black italic uppercase">Upto <span className="text-3xl text-white font-black italic">200</span> Cashback</p>
                                        <p className="text-[9px] text-[#39ff14]/80 font-black uppercase tracking-widest mt-1">on wallet activation</p>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1 text-left">
                                        {[
                                            { icon: <Award className="w-4 h-4" />, text: "Get upto 200 cashback instantly" },
                                            { icon: <Zap className="w-4 h-4" />, text: "Instant activation with wallet" },
                                            { icon: <ShieldCheck className="w-4 h-4" />, text: "100% secure & safe transactions" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="text-[#39ff14]/50 border border-[#39ff14]/20 p-1.5 rounded-full">{item.icon}</div>
                                                <p className="text-[10px] text-gray-400 font-black italic uppercase tracking-tight">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {paymentMode === 'WALLET' ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleActivate(); }}
                                            disabled={isSubmitting}
                                            className="w-full bg-[#39ff14] hover:bg-[#32e012] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(57,255,20,0.3)] transition-all transform active:scale-95"
                                        >
                                            {isSubmitting ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Award className="w-5 h-5" /> CLAIM NOW <ChevronRight className="w-4 h-4" /></>}
                                        </button>
                                    ) : (
                                        <p className="text-center mt-3 text-[9px] text-[#39ff14] font-black uppercase tracking-widest italic animate-pulse">Click to Select</p>
                                    )}
                                </div>
                            </div>

                            {/* UPI Card */}
                            <div 
                                onClick={() => setPaymentMode('UPI')}
                                className={cn(
                                    "relative group cursor-pointer transition-all h-full",
                                    paymentMode === 'UPI' ? "scale-[1.02]" : "hover:scale-[1.01]"
                                )}
                            >
                                {/* Badge */}
                                <div className="absolute -top-1 -right-1 z-20 overflow-hidden rounded-bl-xl rounded-tr-xl">
                                   <div className="bg-[#00d2ff] text-black text-[7px] font-black px-4 py-1.5 uppercase rotate-45 translate-x-4 -translate-y-1">Recommended</div>
                                </div>

                                <div className={cn(
                                    "bg-black border-2 rounded-3xl p-6 relative overflow-hidden transition-all flex flex-col h-full",
                                    paymentMode === 'UPI' ? "border-[#00d2ff] shadow-[0_0_30px_rgba(0,210,255,0.15)]" : "border-[#00d2ff]/30 hover:border-[#00d2ff]"
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d2ff]/5 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <div className="flex items-center gap-3 mb-6 text-left">
                                        <div className="p-3 bg-[#00d2ff]/20 rounded-2xl border border-[#00d2ff]/30 flex items-center justify-center">
                                            <span className="font-black italic text-lg tracking-tighter text-[#00d2ff]">UPI</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 uppercase font-black italic">Activate via</p>
                                            <p className="font-black text-[#00d2ff] uppercase tracking-wider text-lg">UPI</p>
                                        </div>
                                    </div>

                                    <div className="mb-6 text-left">
                                        <p className="text-sm text-gray-400 font-black italic uppercase">Flat <span className="text-3xl text-white font-black italic">500</span> Cashback</p>
                                        <p className="text-[9px] text-[#00d2ff]/80 font-black uppercase tracking-widest mt-1">on UPI activation</p>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1 text-left">
                                        {[
                                            { icon: <Award className="w-4 h-4" />, text: "Get flat 500 cashback instantly" },
                                            { icon: <Zap className="w-4 h-4" />, text: "Instant activation with UPI" },
                                            { icon: <ShieldCheck className="w-4 h-4" />, text: "100% secure vault processing" },
                                            { icon: <Smartphone className="w-4 h-4" />, text: "Works with all major UPI Apps" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="text-[#00d2ff]/50 border border-[#00d2ff]/20 p-1.5 rounded-full">{item.icon}</div>
                                                <p className="text-[10px] text-gray-400 font-black italic uppercase tracking-tight">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {paymentMode === 'UPI' ? (
                                        <div className="space-y-6 pt-6 border-t border-white/10 animate-in fade-in zoom-in-95 duration-500">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-white rounded-3xl shadow-2xl mb-4">
                                                    <QRCodeSVG value={upiUrl} size={150} level="M" />
                                                </div>
                                                <div className="w-full p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10">
                                                    <div className="flex flex-col text-left">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Merchant UPI ID</p>
                                                        <p className="text-[11px] font-black text-white italic">{upiId}</p>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(upiId); }} className="p-3 bg-blue-500 text-white rounded-xl shadow-lg active:scale-90 transition-all"><Copy size={16} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Payment Screenshot</label>
                                                {previewUrl ? (
                                                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#00d2ff] aspect-video group">
                                                        <img src={previewUrl} className="w-full h-full object-cover" />
                                                        <button onClick={() => { setProofImage(null); setPreviewUrl(null); }} className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-xl shadow-lg"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-2xl hover:border-[#00d2ff] hover:bg-[#00d2ff]/5 transition-all cursor-pointer group">
                                                            <Camera className="text-slate-600 group-hover:text-[#00d2ff] mb-2" size={24} />
                                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest italic">Camera</span>
                                                            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                                        </label>
                                                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-2xl hover:border-[#00d2ff] hover:bg-[#00d2ff]/5 transition-all cursor-pointer group">
                                                            <UploadCloud className="text-slate-600 group-hover:text-[#00d2ff] mb-2" size={24} />
                                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest italic">Gallery</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleActivate(); }}
                                                disabled={!proofImage || isSubmitting}
                                                className="w-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,210,255,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                            >
                                                {isSubmitting ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Award className="w-5 h-5" /> CLAIM NOW <ChevronRight className="w-4 h-4" /></>}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-center mt-3 text-[9px] text-[#00d2ff] font-black uppercase tracking-widest italic animate-pulse">Click to Select</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Why Activate Today Section Footer */}
                        <section className="mt-16 pb-12">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 italic">Why Activate Today?</h4>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400 shadow-inner">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-white mb-1 italic">100% Secure</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Vault Guarded</p>
                                </div>

                                <div className="text-center border-x border-white/5 px-2">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400 shadow-inner">
                                        <Zap className="w-7 h-7 fill-purple-400/20" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-white mb-1 italic">Instant Reward</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Live Cashback</p>
                                </div>

                                <div className="text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400 shadow-inner">
                                        <Award className="w-7 h-7" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-white mb-1 italic">Exclusive</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Elite Status</p>
                                </div>
                            </div>
                        </section>
                    </main>

                    <style dangerouslySetInnerHTML={{ __html: `
                        .perspective-1000 { perspective: 1000px; }
                        @keyframes float {
                            0%, 100% { transform: translateY(0) rotate(-12deg); }
                            50% { transform: translateY(-15px) rotate(-10deg); }
                        }
                        .animate-float {
                            animation: float 6s ease-in-out infinite;
                        }
                    `}} />
                </div>
            )}

            {step === 4 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 px-8">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-8 shadow-xl shadow-emerald-500/10 animate-bounce">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-4 leading-none">
                        {paymentMode === 'WALLET' ? 'Card Activated!' : 'Received!'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 max-w-[240px] mx-auto leading-relaxed mb-12 italic">
                        {paymentMode === 'WALLET' ? 'Your Titanium card is now live. Enjoy.' : 'Payment is being verified. Your card will be active in 24h.'}
                    </p>
                    <button onClick={() => router.push('/customer')} className="w-full h-14 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all italic">Back to Home</button>
                </div>
            )}
        </div>
    );
}
