'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const data = await apiFetch('/admin/logs');
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const navItems = [
        { label: 'System Health', href: '/admin', icon: '🛡️' },
        { label: 'Loan Approvals', href: '/admin/loans', icon: '📝' },
        { label: 'Merchant Payouts', href: '/admin/payouts', icon: '💸' },
        { label: 'Audit Logs', href: '/admin/logs', icon: '📋' },
    ];

    return (
        <DashboardLayout title="System Audit Logs" navItems={navItems}>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-white/5">
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Security & Event Ledger</h4>
                    <span className="bg-slate-800 text-[10px] font-black px-2 py-1 rounded text-slate-400 uppercase">Live Watch</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {logs.length > 0 ? logs.map((log: any) => (
                        <div key={log.id} className="p-6 hover:bg-white/5 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${log.action.includes('error') ? 'bg-red-500' : 'bg-emerald-500'
                                        }`}></div>
                                    <div>
                                        <p className="font-bold text-sm text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                                            By Administrator • {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <code className="text-[10px] bg-black/50 px-2 py-1 rounded text-sky-400 border border-sky-400/10">ID: {log.id}</code>
                                </div>
                            </div>
                            <div className="mt-3 ml-6 p-3 rounded-xl bg-black/30 border border-white/5">
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{log.description}"</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center text-slate-500 italic flex flex-col items-center">
                            <div className="text-6xl mb-4 opacity-20">📋</div>
                            <p className="font-bold">No audit trails found in current partition.</p>
                            <p className="text-xs mt-2 opacity-50 uppercase tracking-widest">System integrity verified</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
