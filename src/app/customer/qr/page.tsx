'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import QRCode from 'react-qr-code';
import { Share2, Copy, Check, Home, Smartphone, QrCode, Receipt, Link2, X, Scan, ArrowLeft, Landmark, Zap } from 'lucide-react';

export default function CustomerQR() {
    const router = useRouter();
    const [qrData, setQrData] = useState('');
    const [physicalQrs, setPhysicalQrs] = useState<string[]>([]);
    const [hasMappedWithAgent, setHasMappedWithAgent] = useState(false);
    const [activeQrIndex, setActiveQrIndex] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Mapping State
    const [isMapping, setIsMapping] = useState(false);
    const [mapCode, setMapCode] = useState('');
    const [agentCode, setAgentCode] = useState('');
    const [mapStatus, setMapStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verifyingAgent, setVerifyingAgent] = useState(false);
    const [agentError, setAgentError] = useState('');
    const [referrerName, setReferrerName] = useState('');
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef<any>(null);

    // Debounced Agent Check
    useEffect(() => {
        if (agentCode.length >= 4) {
            setVerifyingAgent(true);
            setAgentError('');
            setReferrerName('');

            const timer = setTimeout(async () => {
                try {
                    const data = await apiFetch('/referral/verify-code', {
                        method: 'POST',
                        body: JSON.stringify({ code: agentCode.toUpperCase() }),
                        skipAuthCheck: true
                    });
                    if (data.valid) {
                        setReferrerName(data.referrer_name);
                        setAgentError('');
                    } else {
                        setAgentError('Invalid agent code');
                    }
                } catch (err: any) {
                    setAgentError('Invalid agent code');
                } finally {
                    setVerifyingAgent(false);
                }
            }, 600); // 600ms debounce

            return () => clearTimeout(timer);
        } else {
            setVerifyingAgent(false);
            setAgentError('');
            setReferrerName('');
        }
    }, [agentCode]);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                if (scannerRef.current.getState() === 2) {
                    scannerRef.current.stop().catch(() => { });
                }
                scannerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        apiFetch('/payment/qr').then((data: any) => {
            setQrData(data.qr_data);
            if (data.physical_qrs) setPhysicalQrs(data.physical_qrs);
            if (typeof data.has_mapped_with_agent !== 'undefined') setHasMappedWithAgent(data.has_mapped_with_agent);
        });

        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            // Fallback: Fetch user if not in local storage
            apiFetch('/auth/me').then(u => {
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
            }).catch(e => console.error('Failed to load user', e));
        }
    }, []);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Payout', href: '/customer/payout', icon: <Landmark className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
        }
    };

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
        }
    };

    const copyVPA = () => {
        const vpa = `${user?.mobile_number}@openscore`;
        navigator.clipboard.writeText(vpa);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const startScanner = async () => {
        setScanning(true);
        const { Html5Qrcode } = await import('html5-qrcode');
        setTimeout(async () => {
            try {
                if (!document.getElementById("reader")) return;

                if (scannerRef.current) {
                    try {
                        if (scannerRef.current.getState() === 2) {
                            await scannerRef.current.stop();
                        }
                    } catch (e) { }
                    scannerRef.current = null;
                }

                const instance = new Html5Qrcode("reader");
                scannerRef.current = instance;
                await instance.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        let finalId = decodedText;
                        if (decodedText.includes('openscore.msmeloan.sbs/qr')) {
                            try {
                                const url = new URL(decodedText);
                                const idFromUrl = url.searchParams.get('id');
                                if (idFromUrl) finalId = idFromUrl;
                            } catch (e) {
                                console.error("URL Parse error:", e);
                            }
                        }
                        setMapCode(finalId);
                        stopScanner();
                    },
                    () => { }
                );
            } catch (err) {
                console.error(err);
                setScanning(false);
            }
        }, 100);
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.getState() === 2) {
                    await scannerRef.current.stop();
                }
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleMapQr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (agentCode && agentError) return;
        setMapStatus('loading');
        try {
            await apiFetch('/merchant/link-qr', {
                method: 'POST',
                body: JSON.stringify({ 
                    code: mapCode,
                    agent_referral_code: agentCode || undefined
                })
            });
            setMapStatus('success');
            // Refresh QR data
            apiFetch('/payment/qr').then((data: any) => {
                setQrData(data.qr_data);
                if (data.physical_qrs) setPhysicalQrs(data.physical_qrs);
                if (typeof data.has_mapped_with_agent !== 'undefined') setHasMappedWithAgent(data.has_mapped_with_agent);
            });
            setTimeout(() => {
                setIsMapping(false);
                setMapStatus('idle');
                setMapCode('');
                setAgentCode('');
            }, 2000);
        } catch (err) {
            setMapStatus('error');
            setTimeout(() => setMapStatus('idle'), 3000);
        }
    };

    const isMerchant = user?.role === 'MERCHANT';

    return (
        <DashboardLayout title="Receive Money" navItems={navItems}>
            <div className="max-w-md mx-auto space-y-6 relative pb-20">
                <div className="bg-gradient-to-br from-[#0F3935] via-[#10403B] to-[#041C1A] rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl shadow-[#0F3935]/40 border border-emerald-500/20 relative overflow-hidden text-white group">
                    {/* CSS-based Background Patterns for Vibrancy */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -mr-20 -mt-20 mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -ml-20 -mb-20 mix-blend-screen"></div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Zap size={12} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                            <h4 className="text-emerald-300 font-black text-[10px] uppercase tracking-[0.3em]">MSME SHAKTI</h4>
                        </div>

                        <h2 className="text-4xl font-black uppercase tracking-tight mb-2 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-100">
                            OPEN SCORE
                        </h2>
                        <p className="text-emerald-200/80 text-xs font-bold uppercase tracking-[0.15em] mb-10">
                            Unlock Cashback Rewards!
                        </p>

                        {/* QR Code Container (Slider) */}
                        <div className="relative w-72 bg-white rounded-[2rem] p-4 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col items-center mb-10 transition-transform duration-500 hover:scale-[1.02]">
                            {/* Animated Border Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-600 rounded-[2.2rem] opacity-30 blur-md animate-pulse"></div>

                            {/* Left Navigation Arrow */}
                            {physicalQrs.length > 0 && activeQrIndex > 0 && (
                                <button 
                                    onClick={handleScrollLeft}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-slate-800/80 backdrop-blur text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                            )}

                            {/* Horizontal scrolling container */}
                            <div 
                                ref={scrollContainerRef}
                                className="relative w-full flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                onScroll={(e) => {
                                    const el = e.currentTarget;
                                    const index = Math.round(el.scrollLeft / el.clientWidth);
                                    setActiveQrIndex(index);
                                }}
                            >
                                {/* Default Digital QR */}
                                <div className="w-full flex-shrink-0 snap-center flex justify-center p-2">
                                    <div className="w-full bg-white rounded-[1.6rem] flex items-center justify-center p-3 border border-slate-100 overflow-hidden aspect-square">
                                        {qrData ? (
                                            <QRCode
                                                value={qrData}
                                                size={256}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                viewBox={`0 0 256 256`}
                                                level="H"
                                            />
                                        ) : (
                                            <div className="animate-pulse w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2">
                                                <QrCode className="text-slate-300 w-12 h-12" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading QR...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Physical QRs */}
                                {physicalQrs.map((code, idx) => (
                                    <div key={idx} className="w-full flex-shrink-0 snap-center flex justify-center p-2">
                                        <div className="w-full bg-white rounded-[1.6rem] flex items-center justify-center p-3 border border-slate-100 overflow-hidden aspect-square">
                                            <QRCode
                                                value={code} // Contains the physical mapping code
                                                size={256}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                viewBox={`0 0 256 256`}
                                                level="H"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Navigation Arrow */}
                            {physicalQrs.length > 0 && activeQrIndex < physicalQrs.length && (
                                <button 
                                    onClick={handleScrollRight}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-slate-800/80 backdrop-blur text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                                >
                                    <ArrowLeft size={16} className="rotate-180" />
                                </button>
                            )}
                            
                            {/* Pagination Dots */}
                            {physicalQrs.length > 0 && (
                                <div className="flex justify-center gap-1.5 mt-2 z-10 w-full relative">
                                    {Array.from({ length: physicalQrs.length + 1 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeQrIndex ? 'w-4 bg-emerald-500' : 'w-1.5 bg-slate-200'}`} 
                                        />
                                    ))}
                                </div>
                            )}
                            
                            {physicalQrs.length > 0 && (
                                <p className="text-[9px] text-emerald-800/80 font-black tracking-widest uppercase mt-3 w-full text-center z-10 relative">
                                    {activeQrIndex === 0 ? 'Digital QR' : `Physical QR #${activeQrIndex}`}
                                </p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
                            <h3 className="relative inline-block px-4 bg-[#0F3935] text-2xl font-black uppercase tracking-[0.2em] mb-2 text-white text-shadow-lg z-10">
                                SCAN & PAY
                            </h3>
                        </div>

                        <p className="text-emerald-100/70 text-[10px] font-medium max-w-[200px] leading-relaxed mb-8 mt-2">
                            Get <span className="text-[#FFD700] font-black">Instant Cashback</span> on Every Transaction via Open Score
                        </p>

                        <div className="w-full flex flex-col items-center gap-4">
                            <div
                                onClick={copyVPA}
                                className="w-full py-3 bg-emerald-950/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-emerald-900/50 transition-colors active:scale-95 group/vpa"
                            >
                                <span className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase group-hover/vpa:text-white transition-colors">
                                    {user?.mobile_number}@openscore
                                </span>
                                <Copy size={12} className="text-emerald-500 group-hover/vpa:text-white transition-colors" />
                            </div>

                            <div className="flex items-center gap-2 opacity-60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-500">
                                    Powered by MSME Shakti
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-white text-[#0F3935] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 shadow-xl shadow-slate-200">
                        <Share2 size={16} /> Share QR
                    </button>
                    {user?.role === 'MERCHANT' && (
                        <button
                            onClick={() => setIsMapping(true)}
                            className="py-4 bg-[#0F3935] text-emerald-400 border border-emerald-500/30 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#092220] transition-all active:scale-95 shadow-xl shadow-black/20"
                        >
                            <Link2 size={16} /> Map Physical
                        </button>
                    )}
                </div>

                {/* Mapping Modal */}
                {isMapping && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Map Physical QR</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link your shop QR Code</p>
                                </div>
                                <button onClick={() => { setIsMapping(false); stopScanner(); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {scanning ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-900 shadow-xl">
                                        <div id="reader" className="w-full h-64"></div>
                                        <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-xl pointer-events-none animate-pulse"></div>
                                    </div>
                                    <button onClick={stopScanner} className="w-full py-3 bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Cancel Scanner</button>
                                </div>
                            ) : (
                                <form onSubmit={handleMapQr} className="space-y-6">
                                    <button
                                        type="button"
                                        onClick={startScanner}
                                        className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-400 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Scan size={24} />
                                        </div>
                                        <span className="uppercase tracking-widest text-[10px]">Tap to Scan QR Camera</span>
                                    </button>

                                    <div className="relative flex items-center">
                                        <div className="flex-grow border-t border-slate-100"></div>
                                        <span className="flex-shrink-0 mx-4 text-slate-300 text-[9px] font-black uppercase tracking-widest">Or Enter ID Manually</span>
                                        <div className="flex-grow border-t border-slate-100"></div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">QR Code ID</label>
                                        <input
                                            autoFocus
                                            value={mapCode}
                                            onChange={(e) => setMapCode(e.target.value)}
                                            placeholder="Ex: MSME-8839"
                                            className="w-full p-4 bg-slate-50 rounded-xl font-black text-center text-lg tracking-widest border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-all uppercase placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                    
                                    {!hasMappedWithAgent && (
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Agent Referral Code (Optional)</label>
                                            <input
                                                value={agentCode}
                                                onChange={(e) => setAgentCode(e.target.value)}
                                                placeholder="Enter Agent's Code"
                                                className={`w-full p-4 bg-slate-50 rounded-xl font-bold text-center text-sm tracking-widest border focus:ring-0 outline-none transition-all uppercase placeholder:text-slate-300 ${agentError ? 'border-rose-500 bg-rose-50/50' : referrerName ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 focus:border-emerald-500'}`}
                                            />
                                            {verifyingAgent && <p className="text-[9px] text-blue-500 font-bold mt-1 ml-1 animate-pulse uppercase tracking-[0.15em]">Verifying Agent...</p>}
                                            {agentError && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-[0.15em]">{agentError}</p>}
                                            {referrerName && <p className="text-[9px] text-emerald-600 font-black mt-1 ml-1 uppercase tracking-[0.15em]">Agent: {referrerName}</p>}
                                        </div>
                                    )}

                                    <button
                                        disabled={mapStatus === 'loading' || !mapCode || verifyingAgent || (!!agentCode && !!agentError)}
                                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${mapStatus === 'success' ? 'bg-emerald-500' :
                                            mapStatus === 'error' ? 'bg-rose-500' :
                                                (!!agentCode && !!agentError) ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                                            }`}
                                    >
                                        {mapStatus === 'loading' ? 'Verifying...' :
                                            mapStatus === 'success' ? <><Check size={16} /> Linked Successfully</> :
                                                mapStatus === 'error' ? 'Invalid QR Code' : 'Link QR Code'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
