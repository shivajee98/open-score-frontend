'use client';

import { useState } from 'react';
import { Shield, ChevronRight, Check } from 'lucide-react';

interface KycFormProps {
    onSubmit: (data: any) => void;
    loanAmount: number;
    loading?: boolean;
}

export default function KycForm({ onSubmit, loanAmount, loading }: KycFormProps) {
    const [formData, setFormData] = useState({
        desired_amount: loanAmount,
        annual_income: '',
        loan_usage: '',
        first_name: '',
        last_name: '',
        birth_month: '',
        birth_day: '',
        birth_year: '',
        marital_status: '',
        email: '',
        phone: '',
        street_address: '',
        street_address_2: '',
        city: '',
        state: '',
        postal_code: '',
        address_duration: '',
        employer: '',
        occupation: '',
        experience_years: '',
        gross_monthly_income: '',
        rent_mortgage: '',
        down_payment: '',
        comments: '',
        bank_references: '',
        consent: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
    const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {/* Header */}
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Loan Application Form</h2>
                <p className="text-slate-500 text-sm">Please provide accurate information for quick verification.</p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Desired Loan Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                readOnly
                                value={loanAmount.toLocaleString()}
                                className={`${inputClasses} pl-8 bg-slate-100 font-bold`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Annual Income</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                required
                                name="annual_income"
                                value={formData.annual_income}
                                onChange={handleChange}
                                placeholder="0"
                                className={`${inputClasses} pl-8`}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Loan will be used for</label>
                    <textarea
                        required
                        name="loan_usage"
                        value={formData.loan_usage}
                        onChange={handleChange}
                        className={inputClasses}
                        rows={3}
                        placeholder="Purpose of your loan..."
                    />
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">CONTACT INFORMATION</h3>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>First Name</label>
                        <input required name="first_name" value={formData.first_name} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Last Name</label>
                        <input required name="last_name" value={formData.last_name} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Birth Date</label>
                    <div className="grid grid-cols-3 gap-2">
                        <select name="birth_month" value={formData.birth_month} onChange={handleChange} className={inputClasses}>
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select name="birth_day" value={formData.birth_day} onChange={handleChange} className={inputClasses}>
                            <option value="">Day</option>
                            {Array.from({ length: 31 }, (_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select name="birth_year" value={formData.birth_year} onChange={handleChange} className={inputClasses}>
                            <option value="">Year</option>
                            {Array.from({ length: 80 }, (_, i) => (
                                <option key={i} value={2026 - i}>{2026 - i}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="example@example.com" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Phone</label>
                        <input type="tel" required name="phone" value={formData.phone} onChange={handleChange} placeholder="(000) 000-0000" className={inputClasses} />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Street Address</label>
                    <input required name="street_address" value={formData.street_address} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Street Address Line 2</label>
                    <input name="street_address_2" value={formData.street_address_2} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <input required name="city" value={formData.city} onChange={handleChange} placeholder="City" className={inputClasses} />
                    <input required name="state" value={formData.state} onChange={handleChange} placeholder="State" className={inputClasses} />
                    <input required name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="ZIP" className={inputClasses} />
                </div>

                <div>
                    <label className={labelClasses}>How long have you lived at this address?</label>
                    <input required name="address_duration" value={formData.address_duration} onChange={handleChange} className={inputClasses} />
                </div>
            </div>

            {/* Employment */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">EMPLOYMENT INFORMATION</h3>

                <div>
                    <label className={labelClasses}>Present Employer</label>
                    <input required name="employer" value={formData.employer} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Occupation</label>
                        <input required name="occupation" value={formData.occupation} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Years of Experience</label>
                        <input type="number" required name="experience_years" value={formData.experience_years} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Gross Monthly Income</label>
                        <input type="number" required name="gross_monthly_income" value={formData.gross_monthly_income} onChange={handleChange} placeholder="1500" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Monthly Rent/Mortgage</label>
                        <input type="number" required name="rent_mortgage" value={formData.rent_mortgage} onChange={handleChange} placeholder="0" className={inputClasses} />
                    </div>
                </div>
            </div>

            {/* Others */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">REFERENCES & CONSENT</h3>

                <div>
                    <label className={labelClasses}>Bank References (List Here)</label>
                    <textarea name="bank_references" value={formData.bank_references} onChange={handleChange} className={inputClasses} rows={3} />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                        I authorize prospective Credit Grantors/Lending/Leasing Companies to obtain personal and credit information about me from my employer and credit bureau, or credit reporting agency... (full text omitted for brevity)
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-700">I agree that the information given is true, accurate and complete.</span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={!formData.consent || loading}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-base hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? 'Submitting...' : 'Send Application Now'}
                {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
        </form>
    );
}
