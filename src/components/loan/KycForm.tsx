'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Shield,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    User,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    CreditCard,
    Calendar,
    IndianRupee,
    FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '@/store/useStore';
import { apiFetch } from '@/lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface KycFormProps {
    onSubmit: (data: any) => void;
    onCancel?: () => void;
    loanAmount: number;
    loading?: boolean;
    initialData?: Partial<any>;
    isModal?: boolean;
}

const STEPS = [
    { id: 'purpose', title: 'Purpose', desc: 'Loan requirements', icon: IndianRupee },
    { id: 'personal', title: 'Personal', desc: 'Basic information', icon: User },
    { id: 'identity', title: 'Identity', desc: 'Verified documents', icon: Shield },
    { id: 'employment', title: 'Work', desc: 'Income & profession', icon: Briefcase },
    { id: 'consent', title: 'Review', desc: 'Final application', icon: FileText },
];

export default function KycForm({ onSubmit, onCancel, loanAmount, loading, initialData, isModal = false }: KycFormProps) {
    const { user } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [uniquenessErrors, setUniquenessErrors] = useState<{ aadhar?: string, pan?: string }>({});
    const [checkingUniqueness, setCheckingUniqueness] = useState<{ aadhar?: boolean, pan?: boolean }>({});

    // Dynamic schema based on role
    const kycSchema = z.object({
        first_name: z.string().min(2, 'First name is too short'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number'),
        birth_date: z.string().min(1, 'Birth date is required').refine((val) => {
            const birthDate = new Date(val);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 15;
        }, { message: 'Minimum age is 15' }).refine((val) => {
            const birthDate = new Date(val);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // If below 18, must be a student
            if (age < 18 && user?.role !== 'STUDENT') {
                return false;
            }
            return true;
        }, { message: 'Only students can apply if under 18' }),

        annual_income: z.string().min(1, 'Income is required'),
        loan_usage: z.string().min(5, 'Please provide more detail about loan usage'),

        aadhar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
        pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN Card format (e.g. ABCDE1234F)'),

        street_address: z.string().min(5, 'Address is too short'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        postal_code: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),

        employer: z.string().min(2, 'Employer name is required'),
        occupation: z.string().min(2, 'Occupation is required'),

        referral_code: z.string().optional(),
        consent: z.boolean().refine(val => val === true, 'You must agree to the terms'),
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(kycSchema),
        mode: 'onChange',
        defaultValues: {
            consent: false,
            referral_code: '',
            ...initialData
        }
    });

    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                let value = (initialData as any)[key];

                // Extra safety: Sanitize state if it contains email (prevent mapping bugs)
                if (key === 'state' && typeof value === 'string' && value.includes('@')) {
                    value = '';
                }

                if (value !== undefined) {
                    setValue(key as any, value);
                }
            });
        }
    }, [initialData, setValue]);

    const aadharValue = watch('aadhar_number');
    const panValue = watch('pan_number');

    useEffect(() => {
        if (aadharValue && aadharValue.length === 12) {
            checkUniqueness('aadhar', aadharValue);
        } else {
            setUniquenessErrors(prev => ({ ...prev, aadhar: undefined }));
        }
    }, [aadharValue]);

    useEffect(() => {
        if (panValue && panValue.length === 10) {
            checkUniqueness('pan', panValue);
        } else {
            setUniquenessErrors(prev => ({ ...prev, pan: undefined }));
        }
    }, [panValue]);

    const checkUniqueness = async (type: 'aadhar' | 'pan', value: string) => {
        setCheckingUniqueness(prev => ({ ...prev, [type]: true }));
        try {
            const res = await apiFetch('/loans/check-kyc-uniqueness', {
                method: 'POST',
                body: JSON.stringify({ type, value })
            });

            if (!res.unique) {
                setUniquenessErrors(prev => ({ ...prev, [type]: res.message }));
            } else {
                setUniquenessErrors(prev => ({ ...prev, [type]: undefined }));
            }
        } catch (e) {
            console.error('Failed to check uniqueness', e);
        } finally {
            setCheckingUniqueness(prev => ({ ...prev, [type]: false }));
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);
        const isStepValid = await trigger(fieldsToValidate as any);

        // Prevent next step if uniqueness check is failing
        if (currentStep === 2 && (uniquenessErrors.aadhar || uniquenessErrors.pan)) {
            return;
        }

        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const getFieldsForStep = (step: number) => {
        switch (step) {
            case 0: return ['annual_income', 'loan_usage', 'referral_code'];
            case 1: return ['first_name', 'last_name', 'email', 'phone', 'birth_date'];
            case 2: return ['aadhar_number', 'pan_number', 'street_address', 'city', 'state', 'postal_code'];
            case 3: return ['employer', 'occupation'];
            case 4: return ['consent'];
            default: return [];
        }
    };

    const inputClasses = "w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-sm";
    const labelClasses = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 ml-1";
    const errorClasses = "text-[10px] font-bold text-rose-500 mt-1 ml-2 uppercase tracking-tight";

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between shadow-inner">
                            <div>
                                <p className={labelClasses}>Loan Amount</p>
                                <p className="text-3xl font-black text-blue-600 tracking-tighter">₹{loanAmount.toLocaleString()}</p>
                            </div>
                            <IndianRupee size={32} className="text-blue-200" />
                        </div>

                        <div>
                            <label className={labelClasses}>Annual Income</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Total yearly income"
                                    {...register('annual_income')}
                                    className={`${inputClasses} pl-11`}
                                />
                            </div>
                            {errors.annual_income && <p className={errorClasses}>{errors.annual_income.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Purpose of Loan</label>
                            <textarea
                                placeholder="Why do you need this loan?"
                                {...register('loan_usage')}
                                className={`${inputClasses} min-h-[100px] resize-none`}
                            />
                            {errors.loan_usage && <p className={errorClasses}>{errors.loan_usage.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Referral Code (Optional)</label>
                            <input
                                placeholder="Agent ID or Friend's Code"
                                {...register('referral_code')}
                                className={inputClasses}
                            />
                            <p className="text-[9px] text-blue-500 font-bold mt-1 ml-2">
                                Use a friend's code to earn rewards!
                            </p>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>First Name</label>
                                <input placeholder="John" {...register('first_name')} className={inputClasses} />
                                {errors.first_name && <p className={errorClasses}>{errors.first_name.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Last Name</label>
                                <input placeholder="Doe" {...register('last_name')} className={inputClasses} />
                                {errors.last_name && <p className={errorClasses}>{errors.last_name.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Birth Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                <input type="date" {...register('birth_date')} className={`${inputClasses} pl-11`} />
                            </div>
                            {errors.birth_date && <p className={errorClasses}>{errors.birth_date.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                <input type="email" placeholder="name@email.com" {...register('email')} className={`${inputClasses} pl-11`} />
                            </div>
                            {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                <input type="tel" maxLength={10} placeholder="9876543210" {...register('phone')} className={`${inputClasses} pl-11`} />
                            </div>
                            {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className={labelClasses}>Aadhaar Card (12 Digits)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0000 0000 0000"
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/\D/g, '').slice(0, 12);
                                    }}
                                    {...register('aadhar_number')}
                                    className={cn(inputClasses, (errors.aadhar_number || uniquenessErrors.aadhar) && "border-rose-500 ring-rose-50")}
                                />
                                {errors.aadhar_number && <p className={errorClasses}>{errors.aadhar_number.message}</p>}
                                {uniquenessErrors.aadhar && <p className={errorClasses}>{uniquenessErrors.aadhar}</p>}
                                {checkingUniqueness.aadhar && <p className="text-[9px] text-blue-500 mt-1 ml-2 font-bold animate-pulse uppercase tracking-widest">Verifying Aadhaar...</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>PAN Card Number</label>
                                <input
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                    {...register('pan_number', {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                        }
                                    })}
                                    className={cn(inputClasses, "uppercase tracking-widest", (errors.pan_number || uniquenessErrors.pan) && "border-rose-500 ring-rose-50")}
                                />
                                {errors.pan_number && <p className={errorClasses}>{errors.pan_number.message}</p>}
                                {uniquenessErrors.pan && <p className={errorClasses}>{uniquenessErrors.pan}</p>}
                                {checkingUniqueness.pan && <p className="text-[9px] text-blue-500 mt-1 ml-2 font-bold animate-pulse uppercase tracking-widest">Verifying PAN...</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Street Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
                                <textarea placeholder="House No, Area, Landmark" {...register('street_address')} className={`${inputClasses} pl-11 min-h-[80px]`} />
                            </div>
                            {errors.street_address && <p className={errorClasses}>{errors.street_address.message}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={labelClasses}>City</label>
                                <input placeholder="City" {...register('city')} className={inputClasses} />
                                {errors.city && <p className={errorClasses}>{errors.city.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>State</label>
                                <select {...register('state')} className={inputClasses}>
                                    <option value="">Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                                {errors.state && <p className={errorClasses}>{errors.state.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>PIN Code</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="6 digits"
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/\D/g, '').slice(0, 6);
                                    }}
                                    {...register('postal_code')}
                                    className={inputClasses}
                                />
                                {errors.postal_code && <p className={errorClasses}>{errors.postal_code.message}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className={labelClasses}>Current Employer / Shop Name</label>
                            <input placeholder="Company or Business Name" {...register('employer')} className={inputClasses} />
                            {errors.employer && <p className={errorClasses}>{errors.employer.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Occupation / Role</label>
                            <input placeholder="e.g. Sales Manager, Shop Owner" {...register('occupation')} className={inputClasses} />
                            {errors.occupation && <p className={errorClasses}>{errors.occupation.message}</p>}
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-12">
                            <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-3">
                                <Shield className="w-4 h-4 text-blue-500" />
                                Safe & Secure
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Your information is encrypted and only used for credit assessment. We never share your sensitive data with third parties without permission.
                            </p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">Final Review</h3>
                                <p className="text-blue-100 text-sm font-medium">Please confirm all details are correct before submitting.</p>
                            </div>
                            <FileText size={120} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
                        </div>

                        <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 scrollbar-hide py-2">
                            <ReviewItem label="Name" value={`${watch('first_name')} ${watch('last_name')}`} icon={User} />
                            <ReviewItem label="Phone" value={watch('phone')} icon={Phone} />
                            <ReviewItem label="Income" value={`₹${watch('annual_income')}`} icon={IndianRupee} />
                            <ReviewItem label="Address" value={`${watch('street_address')}, ${watch('city')} - ${watch('postal_code')}`} icon={MapPin} />
                            {/* Simplified review to avoid too much height */}
                        </div>

                        <label className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <div className="mt-1">
                                <input
                                    type="checkbox"
                                    {...register('consent')}
                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-wide mb-1">Declaration</p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    I certify that the information provided is true and accurate. I authorize Open Score to verify my identity and assess my creditworthiness.
                                </p>
                                {errors.consent && <p className={errorClasses}>{errors.consent.message}</p>}
                            </div>
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    const formContent = (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Vertical Steps Progress */}
            <div className="hidden md:flex flex-col gap-6 w-48 pt-4">
                {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStep;
                    const isCompleted = idx < currentStep;

                    return (
                        <div key={idx} className="flex items-center gap-4 group">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                                    isCompleted ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}>
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    isActive ? "text-blue-600" : "text-slate-400"
                                )}>
                                    {step.title}
                                </span>
                                <span className="text-[9px] text-slate-300 font-bold uppercase truncate">{step.desc}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Horizontal Progress (Minimal) */}
            <div className="flex md:hidden items-center gap-1.5 px-2 mb-4">
                {STEPS.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            idx === currentStep ? "flex-1 bg-blue-600" :
                                idx < currentStep ? "w-8 bg-emerald-500" : "w-4 bg-slate-100"
                        )}
                    />
                ))}
            </div>

            <div className="flex-1">
                {renderStep()}

                {/* Navigation */}
                <div className="flex gap-3 pt-8 mt-4 border-t border-slate-50">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-[2] py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                        >
                            Continue <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading || !isValid}
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Submit Application'}
                            {!loading && <Check size={18} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-300">
                <div className="w-full max-w-2xl bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl my-8 animate-in slide-in-from-bottom-10 duration-500 relative">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kyc Verification</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {STEPS[currentStep].title} — {STEPS[currentStep].desc}
                            </p>
                        </div>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-12 h-12 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl flex items-center justify-center transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-100 max-w-4xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Loan Application</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {STEPS[currentStep].title} — {STEPS[currentStep].desc}
                </p>
            </div>
            {formContent}
        </div>
    );
}

function ReviewItem({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-900 break-all">{value || 'Not provided'}</p>
            </div>
        </div>
    );
}
