'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Package, MapPin, QrCode as QrIcon, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import QrStatusStepper from '@/components/qr/QrStatusStepper';
import { toast } from '@/components/ui/Toast';

function QrUpdateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            toast.error("Invalid Tracking Link");
            router.push('/');
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await apiFetch(`/public/qr-book/${id}`);
                setBooking(res.booking);
            } catch (error) {
                toast.error("Tracking details not found");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 animate-pulse">
                    Loading Tracking Details...
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-50 text-slate-500 border-slate-100';
            case 'payment_confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'dispatched': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'delivering': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'completed': return 'bg-emerald-600 text-white border-emerald-600';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <>
            <div className="bg-[#0f172a] p-6 pt-10 pb-20 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all mb-8 relative z-10"
                >
                    <ArrowLeft className="w-3 h-3" /> Back Home
                </button>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 text-white">
                        <Package className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Order Tracking</h1>
                        <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                            Order #{booking.id.toString().padStart(5, '0')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20 space-y-4 max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusTheme(booking.status)}`}>
                            {booking.status === 'completed' ? <CheckCircle2 size={18} /> : 
                             booking.status === 'rejected' ? <ShieldCheck size={18} /> : <QrIcon size={18} />}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                            <p className="text-sm font-black text-slate-900 capitalize leading-none mt-1">
                                {booking.status.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Journey</p>
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                            <QrStatusStepper status={booking.status} trackingUrl={booking.tracking_url} />
                        </div>
                    </div>

                    {booking.status === 'rejected' && booking.rejection_reason && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">Rejection Reason</p>
                            <p className="text-xs font-bold text-rose-700">{booking.rejection_reason}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100 space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Shipping Details</p>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-slate-900">{booking.full_name}</p>
                                <p className="text-[10px] font-bold text-slate-500">{booking.mobile_number}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{booking.address}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                                    {booking.landmark ? `${booking.landmark} • ` : ''}{booking.city} - {booking.pin_code}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function QrUpdatePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 overflow-x-hidden">
            <title>Track QR Status | OpenScore</title>
            <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 animate-pulse">Loading Tracking Details...</div>
            </div>}>
                <QrUpdateContent />
            </Suspense>
        </div>
    );
}
