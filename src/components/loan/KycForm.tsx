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
import toast from 'react-hot-toast';

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
    loanId?: string;
}

const STEPS = [
    { id: 'purpose', title: 'Loan', desc: 'Amount & Purpose', icon: IndianRupee },
    { id: 'aadhaar', title: 'Aadhaar', desc: 'Scan ID Card', icon: Shield },
    { id: 'pan', title: 'PAN', desc: 'Scan PAN Card', icon: Shield },
    { id: 'personal', title: 'Personal', desc: 'Verify information', icon: User },
    { id: 'employment', title: 'Work', desc: 'Income & profession', icon: Briefcase },
    { id: 'consent', title: 'Review', desc: 'Final application', icon: FileText },
];

const DOCUMENT_CATEGORIES = [
    { id: 'aadhar_front', label: 'Aadhaar (Front)', icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { id: 'aadhar_back', label: 'Aadhaar (Back)', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'pan_card', label: 'PAN Card (Front)', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'applicant_selfie', label: "Applicant Selfie", icon: User, color: 'bg-amber-50 text-amber-600' },
    { id: 'selfie_with_agent', label: "Selfie with Loan Agent", icon: User, color: 'bg-rose-50 text-rose-600' },
];

export default function KycForm({ onSubmit, onCancel, loanAmount, loading, initialData, isModal = false, loanId }: KycFormProps) {
    const { user } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [activeCameraCategory, setActiveCameraCategory] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrResults, setOcrResults] = useState<Record<string, any>>({});
    const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
    const [errorPopup, setErrorPopup] = useState<string | null>(null);
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(!!initialData?.aadhaar_reference_id);
    const [aadhaarReferenceId, setAadhaarReferenceId] = useState<string | null>(initialData?.aadhaar_reference_id || null);
    const [aadhaarOtpInput, setAadhaarOtpInput] = useState('');
    const [isAadhaarVerified, setIsAadhaarVerified] = useState(!!user?.aadhar_number || !!initialData?.aadhar_number || !!initialData?.is_aadhar_verified);
    const [isAadhaarVerifying, setIsAadhaarVerifying] = useState(false);
    const [isPanVerified, setIsPanVerified] = useState(!!user?.pan_number || !!initialData?.pan_number || !!initialData?.is_pan_verified);
    const [isPanVerifying, setIsPanVerifying] = useState(false);
    const [uniquenessErrors, setUniquenessErrors] = useState<{ aadhar?: string, pan?: string, referral?: string }>({});
    const [checkingUniqueness, setCheckingUniqueness] = useState<{ aadhar?: boolean, pan?: boolean, referral?: boolean }>({});
    const [referrerName, setReferrerName] = useState<string | null>(null);
    const [eligibilityError, setEligibilityError] = useState<{ message: string, step: number } | null>(null);

    const saveDraft = async (data: any, imageOverride?: any) => {
        if (!loanId) return;
        try {
            await apiFetch(`/loans/${loanId}/kyc-data`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    kyc_images: imageOverride || capturedImages,
                    ocr_results: ocrResults,
                    is_aadhar_verified: isAadhaarVerified,
                    is_pan_verified: isPanVerified,
                    aadhaar_reference_id: aadhaarReferenceId,
                    is_draft: true
                })
            });
        } catch (e) {
            console.error("Draft save failed:", e);
        }
    };

    const calculateAge = (dobString: string) => {
        if (!dobString) return 0;
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Dynamic schema based on role
    const kycSchema = z.object({
        first_name: z.string().min(2, 'First name is too short'),
        last_name: z.string().optional(),
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

        permanent_street_address: z.string().optional(),
        permanent_city: z.string().optional(),
        permanent_state: z.string().optional(),
        permanent_postal_code: z.string().optional(),
        is_permanent_same: z.boolean().default(true),

        referral_code: z.string().min(4, 'Referral code is required'),
        consent: z.boolean().refine(val => val === true, 'You must agree to the terms'),
    });

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
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
            permanent_street_address: user?.permanent_street_address || '',
            permanent_city: user?.permanent_city || '',
            permanent_state: user?.permanent_state || '',
            permanent_postal_code: user?.permanent_pincode || '',
            is_permanent_same: user?.is_permanent_same ?? true,
            ...initialData
        }
    });

    useEffect(() => {
        const saved = localStorage.getItem('kyc_loan_draft');
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                Object.keys(draft).forEach(key => {
                    if (draft[key] !== undefined) {
                        setValue(key as any, draft[key]);
                    }
                });
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, [setValue]);

    useEffect(() => {
        const subscription = watch((value) => {
            setIsSaving(true);
            localStorage.setItem('kyc_loan_draft', JSON.stringify(value));
            
            // Debounced server save
            const timer = setTimeout(() => {
                saveDraft(value);
                setIsSaving(false);
            }, 1500);
            return () => clearTimeout(timer);
        });
        return () => subscription.unsubscribe();
    }, [watch, capturedImages, ocrResults]);

    useEffect(() => {
        if (isAadhaarVerified || isPanVerified || aadhaarReferenceId) {
            saveDraft(getValues());
        }
    }, [isAadhaarVerified, isPanVerified, aadhaarReferenceId]);

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

    // Sync current address with permanent address if "Same as Permanent" is checked
    const isPermanentSame = watch('is_permanent_same');
    const permStreet = watch('permanent_street_address');
    const permCity = watch('permanent_city');
    const permState = watch('permanent_state');
    const permZip = watch('permanent_postal_code');

    useEffect(() => {
        if (isPermanentSame) {
            if (permStreet) setValue('street_address', permStreet.trim());
            if (permCity) setValue('city', permCity.trim());
            if (permState) setValue('state', permState.trim());
            if (permZip) setValue('postal_code', permZip.trim());
        }
    }, [isPermanentSame, permStreet, permCity, permState, permZip, setValue]);

    const checkReferral = async (code: string) => {
        setCheckingUniqueness(prev => ({ ...prev, referral: true }));
        setUniquenessErrors(prev => ({ ...prev, referral: undefined }));
        try {
            const res = await apiFetch('/referral/verify-code', {
                method: 'POST',
                body: JSON.stringify({ 
                    code: code.toUpperCase(),
                    amount: loanAmount 
                }),
                skipAuthCheck: true
            });
            if (!res.valid) {
                setUniquenessErrors(prev => ({ ...prev, referral: res.message || 'invalid refer code' }));
                setReferrerName(null);
                
                // If it's a vendor code with insufficient funds/limit, discard it
                if (res.dismiss_code) {
                    setValue('referral_code', '');
                }
            } else {
                setReferrerName(res.referrer_name);
            }
        } catch (e) {
            setUniquenessErrors(prev => ({ ...prev, referral: 'invalid refer code' }));
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
                setUniquenessErrors(prev => ({ ...prev, [type]: `This ${type === 'aadhar' ? 'Aadhaar' : 'PAN'} is already linked with another account. Please use your own document.` }));
            } else {
                setUniquenessErrors(prev => ({ ...prev, [type]: undefined }));
            }
        } catch (e) {
            console.error('Failed to check uniqueness', e);
        } finally {
            setCheckingUniqueness(prev => ({ ...prev, [type]: false }));
        }
    };

    const isStepAutoSkippable = (stepIdx: number) => {
        if (stepIdx === 0) { // Purpose/Referral
            return !!watch('referral_code') && !!referrerName;
        }
        if (stepIdx === 1) { // Aadhaar
            // Skip if verified OR if images are already present in initialData/capturedImages
            const hasAadharImages = capturedImages['aadhar_front'] && capturedImages['aadhar_back'];
            return isAadhaarVerified || (hasAadharImages && !!watch('aadhar_number'));
        }
        if (stepIdx === 2) { // PAN
            const hasPanImage = capturedImages['pan_card'];
            return isPanVerified || (hasPanImage && !!watch('pan_number'));
        }
        return false;
    };

    // Auto-jump to the first incomplete step on mount/data-load
    useEffect(() => {
        if (currentStep === 0 && (user || initialData)) {
            let startStep = 0;
            // Only skip if the step is actually skippable and we are not forcing a re-entry
            while (startStep < STEPS.length - 1 && isStepAutoSkippable(startStep)) {
                startStep++;
            }
            if (startStep > 0) {
                setCurrentStep(startStep);
            }
        }
    }, [user, initialData, currentStep]);

    const nextStep = async () => {
        // Enforce document uploads - Only if not already verified
        const aadharVal = watch('aadhar_number');
        const panVal = watch('pan_number');

        if (currentStep === 1) { // Aadhaar step
            if (!capturedImages['aadhar_front'] || !capturedImages['aadhar_back']) {
                setErrorPopup("कृपया आधार कार्ड के दोनों हिस्से अपलोड करें।");
                return;
            }
        }
        if (currentStep === 2) { // PAN step
            if (!capturedImages['pan_card']) {
                setErrorPopup("कृपया अपना पैन कार्ड अपलोड करें।");
                return;
            }
        }



        const fieldsToValidate = getFieldsForStep(currentStep);
        if (fieldsToValidate.length > 0) {
            const isStepValid = await trigger(fieldsToValidate as any);
            if (!isStepValid) {
                const firstErrorField = fieldsToValidate.find(f => (errors as any)[f]);
                const errorMessage = firstErrorField ? (errors as any)[firstErrorField]?.message : "कृपया सभी आवश्यक फ़ील्ड सही ढंग से भरें।";
                toast.error(errorMessage);
                return;
            }
        }

        // Referral code is mandatory
        if (currentStep === 0) {
            if (!referralValue || referralValue.length < 4) {
                setErrorPopup("रेफ़रल कोड अनिवार्य है। कृपया एजेंट का रेफ़रल कोड दर्ज करें।");
                return;
            }
            if (checkingUniqueness.referral) {
                setErrorPopup("रेफ़रल कोड की जाँच की जा रही है...");
                return;
            }
            if (uniquenessErrors.referral) {
                setErrorPopup(uniquenessErrors.referral);
                return;
            }
            if (!referrerName) {
                setErrorPopup("कृपया एक वैध रेफ़रल कोड दर्ज करें।");
                return;
            }
        }

        if (currentStep === 1 && checkingUniqueness.aadhar) {
            toast.loading("Fetching Aadhaar data... please wait", { id: 'api-loading' });
            return;
        }
        
        if (currentStep === 1 && uniquenessErrors.aadhar) {
            toast.error("यह आधार कार्ड पहले से ही उपयोग किया जा चुका है।", { id: 'api-error' });
            return;
        }

        // Enforce Aadhaar OKYC OTP verification
        if (currentStep === 1 && !isAadhaarVerified) {
            if (!aadhaarOtpSent) {
                toast.error("कृपया आधार OTP सत्यापन पूरा करें।");
            } else {
                toast.error("कृपया OTP दर्ज करके Verify करें।");
            }
            return;
        }

        if (currentStep === 2 && checkingUniqueness.pan) {
            toast.loading("Fetching PAN data... please wait", { id: 'api-loading' });
            return;
        }

        if (currentStep === 2 && uniquenessErrors.pan) {
            toast.error("यह पैन कार्ड पहले से ही उपयोग किया जा चुका है।", { id: 'api-error' });
            return;
        }

        // Enforce PAN verification
        if (currentStep === 2 && !isPanVerified) {
            toast.error("कृपया पैन कार्ड विवरण सत्यापित करें।");
            return;
        }

        let targetStep = currentStep + 1;

        // Eligibility Pre-check before proceeding from Aadhaar step
        if (currentStep === 1) {
            const dob = watch('date_of_birth');
            if (dob) {
                const age = calculateAge(dob);
                if (age < 15) {
                    setEligibilityError({
                        message: "We're sorry, but the minimum age requirement for an Open Score account is 15 years. Please ensure the Aadhaar card uploaded is correct.",
                        step: 1
                    });
                    return;
                }
                if (age < 18 && user?.role !== 'STUDENT') {
                    setEligibilityError({
                        message: "Accounts for users under 18 years of age are currently restricted to Students only. Please verify your date of birth or account type.",
                        step: 1
                    });
                    return;
                }
            }
        }

        // Skip steps if they are already "auto-skippable" (fully submitted previously)
        while (targetStep < STEPS.length - 1 && isStepAutoSkippable(targetStep)) {
            targetStep++;
        }

        setCurrentStep(Math.min(targetStep, STEPS.length - 1));
    };


    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };



    // Effect to restore captured images and OCR results from user profile or initialData
    useEffect(() => {
        if (user || initialData) {
            const newImages: Record<string, string> = {};
            const newOcr: Record<string, any> = {};
            
            // Map from user profile (Verified documents)
            if (user?.aadhar_image) newImages['aadhar_front'] = user.aadhar_image;
            if (user?.aadhar_back_image) newImages['aadhar_back'] = user.aadhar_back_image;
            if (user?.pan_image) newImages['pan_card'] = user.pan_image;
            if (user?.profile_image) newImages['applicant_selfie'] = user.profile_image;
            
            // Map from initialData (Precedence)
            if (initialData?.kyc_images) {
                Object.assign(newImages, initialData.kyc_images);
            }
            if (initialData?.ocr_results) {
                Object.assign(newOcr, initialData.ocr_results);
            }
            
            if (Object.keys(newImages).length > 0) {
                setCapturedImages(prev => ({ ...prev, ...newImages }));
            }
            if (Object.keys(newOcr).length > 0) {
                setOcrResults(prev => ({ ...prev, ...newOcr }));
            }
        }
    }, [user, initialData]);


    const uploadToServer = async (blob: Blob, type?: string, corners?: string) => {
        const fd = new FormData();
        fd.append('file', blob, 'kyc_image.jpg');
        if (type) fd.append('type', type);
        if (corners) fd.append('corners', corners);

        const res = await apiFetch('/loans/upload-kyc-temp', {
            method: 'POST',
            body: fd
        });

        return res;
    };

    const handleCapture = async (blob: Blob, corners?: string) => {
        if (corners === 'CLOSE') {
            setActiveCameraCategory(null);
            return;
        }
        if (!activeCameraCategory) return;
        setIsOcrLoading(true);
        
        try {
            // We still call uploadToServer to save the image to the backend/S3
            const { url } = await uploadToServer(blob, activeCameraCategory, corners);
            
            setCapturedImages(prev => {
                const updated = { ...prev, [activeCameraCategory]: url };
                // Also trigger a server save for the new image immediately
                saveDraft(getValues(), updated);
                return updated;
            });
            setActiveCameraCategory(null);
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
            case 0: return ['annual_income', 'loan_usage', 'referral_code'];
            case 1: return ['aadhar_number'];
            case 2: return ['pan_number', 'date_of_birth'];
            case 3: return ['first_name', 'last_name', 'email', 'phone', 'father_name', 'mother_name', 'marital_status', 'street_address', 'city', 'state', 'postal_code'];
            case 4: return ['employer', 'occupation'];
            case 5: return ['consent'];
            default: return [];
        }
    };

    const handleSendAadhaarOtp = async () => {
        const aadhaarNumber = watch('aadhar_number');
        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            toast.error('कृपया पहले आधार नंबर दर्ज करें।');
            return;
        }

        if (uniquenessErrors.aadhar) {
            toast.error('यह आधार पहले से ही किसी अन्य खाते से लिंक है।');
            return;
        }
        setIsAadhaarVerifying(true);
        const toastId = toast.loading('OTP भेजा जा रहा है...');
        try {
            const res = await apiFetch('/loans/sandbox/aadhaar-otp', {
                method: 'POST',
                body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
            });
            // Sandbox returns reference_id inside data object
            const refId = res?.data?.reference_id ?? res?.reference_id;
            if (refId) {
                setAadhaarReferenceId(refId);
                setAadhaarOtpSent(true);
                toast.success('OTP आपके आधार से लिंक्ड मोबाइल नंबर पर भेज दिया गया है।', { id: toastId });
            } else {
                toast.error(res?.message || 'OTP भेजने में विफल। पुनः प्रयास करें।', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'OTP अनुरोध विफल।', { id: toastId });
        } finally {
            setIsAadhaarVerifying(false);
        }
    };

    const handleVerifyAadhaarOtp = async () => {
        if (!aadhaarOtpInput || aadhaarOtpInput.length !== 6 || !aadhaarReferenceId) {
            toast.error('कृपया 6 अंकों का OTP दर्ज करें।');
            return;
        }
        setIsAadhaarVerifying(true);
        const toastId = toast.loading('OTP सत्यापित किया जा रहा है...');
        try {
            const res = await apiFetch('/loans/sandbox/aadhaar-verify', {
                method: 'POST',
                body: JSON.stringify({ otp: aadhaarOtpInput, reference_id: String(aadhaarReferenceId) }),
            });
            const kyc = res?.data?.kyc_result ?? res?.data ?? {};

            if (res?.code === 200 || res?.status === 200 || kyc?.name) {
                setIsAadhaarVerified(true);
                toast.success('आधार सत्यापन सफल!', { id: toastId });

                // Auto-fill: Name
                const kycName = kyc.name || kyc.full_name;
                if (kycName) {
                    const [first, ...rest] = kycName.trim().split(' ');
                    setValue('first_name', first || '');
                    setValue('last_name', rest.join(' ') || '');
                }

                // Auto-fill: DOB (format: DD-MM-YYYY → YYYY-MM-DD for input[type=date])
                const kycDob = kyc.dob || kyc.date_of_birth;
                if (kycDob) {
                    const parts = kycDob.split(/[-/]/);
                    const isoDate = parts.length === 3
                        ? (parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : kycDob)
                        : kycDob;
                    setValue('date_of_birth', isoDate);
                }

                // (no direct form field, but stored for reference)

                // Auto-fill: Address
                const addr = kyc.address ?? {};
                const streetParts = [
                    addr.house, 
                    addr.street, 
                    addr.landmark, 
                    addr.loc, 
                    addr.vtc,
                    addr.subdistrict || addr.sub_dist
                ].filter(Boolean);
                const street = streetParts.join(', ');
                
                if (street) {
                    setValue('permanent_street_address', street);
                    if (watch('is_permanent_same')) setValue('street_address', street);
                }

                const city = addr.dist || addr.district || addr.city;
                if (city) {
                    setValue('permanent_city', city);
                    if (watch('is_permanent_same')) setValue('city', city);
                }

                if (addr.state) {
                    setValue('permanent_state', addr.state);
                    if (watch('is_permanent_same')) setValue('state', addr.state);
                }

                const zip = addr.zip || addr.pincode || addr.zip_code;
                if (zip) {
                    setValue('permanent_postal_code', zip);
                    if (watch('is_permanent_same')) setValue('postal_code', zip);
                }

                // Father name from care_of (e.g. "S/O Ram Kumar" → "Ram Kumar")
                const careOf = kyc.care_of || kyc.careof;
                if (careOf) {
                    const caretaker = careOf.replace(/^(S\/O|D\/O|W\/O)[:\s]*/i, '').trim();
                    if (caretaker) setValue('father_name', caretaker);
                }
            } else {
                toast.error(res?.message || 'OTP सत्यापन विफल। पुनः प्रयास करें।', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'OTP सत्यापन विफल।', { id: toastId });
        } finally {
            setIsAadhaarVerifying(false);
        }
    };

    const handleVerifyPan = async () => {
        const pan = watch('pan_number');
        const first = watch('first_name');
        const last = watch('last_name');
        const dob = watch('date_of_birth');

        if (!pan || pan.length !== 10) {
            toast.error('कृपया मान्य पैन नंबर दर्ज करें।');
            return;
        }
        if (!first || !last || !dob) {
            toast.error('पैन सत्यापन के लिए नाम और जन्म तिथि आवश्यक है।');
            return;
        }
        if (uniquenessErrors.pan) {
            toast.error('यह पैन पहले से ही किसी अन्य खाते से लिंक है।');
            return;
        }

        setIsPanVerifying(true);
        const toastId = toast.loading('पैन सत्यापित किया जा रहा है...');
        try {
            const res = await apiFetch('/loans/sandbox/pan-verify', {
                method: 'POST',
                body: JSON.stringify({ 
                    pan, 
                    name: `${first} ${last}`.trim(), 
                    dob 
                }),
            });

            const data = res?.data ?? res;
            if (res?.code === 200 || res?.status === 200 || data?.status === 'VALID' || data?.full_name) {
                setIsPanVerified(true);
                toast.success('पैन सत्यापन सफल!', { id: toastId });
            } else {
                toast.error(res?.message || 'पैन सत्यापन विफल। विवरण जांचें।', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'पैन सत्यापन विफल।', { id: toastId });
        } finally {
            setIsPanVerifying(false);
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
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <IndianRupee size={14} className="text-blue-500" />
                                Loan Requirements
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Annual Income (₹)</label>
                                    <input type="number" placeholder="e.g. 500000" {...register('annual_income')} className={inputClasses} />
                                    {errors.annual_income && <p className={errorClasses}>{errors.annual_income.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Purpose of Loan</label>
                                    <input placeholder="e.g. Education, Business" {...register('loan_usage')} className={inputClasses} />
                                    {errors.loan_usage && <p className={errorClasses}>{errors.loan_usage.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Referral Code <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <input placeholder="Enter code" {...register('referral_code')} className={inputClasses} />
                                        {checkingUniqueness.referral && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                                        {referrerName && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">{referrerName}</div>}
                                    </div>
                                    {errors.referral_code && <p className={errorClasses}>{errors.referral_code.message}</p>}
                                    {uniquenessErrors.referral && <p className={errorClasses}>{uniquenessErrors.referral}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            {DOCUMENT_CATEGORIES.filter(cat => cat.id.startsWith('aadhar')).map((cat) => {
                                const isCaptured = !!capturedImages[cat.id];
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            if (user?.aadhar_number && isAadhaarVerified) return; // Locked once verified
                                            setActiveCameraCategory(cat.id);
                                        }}
                                        className={cn(
                                            "relative p-6 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center text-center group",
                                            isCaptured ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white",
                                            (user?.aadhar_number && isAadhaarVerified) && "opacity-60 cursor-not-allowed border-emerald-200 bg-emerald-50/20"
                                        )}
                                    >

                                        <div className={cn("w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                                            {isCaptured ? <Check className="w-8 h-8" /> : <cat.icon className="w-7 h-7" />}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">{cat.label}</p>
                                        {isCaptured && (
                                            <div className="mt-3 w-full h-auto min-h-[3rem] max-h-32 rounded-xl border border-emerald-100 overflow-hidden bg-white/50 relative flex items-center justify-center">
                                                <img src={capturedImages[cat.id]} className="max-w-full max-h-32 object-contain" alt="Preview" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Manual Entry Section */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Shield className={cn("transition-colors", isAadhaarVerified ? "text-emerald-500" : "text-blue-500")} size={15} />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                    {isAadhaarVerified ? 'Aadhaar Verified' : 'Aadhaar Information'}
                                </h4>
                            </div>
                            
                            <div>
                                <label className={labelClasses}>Aadhaar Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={12}
                                        placeholder="12-digit Aadhaar number"
                                        {...register('aadhar_number', {
                                            onChange: (e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setValue('aadhar_number', val);
                                                if (val.length === 12) checkUniqueness('aadhar', val);
                                            }
                                        })}
                                        className={cn(inputClasses, isAadhaarVerified && "bg-emerald-50/50 border-emerald-200 text-emerald-900")}
                                        disabled={isAadhaarVerified}
                                    />
                                    {isAadhaarVerified && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-1 rounded-full">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </div>
                                {errors.aadhar_number && <p className={errorClasses}>{errors.aadhar_number.message as string}</p>}
                                {uniquenessErrors.aadhar && <p className={errorClasses}>{uniquenessErrors.aadhar}</p>}
                            </div>

                            {!isAadhaarVerified && (
                                <div className="pt-2">
                                    {!aadhaarOtpSent ? (
                                        <button
                                            type="button"
                                            onClick={handleSendAadhaarOtp}
                                            disabled={isAadhaarVerifying || !watch('aadhar_number') || watch('aadhar_number').length !== 12}
                                            className="w-full py-3.5 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-100"
                                        >
                                            {isAadhaarVerifying ? 'Sending...' : 'Verify with OTP (Required)'}
                                        </button>
                                    ) : (
                                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="6-digit OTP"
                                                value={aadhaarOtpInput}
                                                onChange={e => setAadhaarOtpInput(e.target.value.replace(/\D/g, ''))}
                                                className={inputClasses}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyAadhaarOtp}
                                                    disabled={isAadhaarVerifying || aadhaarOtpInput.length !== 6}
                                                    className="flex-1 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAadhaarOtpSent(false)}
                                                    className="px-4 py-3 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Verified Details Summary (Only if OKYC was used and successful) */}
                        {isAadhaarVerified && watch('first_name') && (
                            <div className="bg-emerald-50/30 rounded-3xl p-5 border border-emerald-100/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Verified Name</p>
                                        <p className="text-xs font-black text-slate-700">{watch('first_name')} {watch('last_name')}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Verified DOB</p>
                                        <p className="text-xs font-black text-slate-700">{watch('date_of_birth')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        {DOCUMENT_CATEGORIES.filter(cat => cat.id === 'pan_card').map((cat) => {
                            const isCaptured = !!capturedImages[cat.id];
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        if (user?.pan_number) return; // Locked once verified
                                        setActiveCameraCategory(cat.id);
                                    }}
                                    className={cn(
                                        "relative p-8 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center text-center group w-full",
                                        isCaptured ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white",
                                        user?.pan_number && "opacity-60 cursor-not-allowed border-emerald-200 bg-emerald-50/20"
                                    )}
                                >

                                    <div className={cn("w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                                        {isCaptured ? <Check className="w-8 h-8" /> : <cat.icon className="w-8 h-8" />}
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">{cat.label}</p>
                                    {isCaptured && (
                                        <div className="mt-4 w-full h-auto min-h-[4rem] max-h-48 rounded-2xl border border-emerald-100 overflow-hidden bg-white/50 relative flex items-center justify-center">
                                            <img src={capturedImages[cat.id]} className="max-w-full max-h-48 object-contain" alt="Preview" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Shield className="text-blue-500" size={15} />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PAN Card Details</h4>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>PAN Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                            {...register('pan_number', {
                                                onChange: (e) => {
                                                    const val = e.target.value.toUpperCase().trim();
                                                    setValue('pan_number', val);
                                                    if (val.length === 10) checkUniqueness('pan', val);
                                                }
                                            })}
                                            className={cn(inputClasses, "uppercase tracking-widest", isPanVerified && "bg-emerald-50/50 border-emerald-200 text-emerald-900")}
                                            disabled={isPanVerified}
                                        />
                                        {isPanVerified && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-1 rounded-full">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </div>
                                    {errors.pan_number && <p className={errorClasses}>{errors.pan_number.message as string}</p>}
                                    {uniquenessErrors.pan && <p className={errorClasses}>{uniquenessErrors.pan}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>First Name on PAN</label>
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            {...register('first_name')}
                                            className={inputClasses}
                                            disabled={isPanVerified || isAadhaarVerified}
                                        />
                                        {errors.first_name && <p className={errorClasses}>{errors.first_name.message as string}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Last Name on PAN</label>
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            {...register('last_name')}
                                            className={inputClasses}
                                            disabled={isPanVerified || isAadhaarVerified}
                                        />
                                        {errors.last_name && <p className={errorClasses}>{errors.last_name.message as string}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>DOB on PAN</label>
                                    <input
                                        type="date"
                                        {...register('date_of_birth')}
                                        className={inputClasses}
                                        disabled={isPanVerified || isAadhaarVerified}
                                    />
                                    {errors.date_of_birth && <p className={errorClasses}>{errors.date_of_birth.message as string}</p>}
                                </div>

                                {!isPanVerified && (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleVerifyPan}
                                            disabled={isPanVerifying || !watch('pan_number') || watch('pan_number').length !== 10}
                                            className="w-full py-3.5 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-100"
                                        >
                                            {isPanVerifying ? 'Verifying...' : 'Verify PAN Details'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>First Name</label>
                                <input placeholder="John" {...register('first_name')} className={inputClasses} disabled={!!user?.name || isAadhaarVerified} />
                                {errors.first_name && <p className={errorClasses}>{errors.first_name.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Last Name</label>
                                <input placeholder="Doe" {...register('last_name')} className={inputClasses} disabled={!!user?.name || isAadhaarVerified} />
                                {errors.last_name && <p className={errorClasses}>{errors.last_name.message}</p>}
                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <input type="email" placeholder="john@example.com" {...register('email')} className={inputClasses} disabled={!!user?.email} />
                                {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Mobile Number</label>
                                <input type="tel" maxLength={10} placeholder="9876543210" {...register('phone')} className={inputClasses} disabled={!!user?.mobile_number} />
                                {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Father Name</label>
                                <input placeholder="Father's Full Name" {...register('father_name')} className={inputClasses} disabled={!!user?.family_detail?.father_name} />
                                {errors.father_name && <p className={errorClasses}>{errors.father_name.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Mother Name</label>
                                <input placeholder="Mother's Full Name" {...register('mother_name')} className={inputClasses} disabled={!!user?.family_detail?.mother_name} />
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
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permanent Address (From Aadhaar)</h4>
                                <div>
                                    <label className={labelClasses}>Street Address</label>
                                    <input placeholder="Street Address" {...register('permanent_street_address')} className={inputClasses} disabled={!!user?.permanent_street_address || isAadhaarVerified} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>City</label>
                                        <input placeholder="City" {...register('permanent_city')} className={inputClasses} disabled={!!user?.permanent_city || isAadhaarVerified} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Pincode</label>
                                        <input placeholder="Pincode" maxLength={6} {...register('permanent_postal_code')} className={inputClasses} disabled={!!user?.permanent_pincode || isAadhaarVerified} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>State</label>
                                    <input placeholder="State" {...register('permanent_state')} className={inputClasses} disabled={!!user?.permanent_state || isAadhaarVerified} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 pt-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Current Address</h4>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Same as Permanent</span>
                                    <div className="relative">
                                        <input type="checkbox" {...register('is_permanent_same')} className="sr-only peer" />
                                        <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                                    </div>
                                </label>
                            </div>

                            {!watch('is_permanent_same') && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className={labelClasses}>Current Street Address</label>
                                        <input placeholder="Current House No, Street" {...register('street_address')} className={inputClasses} disabled={!!user?.business_address || (watch('is_permanent_same') && isAadhaarVerified)} />
                                        {errors.street_address && <p className={errorClasses}>{errors.street_address.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>City</label>
                                            <input placeholder="City" {...register('city')} className={inputClasses} disabled={!!user?.city || (watch('is_permanent_same') && isAadhaarVerified)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Pincode</label>
                                            <input placeholder="Pincode" maxLength={6} {...register('postal_code')} className={inputClasses} disabled={!!user?.pincode || (watch('is_permanent_same') && isAadhaarVerified)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>State</label>
                                        <input placeholder="State" {...register('state')} className={inputClasses} disabled={!!user?.state || (watch('is_permanent_same') && isAadhaarVerified)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={16} className="text-blue-500" />
                                Employment Information
                            </h3>
                            <div>
                                <label className={labelClasses}>{user?.role === 'STUDENT' ? 'School / College Name' : 'Company / Business Name'}</label>
                                <input placeholder="Enter name" {...register('employer')} className={inputClasses} />
                                {errors.employer && <p className={errorClasses}>{errors.employer.message}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Occupation / Position</label>
                                <input placeholder="e.g. Software Engineer, Shop Owner" {...register('occupation')} className={inputClasses} />
                                {errors.occupation && <p className={errorClasses}>{errors.occupation.message}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                         <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2">Almost there!</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Review your details and submit</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Loan Amount</span>
                                    <span className="text-xl font-black text-emerald-400">{loanAmount.toLocaleString()}</span>
                                </div>
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aadhaar Number</span>
                                    <span className="text-sm font-bold text-white/80">{watch('aadhar_number')}</span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">Final Verification Photos</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {DOCUMENT_CATEGORIES.filter(cat => ['applicant_selfie', 'selfie_with_agent'].includes(cat.id)).map((cat) => {
                                        const img = capturedImages[cat.id];
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setActiveCameraCategory(cat.id)}
                                                className={cn(
                                                    "relative h-32 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center overflow-hidden group",
                                                    img ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-white/10"
                                                )}
                                            >
                                                {img ? (
                                                    <img src={img} className="absolute inset-0 w-full h-full object-cover" alt={cat.label} />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cat.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                                                            <cat.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{cat.label}</span>
                                                    </div>
                                                )}
                                                {img && (
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Retake</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <label className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
                                    <div className="relative mt-1">
                                        <input type="checkbox" {...register('consent')} className="sr-only peer" />
                                        <div className="w-6 h-6 border-2 border-white/20 rounded-xl peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white leading-relaxed">
                                            I declare that the information provided is true and I accept the terms of the loan agreement.
                                        </p>
                                        {errors.consent && <p className="text-[10px] font-black text-rose-400 uppercase mt-2 tracking-widest">{errors.consent.message}</p>}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const handleFinalSubmit = async (data: any) => {
        if (!capturedImages['aadhar_front'] || !capturedImages['aadhar_back'] || !capturedImages['pan_card'] || !capturedImages['applicant_selfie'] || !capturedImages['selfie_with_agent']) {
            setErrorPopup("Please provide all required documents including Aadhaar, PAN and Selfies.");
            return;
        }

        const payload = {
            ...data,
            kyc_images: capturedImages,
            ocr_results: ocrResults
        };
        
        try {
            await onSubmit(payload);
        } catch (err: any) {
            console.error("Submission error catch in KycForm:", err);
            const msg = err.message || "Submission failed";
            
            if (msg.toLowerCase().includes('eligib') || msg.toLowerCase().includes('age') || msg.toLowerCase().includes('requirement')) {
                setEligibilityError({ message: msg, step: 1 });
            } else if (msg.toLowerCase().includes('aadhar') || msg.toLowerCase().includes('pan')) {
                setEligibilityError({ message: msg, step: msg.toLowerCase().includes('pan') ? 2 : 1 });
            } else {
                setErrorPopup(msg || "Could not process your application at this time.");
            }
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

                    <button
                        type="button"
                        onClick={() => {
                            setIsSaving(true);
                            localStorage.setItem('kyc_loan_draft', JSON.stringify(watch()));
                            setTimeout(() => setIsSaving(false), 1500);
                        }}
                        className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:border-slate-200 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Check size={16} className="text-emerald-500" /> : <Shield size={16} />}
                        {isSaving ? 'Saved' : 'Save Draft'}
                    </button>

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
                        {isSaving && (
                            <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Draft Saved</span>
                                </div>
                            </div>
                        )}
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
                <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-100 max-w-4xl mx-auto relative">
                    {isSaving && (
                        <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Draft Saved</span>
                            </div>
                        </div>
                    )}
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
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">
                                    {DOCUMENT_CATEGORIES.find(c => c.id === activeCameraCategory)?.label}
                                </h3>
                                <p className="text-blue-400 text-[9px] font-bold uppercase tracking-tight opacity-80 mt-0.5">
                                    Ensure document covers 90% of frame • Minimize background
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveCameraCategory(null)}
                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
                <div className="fixed inset-0 z-[3000] bg-slate-900/98 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                    {/* Tech circuit background */}
                    <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/circuit-board.png")'}} />
                    
                    <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
                        {/* High-fidelity pulse */}
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="absolute inset-10 bg-blue-500/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="absolute inset-20 bg-blue-500/15 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        
                        {/* Premium Document Verification Icon */}
                        <div className="relative w-32 h-40 bg-slate-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
                            {/* Inner gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900" />
                            
                            {/* Document structure lines */}
                            <div className="p-6 space-y-4 pt-12 relative z-10 opacity-30">
                                <div className="h-1 bg-white/20 rounded-full w-full" />
                                <div className="h-1 bg-white/20 rounded-full w-5/6" />
                                <div className="h-1 bg-white/20 rounded-full w-4/6" />
                                <div className="h-1 bg-white/20 rounded-full w-full" />
                            </div>

                            {/* Sophisticated Scan Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,1)] z-20 animate-[scanVertical_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-500/20 to-transparent z-10 opacity-0 animate-[scanVerticalPulse_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-blue-600 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-2xl animate-pulse">
                            <Shield className="text-white" size={24} />
                        </div>
                    </div>
                    
                    <div className="text-center space-y-3 relative z-30">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Secure Processor</span>
                        </div>
                        <h2 className="text-white text-xl font-black uppercase tracking-[0.4em] bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">Authenticating</h2>
                        <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px]">Neural Identity Engine Active</p>
                        
                        <div className="flex items-center justify-center gap-4 pt-10">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes scanVertical {
                            0%, 100% { top: 10%; }
                            50% { top: 90%; }
                        }
                        @keyframes scanVerticalPulse {
                            0%, 100% { top: -10%; opacity: 0; }
                            50% { top: 70%; opacity: 1; }
                        }
                    `}</style>
                </div>
            )}

            {/* Eligibility / Verification Error Popup */}
            {(errorPopup || eligibilityError) && (
                <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
                        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6 text-rose-500 mx-auto">
                            <X size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-center font-black text-slate-900 text-xl mb-3 uppercase tracking-widest">
                            {eligibilityError ? "Not Eligible" : "Verification Issue"}
                        </h3>
                        <p className="text-center text-slate-500 text-sm font-bold leading-relaxed mb-8 px-2">
                            {eligibilityError ? eligibilityError.message : errorPopup}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    if (eligibilityError) {
                                        setCurrentStep(eligibilityError.step);
                                        setEligibilityError(null);
                                    } else {
                                        setErrorPopup(null);
                                    }
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                            >
                                {eligibilityError ? "Re-upload Documents" : "Try Again"}
                            </button>
                            
                            {eligibilityError && (
                                <button 
                                    onClick={() => setEligibilityError(null)}
                                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
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
