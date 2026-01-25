'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function AdminLoans() {
    const [pendingLoans, setPendingLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const data = await apiFetch('/admin/loans');
            setPendingLoans(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await apiFetch(`/admin/loans/${id}/approve`, { method: 'POST' });
            alert('Loan Approved & Disbursed');
            fetchPending();
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
        <DashboardLayout title="Loan Approvals" navItems={navItems}>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-white/5">
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Queue: Pending Review</h4>
                    <span className="bg-sky-500 text-[10px] font-black px-2 py-1 rounded text-white uppercase">{pendingLoans.length} Tasks</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {pendingLoans.length > 0 ? pendingLoans.map((loan: any) => (
                        <div key={loan.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-all gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner italic font-black text-slate-700">₹</div>
                                <div>
                                    <p className="font-black text-lg text-white">{loan.user?.name || 'User ' + loan.user_id}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manual Verification Required</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</p>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">Requested Amount</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(loan.id)}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
                                    >
                                        Approve
                                    </button>
                                    <button className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95">Reject</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center text-slate-500 italic flex flex-col items-center">
                            <div className="text-6xl mb-4 opacity-20">📋</div>
                            <p className="font-bold">No pending loan applications for review.</p>
                            <p className="text-xs mt-2 opacity-50 uppercase tracking-widest">System is in equilibrium</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
