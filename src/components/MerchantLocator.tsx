"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
    description?: string;
    name?: string;
    email?: string;
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
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pincode, setPincode] = useState("");
    const [city, setCity] = useState("");
    const [merchants, setMerchants] = useState<Merchant[]>([]);

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

    // Fetch full details when a merchant is selected
    const handleMerchantClick = (merchant: Merchant) => {
        navigate(`/merchants/${merchant.id}`);
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
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">

                        <button
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-3 ring-4 ring-blue-50">
                                <Store size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900">Find Merchants</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Locate stores near you</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex gap-2">
                                <input
                                    placeholder="Pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="w-1/3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                                <input
                                    placeholder="City (Search...)"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : merchants.length > 0 ? (
                                merchants.map((merchant) => (
                                    <div
                                        key={merchant.id}
                                        onClick={() => handleMerchantClick(merchant)}
                                        className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{merchant.business_name}</h3>
                                                <div className="flex items-start gap-2 mt-2 text-slate-500 text-xs font-medium">
                                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                                    <p>{merchant.business_address}, {merchant.city}, {merchant.pincode}</p>
                                                </div>
                                            </div>
                                            {/* Details Arrow */}
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Navigation size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <Navigation size={32} className="mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No merchants found</p>
                                </div>
                            )}
                        </div>

                        {/* Advanced Search Button */}
                        <div className="pt-4 border-t border-slate-100 mt-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate(`/merchants/search?pincode=${pincode}&city=${city}`);
                                }}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Search size={16} /> Advanced Search & Filters
                            </button>
                        </div>
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
