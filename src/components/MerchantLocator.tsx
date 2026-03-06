"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, X, Store, Navigation, Phone, MessageCircle, SlidersHorizontal } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import MerchantDetailsModal from "./MerchantDetailsModal";
import BackButton from "./BackButton";

interface Merchant {
    id: number;
    business_name: string;
    business_address: string;
    pincode: string;
    city: string;
    mobile_number: string;
    name?: string;
    email?: string;
    shop_images?: string;
    map_location_url?: string;
    business_segment?: string;
    business_nature?: string;
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function MerchantLocator() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pincode, setPincode] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("All");
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>(['All', 'Retail', 'Grocery', 'Pharmacy']);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    // Details Modal State
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const debouncedPincode = useDebounce(pincode, 500);
    const debouncedCity = useDebounce(city, 500);
    const debouncedCategory = useDebounce(category, 500);

    const fetchMerchants = useCallback(async (searchPincode: string, searchCity: string, searchCategory: string) => {
        setLoading(true);
        try {
            // Only update profile if we have valid input
            if (searchPincode.length >= 3 || searchCity.length >= 3) {
                apiFetch('/auth/update-profile', {
                    method: 'POST',
                    body: JSON.stringify({ pincode: searchPincode, city: searchCity })
                }).catch(() => { }); // Fire and forget
            }

            const params = new URLSearchParams();
            if (searchPincode) params.append('pincode', searchPincode);
            if (searchCity) params.append('city', searchCity);
            if (searchCategory && searchCategory !== 'All') params.append('business_segment', searchCategory);

            const res = await apiFetch(`/merchants/nearby?${params.toString()}`);
            setMerchants(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleMerchantClick = (merchant: Merchant) => {
        setSelectedMerchant(merchant);
        setDetailsOpen(true);
    };

    // Initial load from profile and fetch categories
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await apiFetch('/auth/me');
                if (res.pincode) setPincode(res.pincode);
                if (res.city) setCity(res.city);
            } catch (e) {
                console.error(e);
            }

            try {
                const cats = await apiFetch('/merchants/categories');
                if (Array.isArray(cats)) {
                    setAvailableCategories(['All', ...cats.filter(Boolean)]);
                }
            } catch (e) {
                console.error('Failed to fetch categories:', e);
            }
        };
        fetchInitialData();
    }, []);

    // Trigger search on debounce
    useEffect(() => {
        fetchMerchants(debouncedPincode, debouncedCity, debouncedCategory);
    }, [debouncedPincode, debouncedCity, debouncedCategory, fetchMerchants]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="relative w-full max-w-2xl mx-auto flex-1 flex flex-col bg-white sm:shadow-2xl sm:my-4 sm:rounded-3xl overflow-hidden animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="px-4 pt-6 pb-4 bg-white sticky top-0 z-20 shadow-sm sm:shadow-none border-b border-slate-100 sm:border-none">
                    <div className="flex items-center justify-between mb-6">
                        <BackButton className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95" />
                        <div className="text-center flex-1">
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Merchant Locator</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Find stores near you</p>
                        </div>
                        <div className="w-10 h-10"></div> {/* Spacer for symmetry */}
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="w-1/3 relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                                <input
                                    placeholder="Pin"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                <input
                                    placeholder="Search City or Shop Name"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="flex overflow-x-auto gap-2 pb-1 -mx-2 px-2 snap-x scrollbar-hide pr-12">
                                {availableCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`shrink-0 snap-center px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-white via-white to-transparent w-16 flex items-start justify-end pr-2 pointer-events-none">
                                <button onClick={() => setCategoryModalOpen(true)} className="w-9 h-9 mt-0.5 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-sm pointer-events-auto hover:bg-red-100 hover:text-red-600 transition-colors active:scale-95">
                                    <SlidersHorizontal size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Scanning nearby stores...</p>
                        </div>
                    ) : merchants.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 pb-8">
                            {merchants.map((merchant) => (
                                <div
                                    key={merchant.id}
                                    onClick={() => handleMerchantClick(merchant)}
                                    className="p-3 border border-slate-100 rounded-2xl bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex items-center justify-between gap-4 relative shadow-sm group active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
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
                                                return <Store size={24} className="text-slate-300 group-hover:text-blue-500 transition-colors" />;
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors truncate">
                                                    {merchant.business_name || merchant.name}
                                                </h3>
                                                {merchant.business_segment && (
                                                    <span className="shrink-0 bg-blue-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg shadow-blue-600/20">
                                                        {merchant.business_segment}
                                                    </span>
                                                )}
                                                {merchant.business_nature && (
                                                    <span className="shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                                        {merchant.business_nature}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-1.5 text-slate-400 text-[10px] font-bold leading-tight">
                                                <MapPin size={12} className="shrink-0 text-slate-300" />
                                                <p className="line-clamp-2 uppercase">{(merchant.business_address && merchant.business_address !== 'null') ? merchant.business_address + ', ' : ''}{merchant.city || ''} {merchant.pincode}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-50">
                                        {merchant.mobile_number && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `tel:+91${merchant.mobile_number}`;
                                                    }}
                                                    className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all active:scale-90"
                                                >
                                                    <Phone size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`https://wa.me/91${merchant.mobile_number}`, '_blank');
                                                    }}
                                                    className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-all active:scale-90"
                                                >
                                                    <MessageCircle size={14} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMerchantClick(merchant);
                                            }}
                                            className="w-9 h-9 rounded-xl bg-blue-600 text-white hover:bg-slate-900 flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-90"
                                        >
                                            <Navigation size={14} className="rotate-90 ml-[-1px] mt-[1px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 text-center px-10">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
                                <Navigation size={32} className="text-slate-200 animate-bounce" />
                            </div>
                            <h3 className="text-slate-900 font-black text-lg mb-2">No Merchants Found</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                Try adjusting your search or filters to find merchants in your area
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <MerchantDetailsModal
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                merchant={selectedMerchant}
            />

            {/* Category Modal */}
            {categoryModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setCategoryModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="font-black text-slate-900 text-lg">Select Category</h3>
                            <button onClick={() => setCategoryModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {availableCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setCategoryModalOpen(false);
                                        }}
                                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border text-left ${category === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-200 hover:shadow-md'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
