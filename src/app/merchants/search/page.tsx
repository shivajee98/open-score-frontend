'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Search, Filter, Phone, Navigation, ArrowLeft, Store, ImageIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface Merchant {
    id: number;
    business_name: string;
    business_address: string;
    pincode: string;
    city: string;
    mobile_number: string;
    description: string;
    business_segment: string;
    business_type: string;
    shop_images?: string; // JSON string
    map_location_url?: string;
}

export default function MerchantSearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Search States
    const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [searchTrigger, setSearchTrigger] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        business_segment: '',
        business_type: '',
        sort: 'name_asc'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Data State
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMerchants = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (pincode) query.append('pincode', pincode);
                if (city) query.append('city', city);
                if (filters.business_segment) query.append('business_segment', filters.business_segment);
                if (filters.business_type) query.append('business_type', filters.business_type);
                if (filters.sort) query.append('sort', filters.sort);

                const res = await apiFetch(`/merchants/nearby?${query.toString()}`);
                setMerchants(res || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch merchants");
            } finally {
                setLoading(false);
            }
        };

        // Fetch if at least one search param exists or on initial load if params present
        // Or if explicitly triggered
        if (pincode || city || searchTrigger > 0) {
            fetchMerchants();
        }
    }, [searchTrigger, filters]); // Re-fetch when trigger or filters change

    const handleSearch = () => {
        setSearchTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-30 border-b border-slate-200 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-900">Find Merchants</h1>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto px-4 pb-4">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                placeholder="Pincode"
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-[1.5] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="City"
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters Toggle Bar */}
                <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                        <Filter size={14} /> Filters
                    </button>

                    {/* Quick Filters display or badges could go here */}
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value || key === 'sort') return null;
                        return (
                            <span key={key} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap border border-slate-200 capitalize">
                                {value.replace('_', ' ')}
                            </span>
                        );
                    })}
                </div>

                {/* Expanded Filters Area */}
                {showFilters && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4 animate-in slide-in-from-top-2">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort By</label>
                                <div className="flex gap-2">
                                    {['name_asc', 'name_desc', 'newest'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilters({ ...filters, sort: opt })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filters.sort === opt ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                                        >
                                            {opt === 'name_asc' ? 'Name (A-Z)' : opt === 'name_desc' ? 'Name (Z-A)' : 'Newest'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Segment</label>
                                <select
                                    value={filters.business_segment}
                                    onChange={(e) => setFilters({ ...filters, business_segment: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                                >
                                    <option value="">All Segments</option>
                                    <option value="retailer">Retailer</option>
                                    <option value="wholesaler">Wholesaler</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="super_distributor">Super Distributor</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Business Type</label>
                                <input
                                    value={filters.business_type}
                                    onChange={(e) => setFilters({ ...filters, business_type: e.target.value })}
                                    placeholder="e.g. Grocery, Electronics..."
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Results List */}
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : merchants.length > 0 ? (
                    merchants.map((merchant) => {
                        const images = merchant.shop_images ? JSON.parse(merchant.shop_images) : [];
                        return (
                            <div key={merchant.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                {/* Images Carousel */}
                                {images.length > 0 && (
                                    <div className="mb-4 -mx-4 -mt-4 rounded-t-2xl overflow-x-auto flex snap-x no-scrollbar">
                                        {images.map((img: string, idx: number) => (
                                            <img key={idx} src={img} className="w-full h-48 object-cover shrink-0 snap-center first:rounded-tl-2xl last:rounded-tr-2xl" alt={`Shop ${idx}`} />
                                        ))}
                                    </div>
                                )}
                                {!images.length && (
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <Store size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight">{merchant.business_name}</h3>
                                            <p className="text-sm font-medium text-slate-500">{merchant.business_segment || 'Retailer'}</p>
                                        </div>
                                    </div>
                                )}

                                {images.length > 0 && (
                                    <div className="mb-3">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">{merchant.business_name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {merchant.business_segment && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded text-slate-600">{merchant.business_segment}</span>
                                            )}
                                            {merchant.business_type && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded text-blue-600">{merchant.business_type}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-2 text-slate-600 text-sm">
                                        <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                        <p>{merchant.business_address}, {merchant.city}, {merchant.pincode}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Phone size={16} className="shrink-0 text-slate-400" />
                                        <p>{merchant.mobile_number}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={`tel:${merchant.mobile_number}`}
                                        className="py-2.5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <Phone size={16} /> Call Now
                                    </a>
                                    <a
                                        href={merchant.map_location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.business_name + ' ' + merchant.business_address + ' ' + merchant.city)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2.5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-sm text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                                    >
                                        <Navigation size={16} /> Get Direction
                                    </a>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No merchants found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your filters or search area</p>
                    </div>
                )}
            </div>
        </div>
    );
}
