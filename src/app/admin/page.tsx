'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function AdminDashboard() {
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
        <DashboardLayout title="System Administration" navItems={navItems}>
            <div className="space-y-8">
                {/* Global Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">System Credit Exposure</p>
                        <h4 className="text-2xl font-black text-white">₹0</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">Active Defaults</p>
                        <h4 className="text-2xl font-black text-red-500">0.0%</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">Daily Volume</p>
                        <h4 className="text-2xl font-black">₹0</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">New Applications</p>
                        <h4 className="text-2xl font-black text-sky-400">{pendingLoans.length}</h4>
                    </div>
                </div>

                {/* Action Queues */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Loan Queue */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h4 className="font-bold">Pending Loans</h4>
                            <span className="bg-sky-500 text-[10px] font-black px-2 py-1 rounded text-white uppercase">Urgent</span>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {pendingLoans.length > 0 ? pendingLoans.map((loan: any) => (
                                <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                                    <div>
                                        <p className="font-bold">{loan.user?.name} <span className="text-slate-500 text-xs font-normal">#UID{loan.user_id}</span></p>
                                        <p className="text-xl font-black mt-1">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(loan.id)}
                                            className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">Reject</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-slate-500 italic">No pending applications for review.</div>
                            )}
                        </div>
                    </div>

                    {/* Payout Queue (Placeholder) */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden opacity-50">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h4 className="font-bold">Withdrawal Requests</h4>
                        </div>
                        <div className="p-12 text-center text-slate-500 italic">No merchant withdrawals pending.</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
