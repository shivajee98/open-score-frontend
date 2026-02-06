'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
    X,
    MapPin,
    Phone,
    Building2,
    User as UserIcon,
    Store,
    ChevronLeft,
    ExternalLink,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Navigation,
    Share2,
    Heart,
    MessageSquare,
    ShoppingBag,
    Star
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function MerchantProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        fetchMerchant();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const fetchMerchant = async () => {
        try {
            const res = await apiFetch(`/merchants/${id}`);
            setMerchant(res);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load merchant profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Loading Store Profile...</p>
            </div>
        );
    }

    if (!merchant) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Nav */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 pt-4 pb-2 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-black/20 backdrop-blur-md text-white'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex gap-2">
                        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-black/20 backdrop-blur-md text-white'}`}>
                            <Share2 size={18} />
                        </button>
                        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-black/20 backdrop-blur-md text-white'}`}>
                            <Heart size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero / Cover */}
            <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/60 z-10"></div>
                {merchant.profile_image ? (
                    <>
                        <img src={merchant.profile_image} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110" alt="" />
                        <img src={merchant.profile_image} className="relative w-full h-full object-contain z-0 transition-transform duration-700 hover:scale-105" alt={merchant.business_name} />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag size={120} className="text-slate-800 opacity-20" />
                    </div>
                )}

                {/* Float Badges */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} className="text-emerald-400" /> Verified Merchant
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-30">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-white">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center -mt-20 border-4 border-white text-blue-600 mb-6">
                            <Store size={48} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{merchant.business_name}</h1>
                        <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mt-2 mb-4">{merchant.business_nature || 'General Retail'}</p>

                        <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-slate-900">4.9</span> (120+ reviews)
                            </div>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <div className="flex items-center gap-1">
                                <Clock size={14} /> Open until 10 PM
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-8">
                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Business</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                {merchant.description || `Welcome to ${merchant.business_name}. We are committed to providing the best service in ${merchant.city}. Visit us for premium quality and trusted transactions.`}
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <UserIcon size={14} />
                                    </div>
                                    <p className="font-bold text-slate-900 truncate">{merchant.name}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Since</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Clock size={14} />
                                    </div>
                                    <p className="font-bold text-slate-900">May 2023</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Detail */}
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Location & Contact</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                        <MapPin className="text-rose-500" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 leading-tight">{merchant.business_address}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{merchant.city}, {merchant.pincode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                        <Phone className="text-blue-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{merchant.mobile_number}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Official Support</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <a
                                    href={merchant.location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.business_name + ' ' + merchant.city)}`}
                                    target="_blank"
                                    className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-black text-sm text-slate-900 group shadow-sm hover:border-blue-400 transition-all active:scale-[0.98]"
                                >
                                    <Navigation size={18} className="text-blue-600 group-hover:animate-pulse" />
                                    Get Directions
                                </a>
                                <a
                                    href={`tel:${merchant.mobile_number}`}
                                    className="flex-1 py-4 bg-blue-600 rounded-2xl flex items-center justify-center gap-2 font-black text-sm text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    <Phone size={18} />
                                    Contact Now
                                </a>
                            </div>
                        </div>

                        {/* Recent Reviews Placeholder */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Reviews</h3>
                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">See All</button>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0"></div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-black text-slate-900 uppercase">Customer User</p>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <div className="flex text-amber-400"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500">Amazing experience! The payment was seamless and the owner is very helpful.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
