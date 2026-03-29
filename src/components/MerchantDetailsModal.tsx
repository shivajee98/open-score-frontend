"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Phone, Building2, User as UserIcon, Store, ExternalLink, Mail, LayoutGrid, Building, Map, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

interface MerchantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    merchant: any;
}

export default function MerchantDetailsModal({ isOpen, onClose, merchant }: MerchantDetailsModalProps) {
    const [mounted, setMounted] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !merchant || !mounted) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header with Cover-like style */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 pt-10 pb-16 relative shrink-0 z-10">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 text-blue-600 overflow-hidden">
                            {(() => {
                                let imgs: string[] = [];
                                try {
                                    if (Array.isArray(merchant.shop_images)) {
                                        imgs = merchant.shop_images;
                                    } else {
                                        imgs = merchant.shop_images ? JSON.parse(merchant.shop_images) : [];
                                    }
                                } catch (e) { }
                                if (imgs && imgs.length > 0 && typeof imgs[0] === 'string') return <img src={imgs[0]} className="w-full h-full object-cover" alt="Shop" />;
                                return <Store size={40} />;
                            })()}
                        </div>
                        <h2 className="text-2xl font-black text-white">{merchant.business_name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {merchant.business_segment && (
                                <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    {merchant.business_segment}
                                </span>
                            )}
                            {merchant.average_rating !== undefined && (
                                <div className="flex items-center gap-1.5 bg-amber-400 text-slate-900 border border-white/40 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                                    <span className="text-sm">★</span>
                                    <span>{Number(merchant.average_rating).toFixed(1)}</span>
                                    <span className="opacity-50 font-bold ml-1">({merchant.rating_count || 0})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="bg-white px-6 py-6 -mt-8 rounded-t-3xl relative overflow-y-auto flex-1">

                    <div className="space-y-6">

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Owner Name</p>
                                    <p className="font-bold text-slate-900">{merchant.name}</p>
                                </div>
                            </div>

                            <div
                                onClick={() => {
                                    const mapUrl = merchant.map_location_url || `https://maps.google.com/?q=${encodeURIComponent(`${merchant.business_address || ''} ${merchant.city || ''} ${merchant.pincode || ''}`)}`;
                                    window.open(mapUrl, '_blank');
                                }}
                                className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address (Tap to Navigator)</p>
                                    <p className="font-bold text-slate-900 leading-snug break-words">{(merchant.business_address && merchant.business_address !== 'null') ? merchant.business_address : (merchant.city || 'No specific address')}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-0.5">{merchant.city ? merchant.city + ',' : ''} {merchant.pincode}</p>
                                </div>
                                <div className="text-slate-300 group-hover:text-blue-600 mt-2 shrink-0">
                                    <ExternalLink size={20} />
                                </div>
                            </div>

                            {merchant.map_location_url && (
                                <button
                                    onClick={() => window.open(merchant.map_location_url, '_blank')}
                                    className="w-full flex items-center justify-between gap-4 p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                            <Map size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-[0.2em]">Navigation</p>
                                            <p className="text-xs font-black uppercase tracking-widest">Get Directions to Store</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                </button>
                            )}

                            {merchant.email && (
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                        <p className="font-bold text-slate-900 truncate">{merchant.email}</p>
                                    </div>
                                </div>
                            )}

                            {merchant.business_type && (
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Type</p>
                                        <p className="font-bold text-slate-900">{merchant.business_type}</p>
                                    </div>
                                </div>
                            )}

                            {(merchant.mobile_number && (merchant.show_phone ?? true)) && (
                                <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                            <p className="font-bold text-slate-900">+91 {merchant.mobile_number}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = `tel:+91${merchant.mobile_number}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                    >
                                        Call Now
                                    </button>
                                </div>
                            )}

                            {(merchant.show_timing ?? true) && (
                                (() => {
                                    let timingDisplay = "09:00 AM - 09:00 PM";
                                    let isOpenStatus = "Open Now";
                                    let isCurrentlyOpen = true;

                                    try {
                                        if (merchant.shop_timing) {
                                            const timingData = typeof merchant.shop_timing === 'string' 
                                                ? JSON.parse(merchant.shop_timing) 
                                                : merchant.shop_timing;

                                            if (timingData.type === 'daily') {
                                                const open = timingData.daily?.open || "09:00";
                                                const close = timingData.daily?.close || "21:00";
                                                
                                                // Convert 24h to 12h for display
                                                const formatTime = (time: string) => {
                                                    let [h, m] = time.split(':').map(Number);
                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                    h = h % 12 || 12;
                                                    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                                                };
                                                
                                                timingDisplay = `${formatTime(open)} - ${formatTime(close)}`;
                                                
                                                // Basic Open/Closed Logic
                                                const now = new Date();
                                                const currentH = now.getHours();
                                                const currentM = now.getMinutes();
                                                const openParts = open.split(':').map(Number);
                                                const closeParts = close.split(':').map(Number);
                                                
                                                const currentMins = currentH * 60 + currentM;
                                                const openMins = openParts[0] * 60 + openParts[1];
                                                const closeMins = closeParts[0] * 60 + closeParts[1];
                                                
                                                isCurrentlyOpen = currentMins >= openMins && currentMins <= closeMins;
                                                isOpenStatus = isCurrentlyOpen ? "Open Now" : "Closed";
                                            } else if (timingData.type === 'weekly') {
                                                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                                const currentDay = days[new Date().getDay()];
                                                const todayTiming = timingData.weekly?.[currentDay];
                                                
                                                if (!todayTiming || !todayTiming.isOpen) {
                                                    timingDisplay = "Closed Today";
                                                    isOpenStatus = "Closed";
                                                    isCurrentlyOpen = false;
                                                } else {
                                                    const open = todayTiming.open || "09:00";
                                                    const close = todayTiming.close || "21:00";
                                                    const formatTime = (time: string) => {
                                                        let [h, m] = time.split(':').map(Number);
                                                        const ampm = h >= 12 ? 'PM' : 'AM';
                                                        h = h % 12 || 12;
                                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                                                    };
                                                    timingDisplay = `${formatTime(open)} - ${formatTime(close)}`;
                                                    
                                                    const now = new Date();
                                                    const currentH = now.getHours();
                                                    const currentM = now.getMinutes();
                                                    const currentMins = currentH * 60 + currentM;
                                                    const openMins = open.split(':').map(Number)[0] * 60 + open.split(':').map(Number)[1];
                                                    const closeMins = close.split(':').map(Number)[0] * 60 + close.split(':').map(Number)[1];
                                                    
                                                    isCurrentlyOpen = currentMins >= openMins && currentMins <= closeMins;
                                                    isOpenStatus = isCurrentlyOpen ? "Open Now" : "Closed";
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Failed to parse merchant timing', e);
                                    }

                                    return (
                                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCurrentlyOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop Timing</p>
                                                <p className="font-bold text-slate-900">{timingDisplay}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isCurrentlyOpen ? 'text-emerald-600' : 'text-slate-500'}`}>{isOpenStatus}</p>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}

                            {(() => {
                                let imgs: string[] = [];
                                try {
                                    if (Array.isArray(merchant.shop_images)) {
                                        imgs = merchant.shop_images;
                                    } else {
                                        imgs = merchant.shop_images ? JSON.parse(merchant.shop_images) : [];
                                    }
                                } catch (e) { }
                                if (imgs.length > 0) {
                                    return (
                                        <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon size={16} className="text-slate-400" />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop Images</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {imgs.map((img, idx) => (
                                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                                                        <img src={img} alt={`Shop image ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                 return null;
                            })()}

                            {/* Rating Section */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Rate this Merchant</h4>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                onClick={() => setUserRating(star)}
                                                className={`text-2xl transition-all ${userRating >= star ? 'text-amber-400 scale-125' : 'text-slate-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        placeholder="Add a comment (optional)..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none min-h-[80px] font-bold"
                                    />
                                    <button 
                                        disabled={submittingRating || userRating === 0}
                                        onClick={async () => {
                                            if (userRating === 0) return;
                                            setSubmittingRating(true);
                                            try {
                                                const res = await apiFetch(`/merchants/${merchant.id}/rate`, {
                                                    method: 'POST',
                                                    body: JSON.stringify({ rating: userRating, comment })
                                                });
                                                if (res.error) throw new Error(res.error);
                                                toast.success("Thank you for your rating!");
                                                setComment("");
                                                setUserRating(0);
                                                // Ideally refetch merchant or mutate list
                                            } catch (e: any) {
                                                toast.error(e.message || "Failed to submit rating");
                                            } finally {
                                                setSubmittingRating(false);
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${submittingRating || userRating === 0 ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white shadow-xl active:scale-95'}`}
                                    >
                                        {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
