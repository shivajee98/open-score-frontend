'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function CustomerTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: '🏠' },
        { label: 'Pay Merchant', href: '/customer/pay', icon: '💳' },
        { label: 'Loans', href: '/customer/loans', icon: '💰' },
        { label: 'Transactions', href: '/customer/transactions', icon: '📜' },
    ];

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await apiFetch('/wallet/transactions');
                setTransactions(data.data || []);
            } catch (err) {
                console.error('Failed to fetch transactions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <div className="p-8 text-center text-white">Loading Transactions...</div>;

    return (
        <DashboardLayout title="Transaction Ledger" navItems={navItems}>
            <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h4 className="text-xl font-extrabold uppercase tracking-tighter text-sky-400">Activity History</h4>
                        <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded text-slate-500">{transactions.length} Records</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {transactions.length > 0 ? transactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        {tx.type === 'CREDIT' ? '💰' : '💳'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-100">{tx.description || tx.source_type}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${tx.type === 'DEBIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {tx.type === 'DEBIT' ? '-' : '+'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{tx.type}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center">
                                <p className="text-slate-500 font-medium">No transactions found in your ledger.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
