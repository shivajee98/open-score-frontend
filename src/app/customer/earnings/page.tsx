'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Coins, TrendingUp, History, Users, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from '@/components/ui/Toast';

export default function TeamEarningsPage() {
    const router = useRouter();
    const { data: user, mutate: mutateUser } = useApi('/auth/me');
    const { data: stats, isLoading, mutate: mutateStats } = useApi('/auth/team/earnings');
    const [submitting, setSubmitting] = useState(false);

    const handleTransfer = async () => {
        const available = stats?.available || 0;
        if (available <= 0) return toast.error("No earnings available for transfer");

        const amount = window.prompt(`Enter amount to transfer to your main wallet (Max: ₹${available}):`);
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        if (Number(amount) > available) return toast.error("Amount exceeds available balance");

        setSubmitting(true);
        try {
            const res = await apiFetch('/auth/team/transfer-earnings', {
                method: 'POST',
                body: JSON.stringify({ amount: Number(amount) })
            });
            if (res.error) throw new Error(res.error);
            toast.success(res.message || "Transfer requested successfully");
            mutateStats();
            mutateUser();
        } catch (e: any) {
            toast.error(e.message || "Transfer failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Earnings...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-10 pb-20 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <BackButton className="mb-6 flex items-center gap-2 text-indigo-200 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </BackButton>
                    
                    <h1 className="text-2xl font-black text-white tracking-tight">My Earnings</h1>
                    <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">Performance Dashboard</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 space-y-4">
                {/* Balance Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Available for Transfer</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats?.available?.toLocaleString() || 0}</h2>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
                            <Coins size={24} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Earned</p>
                            <p className="text-lg font-black text-slate-800">₹{stats?.total_earned?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pending/Transferred</p>
                            <p className="text-lg font-black text-slate-800">₹{stats?.transferred?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">QR Onboarding Earning</p>
                            <p className="text-lg font-black text-slate-800">₹{stats?.qr_earning?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Loan Earning</p>
                            <p className="text-lg font-black text-slate-800">₹{stats?.loan_earning?.toLocaleString() || 0}</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleTransfer}
                        disabled={submitting || (stats?.available || 0) <= 0}
                        className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Processing...' : (stats?.available || 0) <= 0 ? 'No Earnings Available' : 'Transfer to Wallet'}
                        <ArrowUpRight size={16} />
                    </button>
                    
                    <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                        Transfer requests are reviewed by the Admin.
                    </p>
                </div>

                {/* Status/Banner */}
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Users size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wider">Referring Profit</h3>
                            <p className="text-xs text-indigo-100 font-medium">Earn ₹10 per signup & ₹600 per loan disbursement from your direct refers.</p>
                        </div>
                    </div>
                </div>

                {/* Earnings List */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-900">
                            <History size={18} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Referral History</h3>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Since {new Date(stats?.joined_date).toLocaleDateString()}</p>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {stats?.history?.length > 0 ? (
                            stats.history.map((item: any) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 leading-tight">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.mobile}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 tracking-tight">
                                            +₹{item.signup_bonus + item.loan_bonus}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            {item.status === 'VERIFIED' ? <CheckCircle size={10} className="text-emerald-500" /> : <Clock size={10} className="text-amber-500" />}
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${item.status === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {item.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <TrendingUp className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No referral earnings yet</p>
                                <button 
                                    onClick={() => router.push('/customer/referral')}
                                    className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Start Referring Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
