'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function MerchantWithdraw() {
    const navItems = [
        { label: 'Sales Overview', href: '/merchant', icon: '📊' },
        { label: 'My QR Code', href: '/merchant/qr', icon: '📱' },
        { label: 'Withdrawal', href: '/merchant/withdraw', icon: '🏦' },
        { label: 'History', href: '/merchant/history', icon: '🕒' },
    ];

    return (
        <DashboardLayout title="Bank Settlement" navItems={navItems}>
            <div className="max-w-xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-8">Request Funds Transfer</h4>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Withdrawal Amount (₹)</label>
                        <input type="number" step="0.01" className="w-full bg-black/40 border border-slate-800 rounded-2xl p-6 text-3xl font-black text-white focus:outline-none focus:border-sky-500 transition-all" placeholder="0.00" />
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Destination</span>
                            <span className="font-bold text-white">HDFC Bank **** 8821</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Processing Time</span>
                            <span className="font-bold text-sky-400">Within 24 Hours</span>
                        </div>
                    </div>
                    <button onClick={() => alert('Withdrawal request logged.')} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-900/40 hover:bg-sky-500 transition-all active:scale-95">Initiate Settlement</button>
                </div>
            </div>
        </DashboardLayout>
    );
}
