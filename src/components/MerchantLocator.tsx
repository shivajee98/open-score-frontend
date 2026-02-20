"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, X, Store, Navigation } from "lucide-react";
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
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [showAll, setShowAll] = useState(false);

    // Reset when search terms change
    useEffect(() => {
        setShowAll(false);
    }, [pincode, city]);

    // Details Modal State
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const debouncedPincode = useDebounce(pincode, 500);
    const debouncedCity = useDebounce(city, 500);

    const fetchMerchants = useCallback(async (searchPincode: string, searchCity: string) => {
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
        if (open && (debouncedPincode || debouncedCity)) {
            fetchMerchants(debouncedPincode, debouncedCity);
        }
    }, [debouncedPincode, debouncedCity, open, fetchMerchants]);

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
                    <div className={`relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col transition-all ${showAll ? 'h-[92vh]' : 'max-h-[85vh]'}`}>

                        <button
                            onClick={() => {
                                if (showAll) {
                                    setShowAll(false);
                                } else {
                                    setOpen(false);
                                }
                            }}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-3 ring-4 ring-blue-50">
                                <Store size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900">{showAll ? "All Found Merchants" : "Find Merchants"}</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Locate stores near you</p>
                        </div>

                        {!showAll && (
                            <div className="space-y-3 mb-6 shrink-0">
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
                        )}

                        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : merchants.length > 0 ? (
                                <>
                                    {(showAll ? merchants : merchants.slice(0, 3)).map((merchant) => (
                                        <div
                                            key={merchant.id}
                                            onClick={() => handleMerchantClick(merchant)}
                                            className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-center gap-4">
                                                {showAll && (
                                                    <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                                                        {(() => {
                                                            let imgs: string[] = [];
                                                            try { imgs = merchant.shop_images ? JSON.parse(merchant.shop_images) : []; } catch (e) { }
                                                            if (imgs.length > 0) return <img src={imgs[0]} className="w-full h-full object-cover" alt="Shop" />;
                                                            return <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100"><Store size={20} className="mb-0.5 opacity-40" /></div>;
                                                        })()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{merchant.business_name || merchant.name}</h3>
                                                    <div className="flex items-start gap-2 mt-2 text-slate-500 text-xs font-medium">
                                                        <MapPin size={14} className="mt-0.5 shrink-0" />
                                                        <p className="truncate">{(merchant.business_address && merchant.business_address !== 'null') ? merchant.business_address + ', ' : ''}{merchant.city || ''} {merchant.pincode}</p>
                                                    </div>
                                                    {showAll && merchant.mobile_number && (
                                                        <div className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">
                                                            +91 {merchant.mobile_number}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Details Arrow */}
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                                    <Navigation size={14} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {!showAll && merchants.length > 3 && (
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="w-full py-4 mt-2 mb-2 bg-slate-50 border-2 border-dashed border-slate-200 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            View {merchants.length - 3} More stores
                                        </button>
                                    )}
                                </>
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
