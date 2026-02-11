'use client';

import { ArrowLeft, Shield, Lock, Eye, Server, FileText, Mail, Globe, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl -ml-12 -mb-12"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all mb-8"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Your Data, Our Responsibility</p>
                        </div>
                    </div>

                    <div className="inline-block px-4 py-1.5 bg-blue-500/20 text-blue-200 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                        Last Updated: {lastUpdated}
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-8 relative z-20 space-y-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <p className="text-slate-600 leading-relaxed font-medium">
                        Welcome to <span className="font-black text-slate-900">OpenScore</span>. Your privacy is paramount to us.
                        This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our platform.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Information Collection */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Information We Collect</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Information</h3>
                                <ul className="space-y-2">
                                    {['Name', 'Email Address', 'Mobile Number', 'Business Details', 'Payment Information'].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Non-Personal Information</h3>
                                <ul className="space-y-2">
                                    {['Device & Browser Info', 'IP Address', 'Usage & Analytics'].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* How We Use Info */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <Server size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">How We Use Data</h2>
                        </div>
                        <ul className="space-y-3">
                            {[
                                'Provide and improve our services',
                                'Process transactions and payouts',
                                'Provide cashback & reward services',
                                'Send notifications & updates',
                                'Prevent fraud & improve security',
                                'Provide customer support'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">{i + 1}</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Services Covered */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                <Globe size={20} />
                            </div>
                            <h2 className="text-lg font-black">Services Covered</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Discount Services', 'Cashback Services', 'Reward Services', 'Earning Services', 'Payout Services', 'Value-added Services'].map((tag) => (
                                <span key={tag} className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-slate-200">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Usage Scope</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 font-medium">
                                <p>• Daily shopping</p>
                                <p>• Business purchases</p>
                                <p>• Utility payments</p>
                                <p>• Professional services</p>
                                <p>• Vendor payments</p>
                                <p>• Business growth</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sharing & Security */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock size={20} className="text-indigo-500" />
                            <h2 className="text-lg font-black text-slate-900">Data Sharing</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-medium">
                            We <span className="font-black text-indigo-700">do not sell</span> personal data.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 font-medium">
                            <li>• Payment gateway partners</li>
                            <li>• Service providers</li>
                            <li>• Legal authorities (if required)</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye size={20} className="text-rose-500" />
                            <h2 className="text-lg font-black text-slate-900">Security & Tracking</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            We use industry-standard security measures. We may use cookies to enhance your experience, which you can disable in your browser.
                        </p>
                        <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Disclaimer</h4>
                            <p className="text-xs text-rose-700">No method of online transmission is 100% secure.</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100 text-center">
                    <h2 className="text-lg font-black text-slate-900 mb-6">Contact Us</h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm font-medium text-slate-600 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                            <Mail size={16} className="text-slate-400" />
                            <span>support@openscore.in</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                            <Globe size={16} className="text-slate-400" />
                            <span>www.openscore.in</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                            <Building2 size={16} className="text-slate-400" />
                            <span>OpenScore Financials</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} OpenScore. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}