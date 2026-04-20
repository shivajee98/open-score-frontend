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
import Camera from './Camera';

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
    { id: 'documents', title: 'Identity', desc: 'Scan Aadhaar & PAN', icon: Shield },
    { id: 'purpose', title: 'Loan', desc: 'Amount & Purpose', icon: IndianRupee },
    { id: 'personal', title: 'Personal', desc: 'Verify information', icon: User },
    { id: 'employment', title: 'Work', desc: 'Income & profession', icon: Briefcase },
    { id: 'consent', title: 'Review', desc: 'Final application', icon: FileText },
];

const DOCUMENT_CATEGORIES = [
    { id: 'aadhar_front', label: 'Aadhaar (Front)', icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { id: 'aadhar_back', label: 'Aadhaar (Back)', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'pan_front', label: 'PAN Card (Front)', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'applicant_selfie', label: "Applicant Selfie", icon: User, color: 'bg-amber-50 text-amber-600' },
];

export default function KycForm({ onSubmit, onCancel, loanAmount, loading, initialData, isModal = false }: KycFormProps) {
    const { user } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [uniquenessErrors, setUniquenessErrors] = useState<{ aadhar?: string, pan?: string, referral?: string }>({});
    const [checkingUniqueness, setCheckingUniqueness] = useState<{ aadhar?: boolean, pan?: boolean, referral?: boolean }>({});
    const [referrerName, setReferrerName] = useState<string | null>(null);

    // Dynamic schema based on role
    const kycSchema = z.object({
        first_name: z.string().min(2, 'First name is too short'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number'),
        annual_income: z.string().min(1, 'Income is required'),
        loan_usage: z.string().min(5, 'Please provide more detail about loan usage'),

        employer: z.string().min(2, 'Employer name is required'),
        occupation: z.string().min(2, 'Occupation is required'),

        aadhar_number: z.string().length(12, 'Aadhaar number must be 12 digits'),
        pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
        date_of_birth: z.string().min(1, 'Date of birth is required'),
        
        father_name: z.string().min(2, 'Father name is required'),
        mother_name: z.string().min(2, 'Mother name is required'),
        marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),

        street_address: z.string().min(5, 'Address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        postal_code: z.string().length(6, 'Pincode must be 6 digits'),

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
            first_name: user?.name?.split(' ')[0] || '',
            last_name: user?.name?.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
            phone: user?.mobile_number || '',
            employer: user?.role === 'STUDENT' ? (user?.student_profile?.school_name || '') : (user?.business_name || ''),
            occupation: user?.role === 'STUDENT' ? (user?.student_profile?.course_name || 'Student') : '',
            aadhar_number: user?.aadhar_number || '',
            pan_number: user?.pan_number || '',
            date_of_birth: user?.date_of_birth || '',
            father_name: user?.family_detail?.father_name || '',
            mother_name: user?.family_detail?.mother_name || '',
            marital_status: user?.marital_status || 'Single',
            street_address: user?.business_address || '',
            city: user?.city || '',
            state: user?.state || '',
            postal_code: user?.pincode || '',
            ...initialData
        }
    });

    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                let value = (initialData as any)[key];

                if (value !== undefined) {
                    setValue(key as any, value);
                }
            });
        }
    }, [initialData, setValue]);




    const referralValue = watch('referral_code');

    useEffect(() => {
        if (referralValue && referralValue.length >= 4) {
            const timer = setTimeout(() => {
                checkReferral(referralValue);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setUniquenessErrors(prev => ({ ...prev, referral: undefined }));
            setReferrerName(null);
        }
    }, [referralValue]);

    const checkReferral = async (code: string) => {
        setCheckingUniqueness(prev => ({ ...prev, referral: true }));
        setUniquenessErrors(prev => ({ ...prev, referral: undefined }));
        try {
            const res = await apiFetch('/referral/verify-code', {
                method: 'POST',
                body: JSON.stringify({ code: code.toUpperCase() }),
                skipAuthCheck: true
            });
            if (!res.valid) {
                setUniquenessErrors(prev => ({ ...prev, referral: 'Invalid referral code' }));
                setReferrerName(null);
            } else {
                setReferrerName(res.referrer_name);
            }
        } catch (e) {
            setUniquenessErrors(prev => ({ ...prev, referral: 'Invalid referral code' }));
            setReferrerName(null);
        } finally {
            setCheckingUniqueness(prev => ({ ...prev, referral: false }));
        }
    };


    const checkUniqueness = async (type: 'aadhar' | 'pan', value: string) => {
        setCheckingUniqueness(prev => ({ ...prev, [type]: true }));
        try {
            const res = await apiFetch('/loans/check-kyc-uniqueness', {
                method: 'POST',
                body: JSON.stringify({ type, value })
            });

            if (!res.unique) {
                setUniquenessErrors(prev => ({ ...prev, [type]: 'Apply for loan from another account' }));
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
        // Enforce document uploads if in Step 0
        if (currentStep === 0) {
            const missingDocs = DOCUMENT_CATEGORIES.filter(cat => !capturedImages[cat.id]);
            if (missingDocs.length > 0) {
                setErrorPopup(`कृपया सभी दस्तावेज अपलोड करें: ${missingDocs.map(d => d.label).join(', ')}`);
                return;
            }
        }

        const fieldsToValidate = getFieldsForStep(currentStep);
        if (fieldsToValidate.length > 0) {
            const isStepValid = await trigger(fieldsToValidate as any);
            if (!isStepValid) return;
        }

        // Prevent next step if uniqueness check is failing
        if (currentStep === 1 && referralValue && (checkingUniqueness.referral || uniquenessErrors.referral)) {
            return;
        }

        // Prevent next step if uniqueness check is failing (Personal step now at index 2)
        if (currentStep === 2 && (uniquenessErrors.aadhar || uniquenessErrors.pan)) {
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const [activeCameraCategory, setActiveCameraCategory] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrResults, setOcrResults] = useState<Record<string, any>>({});
    const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
    const [errorPopup, setErrorPopup] = useState<string | null>(null);

    const uploadToServer = async (blob: Blob, type?: string) => {
        const fd = new FormData();
        fd.append('file', blob, 'kyc_image.jpg');
        if (type) fd.append('type', type);

        const res = await apiFetch('/loans/upload-kyc-temp', {
            method: 'POST',
            body: fd
        });

        return res;
    };

    const handleCapture = async (blob: Blob) => {
        if (!activeCameraCategory) return;
        setIsOcrLoading(true);
        
        try {
            const { url, ocr_data } = await uploadToServer(blob, activeCameraCategory);
            
            if ((ocr_data && !ocr_data.error) || activeCameraCategory === 'applicant_selfie') {
                if (activeCameraCategory !== 'applicant_selfie') {
                    // Same Image Check (using raw_text signature)
                    const currentText = JSON.stringify(ocr_data.raw_text);
                    const isSameImage = Object.entries(ocrResults).some(([cat, data]) => {
                        return cat !== activeCameraCategory && data && JSON.stringify(data.raw_text) === currentText;
                    });

                    if (isSameImage) {
                        setErrorPopup("यह तस्वीर पहले ही किसी अन्य श्रेणी में उपयोग की जा चुकी है। कृपया सही तस्वीर अपलोड करें।");
                        setActiveCameraCategory(null);
                        return;
                    }
                }

                if (activeCameraCategory !== 'applicant_selfie') {
                    // Side-specific Keyword Check
                    const rawTextStr = (ocr_data.raw_text || []).join(' ').toLowerCase();
                    const isBackSide = rawTextStr.includes('address') || rawTextStr.includes('पता') || rawTextStr.includes('s/o') || rawTextStr.includes('w/o') || rawTextStr.includes('d/o');
                    const isFrontSide = rawTextStr.includes('dob') || rawTextStr.includes('जन्म') || rawTextStr.includes('male') || rawTextStr.includes('female');

                    if (activeCameraCategory === 'aadhar_front' && isBackSide && !isFrontSide) {
                        setErrorPopup("आपने आधार कार्ड का पिछला हिस्सा अपलोड किया है। कृपया सामने का हिस्सा अपलोड करें।");
                        setActiveCameraCategory(null);
                        return;
                    }

                    if (activeCameraCategory === 'aadhar_back' && isFrontSide && !isBackSide) {
                        setErrorPopup("आपने आधार कार्ड का सामने का हिस्सा अपलोड किया है। कृपया पिछला हिस्सा अपलोड करें।");
                        setActiveCameraCategory(null);
                        return;
                    }

                    // Aadhaar Consistency Check
                    if (activeCameraCategory === 'aadhar_back') {
                        const frontAadhar = ocrResults['aadhar_front']?.aadhaar_number || watch('aadhar_number');
                        if (ocr_data.aadhaar_number && frontAadhar) {
                            const frontNum = frontAadhar.replace(/\s/g, '');
                            const backNum = ocr_data.aadhaar_number.replace(/\s/g, '');
                            if (frontNum !== backNum) {
                                setErrorPopup("आधार कार्ड के दोनों तरफ के नंबर अलग-अलग हैं। कृपया उसी आधार कार्ड का पिछला हिस्सा अपलोड करें।");
                                setActiveCameraCategory(null);
                                return; 
                            }
                        }
                    }
                }

                setOcrResults(prev => ({ ...prev, [activeCameraCategory]: ocr_data }));
                setCapturedImages(prev => ({ ...prev, [activeCameraCategory]: url }));
                
                // Auto-fill
                if (activeCameraCategory === 'aadhar_front') {
                    if (ocr_data.name) {
                        const [first, ...rest] = ocr_data.name.split(' ');
                        setValue('first_name', first);
                        setValue('last_name', rest.join(' '));
                    }
                    if (ocr_data.aadhaar_number) setValue('aadhar_number', ocr_data.aadhaar_number);
                    if (ocr_data.dob) {
                        const dob = ocr_data.dob.split(/[/-]/).reverse().join('-');
                        setValue('date_of_birth', dob);
                    }
                    checkUniqueness('aadhar', ocr_data.aadhaar_number);
                }
                
                if (activeCameraCategory === 'pan_front') {
                    if (ocr_data.pan_number) {
                        setValue('pan_number', ocr_data.pan_number);
                        checkUniqueness('pan', ocr_data.pan_number);
                    }
                }

                if (activeCameraCategory === 'aadhar_back') {
                    // Robust address extraction
                    let fullAddress = '';
                    
                    // 1. Try to use ocr_data.address if it looks valid (not just a short string or trash)
                    if (ocr_data.address && ocr_data.address.length > 20 && !ocr_data.address.toLowerCase().includes('authority')) {
                        fullAddress = ocr_data.address;
                    } 
                    
                    // 2. If ocr_data.address is missing or looks like trash, try raw_text
                    if (!fullAddress && ocr_data.raw_text && Array.isArray(ocr_data.raw_text)) {
                        const addressIndex = ocr_data.raw_text.findIndex((line: string) => 
                            line.toLowerCase().includes('address:') || line.toLowerCase().includes('पता:')
                        );
                        
                        if (addressIndex !== -1) {
                            // Take lines after "Address:" until we hit an Aadhaar number pattern or end
                            const addressLines = [];
                            for (let i = addressIndex + 1; i < ocr_data.raw_text.length; i++) {
                                const line = ocr_data.raw_text[i].trim();
                                // Stop if line is an Aadhaar number (xxxx xxxx xxxx) or VID
                                if (/^\d{4}\s\d{4}\s\d{4}$/.test(line) || line.toLowerCase().includes('vid :') || line.length < 2) {
                                    if (addressLines.length > 0) break; 
                                    continue;
                                }
                                addressLines.push(line);
                            }
                            if (addressLines.length > 0) {
                                fullAddress = addressLines.join(', ');
                            }
                        }
                    }

                    // 3. Last ditch: clean up the provided address if it contains trash headers
                    if (fullAddress) {
                        fullAddress = fullAddress
                            .replace(/unique identification authority of india/gi, '')
                            .replace(/government of india/gi, '')
                            .replace(/भारत सरकार/g, '')
                            .replace(/भारतीय विशिष्ट पहचान प्राधिकरण/g, '')
                            .trim()
                            .replace(/^,|,$/g, '');
                    }

                    if (fullAddress) setValue('street_address', fullAddress);
                    if (ocr_data.pincode) setValue('postal_code', ocr_data.pincode);
                    if (ocr_data.city) setValue('city', ocr_data.city);
                    if (ocr_data.state) setValue('state', ocr_data.state);
                    if (ocr_data.father_name) setValue('father_name', ocr_data.father_name);
                }

                setActiveCameraCategory(null);
            } else {
                setErrorPopup(ocr_data?.error || "Could not extract information. Please re-upload.");
                setActiveCameraCategory(null);
            }
        } catch (err: any) {
            console.error("Capture error:", err);
            setErrorPopup(err.message || "An unexpected error occurred during capture.");
            setActiveCameraCategory(null);
        } finally {
            setIsOcrLoading(false);
        }
    };

    const getFieldsForStep = (step: number) => {
        switch (step) {
            case 0: return []; // Documents step (manually checked in nextStep)
            case 1: return ['annual_income', 'loan_usage', 'referral_code'];
            case 2: return ['first_name', 'last_name', 'email', 'phone', 'aadhar_number', 'pan_number', 'date_of_birth', 'father_name', 'mother_name', 'marital_status', 'street_address', 'city', 'state', 'postal_code'];
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {DOCUMENT_CATEGORIES.map((cat) => {
                                const isCaptured = !!capturedImages[cat.id];
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCameraCategory(cat.id)}
                                        className={cn(
                                            "relative p-6 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center text-center group",
                                            isCaptured ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white"
                                        )}
                                    >
                                        <div className={cn("w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                                            {isCaptured ? <Check className="w-8 h-8" /> : <cat.icon className="w-7 h-7" />}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">{cat.label}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                            {isCaptured ? "Captured Successfully" : "Tap to capture"}
                                        </p>
                                        
                                        {isCaptured && (
                                            <div className="mt-3 w-full h-12 rounded-xl border border-emerald-100 overflow-hidden bg-white">
                                                <img src={capturedImages[cat.id]} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                            <Shield className="text-blue-500 shrink-0 mt-1" size={18} />
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Identity Verification</p>
                                <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed">
                                    Please ensure your documents are clearly visible and not expired. We use encrypted OCR to verify your details instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <Shield className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Applying for</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">₹ {loanAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</p>
                                <p className="text-xs font-black text-slate-900">Open Score</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <label className={labelClasses}>Referral Code (Optional)</label>
                                <input
                                    placeholder="Agent ID or Friend's Code"
                                    {...register('referral_code')}
                                    className={cn(inputClasses, uniquenessErrors.referral && "border-rose-500 ring-rose-50", referrerName && "border-emerald-500 ring-emerald-50")}
                                />
                                {checkingUniqueness.referral && <p className="text-[9px] text-blue-500 font-bold mt-1 ml-2 animate-pulse uppercase tracking-widest">Verifying Code...</p>}
                                {uniquenessErrors.referral && <p className={errorClasses}>{uniquenessErrors.referral}</p>}
                                {referrerName && <p className="text-[9px] text-emerald-600 font-black mt-1 ml-2 uppercase tracking-widest">Referrer: {referrerName}</p>}
                            </div>
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
                    </div>
                );

            case 2:
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

                        {/* OCR Extracted Details (Read-only) */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-blue-500" size={16} />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Identity Details</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Aadhaar Number</p>
                                    <p className="text-xs font-bold text-slate-700">{watch('aadhar_number') || 'Not Captured'}</p>
                                    <input type="hidden" {...register('aadhar_number')} />
                                    {errors.aadhar_number && <p className={errorClasses}>Required via Scan</p>}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">PAN Number</p>
                                    <p className="text-xs font-bold text-slate-700">{watch('pan_number') || 'Not Captured'}</p>
                                    <input type="hidden" {...register('pan_number')} />
                                    {errors.pan_number && <p className={errorClasses}>Required via Scan</p>}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Date of Birth</p>
                                    <p className="text-xs font-bold text-slate-700">{watch('date_of_birth') || 'Not Captured'}</p>
                                    <input type="hidden" {...register('date_of_birth')} />
                                    {errors.date_of_birth && <p className={errorClasses}>Required via Scan</p>}
                                </div>
                            </div>

                            <p className="text-[9px] text-slate-400 font-medium italic">These details were extracted from your documents. If incorrect, please re-scan in Step 1.</p>
                        </div>



                        <div>
                            <label className={labelClasses}>Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                <input type="email" placeholder="name@email.com" {...register('email')} className={`${inputClasses} pl-11`} />
                            </div>
                            {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                    <input 
                                        type="tel" 
                                        maxLength={10} 
                                        placeholder="9876543210" 
                                        {...register('phone')} 
                                        readOnly={!!user?.mobile_number}
                                        className={cn(inputClasses, "pl-11", !!user?.mobile_number && "bg-slate-50 text-slate-500 cursor-not-allowed")} 
                                    />
                                </div>
                                {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Father Name</label>
                                <input placeholder="Father's Full Name" {...register('father_name')} className={inputClasses} />
                                {errors.father_name && <p className={errorClasses}>{errors.father_name.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Mother Name</label>
                                <input placeholder="Mother's Full Name" {...register('mother_name')} className={inputClasses} />
                                {errors.mother_name && <p className={errorClasses}>{errors.mother_name.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Marital Status</label>
                            <select {...register('marital_status')} className={inputClasses}>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                            {errors.marital_status && <p className={errorClasses}>{errors.marital_status.message}</p>}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Address</h4>
                            <div>
                                <label className={labelClasses}>Street Address</label>
                                <input placeholder="House No, Street, Area" {...register('street_address')} className={inputClasses} />
                                {errors.street_address && <p className={errorClasses}>{errors.street_address.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>City</label>
                                    <input placeholder="City" {...register('city')} className={inputClasses} />
                                    {errors.city && <p className={errorClasses}>{errors.city.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Pincode</label>
                                    <input placeholder="6 Digit PIN" maxLength={6} {...register('postal_code')} className={inputClasses} />
                                    {errors.postal_code && <p className={errorClasses}>{errors.postal_code.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>State</label>
                                <input placeholder="State" {...register('state')} className={inputClasses} />
                                {errors.state && <p className={errorClasses}>{errors.state.message}</p>}
                            </div>
                        </div>
                    </div>
                );


            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className={labelClasses}>{user?.role === 'STUDENT' ? 'School / College Name' : 'Current Employer / Shop Name'}</label>
                            <input 
                                placeholder={user?.role === 'STUDENT' ? 'Enter your school or college name' : 'Company or Business Name'} 
                                {...register('employer')} 
                                className={inputClasses} 
                            />
                            {errors.employer && <p className={errorClasses}>{errors.employer.message}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>{user?.role === 'STUDENT' ? 'Course / Degree' : 'Occupation / Role'}</label>
                            <input 
                                placeholder={user?.role === 'STUDENT' ? 'e.g. B.Tech Computer Science' : 'e.g. Sales Manager, Shop Owner'} 
                                {...register('occupation')} 
                                className={inputClasses} 
                            />
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
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Application Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReviewItem label="Full Name" value={`${watch('first_name')} ${watch('last_name')}`} icon={User} />
                                <ReviewItem label="Aadhaar" value={watch('aadhar_number')} icon={Shield} />
                                <ReviewItem label="PAN Card" value={watch('pan_number')} icon={CreditCard} />
                                <ReviewItem label="Father's Name" value={watch('father_name')} icon={User} />
                                <ReviewItem label="Mother's Name" value={watch('mother_name')} icon={User} />
                                <ReviewItem label="City" value={watch('city')} icon={MapPin} />
                                <ReviewItem label="Income" value={`₹ ${watch('annual_income')}`} icon={IndianRupee} />
                            </div>
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

    const handleFinalSubmit = async (data: any) => {
        const payload = {
            ...data,
            kyc_images: capturedImages,
            ocr_results: ocrResults
        };
        onSubmit(payload);
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
                            onClick={handleSubmit(handleFinalSubmit)}
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

    const finalContent = (
        <>
            {isModal ? (
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
            ) : (
                <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-100 max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Loan Application</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            {STEPS[currentStep].title} — {STEPS[currentStep].desc}
                        </p>
                    </div>
                    {formContent}
                </div>
            )}

            {/* Camera Overlay Modal */}
            {activeCameraCategory && (
                <div className="fixed inset-0 z-[1000] bg-slate-900 p-4 sm:p-8 flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-white font-black uppercase tracking-widest text-sm">
                                {DOCUMENT_CATEGORIES.find(c => c.id === activeCameraCategory)?.label}
                            </h3>
                        </div>
                        <button 
                            onClick={() => setActiveCameraCategory(null)}
                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center relative">
                        <Camera
                            onCapture={handleCapture}
                            label={DOCUMENT_CATEGORIES.find(c => c.id === activeCameraCategory)?.label || ''}
                        />
                    </div>
                </div>
            )}

            {/* OCR Loading Overlay */}
            {isOcrLoading && (
                <div className="fixed inset-0 z-[1100] bg-slate-900/90 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-700">
                    <div className="relative w-64 h-64 mb-12">
                        {/* Outer rotating rings */}
                        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-4 border border-blue-400/10 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
                        
                        {/* Hexagon scanner shape */}
                        <div className="absolute inset-8 flex items-center justify-center">
                            <div className="w-full h-full bg-blue-500/5 rounded-[2rem] border border-blue-500/30 relative overflow-hidden group">
                                <Shield className="absolute inset-0 m-auto text-blue-500/20" size={60} />
                                
                                {/* Scanning light line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,1)] animate-[scan_3s_ease-in-out_infinite]"></div>
                                
                                {/* Data particles */}
                                <div className="absolute inset-0">
                                    {[...Array(6)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-ping"
                                            style={{ 
                                                top: `${Math.random() * 100}%`, 
                                                left: `${Math.random() * 100}%`,
                                                animationDelay: `${i * 0.5}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pulsing core */}
                        <div className="absolute inset-[-15%] bg-blue-600/10 rounded-full blur-[60px] animate-pulse"></div>
                    </div>
                    
                    <div className="text-center max-w-xs">
                        <h2 className="text-white font-black uppercase tracking-[0.5em] text-sm mb-4">Neural Scan</h2>
                        <div className="h-1 w-48 bg-white/5 rounded-full mx-auto mb-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite]"></div>
                        </div>
                        <p className="text-blue-300 font-bold uppercase tracking-widest text-[9px] mb-2 opacity-80">Extracting Secure Attributes</p>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[8px] text-blue-400 font-mono animate-pulse">ENCRYPTING...</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes scan {
                            0%, 100% { top: 0%; opacity: 0; }
                            50% { top: 100%; opacity: 1; }
                        }
                        @keyframes progress {
                            0% { width: 0%; left: 0%; }
                            50% { width: 100%; left: 0%; }
                            100% { width: 0%; left: 100%; }
                        }
                    `}</style>
                </div>
            )}

            {/* Error Popup */}
            {errorPopup && (
                <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-6 text-rose-500 mx-auto">
                            <X size={28} strokeWidth={3} />
                        </div>
                        <h3 className="text-center font-black text-slate-900 text-lg mb-2 uppercase tracking-widest">Verification Error</h3>
                        <p className="text-center text-slate-500 text-sm font-medium leading-relaxed mb-8">{errorPopup}</p>
                        <button 
                            onClick={() => setErrorPopup(null)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    return finalContent;
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
