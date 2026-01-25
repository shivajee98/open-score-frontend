'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function MerchantHistory() {
    const navItems = [
        { label: 'Sales Overview', href: '/merchant', icon: '📊' },
        { label: 'My QR Code', href: '/merchant/qr', icon: '📱' },
        { label: 'Withdrawal', href: '/merchant/withdraw', icon: '🏦' },
        { label: 'History', href: '/merchant/history', icon: '🕒' },
    ];

    return (
        <DashboardLayout title="Sales History" navItems={navItems}>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-20 text-center text-slate-500 italic flex flex-col items-center">
                <div className="text-6xl mb-4 opacity-20">🕒</div>
                <p className="font-bold">No sales records found for this store.</p>
                <p className="text-xs mt-2 opacity-50 uppercase tracking-widest">Awaiting first customer payment</p>
            </div>
        </DashboardLayout>
    );
}
