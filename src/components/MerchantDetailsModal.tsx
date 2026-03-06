"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Phone, Building2, User as UserIcon, Store, ExternalLink, Mail, LayoutGrid, Building, Map, Image as ImageIcon } from "lucide-react";

interface MerchantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    merchant: any;
}

export default function MerchantDetailsModal({ isOpen, onClose, merchant }: MerchantDetailsModalProps) {
    const [mounted, setMounted] = useState(false);

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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
