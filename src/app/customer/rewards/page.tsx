'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Gift, PartyPopper, Sparkles, Trophy, ArrowLeft, Scan, X, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import { toast } from '@/components/ui/Toast';

export default function RewardsPage() {
    const router = useRouter();
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalEarned, setTotalEarned] = useState(0);

    // Coupon Mapping/Claiming State
    const [isClaiming, setIsClaiming] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            // Updated to fetch actual transactions related to rewards/coupons if needed, 
            // but for now, we'll keep the mock or check if there's an actual endpoint.
            // Since we just added coupons, we should definitely show those claims.
            
            const res = await apiFetch('/wallet/transactions?type=CREDIT');
            const data = res.data || [];
            
            // Filter reward transactions (Coupon Cashback, Welcome Bonus, etc)
            const rewardTx = data.filter((tx: any) => 
                ['COUPON_CASHBACK', 'WELCOME_BONUS', 'REFERRAL_BONUS'].includes(tx.source_type)
            ).map((tx: any) => ({
                id: tx.id,
                type: tx.source_type === 'COUPON_CASHBACK' ? 'Coupon' : 'Bonus',
                amount: tx.amount,
                description: tx.description || 'Reward Credit',
                date: new Date(tx.created_at).toLocaleDateString(),
                status: 'credited'
            }));

            setRewards(rewardTx);
            const total = rewardTx.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
            setTotalEarned(total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        setScanning(true);
        const { Html5Qrcode } = await import('html5-qrcode');
        setTimeout(async () => {
            try {
                if (!document.getElementById("reader")) return;
                
                if (scannerRef.current) {
                    try {
                        if (scannerRef.current.getState() === 2) await scannerRef.current.stop();
                    } catch (e) { }
                    scannerRef.current = null;
                }

                const instance = new Html5Qrcode("reader");
                scannerRef.current = instance;
                await instance.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        setCouponCode(decodedText);
                        stopScanner();
                        handleClaimCoupon(null, decodedText);
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
                if (scannerRef.current.getState() === 2) await scannerRef.current.stop();
            } catch (e) { }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleClaimCoupon = async (e: React.FormEvent | null, codeOverride?: string) => {
        if (e) e.preventDefault();
        const finalCode = codeOverride || couponCode;
        if (!finalCode) return;

        setClaimStatus('loading');
        try {
            const res = await apiFetch('/auth/coupons/claim', {
                method: 'POST',
                body: JSON.stringify({ code: finalCode })
            });
            
            setClaimStatus('success');
            toast.success(`₹${res.amount} Cashback Claimed!`);
            
            // Refresh rewards
            loadRewards();
            
            setTimeout(() => {
                setIsClaiming(false);
                setClaimStatus('idle');
                setCouponCode('');
            }, 2000);
        } catch (err: any) {
            setClaimStatus('error');
            toast.error(err.message || 'Failed to claim coupon');
            setTimeout(() => setClaimStatus('idle'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-4 pt-12 pb-20 rounded-b-[2.5rem] shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <div className="relative z-10">
                    <button onClick={() => router.push('/customer')} className="mb-6 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-2 mb-6 text-white">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <PartyPopper size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">OpenScore Rewards</h1>
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Loyalty & Cashback</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mt-4 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 px-1">Total Savings</p>
                                <p className="text-4xl font-black text-white tracking-tighter">₹{totalEarned}</p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-400 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                <Trophy size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-10 relative z-20 space-y-6">
                {/* Claim Coupon Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Gift size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Have a Coupon?</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Claim your cashback now</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsClaiming(true)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Scan size={18} /> Claim Coupon
                    </button>
                </div>

                {/* Rewards List */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100 min-h-[300px]">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent History</h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Rewards...</p>
                        </div>
                    ) : rewards.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Sparkles className="text-slate-200" size={32} />
                            </div>
                            <p className="text-slate-400 font-bold text-sm">No rewards yet</p>
                            <p className="text-slate-300 text-[10px] mt-1 font-medium px-8">Coupons you claim will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rewards.map((reward) => (
                                <div key={reward.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        reward.type === 'Coupon' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                                    )}>
                                        {reward.type === 'Coupon' ? <Gift size={24} /> : <Sparkles size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 text-sm leading-tight">{reward.description}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{reward.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-base text-indigo-600">₹{parseFloat(reward.amount).toFixed(0)}</p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Credit</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Claim Modal */}
            {isClaiming && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Claim Reward</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter coupon code manually or scan</p>
                            </div>
                            <button 
                                onClick={() => { setIsClaiming(false); stopScanner(); }} 
                                className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {scanning ? (
                            <div className="space-y-6">
                                <div className="relative rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-2xl aspect-square">
                                    <div id="reader" className="w-full h-full"></div>
                                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-2xl pointer-events-none animate-pulse"></div>
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Scanner</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={stopScanner} 
                                    className="w-full py-4 bg-slate-100 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl text-slate-500 hover:bg-slate-200 transition-all"
                                >
                                    Switch to Keyboard
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => handleClaimCoupon(e)} className="space-y-8">
                                <button
                                    type="button"
                                    onClick={startScanner}
                                    className="w-full py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] font-black text-slate-400 flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-600">
                                        <Scan size={32} />
                                    </div>
                                    <span className="uppercase tracking-[0.2em] text-[10px]">Open Camera Scanner</span>
                                </button>

                                <div className="relative flex items-center px-4">
                                    <div className="flex-grow border-t border-slate-100"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">Or Type Manually</span>
                                    <div className="flex-grow border-t border-slate-100"></div>
                                </div>

                                <div>
                                    <input
                                        autoFocus
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="CODE-HERE"
                                        className="w-full p-5 bg-slate-50 rounded-2xl font-black text-center text-xl tracking-[0.1em] border-2 border-slate-100 focus:border-indigo-600 focus:bg-white outline-none transition-all uppercase placeholder:text-slate-200"
                                        required
                                    />
                                </div>

                                <button
                                    disabled={claimStatus === 'loading' || !couponCode}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2",
                                        claimStatus === 'success' ? 'bg-emerald-500' :
                                        claimStatus === 'error' ? 'bg-rose-500' :
                                        'bg-slate-900 hover:bg-slate-800'
                                    )}
                                >
                                    {claimStatus === 'loading' ? 'Claiming...' :
                                     claimStatus === 'success' ? <><CheckCircle size={18} /> Reward Claimed</> :
                                     claimStatus === 'error' ? 'Invalid Code' : 'Claim Cashback'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
