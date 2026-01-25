'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function CustomerLoans() {
    const [loans, setLoans] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: '🏠' },
        { label: 'Pay Merchant', href: '/customer/pay', icon: '💳' },
        { label: 'Loans', href: '/customer/loans', icon: '💰' },
        { label: 'Transactions', href: '/customer/transactions', icon: '📜' },
    ];

    const fetchHistory = async () => {
        try {
            const data = await apiFetch('/loans');
            setLoans(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleApply = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            await apiFetch('/loans/apply', {
                method: 'POST',
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            alert('Application Submitted');
            setAmount('');
            fetchHistory();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <DashboardLayout title="Digital Credit" navItems={navItems}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                        <h4 className="text-xl font-bold mb-6">Apply for New Credit</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Requested Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/30 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:border-sky-500 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[500, 1000, 2500].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(amt.toString())}
                                        className="py-3 border border-slate-800 rounded-xl text-xs font-bold hover:border-sky-500 hover:bg-sky-500/5 transition-all outline-none text-slate-400 hover:text-sky-400"
                                    >
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleApply}
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/40 hover:from-sky-500 hover:to-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold px-2">Application History</h4>
                        {loans.length > 0 ? loans.map((loan: any) => (
                            <div key={loan.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between group hover:bg-slate-800/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${loan.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : loan.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {loan.status === 'APPROVED' ? '✓' : loan.status === 'REJECTED' ? '✗' : '🕒'}
                                    </div>
                                    <div>
                                        <p className="font-bold">Digital Credit #{loan.id}</p>
                                        <p className="text-xs text-slate-500">Applied {new Date(loan.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${loan.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : loan.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {loan.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-500">No applications yet.</div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <h4 className="text-lg font-bold mb-4 relative z-10">Credit Health</h4>
                        <div className="flex items-end gap-2 mb-2 relative z-10">
                            <span className="text-4xl font-black">0</span>
                            <span className="text-white/60 text-sm font-medium mb-1">/ 850</span>
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full mb-6 relative z-10">
                            <div className="w-0 h-full bg-white rounded-full"></div>
                        </div>
                        <p className="text-sm text-indigo-100/70 relative z-10">Your credit profile is being initialized. Pay your bills to improve your score.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
