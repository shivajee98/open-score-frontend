"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Phone, Building2, User as UserIcon, Store } from "lucide-react";

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

            <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header with Cover-like style */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 pt-10 pb-16 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 text-blue-600">
                            <Store size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white">{merchant.business_name}</h2>
                        <p className="text-blue-100 font-medium mt-1">{merchant.description || "Verified Merchant"}</p>
                    </div>
                </div>

                {/* Content Body */}
                <div className="bg-white px-6 py-6 -mt-8 rounded-t-3xl relative">

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

                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</p>
                                    <p className="font-bold text-slate-900 leading-snug">{merchant.business_address}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-0.5">{merchant.city}, {merchant.pincode}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                                    <p className="font-bold text-slate-900">{merchant.mobile_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Call Action */}
                        <a
                            href={`tel:${merchant.mobile_number}`}
                            className="flex items-center justify-center w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                        >
                            <Phone className="mr-2 w-5 h-5 fill-current" />
                            Call Now
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
}
