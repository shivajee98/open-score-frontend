import React from 'react';
import { Phone, Mail, X, Headphones } from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    if (!isOpen) return null;

    // Generate random phone number and support info for demo purposes
    const randomPhone = `+91 ${Math.floor(9000000000 + Math.random() * 900000000)}`;
    const supportEmail = "support@openscore.com";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            ></div>

            {/* Modal Content */}
            <div
                className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8 pt-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 text-white shadow-xl shadow-blue-500/20">
                        <Headphones size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Support Center</h3>
                    <p className="text-slate-500 font-medium text-sm">We're here to help you 24/7</p>
                </div>

                <div className="space-y-4">
                    <a href={`tel:${randomPhone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm group-hover:text-blue-600 group-hover:scale-110 transition-all border border-slate-50">
                            <Phone size={22} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Customer Care</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{randomPhone}</p>
                        </div>
                    </a>

                    <a href={`mailto:${supportEmail}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm group-hover:text-blue-600 group-hover:scale-110 transition-all border border-slate-50">
                            <Mail size={22} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Support</p>
                            <p className="text-sm font-black text-slate-900">{supportEmail}</p>
                        </div>
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Average Wait Time: &lt; 2 Mins
                    </div>
                </div>
            </div>
        </div>
    );
}
