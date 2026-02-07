'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Gift, PartyPopper, Sparkles, Trophy, ArrowLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/loanUtils';

export default function RewardsPage() {
    const navigate = useNavigate();
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalEarned, setTotalEarned] = useState(0);

    useEffect(() => {
        const loadRewards = async () => {
            try {
                // TODO: Connect to actual API endpoint when available
                // const data = await apiFetch('/rewards');
                // setRewards(data.rewards);
                // setTotalEarned(data.total_earned);

                // Mock data for now
                setRewards([
                    { id: 1, type: 'Cashback', amount: 50, description: 'Loan repayment bonus', date: '2026-01-25', status: 'credited' },
                    { id: 2, type: 'Referral', amount: 100, description: 'Friend signup bonus', date: '2026-01-20', status: 'credited' },
                    { id: 3, type: 'Cashback', amount: 25, description: 'Transaction reward', date: '2026-01-15', status: 'pending' },
                ]);
                setTotalEarned(175);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadRewards();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-600 to-pink-700 p-4 pt-12 pb-20 rounded-b-[2.5rem] shadow-xl shadow-rose-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <div className="relative z-10">
                    <button onClick={() => navigate(-1)} className="mb-6 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <PartyPopper className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Rewards</h1>
                            <p className="text-rose-100 text-xs font-bold uppercase tracking-widest">Your Earnings</p>
                        </div>
                    </div>

                    {/* Total Earned */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-2">Total Earned</p>
                                <p className="text-3xl font-black text-white tracking-tight">₹{totalEarned}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <Trophy className="text-yellow-300" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rewards List */}
            <div className="px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-4 border border-slate-100">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Rewards</h2>

                    {rewards.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gift className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-bold text-sm">No rewards yet</p>
                            <p className="text-slate-300 text-xs mt-1">Start earning rewards by using our services</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rewards.map((reward) => (
                                <div key={reward.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        reward.status === 'credited' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                    )}>
                                        {reward.type === 'Cashback' ? <Sparkles size={20} /> : <Gift size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 text-sm">{reward.description}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{reward.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-base text-emerald-600">₹{reward.amount}</p>
                                        <p className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider",
                                            reward.status === 'credited' ? 'text-emerald-600' : 'text-orange-600'
                                        )}>{reward.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* How to Earn More */}
                <div className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black mb-4 tracking-tight">Earn More Rewards</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                <p className="text-sm font-medium text-blue-100">Complete loan repayments on time</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                <p className="text-sm font-medium text-blue-100">Refer friends to OpenScore</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                <p className="text-sm font-medium text-blue-100">Use bill payment services</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
