'use client';

import Link from 'next/link';
import { QrCode, LogOut, Users, DollarSign, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-xl font-black text-slate-900">Admin Panel</h1>
                    <p className="text-slate-500 font-medium">Manage OpenScore Platform</p>
                </div>
                <button onClick={handleLogout} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/qr-generator" className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-blue-900/5 hover:border-blue-200 hover:-translate-y-1 transition-all group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <QrCode size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">QR Generator</h3>
                    <p className="text-xs text-slate-400 mt-1">Create & Print Merchant Codes</p>
                </Link>

                <Link href="/admin/users" className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-blue-900/5 hover:border-blue-200 hover:-translate-y-1 transition-all group">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Users</h3>
                    <p className="text-xs text-slate-400 mt-1">Manage All Accounts</p>
                </Link>

                <Link href="/admin/payouts" className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-blue-900/5 hover:border-blue-200 hover:-translate-y-1 transition-all group">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <DollarSign size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Payouts</h3>
                    <p className="text-xs text-slate-400 mt-1">Approve Withdrawals</p>
                </Link>

                <Link href="/admin/logs" className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-blue-900/5 hover:border-blue-200 hover:-translate-y-1 transition-all group">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Activity size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Logs</h3>
                    <p className="text-xs text-slate-400 mt-1">System Audit Trail</p>
                </Link>
            </div>
        </div>
    );
}
