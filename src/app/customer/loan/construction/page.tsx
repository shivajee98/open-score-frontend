'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getStorageUrl } from '@/lib/api';
import { 
    ArrowLeft, ArrowRight, Check, Upload, Camera, FileText, MapPin, 
    Briefcase, User, Shield, Info, Calendar, Sparkles, Building, 
    DollarSign, Percent, Lock, Phone, Mail, Award, CheckCircle2,
    Eye, X, Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

// Form Wizard Steps
const STEPS = [
    { id: 1, title: 'Basic Details', icon: User },
    { id: 2, title: 'Employment Details', icon: Briefcase },
    { id: 3, title: 'Property details', icon: Building },
    { id: 4, title: 'Property Docs', icon: FileText },
    { id: 5, title: 'Financials', icon: DollarSign },
    { id: 6, title: 'Bank Info', icon: Percent },
    { id: 7, title: 'Guarantor Details', icon: Shield },
    { id: 8, title: 'Site Verification', icon: MapPin },
    { id: 9, title: 'Review & Risk Check', icon: Sparkles }
];

export default function ConstructionLoanWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Form fields
    const [formData, setFormData] = useState<any>({
        // Step 1: Basic
        full_name: '',
        father_husband_name: '',
        mobile: '',
        alternate_mobile: '',
        email: '',
        dob: '',
        gender: 'Male',
        marital_status: 'Single',
        current_address: '',
        permanent_address: '',
        aadhar_number: '',
        pan_number: '',
        selfie_url: '',

        // Step 2: Employment / Business
        emp_type: 'Job Person', // Job Person or Business Person
        company_name: '',
        designation: '',
        monthly_salary: '',
        salary_slip_url: '',
        bank_statement_6m_url: '',
        business_name: '',
        nature_of_business: '',
        monthly_turnover: '',
        gst_available: '',
        business_proof_url: '',
        shop_photos_url: '',

        // Step 3: Property Details
        property_owner_name: '',
        property_address: '',
        plot_size: '',
        construction_purpose: 'New House', // New House, Floor Addition, Renovation, Commercial
        estimated_cost: '',
        required_loan_amount: '',
        start_date: '',
        completion_date: '',

        // Step 4: Property Docs
        registry_url: '',
        khata_khasra_url: '',
        approved_map_url: '',
        municipal_approval_url: '',
        property_tax_receipt_url: '',
        electricity_bill_url: '',
        noc_url: '',

        // Step 5: Financials
        monthly_income: '',
        existing_emi: '',
        existing_loans: '',
        credit_score_url: '',
        transaction_history_url: '',

        // Step 6: Bank Info
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        cancelled_cheque_url: '',

        // Step 7: Guarantor
        guarantor_name: '',
        guarantor_relationship: '',
        guarantor_mobile: '',
        guarantor_address: '',
        guarantor_aadhar_pan: '',
        guarantor_income: '',

        // Step 8: Site Verification
        geo_location: '',
        plot_front_photo_url: '',
        applicant_site_photo_url: '',
        site_video_url: '',
        neighbour_verification: '',
    });

    // Populate user profile info where possible
    useEffect(() => {
        // Check if user already applied
        apiFetch('/construction-loans/my')
            .then(res => {
                if (res && res.loans && res.loans.length > 0) {
                    const loan = res.loans[0];
                    if (loan.status === 'RE_EDIT') {
                        // Pre-fill form with existing data and allow editing
                        setFormData((prev: any) => ({
                            ...prev,
                            ...(loan.form_data || {}),
                            required_loan_amount: loan.amount || prev.required_loan_amount
                        }));
                        toast.error('Your application requires re-editing. Please update the requested details.');
                    } else {
                        setIsSubmitted(true);
                    }
                } else {
                    // Fetch profile info if no existing application
                    apiFetch('/auth/me')
            .then(data => {
                if (data) {
                    const u = data.user || data;
                    
                    // Reconstruct formatted address from profile fields
                    const addrParts = [];
                    if (u.business_address) addrParts.push(u.business_address);
                    if (u.city) addrParts.push(u.city);
                    if (u.state) addrParts.push(u.state);
                    if (u.pincode) addrParts.push(u.pincode);
                    const formattedAddr = addrParts.join(', ');

                    // Reconstruct permanent address from profile fields
                    const permParts = [];
                    if (u.permanent_street_address) permParts.push(u.permanent_street_address);
                    if (u.permanent_city) permParts.push(u.permanent_city);
                    if (u.permanent_state) permParts.push(u.permanent_state);
                    if (u.permanent_pincode) permParts.push(u.permanent_pincode);
                    const formattedPermAddr = permParts.length > 0 ? permParts.join(', ') : formattedAddr;

                    setFormData((prev: any) => ({
                        ...prev,
                        // Step 1: Basic Details
                        full_name: u.name || '',
                        email: u.email || '',
                        mobile: u.mobile_number || '',
                        aadhar_number: u.aadhar_number || '',
                        pan_number: u.pan_number || '',
                        dob: u.date_of_birth ? (typeof u.date_of_birth === 'string' ? u.date_of_birth.split('T')[0] : '') : '',
                        father_husband_name: u.father_name || (u.family_detail && u.family_detail.father_name) || '',
                        current_address: formattedAddr || '',
                        permanent_address: formattedPermAddr || '',
                        marital_status: u.marital_status || 'Single',
                        selfie_url: u.profile_image ? getStorageUrl(u.profile_image) : '',
                        alternate_mobile: (u.alternate_number && u.alternate_number.phone) || '',

                        // Step 2: Employment / Business
                        emp_type: u.role === 'MERCHANT' ? 'Business Person' : 'Job Person',
                        business_name: u.business_name || '',
                        nature_of_business: u.business_nature || u.business_segment || '',
                        monthly_turnover: u.daily_turnover ? String(Math.round(parseFloat(u.daily_turnover) * 30)) : '',
                        business_proof_url: u.shop_rent_doc ? getStorageUrl(u.shop_rent_doc) : '',
                        shop_photos_url: (() => {
                            try {
                                const items = Array.isArray(u.shop_images)
                                    ? u.shop_images
                                    : JSON.parse(u.shop_images || '[]');
                                return items[0] ? getStorageUrl(items[0]) : '';
                            } catch {
                                return '';
                            }
                        })(),

                        // Step 4: Property Docs
                        electricity_bill_url: u.electricity_bill ? getStorageUrl(u.electricity_bill) : '',

                        // Step 6: Bank Info
                        account_holder_name: u.account_holder_name || u.name || '',
                        bank_name: u.bank_name || '',
                        account_number: u.account_number || '',
                        ifsc_code: u.ifsc_code || '',
                    }));
                }
            })
            .catch(() => {});
        }
    })
    .catch(() => {});
}, []);

    // Get live Geo location
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`;
                    setFormData((prev: any) => ({ ...prev, geo_location: loc }));
                    toast.success('Live GPS coordinates captured successfully!');
                },
                () => {
                    toast.error('Failed to retrieve location. Please permit GPS access.');
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
        }
    };

    // Generic file upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        const formPayload = new FormData();
        formPayload.append('file', file);

        try {
            const response = await apiFetch('/construction-loans/upload', {
                method: 'POST',
                body: formPayload
            });

            if (response && response.url) {
                setFormData((prev: any) => ({ ...prev, [fieldName]: response.url }));
                toast.success('Document uploaded successfully!');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'File upload failed. Please try again.');
        } finally {
            setUploadingField(null);
        }
    };

    // Real Camera Capture via device camera
    const triggerCameraSelfie = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'user'; // front camera
        input.onchange = async (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) return;

            setCameraActive(true);
            const formPayload = new FormData();
            formPayload.append('file', file);

            try {
                const response = await apiFetch('/construction-loans/upload', {
                    method: 'POST',
                    body: formPayload
                });

                if (response && response.url) {
                    setFormData((prev: any) => ({ ...prev, selfie_url: response.url }));
                    toast.success('Selfie captured & uploaded successfully!');
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error: any) {
                toast.error(error.message || 'Selfie upload failed. Please try again.');
            } finally {
                setCameraActive(false);
            }
        };
        input.click();
    };

    // Handle input field change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let sanitizedValue = value;
        if (name === 'mobile' || name === 'alternate_mobile') {
            sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'aadhar_number') {
            sanitizedValue = value.replace(/\D/g, '').slice(0, 12);
        } else if (name === 'pan_number') {
            sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        }

        setFormData((prev: any) => ({ ...prev, [name]: sanitizedValue }));
    };

    // Submit complete form
    const handleSubmitForm = async () => {
        setSubmitting(true);
        try {
            // Frontend validation before submission
            if (formData.mobile && formData.mobile.length !== 10) {
                toast.error('Mobile number must be exactly 10 digits');
                setCurrentStep(1);
                setSubmitting(false);
                return;
            }
            if (formData.aadhar_number && formData.aadhar_number.length !== 12) {
                toast.error('Aadhaar number must be exactly 12 digits');
                setCurrentStep(1);
                setSubmitting(false);
                return;
            }
            if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
                toast.error('Invalid PAN number format');
                setCurrentStep(1);
                setSubmitting(false);
                return;
            }

            const amount = parseFloat(formData.required_loan_amount) || 0;
            if (amount <= 0) {
                toast.error('Please enter a valid required loan amount in Step 3');
                setCurrentStep(3);
                setSubmitting(false);
                return;
            }

            const response = await apiFetch('/construction-loans/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    form_data: {
                        ...formData,
                        estimated_construction_cost: formData.estimated_cost
                    }
                })
            });

            if (response && response.loan) {
                toast.success('Your details have been successfully recorded!');
                setIsSubmitted(true);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit application.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 9) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-3 sm:p-6 pb-32 sm:pb-6 font-sans flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                        <CheckCircle2 size={40} className="stroke-[2]" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Details Submitted!</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construction Loan Portal</p>
                    </div>

                    <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                        We have successfully pre-filled, verified, and submitted your profile credentials, business proofs, property details, and site verification records!
                    </p>

                    <div className="bg-[#F0F9FF] border border-blue-100 rounded-2xl p-5 text-left">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Eligibility Check Pending</span>
                        <p className="text-xs font-bold text-blue-900 leading-normal">
                            You have filled all the details. Our backend and site verification teams will verify your coordinates and files. We will be back in some time for your final eligibility status.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/customer/loan')}
                        className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Go to My Loans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-3 sm:p-6 pb-32 sm:pb-6 font-sans">
            {/* Header */}
            <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Construction Portal</span>
                </div>
            </div>

            {/* Main Application Container */}
            <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden min-h-[500px]">
                {/* Horizontal Progress Bar */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 overflow-x-auto whitespace-nowrap flex items-center justify-between gap-4 scrollbar-none">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        const isCompleted = currentStep > s.id;
                        const isActive = currentStep === s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-2 shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                    isCompleted ? 'bg-emerald-500 text-white' :
                                    isActive ? 'bg-slate-950 text-white ring-4 ring-slate-150' :
                                    'bg-slate-200 text-slate-500'
                                }`}>
                                    {isCompleted ? <Check size={14} /> : s.id}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${
                                    isActive ? 'text-slate-950' : 'text-slate-400'
                                }`}>
                                    {s.title}
                                </span>
                                {s.id < 9 && <div className="h-[1px] w-4 bg-slate-200" />}
                            </div>
                        );
                    })}
                </div>

                {/* Form Step Body */}
                <div className="p-6 sm:p-10">
                    
                    {/* Step 1: Basic Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">1. Basic Applicant Details</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Submit your personal credentials matching your identity proofs.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Full Name (as per Aadhaar/PAN)</label>
                                    <input 
                                        type="text" 
                                        name="full_name" 
                                        value={formData.full_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Father / Husband Name</label>
                                    <input 
                                        type="text" 
                                        name="father_husband_name" 
                                        value={formData.father_husband_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Father/Husband Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        inputMode="numeric"
                                        maxLength={10}
                                        name="mobile" 
                                        value={formData.mobile} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Alternate Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        inputMode="numeric"
                                        maxLength={10}
                                        name="alternate_mobile" 
                                        value={formData.alternate_mobile} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Alternate number"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Email ID</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Email address"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        name="dob" 
                                        value={formData.dob} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Gender</label>
                                    <select 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Marital Status</label>
                                    <select 
                                        name="marital_status" 
                                        value={formData.marital_status} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    >
                                        <option>Single</option>
                                        <option>Married</option>
                                        <option>Divorced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Current Address</label>
                                    <textarea 
                                        name="current_address" 
                                        value={formData.current_address} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors h-20 resize-none"
                                        placeholder="Enter current address"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Permanent Address</label>
                                    <textarea 
                                        name="permanent_address" 
                                        value={formData.permanent_address} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors h-20 resize-none"
                                        placeholder="Enter permanent address"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Aadhaar Number</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        maxLength={12}
                                        name="aadhar_number" 
                                        value={formData.aadhar_number} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="12-digit Aadhaar"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">PAN Number</label>
                                    <input 
                                        type="text" 
                                        maxLength={10}
                                        name="pan_number" 
                                        value={formData.pan_number} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold uppercase focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                            </div>

                            {/* Live Selfie Capture */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 text-sm">Selfie / Live Photo</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Submit a live snapshot for matching biometrics</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {formData.selfie_url && (
                                        <img 
                                            src={formData.selfie_url} 
                                            alt="Live Selfie" 
                                            className="w-16 h-16 rounded-full border border-slate-200 object-cover" 
                                        />
                                    )}
                                    <button 
                                        onClick={triggerCameraSelfie}
                                        disabled={cameraActive}
                                        className="bg-slate-950 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors active:scale-95 mb-4 sm:mb-0"
                                    >
                                        {cameraActive ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                Capturing...
                                            </>
                                        ) : (
                                            <>
                                                <Camera size={14} />
                                                Capture Live
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Employment Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">2. Employment / Business Details</h2>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Specify whether you are salaried or running a verified business.</p>
                                </div>
                                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-auto border border-slate-200/50">
                                    {['Job Person', 'Business Person'].map((type) => (
                                        <button 
                                            key={type}
                                            onClick={() => setFormData((prev: any) => ({ ...prev, emp_type: type }))}
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                formData.emp_type === type ? 'bg-white text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job Person Fields */}
                            {formData.emp_type === 'Job Person' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Company Name</label>
                                        <input 
                                            type="text" 
                                            name="company_name" 
                                            value={formData.company_name} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Designation</label>
                                        <input 
                                            type="text" 
                                            name="designation" 
                                            value={formData.designation} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Enter Designation"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Monthly Salary (INR)</label>
                                        <input 
                                            type="text" 
                                            name="monthly_salary" 
                                            value={formData.monthly_salary} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Monthly Take Home"
                                        />
                                    </div>
                                    
                                    {/* File Uploads */}
                                    <div className="space-y-4 sm:col-span-2">
                                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">Salary Slip (3–6 months)</h4>
                                                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Attach recent salary slips in PDF/Image formats</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {formData.salary_slip_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                                <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                    <Upload size={12} /> {uploadingField === 'salary_slip_url' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'salary_slip_url')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">Bank Statement (6 months)</h4>
                                                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Statement showing salary credits clearly</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {formData.bank_statement_6m_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                                <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                    <Upload size={12} /> {uploadingField === 'bank_statement_6m_url' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'bank_statement_6m_url')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Business Person Fields */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Business Name</label>
                                        <input 
                                            type="text" 
                                            name="business_name" 
                                            value={formData.business_name} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Enter Legal Business Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nature of Business</label>
                                        <input 
                                            type="text" 
                                            name="nature_of_business" 
                                            value={formData.nature_of_business} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Trading, Manufacturing, Retail etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Monthly Turnover (INR)</label>
                                        <input 
                                            type="text" 
                                            name="monthly_turnover" 
                                            value={formData.monthly_turnover} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="Approx turnover"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">GST (if available)</label>
                                        <input 
                                            type="text" 
                                            name="gst_available" 
                                            value={formData.gst_available} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                            placeholder="GSTIN Number"
                                        />
                                    </div>

                                    {/* Business File Uploads */}
                                    <div className="space-y-4 sm:col-span-2">
                                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">Business Proof</h4>
                                                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Attach MSME Certificate / GST Certificate / Shop Act Lic</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {formData.business_proof_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                                <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                    <Upload size={12} /> {uploadingField === 'business_proof_url' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'business_proof_url')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">Shop / Office Photos</h4>
                                                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Interior & exterior photos containing name board</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {formData.shop_photos_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                                <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                    <Upload size={12} /> {uploadingField === 'shop_photos_url' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" onChange={(e) => handleFileUpload(e, 'shop_photos_url')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Construction Property Details */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">3. Construction Property Details</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Submit specific info about the property/plot to be constructed.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Property Owner Name (as in Registry)</label>
                                    <input 
                                        type="text" 
                                        name="property_owner_name" 
                                        value={formData.property_owner_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Owner name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Plot Size (Sq Ft / Gaj)</label>
                                    <input 
                                        type="text" 
                                        name="plot_size" 
                                        value={formData.plot_size} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g. 1200 Sq Ft"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Plot / Property Address</label>
                                    <input 
                                        type="text" 
                                        name="property_address" 
                                        value={formData.property_address} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Full address of construction plot"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Construction Purpose</label>
                                    <select 
                                        name="construction_purpose" 
                                        value={formData.construction_purpose} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    >
                                        <option>New House</option>
                                        <option>Floor Addition</option>
                                        <option>Renovation</option>
                                        <option>Commercial Construction</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Estimated Construction Cost (INR)</label>
                                    <input 
                                        type="text" 
                                        name="estimated_cost" 
                                        value={formData.estimated_cost} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Estimated cost"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Required Loan Amount (INR)</label>
                                    <input 
                                        type="text" 
                                        name="required_loan_amount" 
                                        value={formData.required_loan_amount} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors text-emerald-600 font-bold"
                                        placeholder="Desired loan amount"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Construction Start Date</label>
                                    <input 
                                        type="date" 
                                        name="start_date" 
                                        value={formData.start_date} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Expected Completion Date</label>
                                    <input 
                                        type="date" 
                                        name="completion_date" 
                                        value={formData.completion_date} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Property Documents */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">4. Property Documents</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Upload verified property records for clear land title checking.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'registry_url', label: 'Registry / Sale Deed', desc: 'Legible scanned pages of absolute ownership registry' },
                                    { key: 'khata_khasra_url', label: 'Khata / Khasra / Property Papers', desc: 'Latest government mutation details / possession certificate' },
                                    { key: 'approved_map_url', label: 'Approved Map / Building Plan', desc: 'Copy of blueprint map approved by development board' },
                                    { key: 'municipal_approval_url', label: 'Municipal Approval (if required)', desc: 'NOC / Construction permission from Municipality' },
                                    { key: 'property_tax_receipt_url', label: 'Property Tax Receipt', desc: 'Latest paid property tax token' },
                                    { key: 'electricity_bill_url', label: 'Electricity Bill', desc: 'Recent electricity connection token at address' },
                                    { key: 'noc_url', label: 'NOC (No Objection Certificate)', desc: 'Clearance from local pollution / fire department if applicable' },
                                ].map((item) => (
                                    <div key={item.key} className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900">{item.label}</h4>
                                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {formData[item.key] && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                            <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                <Upload size={12} /> {uploadingField === item.key ? 'Uploading...' : 'Upload'}
                                                <input type="file" onChange={(e) => handleFileUpload(e, item.key)} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Financials */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">5. Income & Financial Verification</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Submit files to assist automated credit standing assessment.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Estimated Net Monthly Income (INR)</label>
                                    <input 
                                        type="text" 
                                        name="monthly_income" 
                                        value={formData.monthly_income} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Monthly earnings"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Existing EMI Outgo (Monthly INR)</label>
                                    <input 
                                        type="text" 
                                        name="existing_emi" 
                                        value={formData.existing_emi} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Active EMIs"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Details of Existing Loans</label>
                                    <input 
                                        type="text" 
                                        name="existing_loans" 
                                        value={formData.existing_loans} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Active loan details"
                                    />
                                </div>

                                <div className="space-y-4 sm:col-span-2 mt-2">
                                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900">Credit Score Report</h4>
                                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5 font-sans">CIBIL / Experian report in PDF (if available)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {formData.credit_score_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                            <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                <Upload size={12} /> {uploadingField === 'credit_score_url' ? 'Uploading...' : 'Upload'}
                                                <input type="file" onChange={(e) => handleFileUpload(e, 'credit_score_url')} className="hidden" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900">UPI / Bank Transaction History</h4>
                                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">PDF export of banking statement (6 to 12 months)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {formData.transaction_history_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                            <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                <Upload size={12} /> {uploadingField === 'transaction_history_url' ? 'Uploading...' : 'Upload'}
                                                <input type="file" onChange={(e) => handleFileUpload(e, 'transaction_history_url')} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Bank Info */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">6. Bank Details</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Specify target account credentials for direct disbursal routing.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Account Holder Name (as in bank)</label>
                                    <input 
                                        type="text" 
                                        name="account_holder_name" 
                                        value={formData.account_holder_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Holder name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bank Name</label>
                                    <input 
                                        type="text" 
                                        name="bank_name" 
                                        value={formData.bank_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g. HDFC Bank"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Account Number</label>
                                    <input 
                                        type="text" 
                                        name="account_number" 
                                        value={formData.account_number} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Bank account number"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">IFSC Code</label>
                                    <input 
                                        type="text" 
                                        name="ifsc_code" 
                                        value={formData.ifsc_code} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors text-slate-900 uppercase"
                                        placeholder="11 digit IFSC code"
                                    />
                                </div>

                                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 sm:col-span-2 mt-2">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Cancelled Cheque / Passbook Copy</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Scanned copy showing name & account info clearly</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {formData.cancelled_cheque_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                        <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                            <Upload size={12} /> {uploadingField === 'cancelled_cheque_url' ? 'Uploading...' : 'Upload'}
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'cancelled_cheque_url')} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Guarantor / Reference Details */}
                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">7. Guarantor / Reference Details</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Submit guarantor credentials for collateral risk backing.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Guarantor Full Name</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_name" 
                                        value={formData.guarantor_name} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Guarantor name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Relationship with Applicant</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_relationship" 
                                        value={formData.guarantor_relationship} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g. Brother, Friend"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Guarantor Mobile Number</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_mobile" 
                                        value={formData.guarantor_mobile} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Guarantor Aadhaar & PAN details</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_aadhar_pan" 
                                        value={formData.guarantor_aadhar_pan} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g. Aadhaar: XXXXXXXX, PAN: XXXXXXX"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Guarantor Residential Address</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_address" 
                                        value={formData.guarantor_address} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="Full address of guarantor"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Guarantor Monthly Income Details</label>
                                    <input 
                                        type="text" 
                                        name="guarantor_income" 
                                        value={formData.guarantor_income} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g. Salaried earning 45,000/pm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Site Verification */}
                    {currentStep === 8 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">8. Site Physical Verification Details</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Provide site photos and live GPS tags to trigger field investigation.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 bg-slate-50 p-6 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Live GPS Coordinates</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Tag exact coordinates of construction plot</p>
                                        {formData.geo_location && (
                                            <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">{formData.geo_location}</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleGetLocation}
                                        className="bg-slate-950 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-1.5 hover:bg-slate-900 transition-colors shrink-0"
                                    >
                                        <MapPin size={12} /> Fetch Live GPS
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Plot Front Photo</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Direct photo standing in front of plot</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {formData.plot_front_photo_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                        <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                            <Upload size={12} /> {uploadingField === 'plot_front_photo_url' ? 'Uploading...' : 'Upload'}
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'plot_front_photo_url')} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Applicant Photo at Site</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Selfie/photo of applicant standing inside plot</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {formData.applicant_site_photo_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                        <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                            <Upload size={12} /> {uploadingField === 'applicant_site_photo_url' ? 'Uploading...' : 'Upload'}
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'applicant_site_photo_url')} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 sm:col-span-2">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Construction Site Video</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">360 degree panoramic video clip showing adjacent houses</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {formData.site_video_url && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPLOADED</span>}
                                        <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                            <Upload size={12} /> {uploadingField === 'site_video_url' ? 'Uploading...' : 'Upload'}
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'site_video_url')} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Neighbor Remarks (Name & Contact of two neighbors)</label>
                                    <textarea 
                                        name="neighbour_verification" 
                                        value={formData.neighbour_verification} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-400 transition-colors h-24 resize-none"
                                        placeholder="Neighbor 1: Name, Phone. Neighbor 2: Name, Phone."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 9: Final Review & Risk Check */}
                    {currentStep === 9 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">9. Review & Final Verification</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Review complete details before submitting to internal risk pipeline.</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant Name</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.full_name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.mobile || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construction Purpose</span>
                                    <span className="text-sm font-bold text-slate-950 bg-slate-200/60 px-3 py-1 rounded-full">{formData.construction_purpose}</span>
                                </div>
                                <div className="flex items-center justify-between pb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Amount Requested</span>
                                    <span className="text-sm font-black text-emerald-600"> {parseFloat(formData.required_loan_amount).toLocaleString('en-IN') || '0'}</span>
                                </div>
                            </div>

                            <div className="border border-slate-150 rounded-2xl p-4 bg-[#F0F9FF] flex gap-3">
                                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">Automated System Security Match</h4>
                                    <p className="text-[10px] text-blue-700/80 font-semibold mt-1">Our internal risk check will matches your IP signature, Device ID and Area Risk parameters automatically upon submission.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="consent" className="rounded border-slate-300 text-slate-900 focus:ring-slate-950 w-4 h-4 cursor-pointer" defaultChecked />
                                <label htmlFor="consent" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer">I authorize Open Score risk team to verify my documents and geo coordinates</label>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    {currentStep < 9 ? (
                        <button 
                            onClick={nextStep}
                            className="bg-slate-950 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-slate-900 transition-colors active:scale-95 shadow-md shadow-slate-950/10"
                        >
                            Next <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmitForm}
                            disabled={submitting}
                            className="bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition-colors active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={14} />
                                    Submit Application
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
