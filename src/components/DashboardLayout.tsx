import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AuthGuard from './AuthGuard';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export default function DashboardLayout({
    children,
    title,
    navItems
}: {
    children: React.ReactNode;
    title: string;
    navItems: NavItem[];
}) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Hydrate latest data from server if token exists
        if (token) {
            apiFetch('/auth/me')
                .then(data => {
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                })
                .catch(err => {
                    console.error("Hydration failed", err);
                    if (!storedUser) router.push('/');
                });
        } else {
            router.push('/');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthGuard>
            <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
                {/* Desktop Sidebar */}
                <aside className="w-72 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-xl z-20">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl">O</div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">OpenScore</h1>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-11">Financial Ecosystem</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 hover:text-blue-600 group font-bold"
                            >
                                <span className="group-hover:scale-110 transition-transform text-xl">
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>


                    <div className="p-6 border-t border-slate-100">
                        <Link href="/customer/profile" className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate text-slate-900">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.vpa || user?.mobile_number || 'Guest'}</p>
                            </div>
                        </Link>
                    </div>
                </aside >

                {/* Main Content */}
                < main className="flex-1 flex flex-col overflow-hidden relative pb-[5.5rem] md:pb-0 bg-slate-50" >
                    <header className="px-6 py-4 md:py-6 flex justify-between items-center bg-white/80 backdrop-blur-xl md:bg-transparent sticky top-0 z-30 border-b md:border-none border-slate-200">
                        <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h2>
                        <div className="flex items-center gap-3 md:hidden">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-200">
                                {user?.name?.[0] || 'U'}
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar scroll-smooth">
                        {user ? children : (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Session...</p>
                            </div>
                        )}
                    </div>
                </main >
            </div >
        </AuthGuard>
    );
}
