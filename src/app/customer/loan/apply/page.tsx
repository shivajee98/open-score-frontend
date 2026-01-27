'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Zap, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function LoanApplication() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        address: '',
        city: '',
        pinCode: '',
        altMobile: '',
        whatsappTicket: '' // Placeholder field as requested
    });

    const handleInputChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: any) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API check
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const offers = [
        {
            amount: '10,000',
            type: 'Credit',
            details: '10 Minutes • ₹500 Platform Fee',
            bestFor: 'Urgent',
            color: 'bg-emerald-500'
        },
        {
            amount: '30,000',
            type: 'Credit',
            details: '0% Interest (3 Months)',
            bestFor: 'Short Term',
            color: 'bg-blue-500'
        },
        {
            amount: '50,000',
            type: 'Credit',
            details: '6% Monthly (3 Months) • One Time 16%',
            bestFor: 'Medium Term',
            color: 'bg-purple-500'
        },
        {
            amount: '50,000',
            type: 'Credit',
            details: '12% Monthly (6 Months) • Half Yearly 18%',
            bestFor: 'Long Term',
            color: 'bg-indigo-500'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-md mx-auto">
                <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Apply for Loan</h1>
                        <p className="text-slate-500 text-sm font-medium">Get instant approval in minutes.</p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleFormSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Full Name (As per Aadhaar)</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                    placeholder="e.g. Rahul Kumar"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Pin Code</label>
                                    <input
                                        type="text"
                                        name="pinCode"
                                        value={formData.pinCode}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm resize-none"
                                    placeholder="Enter your current address"
                                    rows={2}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                    placeholder="e.g. Mumbai"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">Alternate Mobile No</label>
                                <input
                                    type="tel"
                                    name="altMobile"
                                    value={formData.altMobile}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                    placeholder="+91"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-4">WhatsApp Ticket (Optional)</label>
                                <input
                                    type="text"
                                    name="whatsappTicket"
                                    value={formData.whatsappTicket}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
                                    placeholder="#TICKET123"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Checking Eligibility...' : 'Virtual Credit'} <Zap className="w-4 h-4 text-yellow-400" />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <Check className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-emerald-800 font-bold text-sm">Congratulations!</p>
                                    <p className="text-emerald-600 text-xs font-medium">You are eligible for the following offers.</p>
                                </div>
                            </div>

                            {offers.map((offer, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative group overflow-hidden transition-all hover:border-slate-300">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${offer.color}`}></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{offer.type}</p>
                                            <h3 className="text-2xl font-black text-slate-900">₹ {offer.amount}</h3>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white ${offer.color}`}>
                                            {offer.bestFor}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-medium text-xs mb-4">{offer.details}</p>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors">
                                            Details
                                        </button>
                                        <button className={`py-2.5 text-white rounded-xl font-bold text-xs shadow-lg transition-colors ${offer.color}`}>
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                        <CreditCard className="w-3 h-3" /> 100% Digital Process
                    </p>
                </div>
            </div>
        </div>
    );
}

