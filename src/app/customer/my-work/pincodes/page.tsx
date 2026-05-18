'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { MapPin, Search, Users, ArrowLeft, Loader2, ChevronRight, Activity, Zap, Info, X, Phone, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import BackButton from '@/components/BackButton';

export default function AreaAnalyticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<{ active: any[], upcoming: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'global'>('active');

    // Global Pincodes state
    const [globalPincodes, setGlobalPincodes] = useState<any[]>([]);
    const [globalPage, setGlobalPage] = useState(1);
    const [globalSearch, setGlobalSearch] = useState('');
    const [hasMoreGlobal, setHasMoreGlobal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [totalGlobal, setTotalGlobal] = useState<number>(0);

    // Modal state for merchant list
    const [selectedPincode, setSelectedPincode] = useState<string | null>(null);
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loadingMerchants, setLoadingMerchants] = useState(false);
    const [merchantSearch, setMerchantSearch] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/analytics/pincodes');
            setStats(res);
        } catch (e: any) {
            toast.error(e.message || 'Failed to fetch area analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchants = async (pincode: string) => {
        setSelectedPincode(pincode);
        setLoadingMerchants(true);
        try {
            const res = await apiFetch(`/analytics/pincodes/${pincode}/merchants`);
            setMerchants(res.merchants || []);
        } catch (e: any) {
            toast.error('Failed to fetch merchant list');
        } finally {
            setLoadingMerchants(false);
        }
    };

    const fetchGlobalPincodes = async (page: number = 1, search: string = '') => {
        setLoadingGlobal(true);
        try {
            const res = await apiFetch(`/analytics/global-pincodes?page=${page}&search=${search}`);
            if (page === 1) {
                setGlobalPincodes(res.pincodes || []);
            } else {
                setGlobalPincodes(prev => [...prev, ...(res.pincodes || [])]);
            }
            setGlobalPage(res.current_page);
            setHasMoreGlobal(res.has_more);
            setTotalGlobal(res.total || 0);
        } catch (e: any) {
            toast.error(e.message || 'Failed to fetch global pincodes');
        } finally {
            setLoadingGlobal(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'global') {
                fetchGlobalPincodes(1, globalSearch);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [globalSearch, activeTab]);

    useEffect(() => {
        fetchStats();
    }, []);

    const filteredAreas = activeTab === 'global' 
        ? globalPincodes 
        : (stats?.[activeTab as 'active' | 'upcoming'] || []).filter(area => 
            area.pincode.toString().includes(searchTerm)
        );

    const filteredMerchants = merchants.filter(m =>
        m.name?.toLowerCase().includes(merchantSearch.toLowerCase()) ||
        m.business_name?.toLowerCase().includes(merchantSearch.toLowerCase()) ||
        m.mobile_number?.includes(merchantSearch)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 select-none animate-in fade-in duration-500">
            {/* Minimal Sticky Header */}
            <div className="bg-white px-4 pt-10 pb-4 shadow-sm border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <BackButton className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        <ArrowLeft size={16} />
                    </BackButton>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Pincode List</h1>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Market Network Index (One Layer)</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

                {/* Compact Metrics Row */}
                {activeTab !== 'global' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                <Zap size={16} className="fill-current" />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Active</p>
                                <h3 className="text-sm font-black text-slate-900 leading-none">{stats?.active.length || 0}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Upcoming</p>
                                <h3 className="text-sm font-black text-slate-900 leading-none">{stats?.upcoming.length || 0}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compact Search & Tabs */}
                <div className="space-y-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Filter by pincode..."
                            value={activeTab === 'global' ? globalSearch : searchTerm}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (activeTab === 'global') {
                                    setGlobalSearch(val);
                                } else {
                                    setSearchTerm(val);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-50 rounded-xl text-[10px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-indigo-50/50"
                        />
                        {activeTab === 'global' && totalGlobal > 0 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                                <span className="text-[7px] font-black text-indigo-600 uppercase tracking-tighter">{totalGlobal} Zones</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-200/50 p-1 rounded-xl flex">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'active' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400"}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'upcoming' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400"}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'global' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400"}`}
                        >
                            Global
                        </button>
                    </div>
                </div>

                {/* Compact List */}
                <div className="grid grid-cols-1 gap-3 pb-20">
                    {loadingGlobal && activeTab === 'global' && globalPincodes.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2">
                             <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Searching Map...</p>
                        </div>
                    ) : filteredAreas.length === 0 ? (
                        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-100">
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">No matching areas</p>
                        </div>
                    ) : (
                        <>
                            {filteredAreas.map((area) => (
                                <div
                                    key={area.pincode}
                                    onClick={() => activeTab !== 'global' && fetchMerchants(area.pincode)}
                                    className={`bg-white p-3 rounded-2xl border border-slate-50 flex items-center justify-between shadow-sm transition-all ${activeTab !== 'global' ? 'active:scale-95 cursor-pointer' : 'cursor-default opacity-80'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none">{area.pincode}</h4>
                                            {activeTab !== 'global' && (
                                                <p className="text-[8px] font-black text-indigo-500 uppercase mt-1 leading-none">
                                                    {area.mapped_count || area.merchant_count || 0} Merchants
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {activeTab !== 'global' && <ChevronRight size={14} className="text-slate-200" />}
                                </div>
                            ))}

                            {activeTab === 'global' && hasMoreGlobal && (
                                <button
                                    onClick={() => fetchGlobalPincodes(globalPage + 1, globalSearch)}
                                    disabled={loadingGlobal}
                                    className="w-full py-4 bg-white border border-slate-100 rounded-2xl text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 mt-2 shadow-sm"
                                >
                                    {loadingGlobal ? 'Searching Map...' : 'Load Next 50 Zones'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Merchant Modal (Compact) */}
            {selectedPincode && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4" onClick={() => setSelectedPincode(null)}>
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"></div>

                    <div
                        className="bg-white w-full max-w-lg h-[60vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative z-10 animate-in translate-y-full slide-in-from-bottom duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 pb-2 flex justify-between items-center bg-white border-b border-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-none">{selectedPincode}</h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Merchant Roster</p>
                            </div>
                            <button onClick={() => setSelectedPincode(null)} className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar bg-slate-50/30">
                            {loadingMerchants ? (
                                <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /></div>
                            ) : filteredMerchants.length === 0 ? (
                                <p className="py-12 text-center text-[7px] font-black uppercase text-slate-300">Empty Area</p>
                            ) : (
                                filteredMerchants.map((m) => (
                                    <div key={m.id} className="bg-white p-1.5 rounded-lg border border-slate-100 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">
                                                {m.business_name?.[0] || 'B'}
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="font-black text-slate-900 text-[9px] uppercase truncate leading-none mb-0.5 italic">{m.business_name || 'Business'}</h5>
                                                <p className="text-[7px] font-bold text-slate-400 leading-none">{m.mobile_number}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[6px] font-black text-indigo-500 uppercase leading-none truncate max-w-[90px]">{m.name}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f5f8;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
