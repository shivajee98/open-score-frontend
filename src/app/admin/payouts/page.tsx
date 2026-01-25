'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const data = await apiFetch('/admin/payouts');
            setPayouts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await apiFetch(`/admin/payouts/${id}/approve`, { method: 'POST' });
            alert('Payout Settled Successfully');
            fetchPayouts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const navItems = [
        { label: 'System Health', href: '/admin', icon: '🛡️' },
        { label: 'Loan Approvals', href: '/admin/loans', icon: '📝' },
        { label: 'Merchant Payouts', href: '/admin/payouts', icon: '💸' },
        { label: 'Audit Logs', href: '/admin/logs', icon: '📋' },
    ];

    return (
        <DashboardLayout title="Merchant Payouts" navItems={navItems}>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-white/5">
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Settlement Queue</h4>
                </div>
                <div className="divide-y divide-slate-800">
                    {payouts.length > 0 ? payouts.map((p: any) => (
                        <div key={p.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-all gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner">🏦</div>
                                <div>
                                    <p className="font-black text-lg text-white">{p.user?.name || 'Merchant ' + p.user_id}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">HDFC Bank • **** 8821</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-3xl font-black text-emerald-400">₹{parseFloat(p.amount).toLocaleString('en-IN')}</p>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter text-right">Requested Settlement</p>
                                </div>
                                <button
                                    onClick={() => handleApprove(p.id)}
                                    className="px-6 py-3 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/40 active:scale-95"
                                >
                                    Disburse
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center text-slate-500 italic flex flex-col items-center">
                            <div className="text-6xl mb-4 opacity-20">💸</div>
                            <p className="font-bold">No bank settlement requests pending from merchants.</p>
                            <p className="text-xs mt-2 opacity-50 uppercase tracking-widest">Withdrawal queue is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
