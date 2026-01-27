'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import { Store, Smartphone, QrCode, History, Calendar, Download, TrendingUp } from 'lucide-react';

export default function MerchantHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/wallet/transactions')
            .then(data => setTransactions(data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const navItems = [
        { label: 'Store Overview', href: '/merchant', icon: <Store className="w-5 h-5" /> },
        { label: 'Pay Mobile/QR', href: '/merchant/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'Receive QR', href: '/merchant/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Sales History', href: '/merchant/history', icon: <History className="w-5 h-5" /> },
    ];

    return (
        <DashboardLayout title="Sales History" navItems={navItems}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Sales (Today)</p>
                        <h3 className="text-2xl font-black text-slate-900">₹{loading ? '...' : '12,450.00'}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Transactions</p>
                        <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : transactions.length}</h3>
                    </div>
                    <button className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 flex flex-col justify-center items-center font-bold hover:bg-blue-700 transition-all active:scale-95">
                        <Download className="w-6 h-6 mb-2" />
                        Download Report
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            All Transactions
                        </h4>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> This Month
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 font-bold text-slate-300">Loading...</div>
                        ) : transactions.length > 0 ? (
                            transactions.map((t: any) => (
                                <div key={t.id} className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {t.type === 'CREDIT' ? 'IN' : 'OUT'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {t.type === 'CREDIT' ? 'Payment Received' : 'Payout / Transfer'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                {new Date(t.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-black text-base ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                No sales history yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
