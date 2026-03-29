'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';

export interface ShopTimingData {
    type: 'daily' | 'weekly';
    daily: { open: string; close: string };
    weekly: Record<string, { isOpen: boolean; open: string; close: string }>;
}

const DEFAULT_TIMING: ShopTimingData = {
    type: 'daily',
    daily: { open: '09:00', close: '21:00' },
    weekly: {
        monday: { isOpen: true, open: '09:00', close: '21:00' },
        tuesday: { isOpen: true, open: '09:00', close: '21:00' },
        wednesday: { isOpen: true, open: '09:00', close: '21:00' },
        thursday: { isOpen: true, open: '09:00', close: '21:00' },
        friday: { isOpen: true, open: '09:00', close: '21:00' },
        saturday: { isOpen: true, open: '09:00', close: '21:00' },
        sunday: { isOpen: false, open: '09:00', close: '21:00' },
    }
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface ShopTimingModalProps {
    isOpen: boolean;
    initialData: ShopTimingData | null;
    onClose: () => void;
    onSave: (data: ShopTimingData) => void;
    themeColor?: string;
}

export default function ShopTimingModal({ isOpen, initialData, onClose, onSave, themeColor = 'blue' }: ShopTimingModalProps) {
    const [timing, setTiming] = useState<ShopTimingData>(DEFAULT_TIMING);

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.type) {
                setTiming(initialData);
            } else {
                setTiming(DEFAULT_TIMING);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleWeeklyChange = (day: string, field: 'isOpen' | 'open' | 'close', value: any) => {
        setTiming(prev => ({
            ...prev,
            weekly: {
                ...prev.weekly,
                [day]: {
                    ...prev.weekly[day],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Clock className={`text-${themeColor}-500`} size={24} />
                            Shop Timing
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Set your business hours</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                    <button 
                        onClick={() => setTiming({ ...timing, type: 'daily' })}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${timing.type === 'daily' ? `bg-white text-${themeColor}-600 shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Clock size={16} /> Daily Same
                    </button>
                    <button 
                        onClick={() => setTiming({ ...timing, type: 'weekly' })}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${timing.type === 'weekly' ? `bg-white text-${themeColor}-600 shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <CalendarDays size={16} /> Weekly Custom
                    </button>
                </div>

                <div className="mb-8">
                    {timing.type === 'daily' ? (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                            <h4 className="text-sm font-black text-slate-700 mb-2">Opens Every Day At</h4>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Opening Time</p>
                                    <input 
                                        type="time" 
                                        value={timing.daily.open}
                                        onChange={(e) => setTiming({ ...timing, daily: { ...timing.daily, open: e.target.value }})}
                                        className={`w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-200 outline-none transition-all`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Closing Time</p>
                                    <input 
                                        type="time" 
                                        value={timing.daily.close}
                                        onChange={(e) => setTiming({ ...timing, daily: { ...timing.daily, close: e.target.value }})}
                                        className={`w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-200 outline-none transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {DAYS.map(day => (
                                <div key={day} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${timing.weekly[day].isOpen ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                                    <div className="w-24 shrink-0">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={timing.weekly[day].isOpen}
                                                onChange={(e) => handleWeeklyChange(day, 'isOpen', e.target.checked)}
                                                className={`w-4 h-4 rounded text-${themeColor}-600 focus:ring-${themeColor}-500`}
                                            />
                                            <span className="text-sm font-bold text-slate-700 capitalize">{day.slice(0,3)}</span>
                                        </label>
                                    </div>
                                    
                                    {timing.weekly[day].isOpen ? (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                value={timing.weekly[day].open}
                                                onChange={(e) => handleWeeklyChange(day, 'open', e.target.value)}
                                                className={`w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:border-${themeColor}-500 outline-none`}
                                            />
                                            <span className="text-slate-400 font-bold">-</span>
                                            <input 
                                                type="time" 
                                                value={timing.weekly[day].close}
                                                onChange={(e) => handleWeeklyChange(day, 'close', e.target.value)}
                                                className={`w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:border-${themeColor}-500 outline-none`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 text-xs font-bold text-slate-400 text-center bg-slate-100 py-2 rounded-lg">
                                            Closed
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white pt-4">
                    <button 
                        onClick={() => {
                            onSave(timing);
                            onClose();
                        }}
                        className={`w-full py-4 bg-${themeColor}-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-${themeColor}-600/30 hover:bg-${themeColor}-700 active:scale-95 transition-all flex items-center justify-center gap-2`}
                    >
                        <CheckCircle2 size={18} />
                        Save Timing
                    </button>
                </div>
            </div>
        </div>
    );
}
