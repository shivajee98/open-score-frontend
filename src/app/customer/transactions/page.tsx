import { useEffect, useState, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import { Home, Smartphone, QrCode, Receipt, ArrowDownLeft, ArrowUpRight, Search, Landmark, Loader2 } from 'lucide-react';

export default function CustomerTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: any) => {
        if (loading || fetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, fetchingMore, hasMore]);

    const fetchTransactions = async (pageNum: number) => {
        if (pageNum === 1) setLoading(true);
        else setFetchingMore(true);

        try {
            const data = await apiFetch(`/wallet/transactions?page=${pageNum}`);
            const newTxs = data.data || [];

            if (pageNum === 1) {
                setTransactions(newTxs);
            } else {
                setTransactions(prev => [...prev, ...newTxs]);
            }

            setHasMore(data.current_page < data.last_page);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
    }, [page]);

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
            if (!tx.created_at) return;
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
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user from local storage");
            }
        }
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

            <div className="max-w-4xl mx-auto space-y-4 pb-12">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="text" placeholder="Search payments..." className={`w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-slate-100 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-${themeColor}-100 outline-none`} />
                    </div>
                </div>

                {loading && transactions.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-white border border-slate-50 rounded-2xl animate-pulse"></div>)}
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.keys(grouped).map((date, dateIdx) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{date}</h5>
                            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 space-y-1">
                                {grouped[date].map((t: any, idx: number) => {
                                    // Attach observer to the last element of the last group
                                    const isLastItem = dateIdx === Object.keys(grouped).length - 1 && idx === grouped[date].length - 1;

                                    return (
                                        <div
                                            key={t.id}
                                            ref={isLastItem ? lastElementRef : null}
                                            onClick={() => setSelectedTx(t)}
                                            className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {t.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5 stroke-[3]" /> : <ArrowUpRight className="w-5 h-5 stroke-[3]" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-[11px] tracking-tight">
                                                        {t.counterparty_vpa === 'System'
                                                            ? (t.type === 'CREDIT' ? t.counterparty_name : 'Paid')
                                                            : (t.type === 'CREDIT' ? `Received from ${t.counterparty_name}` : `Paid to ${t.counterparty_name}`)
                                                        }
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.counterparty_vpa || 'Wallet Transfer'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-xs ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {t.type === 'CREDIT' ? '+' : '-'}₹ {parseFloat(t.amount).toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter">REF: {String(t.description).split('Ref: ')[1]?.substring(0, 8) || String(t.id).substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-black text-sm">No Activity Yet</h4>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Payments you make will appear here.</p>
                    </div>
                )}

                {/* Loading More Indicator */}
                {(fetchingMore || (loading && transactions.length > 0)) && (
                    <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading earlier activity...</p>
                        </div>
                    </div>
                )}

                {/* End of Activity Marker */}
                {!hasMore && transactions.length > 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">End of activity history</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
