"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, X, Store, Navigation, Phone, MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import MerchantDetailsModal from "./MerchantDetailsModal";

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
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pincode, setPincode] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("All");
    const [merchants, setMerchants] = useState<Merchant[]>([]);

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
            // toast.error("Failed to fetch merchants."); // Optional: suppress to avoid spamming toast on typing
        } finally {
            setLoading(false);
        }
    }, []);

    const handleMerchantClick = (merchant: Merchant) => {
        setSelectedMerchant(merchant);
        setDetailsOpen(true);
    };

    // Initial load from profile
    useEffect(() => {
        if (open) {
            const fetchProfile = async () => {
                try {
                    const res = await apiFetch('/auth/me');
                    if (res.pincode) setPincode(res.pincode);
                    if (res.city) setCity(res.city);
                } catch (e) {
                    console.error(e);
                }
            }
            fetchProfile();
        }
    }, [open]);

    // Trigger search on debounce
    useEffect(() => {
        if (open) {
            fetchMerchants(debouncedPincode, debouncedCity, debouncedCategory);
        }
    }, [debouncedPincode, debouncedCity, debouncedCategory, open, fetchMerchants]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 rounded-full w-12 h-12 shadow-xl z-40 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-transform active:scale-95"
            >
                <MapPin className="w-6 h-6" />
            </button>

            {/* Locator Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
                    <div className="relative w-full h-full min-h-[100dvh] rounded-none sm:min-h-0 sm:max-w-md sm:rounded-3xl p-4 sm:p-6 sm:max-h-[92vh] flex flex-col bg-white shadow-2xl animate-in zoom-in-95 duration-300">

                        <button
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-3 ring-4 ring-blue-50">
                                <Store size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900">All Found Merchants</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Locate stores near you</p>
                        </div>

                        <div className="space-y-3 mb-4 shrink-0">
                            <div className="flex gap-2">
                                <input
                                    placeholder="Pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="w-1/3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                                <input
                                    placeholder="City / Name (Search...)"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 -mx-2 px-2 snap-x scrollbar-hide shrink-0">
                            {['All', 'Retail', 'Grocery', 'Pharmacy', 'Electronics', 'Clothing', 'Restaurant', 'Hardware', 'Services'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`shrink-0 snap-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : merchants.length > 0 ? (
                                <div className="space-y-3">
                                    {merchants.map((merchant) => (
                                        <div
                                            key={merchant.id}
                                            onClick={() => handleMerchantClick(merchant)}
                                            className="p-3 border border-slate-100 rounded-2xl bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 relative shadow-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
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
                                                        return <Store size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />;
                                                    })()}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                                        <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors truncate max-w-full">
                                                            {merchant.business_name || merchant.name}
                                                        </h3>
                                                        {merchant.business_segment && (
                                                            <span className="shrink-0 bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                                                                {merchant.business_segment}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-1.5 text-slate-500 text-[10px] font-medium leading-snug">
                                                        <MapPin size={10} className="shrink-0 mt-0.5" />
                                                        <p className="line-clamp-2">{(merchant.business_address && merchant.business_address !== 'null') ? merchant.business_address + ', ' : ''}{merchant.city || ''} {merchant.pincode}</p>
                                                    </div>
                                                </div>

                                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shadow-md shrink-0">
                                                    <Navigation size={12} className="rotate-90" />
                                                </div>
                                            </div>

                                            {merchant.mobile_number && (
                                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `tel:+91${merchant.mobile_number}`;
                                                        }}
                                                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                                    >
                                                        <Phone size={12} /> <span className="text-[10px] font-black uppercase tracking-wider">Call</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`https://wa.me/91${merchant.mobile_number}`, '_blank');
                                                        }}
                                                        className="flex-1 bg-slate-50 border border-slate-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                                    >
                                                        <MessageCircle size={12} /> <span className="text-[10px] font-black uppercase tracking-wider">Msg</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <Navigation size={32} className="mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No merchants found</p>
                                </div>
                            )}
                        </div>

                        {/* Advanced Search Button removed as legacy */}
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <MerchantDetailsModal
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                merchant={selectedMerchant}
            />
        </>
    );
}
