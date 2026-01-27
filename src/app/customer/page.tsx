'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import PinModal from '@/components/PinModal';
import { Home, Smartphone, QrCode, Receipt, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function CustomerDashboard() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showPinModal, setShowPinModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check PIN Status
                const pinStatus = await apiFetch('/wallet/check-pin');
                if (!pinStatus.has_pin) setShowPinModal(true);

                const balanceData = await apiFetch('/wallet/balance');
                setBalance(balanceData.balance);
                const txData = await apiFetch('/wallet/transactions');
                setTransactions(txData.data ? txData.data.slice(0, 5) : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePinSet = async (pin: string) => {
        try {
            await apiFetch('/wallet/set-pin', {
                method: 'POST',
                body: JSON.stringify({ pin, pin_confirmation: pin })
            });
            setShowPinModal(false);
            alert("Security PIN set successfully!");
        } catch (err: any) {
            alert(err.message || "Failed to set PIN");
        }
    };

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    if (loading) return (
        <DashboardLayout title="Overview" navItems={navItems}>
            <div className="flex items-center justify-center p-20">
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Financial Data...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="My Finances" navItems={navItems}>
            <PinModal
                isOpen={showPinModal}
                mode="SET"
                title="Setup Wallet PIN"
                onComplete={handlePinSet}
            />
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Balance Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-6 md:p-12 shadow-2xl shadow-blue-900/20 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-70">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Balance</span>
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <button onClick={() => window.location.href = '/customer/pay'} className="px-6 py-4 sm:py-3 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Smartphone className="w-4 h-4" /> Scan to Pay
                            </button>
                            <button onClick={() => window.location.href = '/customer/qr'} className="px-6 py-4 sm:py-3 bg-white/10 text-white rounded-2xl font-bold text-sm backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <QrCode className="w-4 h-4" /> Receive Money
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" /> Recent Activity
                            </h4>
                            <button onClick={() => window.location.href = '/customer/transactions'} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {t.type === 'CREDIT' ? <ArrowDownLeft className="w-6 h-6 stroke-[3]" /> : <ArrowUpRight className="w-6 h-6 stroke-[3]" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm truncate max-w-[120px]">{t.type === 'CREDIT' ? 'Received' : 'Paid'}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-black text-sm ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {t.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-sm font-medium">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Features */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-600" /> Quick Actions
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => router.push('/customer/pay')}>
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h5 className="font-bold text-slate-900">Scan QR</h5>
                                <p className="text-xs text-slate-500 mt-1">Pay friends or shops</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer group" onClick={() => window.location.href = '/customer/qr'}>
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <h5 className="font-bold text-slate-900">Show QR</h5>
                                <p className="text-xs text-slate-500 mt-1">Receive payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24 md:hidden"></div>
        </DashboardLayout>
    );
}
