'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import { Home, Smartphone, QrCode, Receipt, ArrowDownLeft, ArrowUpRight, Search, Calendar, Filter, Landmark } from 'lucide-react';

export default function CustomerTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/wallet/transactions')
            .then(data => setTransactions(data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Payout', href: '/customer/payout', icon: <Landmark className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    const groupTransactionsByDate = (txs: any[]) => {
        if (!Array.isArray(txs)) return {};
        const groups: any = {};

        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

        txs.forEach(tx => {
            const d = new Date(tx.created_at);
            const dateStr = d.toLocaleDateString();

            let label = dateStr;
            if (dateStr === today) label = 'Today';
            else if (dateStr === yesterday) label = 'Yesterday';
            else label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            if (!groups[label]) groups[label] = [];
            groups[label].push(tx);
        });
        return groups;
    };

    const grouped = groupTransactionsByDate(transactions);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    return (
        <DashboardLayout title="Activity" navItems={navItems}>
            <TransactionDetailModal
                isOpen={!!selectedTx}
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
            />

            <div className="max-w-4xl mx-auto space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="text" placeholder="Search payments..." className={`w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-slate-100 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-${themeColor}-100 outline-none`} />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.keys(grouped).map(date => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">{date}</h5>
                            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 space-y-1">
                                {grouped[date].map((t: any) => (
                                    <div key={t.id} onClick={() => setSelectedTx(t)} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all group cursor-pointer active:scale-[0.98]">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {t.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5 stroke-[3]" /> : <ArrowUpRight className="w-5 h-5 stroke-[3]" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {t.counterparty_vpa === 'System'
                                                        ? (t.type === 'CREDIT' ? t.counterparty_name : 'Paid')
                                                        : (t.type === 'CREDIT' ? `Received from ${t.counterparty_name}` : `Paid to ${t.counterparty_name}`)
                                                    }
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                    {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.counterparty_vpa || 'Wallet Transfer'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black text-sm ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {t.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-[10px] text-slate-300 font-medium">TxID: ...{String(t.description).split('Ref: ')[1]?.substring(0, 6) || String(t.id)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 font-bold">No transactions found.</div>
                )}
            </div>
        </DashboardLayout>
    );
}
