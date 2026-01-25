'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function CustomerDashboard() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const balanceData = await apiFetch('/wallet/balance');
                setBalance(balanceData.balance);

                const transData = await apiFetch('/wallet/transactions');
                setTransactions(transData.data || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: '🏠' },
        { label: 'Pay Merchant', href: '/customer/pay', icon: '💳' },
        { label: 'Loans', href: '/customer/loans', icon: '💰' },
        { label: 'Transactions', href: '/customer/transactions', icon: '📜' },
    ];

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <DashboardLayout title="Customer Dashboard" navItems={navItems}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wallet Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-8 shadow-xl shadow-indigo-500/20 group">
                    <div className="absolute top-0 right-0 p-6 md:p-8 transform group-hover:scale-110 transition-transform hidden sm:block">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <p className="text-white/70 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] mb-1">Available Credit</p>
                    <h3 className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-8 tracking-tighter transition-all">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => window.location.href = '/customer/pay'} className="px-5 py-2.5 md:px-8 md:py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs md:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">Quick Pay</button>
                        <button className="px-5 py-2.5 md:px-8 md:py-3 bg-white/10 text-white rounded-2xl font-black text-xs md:text-sm backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 transition-all">Add Limit</button>
                    </div>
                </div>

                {/* Loan Status Card */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between">
                    <div>
                        <h4 className="text-lg font-bold mb-4">Loan Requests</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40">
                                <div>
                                    <p className="font-semibold text-slate-400">No pending loans</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 border border-slate-700 rounded-2xl text-sm font-medium hover:bg-slate-800 transition-all text-slate-400">View All Applications</button>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-3 mt-4">
                    <h4 className="text-xl font-bold mb-6 px-2">Recent Activity</h4>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="divide-y divide-slate-800">
                            {transactions.length > 0 ? transactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-slate-800/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                            {tx.type === 'CREDIT' ? '💰' : '💳'}
                                        </div>
                                        <div>
                                            <p className="font-bold">{tx.description || tx.source_type}</p>
                                            <p className="text-sm text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.type === 'DEBIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {tx.type === 'DEBIT' ? '-' : '+'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500">No transactions found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
