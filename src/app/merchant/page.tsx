'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function MerchantDashboard() {
    const [balance, setBalance] = useState(0);
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const balanceData = await apiFetch('/wallet/balance');
                setBalance(balanceData.balance);

                const qr = await apiFetch('/merchant/qr');
                setQrData(qr.qr_data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const navItems = [
        { label: 'Sales Overview', href: '/merchant', icon: '📊' },
        { label: 'My QR Code', href: '/merchant/qr', icon: '📱' },
        { label: 'Withdrawal', href: '/merchant/withdraw', icon: '🏦' },
        { label: 'History', href: '/merchant/history', icon: '🕒' },
    ];

    if (loading) return <div className="p-8 text-center text-white">Loading Merchant Terminal...</div>;

    return (
        <DashboardLayout title="Merchant Hub" navItems={navItems}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Balance</p>
                    <h4 className="text-2xl font-black text-emerald-400">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Ready for withdrawal</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Pending Payouts</p>
                    <h4 className="text-2xl font-black text-amber-500">₹0.00</h4>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Settlement Account</p>
                    <h4 className="text-sm font-black truncate text-slate-600">NOT LINKED</h4>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Status</p>
                    <h4 className="text-sm font-black text-amber-500 uppercase">AWAITING KYC</h4>
                </div>

                {/* Dynamic QR Display */}
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 flex flex-col items-center justify-center space-y-4">
                    <h4 className="text-slate-900 font-bold text-lg">Accept Credit Payment</h4>
                    <div className="w-48 h-48 bg-slate-100 rounded-3xl p-4 flex items-center justify-center border-4 border-slate-100 shadow-inner overflow-hidden">
                        <div className="grid grid-cols-7 gap-1 opacity-90 w-full aspect-square">
                            {Array.from({ length: 49 }).map((_, i) => (
                                <div key={i} className={`w-full aspect-square ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'} rounded-xs`}></div>
                            ))}
                        </div>
                    </div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest truncate max-w-full">ID: {qrData}</p>
                    <button
                        onClick={() => window.location.href = '/merchant/qr'}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm w-full"
                    >
                        Enlarge QR & Tools
                    </button>
                </div>

                {/* Withdrawal Request */}
                <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8">
                    <h4 className="font-bold text-lg mb-6">Request Withdrawal</h4>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Request logged for Manual verification (production flow).'); }}>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Amount to Withdraw (₹)</label>
                            <input type="number" step="0.01" className="w-full bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-sky-500 transition-all text-xl font-bold" placeholder="0.00" required />
                        </div>
                        <p className="text-[10px] text-slate-500 px-1">Withdrawals are processed manually by Admin within 24 hours.</p>
                        <button type="submit" className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-900/20 hover:bg-sky-500 transition-all">Submit Request</button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
