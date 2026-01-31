"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, X, Store, Navigation } from "lucide-react";
import axios from "axios";
import { toast } from "@/components/ui/Toast";

interface Merchant {
    id: number;
    business_name: string;
    business_address: string;
    pincode: string;
    city: string;
    mobile_number: string;
}

export default function MerchantLocator() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pincode, setPincode] = useState("");
    const [city, setCity] = useState("");
    const [merchants, setMerchants] = useState<Merchant[]>([]);

    const fetchMerchants = async () => {
        setLoading(true);
        try {
            if (pincode || city) {
                const token = localStorage.getItem("token");
                // Update profile with new location if provided
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/update-profile`, {
                    pincode,
                    city
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchants/nearby`, {
                params: { pincode, city },
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchants(res.data);
            if (res.data.length === 0) {
                toast.info("No merchants found in this area.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch merchants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            const fetchProfile = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.pincode) setPincode(res.data.pincode);
                    if (res.data.city) setCity(res.data.city);
                } catch (e) {
                    console.error(e);
                }
            }
            fetchProfile();
        }
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 rounded-full w-12 h-12 shadow-xl z-40 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-transform active:scale-95"
            >
                <MapPin className="w-6 h-6" />
            </button>

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
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={fetchMerchants}
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? "Searching..." : <><Search className="w-4 h-4" /> Search Nearby</>}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
                            {merchants.length > 0 ? (
                                merchants.map((merchant) => (
                                    <div key={merchant.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                        <h3 className="font-bold text-slate-900">{merchant.business_name}</h3>
                                        <div className="flex items-start gap-2 mt-2 text-slate-500 text-xs font-medium">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <p>{merchant.business_address}, {merchant.city}, {merchant.pincode}</p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                                            <a
                                                href={`tel:${merchant.mobile_number}`}
                                                className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5"
                                            >
                                                Call Merchant
                                            </a>
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
                    </div>
                </div>
            )}
        </>
    );
}
