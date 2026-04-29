'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { apiFetch, clearAuthState } from '@/lib/api';
import { User, Mail, Briefcase, Phone, Smartphone, ArrowLeft, Shield, Edit2, Lock, Headphones, Bell, ArrowRight, LogOut, ShieldCheck, FileText, Lightbulb, HelpCircle, Share, Trophy, AlertTriangle, Camera, Image as ImageIcon, Plus, Info, Check, X, Clock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import PinModal from '@/components/PinModal';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useApi } from '@/hooks/useApi';
import TutorialPlayer from '@/components/TutorialPlayer';
import BackButton from '@/components/BackButton';
import ShopTimingModal, { ShopTimingData } from '@/components/ShopTimingModal';
import CameraComponent from '@/components/loan/Camera';
import DocumentCropper from '@/components/loan/DocumentCropper';
import { CreditCard, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
    const { data: user, error: userError, isLoading: userLoading, mutate: mutateUser } = useApi('/auth/me');
    const { data: pinData, mutate: mutatePin } = useApi('/wallet/check-pin');

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const initialDataLoaded = useRef(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        business_segment: '',
        business_type: '',
        business_nature: '',
        customer_segment: '',
        daily_turnover: '',
        map_location_url: '',
        shop_images: '[]',
        business_name: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        show_phone: true,
        show_timing: true,
        shop_timing: null as any,
        aadhar_number: '',
        pan_number: '',
        date_of_birth: '',
        father_name: ''
    });
    const [newShopImages, setNewShopImages] = useState<File[]>([]);
    const [newAadharImage, setNewAadharImage] = useState<File | null>(null);
    const [newAadharBackImage, setNewAadharBackImage] = useState<File | null>(null);
    const [newPanImage, setNewPanImage] = useState<File | null>(null);
    const [isShopTimingModalOpen, setIsShopTimingModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'SET' | 'VERIFY'>('VERIFY');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [dynamicButtons, setDynamicButtons] = useState<any[]>([]);
    const [uniquenessErrors, setUniquenessErrors] = useState<{ aadhar?: string, pan?: string, account?: string }>({});
    const [checkingUniqueness, setCheckingUniqueness] = useState<{ aadhar?: boolean, pan?: boolean, account?: boolean }>({});
    const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
    const [isAppPinMissing, setIsAppPinMissing] = useState(false);
    const hasPromptedPin = useRef(false);

    // Alternate Number Verification States
    const [alternatePhone, setAlternatePhone] = useState(user?.alternate_number?.phone || '');
    const [altOtp, setAltOtp] = useState('');
    const [altOtpSent, setAltOtpSent] = useState(false);
    const [isAltOtpSending, setIsAltOtpSending] = useState(false);
    const [isAltOtpVerifying, setIsAltOtpVerifying] = useState(false);

    // KYC Verification States
    const [isAadhaarVerified, setIsAadhaarVerified] = useState(!!user?.aadhar_number);
    const [isPanVerified, setIsPanVerified] = useState(!!user?.pan_number);
    const [aadhaarReferenceId, setAadhaarReferenceId] = useState('');
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [aadhaarOtpInput, setAadhaarOtpInput] = useState('');
    const [isAadhaarVerifying, setIsAadhaarVerifying] = useState(false);
    const [isPanVerifying, setIsPanVerifying] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [activeCameraCategory, setActiveCameraCategory] = useState<string | null>(null);
    const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});

    const DOCUMENT_CATEGORIES = [
        { id: 'aadhar_front', label: 'Aadhaar Front', desc: 'Face side of your Aadhaar card' },
        { id: 'aadhar_back', label: 'Aadhaar Back', desc: 'Address side of your Aadhaar card' },
        { id: 'pan_card', label: 'PAN Card', desc: 'Front side of your PAN card' }
    ];

    useEffect(() => {
        if (user) {
            setIsAadhaarVerified(!!user.aadhar_number);
            setIsPanVerified(!!user.pan_number);
        }
    }, [user]);

    useEffect(() => {
        if (user?.alternate_number?.phone) {
            setAlternatePhone(user.alternate_number.phone);
        }
    }, [user?.alternate_number]);

    useEffect(() => {
        if (pinData && !pinData.has_pin) {
            setIsAppPinMissing(true);
            if (!hasPromptedPin.current) {
                setPinModalMode('SET');
                setIsPinModalOpen(true);
                hasPromptedPin.current = true;
            }
        } else {
            setIsAppPinMissing(false);
        }
    }, [pinData]);

    const checkUniqueness = async (type: 'aadhar' | 'pan' | 'account', value: string, ifsc?: string) => {
        setCheckingUniqueness(prev => ({ ...prev, [type]: true }));
        try {
            const apiType = type === 'account' ? 'account_number' : type;
            const res = await apiFetch('/loans/check-kyc-uniqueness', {
                method: 'POST',
                body: JSON.stringify({ type: apiType, value, ifsc_code: ifsc })
            });

            if (!res.unique) {
                setUniquenessErrors(prev => ({ ...prev, [type]: 'यह विवरण पहले से ही किसी अन्य खाते से लिंक है।' }));
            } else {
                setUniquenessErrors(prev => ({ ...prev, [type]: undefined }));
            }
        } catch (e) {
            console.error('Failed to check uniqueness', e);
        } finally {
            setCheckingUniqueness(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSendAadhaarOtp = async () => {
        const aadhaarNumber = formData.aadhar_number;
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

                // Auto-fill
                const update: any = {};
                if (kyc.name) update.name = kyc.name;
                if (kyc.dob) {
                    const parts = kyc.dob.split(/[-/]/);
                    update.date_of_birth = parts.length === 3
                        ? (parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : kyc.dob)
                        : kyc.dob;
                }
                if (kyc.care_of) update.father_name = kyc.care_of.replace(/^(S\/O|D\/O|W\/O)\s*/i, '').trim();
                
                const addr = kyc.address ?? {};
                const street = [addr.house, addr.street, addr.landmark, addr.loc, addr.vtc].filter(Boolean).join(', ');
                if (street) update.street_address = street;
                if (addr.city || addr.dist) update.city = addr.city || addr.dist;
                if (addr.state) update.state = addr.state;
                if (addr.zip) update.postal_code = addr.zip;

                setFormData(prev => ({ ...prev, ...update }));
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
        const pan = formData.pan_number;
        const name = formData.name;
        const dob = formData.date_of_birth;

        if (!pan || pan.length !== 10) {
            toast.error('कृपया पहले पैन नंबर दर्ज करें।');
            return;
        }
        if (!name || !dob) {
            toast.error('पैन सत्यापन के लिए नाम और जन्म तिथि आवश्यक है।');
            return;
        }

        setIsPanVerifying(true);
        const toastId = toast.loading('पैन सत्यापित किया जा रहा है...');
        try {
            const res = await apiFetch('/loans/sandbox/pan-verify', {
                method: 'POST',
                body: JSON.stringify({ pan, name, dob }),
            });

            if (res?.data?.status === 'VALID' || res?.status === 'VALID' || res?.data?.name_match === true) {
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

    const handleCapture = async (url: string) => {
        if (url === 'CLOSE') {
            setActiveCameraCategory(null);
            return;
        }

        setIsOcrLoading(true);
        try {
            const res = await apiFetch('/kyc/detect-corners', {
                method: 'POST',
                body: JSON.stringify({ image: url, type: activeCameraCategory === 'pan_card' ? 'pan' : 'aadhar' }),
            });

            if (res.success && res.data) {
                const ocr_data = res.data;
                const update: any = {};

                if (activeCameraCategory === 'aadhar_front') {
                    if (ocr_data.aadhaar_number) update.aadhar_number = ocr_data.aadhaar_number;
                    if (ocr_data.name) update.name = ocr_data.name;
                    if (ocr_data.dob) {
                        const parts = ocr_data.dob.split(/[-/]/);
                        update.date_of_birth = parts.length === 3
                            ? (parts[2].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ocr_data.dob)
                            : ocr_data.dob;
                    }
                } else if (activeCameraCategory === 'pan_card') {
                    if (ocr_data.pan_number) update.pan_number = ocr_data.pan_number;
                }

                setFormData(prev => ({ ...prev, ...update }));

                if (update.aadhar_number) checkUniqueness('aadhar', update.aadhar_number);
                if (update.pan_number) checkUniqueness('pan', update.pan_number);
            }

            setCapturedImages(prev => ({ ...prev, [activeCameraCategory!]: url }));
            setActiveCameraCategory(null);
        } catch (err: any) {
            console.error("Capture error:", err);
            toast.error(err.message || "Capture processing failed.");
        } finally {
            setIsOcrLoading(false);
        }
    };

    const BUSINESS_STRUCTURE = {
        'Food & Daily Essentials': ['Grocery / Kirana Store', 'Dairy / Milk Booth', 'Fruit & Vegetable Vendor', 'Bakery', 'Sweet Shop / Mithai Shop', 'Fast Food Stall', 'Tea / Coffee Stall', 'Juice Shop', 'Restaurant', 'Dhaba', 'Hotel / Lodge'],
        'Health & Medical': ['Pharmacy / Medical Store', 'Clinic', 'Pathology Lab', 'Medical Equipment Shop', 'Ayurvedic / Herbal Store'],
        'Retail Shops': ['General Store', 'Departmental Store', 'Clothing / Garment Shop', 'Footwear Shop', 'Mobile Shop', 'Electronics Shop', 'Gift Shop', 'Cosmetic / Beauty Store', 'Stationery Shop', 'Toy Shop'],
        'Street Vendors / Small Traders': ['Street Food Cart', 'Paan Shop', 'Ice Cream Cart', 'Egg / Chicken Vendor', 'Fish / Meat Shop', 'Flower Vendor'],
        'Services (Daily Use)': ['Barber / Salon', 'Beauty Parlour', 'Laundry / Dry Cleaner', 'Tailor', 'Repair Shop (Mobile / Electronics)', 'Bike / Car Garage', 'Photocopy / Printing Shop', 'Cyber Cafe'],
        'Home & Utility': ['Hardware Store', 'Electrical Shop', 'Plumbing Store', 'Paint Shop', 'Furniture Shop', 'Mattress Shop', 'Kitchenware / Utensils Store'],
        'Agriculture & Rural': ['Fertilizer Shop', 'Seeds Store', 'Animal Feed Shop', 'Pesticide Store', 'Dairy Farm'],
        'Education & Others': ['Book Store', 'Coaching Institute', 'Computer Training Center', 'Play School / Daycare']
    };

    const hasPin = pinData?.has_pin || false;
    const router = useRouter();
    const isAuthenticated = useAuthProtection();

    useEffect(() => {
        const saved = localStorage.getItem('audio_enabled');
        if (saved === 'true') setNotificationsEnabled(true);
    }, []);

    const hasNativePushSupport = () => {
        if (typeof window === 'undefined') return false;
        return Capacitor.isPluginAvailable('PushNotifications');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const isEdit = searchParams.get('edit') === 'true';
            const editBank = searchParams.get('editBank') === 'true';
            const section = searchParams.get('section');

            if (isEdit || editBank) {
                if (user?.role === 'MERCHANT' && user?.kyc_status === 'FULL_VERIFIED' && user.aadhar_image && user.pan_image) {
                    toast.error("Verified profile cannot be edited.");
                    return;
                }
                setIsEditing(true);

                const targetId = editBank ? 'bank-details-section' : (section ? `${section}-section` : null);

                if (targetId) {
                    setTimeout(() => {
                        const element = document.getElementById(targetId);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all');
                            setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all'), 3000);
                        }
                    }, 500);
                }
            }
        }
    }, [user?.role, user?.kyc_status]);

    const isPinMissing = user && !user.pincode;

    // Force edit mode if PIN is missing
    useEffect(() => {
        if (isPinMissing && !isEditing && initialDataLoaded.current) {
            setIsEditing(true);
            toast.info("Please set your 6-digit PIN code to unlock virtual credit plans.");

            // Focus on address section
            setTimeout(() => {
                const element = document.getElementById('address-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-amber-500', 'ring-offset-4', 'transition-all');
                    setTimeout(() => element.classList.remove('ring-4', 'ring-amber-500', 'ring-offset-4', 'transition-all'), 3000);
                }
            }, 800);
        }
    }, [isPinMissing, isEditing, initialDataLoaded.current]);

    // Synchronize form data with user data when it arrives
    useEffect(() => {
        if (user) {
            // Populate if not editing, or if editing but we haven't loaded initial data yet
            if (!isEditing || !initialDataLoaded.current) {
                const ensureNoBlob = (url: string | null | undefined) => {
                    if (!url || url.includes('blob:')) return '';
                    return url;
                };

                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bank_name: user.bank_name || '',
                    account_number: user.account_number || '',
                    ifsc_code: user.ifsc_code || '',
                    account_holder_name: user.account_holder_name || '',
                    business_segment: user.business_segment || '',
                    business_type: user.business_type || '',
                    business_nature: user.business_nature || '',
                    customer_segment: user.customer_segment || '',
                    daily_turnover: user.daily_turnover || '',
                    map_location_url: user.map_location_url || '',
                    shop_images: (() => {
                        const items = Array.isArray(user.shop_images) ? user.shop_images : JSON.parse(user.shop_images || '[]');
                        return JSON.stringify(items.filter((img: string) => img && !img.includes('blob:')));
                    })(),
                    business_name: user.business_name || '',
                    street_address: user.business_address || '',
                    city: user.city || '',
                    state: user.state || '',
                    postal_code: user.pincode || '',
                    show_phone: user.show_phone ?? true,
                    show_timing: user.show_timing ?? true,
                    shop_timing: user.shop_timing || null,
                    aadhar_number: user.aadhar_number || '',
                    pan_number: user.pan_number || '',
                    date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                    father_name: user.father_name || (user.family_detail?.father_name || '')
                });
                initialDataLoaded.current = true;
            }
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (user?.role) {
            const fetchDynamicButtons = async () => {
                try {
                    const data = await apiFetch(`/dynamic-buttons?role=${user.role}`);
                    setDynamicButtons(data);
                } catch (error) {
                    console.error('Failed to fetch dynamic buttons', error);
                }
            };
            fetchDynamicButtons();
        }
    }, [user?.role]);

    useEffect(() => {
        if (isEditing && formData.aadhar_number.length === 12 && formData.aadhar_number !== user?.aadhar_number) {
            const timer = setTimeout(() => {
                checkUniqueness('aadhar', formData.aadhar_number);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setUniquenessErrors(prev => ({ ...prev, aadhar: undefined }));
        }
    }, [formData.aadhar_number, isEditing, user?.aadhar_number]);

    useEffect(() => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
        if (isEditing && formData.pan_number.length === 10 && panRegex.test(formData.pan_number) && formData.pan_number !== user?.pan_number) {
            const timer = setTimeout(() => {
                checkUniqueness('pan', formData.pan_number);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setUniquenessErrors(prev => ({ ...prev, pan: undefined }));
        }
    }, [formData.pan_number, isEditing, user?.pan_number]);

    useEffect(() => {
        const isNewBank = formData.account_number !== user?.account_number || formData.ifsc_code !== user?.ifsc_code;
        if (isEditing && formData.account_number.length >= 9 && formData.ifsc_code.length === 11 && isNewBank) {
            const timer = setTimeout(() => {
                checkUniqueness('account', formData.account_number, formData.ifsc_code);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setUniquenessErrors(prev => ({ ...prev, account: undefined }));
        }
    }, [formData.account_number, formData.ifsc_code, isEditing, user?.account_number, user?.ifsc_code]);

    const toggleNotifications = async () => {
        if (typeof window === 'undefined') return;

        const platform = Capacitor.getPlatform();
        const isNative = hasNativePushSupport();

        console.log(`[PushDebug] Platform detected: ${platform}, isNative: ${isNative}`);

        if (isNative) {
            try {
                const { PushNotifications } = await import('@capacitor/push-notifications');

                // If we are turning it OFF
                if (notificationsEnabled) {
                    console.log('[PushDebug] Disabling notifications');
                    setNotificationsEnabled(false);
                    localStorage.setItem('audio_enabled', 'false');
                    toast.success("Notifications Disabled");
                    return;
                }

                // If we are turning it ON
                console.log('[PushDebug] Attempting native push registration...');
                let perm = await PushNotifications.checkPermissions();

                if (perm.receive === 'prompt' || perm.receive === 'denied') {
                    perm = await PushNotifications.requestPermissions();
                }

                const granted = perm.receive === 'granted';
                if (granted) {
                    setNotificationsEnabled(true);
                    localStorage.setItem('audio_enabled', 'true');
                    toast.success("Notifications Enabled (Native)");
                    try {
                        await PushNotifications.register();
                    } catch (regErr) {
                        console.error("[PushDebug] Registration failed", regErr);
                    }
                } else {
                    toast.error(`Permission denied: ${perm.receive}`);
                }
            } catch (e) {
                console.error("[PushDebug] Native Error:", e);
                toast.error("Native push error. Ensure you are using the installed App.");
            }
            return;
        }

        // Standard Browser logic (Fallback for web)
        console.log('[PushDebug] Using Web Push fallback logic');
        if (!("Notification" in window)) {
            const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobileBrowser) {
                toast.error(`Mobile browsers don't support web push. Open the installed App.`);
            } else {
                toast.error(`Notifications not supported in this browser (${platform})`);
            }
            return;
        }

        if (Notification.permission === "granted") {
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);
            localStorage.setItem('audio_enabled', newState.toString());
            toast.success(newState ? "Notifications Enabled" : "Notifications Disabled");
        } else if (Notification.permission !== "denied") {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    setNotificationsEnabled(true);
                    localStorage.setItem('audio_enabled', 'true');
                    toast.success("Notifications Enabled");
                } else {
                    toast.error("Permission denied");
                }
            } catch (e) {
                toast.error("Failed to request permission");
            }
        } else {
            toast.error("Notifications are blocked in browser settings.");
        }
    };

    const toggleMerchantVisibility = async (field: 'show_phone' | 'show_timing') => {
        const newValue = !formData[field];

        // Always update local state for UI feedback
        setFormData(prev => ({ ...prev, [field]: newValue }));

        // If not in editing mode, sync with backend immediately
        if (!isEditing) {
            try {
                const res = await apiFetch('/merchant/visibility', {
                    method: 'POST',
                    body: JSON.stringify({ [field]: newValue })
                });
                if (res.error) throw new Error(res.error);
                toast.success('Visibility updated');
                await mutateUser();
            } catch (e: any) {
                toast.error(e.message || 'Failed to update visibility');
                // Revert local state on error
                setFormData(prev => ({ ...prev, [field]: !newValue }));
            }
        }
    };

    const [showNameMismatch, setShowNameMismatch] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isAddressLocked, setIsAddressLocked] = useState(false);

    useEffect(() => {
        const updateTimeStr = user?.address_updated_at;
        if (updateTimeStr) {
            // Ensure we handle UTC/Local correctly by parsing
            const updateTime = new Date(updateTimeStr).getTime();

            const calculateTime = () => {
                const now = new Date().getTime();
                const diff = (updateTime + 3 * 60 * 1000) - now;
                if (diff <= 0) {
                    setTimeLeft(0);
                    setIsAddressLocked(true);
                } else {
                    setTimeLeft(Math.floor(diff / 1000));
                    setIsAddressLocked(false);
                }
            };

            calculateTime();
            const timer = setInterval(calculateTime, 1000);
            return () => clearInterval(timer);
        } else {
            setIsAddressLocked(false);
            setTimeLeft(null);
        }
    }, [user?.address_updated_at]);

    const handleBack = () => {
        if (isPinMissing && !formData.postal_code) {
            toast.error("PIN Code is required to unlock your regional features.");
            const element = document.getElementById('address-section');
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (user?.role === 'ADMIN') router.push('/admin');
        else router.push('/customer'); // Unified dashboard
    };

    const uploadSingleImage = async (field: string, file: File) => {
        setUploadingImages(prev => ({ ...prev, [field]: true }));
        try {
            const uploadData = new FormData();
            uploadData.append(field, file);

            const res = await apiFetch('/auth/update-profile', {
                method: 'POST',
                body: uploadData
            });

            if (res.error) throw new Error(res.error);

            toast.success(`${field.replace(/_/g, ' ').toUpperCase()} updated successfully!`);
            await mutateUser();
        } catch (e: any) {
            toast.error(e.message || `Failed to update ${field}`);
        } finally {
            setUploadingImages(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleFileChangeAutoSave = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadSingleImage(field, file);
        }
    };

    const handleUpdateProfile = async () => {
        // Issue 7: Name matching validation
        const profileName = formData.name.trim().toLowerCase();
        const bankName = formData.account_holder_name.trim().toLowerCase();

        if (bankName && profileName !== bankName) {
            setShowNameMismatch(true);
            return;
        }

        if (uniquenessErrors.aadhar || uniquenessErrors.pan || uniquenessErrors.account) {
            toast.error("Please resolve KYC or Bank uniqueness issues before saving.");
            return;
        }

        if (!formData.postal_code || formData.postal_code.length !== 6) {
            toast.error("Valid 6-digit PIN Code is required.");
            const element = document.getElementById('address-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-4', 'ring-amber-500', 'ring-offset-4');
                setTimeout(() => element.classList.remove('ring-4', 'ring-amber-500', 'ring-offset-4'), 3000);
            }
            return;
        }

        setIsSaving(true);
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('business_name', formData.business_name);
            uploadData.append('business_nature', formData.business_nature);
            uploadData.append('business_segment', formData.business_segment);
            uploadData.append('customer_segment', formData.customer_segment);
            uploadData.append('daily_turnover', formData.daily_turnover);
            if (!isAddressLocked) {
                uploadData.append('business_address', formData.street_address);
                uploadData.append('city', formData.city);
                uploadData.append('state', formData.state);
                uploadData.append('pincode', formData.postal_code);
                uploadData.append('map_location_url', formData.map_location_url);
            }
            uploadData.append('show_phone', formData.show_phone ? '1' : '0');
            uploadData.append('show_timing', formData.show_timing ? '1' : '0');
            uploadData.append('aadhar_number', formData.aadhar_number);
            uploadData.append('pan_number', formData.pan_number);
            uploadData.append('date_of_birth', formData.date_of_birth);
            uploadData.append('father_name', formData.father_name);

            // Bank details
            if (!user?.account_number) {
                uploadData.append('bank_name', formData.bank_name);
                uploadData.append('account_number', formData.account_number);
                uploadData.append('ifsc_code', formData.ifsc_code);
                uploadData.append('account_holder_name', formData.account_holder_name);
            }

            let currentImages: string[] = [];
            try {
                if (typeof formData.shop_images === 'string') {
                    currentImages = JSON.parse(formData.shop_images);
                }
            } catch (e) { currentImages = []; }

            // Filter out blob preview URLs from retained images to prevent 404s
            currentImages.filter(img => !img.includes('blob:')).forEach((img) => {
                uploadData.append('retained_shop_images[]', img);
            });

            newShopImages.forEach((file) => {
                uploadData.append('shop_images[]', file);
            });

            if (newAadharImage) {
                uploadData.append('aadhar_image', newAadharImage);
            }

            if (newAadharBackImage) {
                uploadData.append('aadhar_back_image', newAadharBackImage);
            }

            if (newPanImage) {
                uploadData.append('pan_image', newPanImage);
            }

            const res = await apiFetch('/auth/update-profile', {
                method: 'POST',
                body: uploadData
            });
            if (res.error) throw new Error(res.error);

            // Immediate sync: update SWR cache and localStorage
            if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
                await mutateUser(res.user, false);

                // Clear blob previews from form data by re-parsing from saved user
                try {
                    setFormData(prev => ({
                        ...prev,
                        shop_images: JSON.stringify(res.user.shop_images || [])
                    }));
                } catch (e) { }
            } else {
                await mutateUser(); // Fallback to refetch if user not returned
            }

            setIsEditing(false);
            setNewShopImages([]);
            setNewAadharImage(null);
            setNewAadharBackImage(null);
            setNewPanImage(null);
            toast.success('Profile updated successfully!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePinClick = () => {
        if (hasPin) {
            setPinModalMode('VERIFY');
            setIsPinModalOpen(true);
        } else {
            setPinModalMode('SET');
            setIsPinModalOpen(true);
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (pinModalMode === 'VERIFY') {
            try {
                const res = await apiFetch('/wallet/verify-pin', {
                    method: 'POST',
                    body: JSON.stringify({ pin })
                });
                if (res.valid) {
                    setIsPinModalOpen(false);
                    setTimeout(() => {
                        setPinModalMode('SET');
                        setIsPinModalOpen(true);
                    }, 200);
                } else {
                    toast.error('Incorrect PIN');
                }
            } catch (e) {
                toast.error('Failed to verify PIN');
            }
        } else {
            // Set new PIN
            try {
                await apiFetch('/auth/set-pin', {
                    method: 'POST',
                    body: JSON.stringify({
                        pin,
                        pin_confirmation: pin
                    })
                });
                toast.success('PIN updated successfully!');
                mutatePin(); // Refresh pin status
                setIsPinModalOpen(false);
            } catch (e: any) {
                toast.error(e.message || 'Failed to update PIN');
            }
        }
    };

    const handleRequestAltOtp = async () => {
        if (!alternatePhone || alternatePhone.length !== 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        if (alternatePhone === user?.mobile_number) {
            toast.error("Alternate number cannot be the same as your primary number");
            return;
        }

        setIsAltOtpSending(true);
        try {
            const res = await apiFetch('/auth/alternate-number/otp', {
                method: 'POST',
                body: JSON.stringify({ phone: alternatePhone })
            });
            if (res.error) throw new Error(res.error);
            setAltOtpSent(true);
            toast.success("OTP sent to your alternate number");
        } catch (e: any) {
            toast.error(e.message || "Failed to send OTP");
        } finally {
            setIsAltOtpSending(false);
        }
    };

    const handleVerifyAltOtp = async () => {
        if (!altOtp || altOtp.length !== 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        setIsAltOtpVerifying(true);
        try {
            const res = await apiFetch('/auth/alternate-number/verify', {
                method: 'POST',
                body: JSON.stringify({ phone: alternatePhone, otp: altOtp })
            });
            if (res.error) throw new Error(res.error);
            toast.success("Alternate number verified successfully!");
            setAltOtpSent(false);
            setAltOtp('');
            await mutateUser();
        } catch (e: any) {
            toast.error(e.message || "Invalid OTP");
        } finally {
            setIsAltOtpVerifying(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        // Add to actual file queue
        setNewShopImages(prev => [...prev, file]);
        toast.success("Image added to upload list");

        // UI Smoothing: Clear file input so it can be used again
        e.target.value = '';

        // Add local preview to formData for immediate UI feedback
        const previewUrl = URL.createObjectURL(file);
        let currentImages: string[] = [];
        try {
            currentImages = formData.shop_images ? JSON.parse(formData.shop_images) : [];
        } catch (err) { currentImages = []; }

        const updatedImages = [...currentImages, previewUrl];
        setFormData(prev => ({ ...prev, shop_images: JSON.stringify(updatedImages) }));
    };

    const isMerchant = user?.role === 'MERCHANT';
    const isNameLocked = isMerchant && !!user?.name;
    const themeColor = isMerchant ? 'emerald' : 'blue';

    if (userError) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Profile</h3>
                    <p className="text-slate-500 text-sm mb-6">{userError.message || "Please check your internet connection."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={async () => { await clearAuthState(); window.location.href = '/'; }}
                        className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || userLoading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-xs animate-pulse">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Themed Header */}
            <div className={`bg-gradient-to-br ${isMerchant ? 'from-emerald-950 via-green-900 to-teal-950' : 'from-slate-900 via-indigo-950 to-violet-950'} pt-12 pb-24 px-4 relative overflow-hidden shadow-2xl`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-600/20' : 'bg-blue-600/20'} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse`}></div>
                <div className="relative z-10 max-w-2xl mx-auto pt-4">
                    <BackButton
                        className="mb-8 flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </BackButton>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Security & Profile</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Identity Protocol</p>
                        </div>
                        <div className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white`}>
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
                {isAppPinMissing && (
                    <div className="mb-6 bg-rose-50 border-2 border-rose-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-rose-100/50">
                        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shrink-0 border-2 border-rose-200/50">
                            <Shield size={32} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest leading-none mb-2">Unsecured Account</p>
                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">Set Your Security PIN</h3>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">Protect your withdrawals and sensitive data with a 6-digit transaction PIN.</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setPinModalMode('SET');
                                setIsPinModalOpen(true);
                            }}
                            className="w-full sm:w-auto bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.15em] px-8 py-4 rounded-2xl shadow-xl shadow-rose-600/20 active:scale-95 hover:bg-rose-700 transition-all"
                        >
                            Configure Now
                        </button>
                    </div>
                )}
                <div className="bg-white rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-slate-300/50 border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 ${isMerchant ? 'bg-emerald-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl -mr-16 -mt-16`}></div>

                    <div className="relative text-center mb-12">
                        <label htmlFor="profile-photo-upload" className="cursor-pointer block">
                            <div className="w-32 h-32 mx-auto bg-slate-900 border-4 border-white text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl mb-6 overflow-hidden relative group">
                                {uploadingImages.profile_image && (
                                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-[10px] font-bold uppercase text-white tracking-widest">Saving...</p>
                                    </div>
                                )}
                                {user.profile_image && !user.profile_image.includes('blob:') ? (
                                    <img src={user.profile_image} className={`w-full h-full object-cover ${uploadingImages.profile_image ? 'blur-sm' : ''}`} alt={user.name} />
                                ) : (
                                    <span>{user.name?.[0]}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                        </label>
                        <input
                            type="file"
                            id="profile-photo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChangeAutoSave(e, 'profile_image')}
                        />

                        {isEditing ? (
                            <>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => !isNameLocked && setFormData({ ...formData, name: e.target.value })}
                                        readOnly={isNameLocked}
                                        className={`text-xl font-medium text-slate-900 tracking-tight mb-2 text-center bg-transparent border-b-2 ${isNameLocked ? 'border-transparent cursor-not-allowed' : `border-slate-200 focus:border-${themeColor}-500`} focus:outline-none w-full`}
                                        placeholder="Full Name"
                                    />
                                    {isNameLocked && (
                                        <div className="absolute right-0 top-1 text-slate-300" title="Name cannot be changed after saving">
                                            <Lock size={14} />
                                        </div>
                                    )}
                                </div>
                                {!isNameLocked && formData.name.trim().toLowerCase() !== formData.account_holder_name.trim().toLowerCase() && formData.account_holder_name && (
                                    <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tighter animate-pulse">
                                        ⚠️ Must match account holder name
                                    </p>
                                )}
                                {isNameLocked && (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Profile Identity Verified</p>
                                )}
                            </>
                        ) : (
                            <h2 className="text-xl font-medium text-slate-900 tracking-tight mb-2">{user.name}</h2>
                        )}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${(user.kyc_status === 'FULL_VERIFIED' || user.kyc_status === 'FIELD_VERIFIED') ? 'bg-emerald-500 text-white' : `bg-${themeColor}-50 text-${themeColor}-600`} rounded-full font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/20 animate-pulse`}>
                            {(user.kyc_status === 'FULL_VERIFIED' || user.kyc_status === 'FIELD_VERIFIED') ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-3 h-3" />}
                            {(user.kyc_status === 'FULL_VERIFIED' || user.kyc_status === 'FIELD_VERIFIED') ? 'Verified Merchant' : `${user.role} Account`}
                        </div>

                        {/* Missing KYC Documents Alert */}
                        {user.role === 'MERCHANT' && (!user.aadhar_image || !user.aadhar_back_image || !user.pan_image) && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in slide-in-from-top duration-500">
                                <div className="flex gap-3 items-start">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Missing Documents</p>
                                        <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                                            Your KYC is incomplete. Please click <span className="font-bold underline">Edit Profile</span> below to upload your Aadhaar and PAN card images.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {!user.aadhar_image && <span className="text-[8px] font-black bg-white/50 px-2 py-0.5 rounded text-amber-800 border border-amber-200">AADHAAR FRONT</span>}
                                            {!user.aadhar_back_image && <span className="text-[8px] font-black bg-white/50 px-2 py-0.5 rounded text-amber-800 border border-amber-200">AADHAAR BACK</span>}
                                            {!user.pan_image && <span className="text-[8px] font-black bg-white/50 px-2 py-0.5 rounded text-amber-800 border border-amber-200">PAN CARD</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Phone className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Mobile Number</p>
                                <p className="text-sm font-medium text-slate-900">+91 {user.mobile_number}</p>
                            </div>
                        </div>

                        {/* Alternate Mobile Number Section */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden group">
                            {user?.has_verified_alternate_number && (
                                <div className="absolute top-0 right-0 p-2 text-emerald-500">
                                    <ShieldCheck size={16} />
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                                    <Smartphone className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Alternate Mobile Number</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="tel"
                                            value={alternatePhone}
                                            onChange={(e) => !user?.has_verified_alternate_number && setAlternatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="Enter alternate number"
                                            disabled={user?.has_verified_alternate_number || altOtpSent}
                                            className={`text-sm font-bold text-slate-900 bg-transparent border-b-2 ${user?.has_verified_alternate_number ? 'border-transparent' : 'border-slate-200 focus:border-indigo-500'} focus:outline-none w-full disabled:opacity-70`}
                                        />
                                        {!user?.has_verified_alternate_number && !altOtpSent && (
                                            <button
                                                onClick={handleRequestAltOtp}
                                                disabled={isAltOtpSending || alternatePhone.length !== 10}
                                                className="shrink-0 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg disabled:opacity-50 active:scale-95 transition-all"
                                            >
                                                {isAltOtpSending ? 'Sending...' : 'Verify'}
                                            </button>
                                        )}
                                    </div>
                                    {altOtpSent && (
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Enter 6-Digit OTP</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={altOtp}
                                                    onChange={(e) => setAltOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    placeholder="000 000"
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-black tracking-[0.3em] text-center focus:outline-none focus:border-indigo-500"
                                                />
                                                <button
                                                    onClick={handleVerifyAltOtp}
                                                    disabled={isAltOtpVerifying || altOtp.length !== 6}
                                                    className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-all"
                                                >
                                                    {isAltOtpVerifying ? 'Wait...' : 'Confirm'}
                                                </button>
                                                <button 
                                                    onClick={() => setAltOtpSent(false)}
                                                    className="p-2 text-slate-400 hover:text-rose-500"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {user?.has_verified_alternate_number && (
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                            <Check size={10} /> Verified & Secure
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Mail className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 truncate" title={user.email}>{user.email || 'Not verified'}</p>
                                )}
                            </div>
                        </div>

                        {isMerchant && (
                            <>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Briefcase className="w-5 h-5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business Name</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.business_name}
                                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="Enter Business Name"
                                            />
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.business_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Merchant Type</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.customer_segment}
                                                onChange={(e) => setFormData({ ...formData, customer_segment: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Segment</option>
                                                <option value="Wholesale">Wholesale</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Distributor">Distributor</option>
                                                <option value="Super Distributor">Super Distributor</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Supplier">Supplier</option>
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900 capitalize">{user.customer_segment?.replace('_', ' ') || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Business Nature (Category)</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.business_nature}
                                                onChange={(e) => setFormData({ ...formData, business_nature: e.target.value, business_segment: '' })}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Category</option>
                                                {Object.keys(BUSINESS_STRUCTURE).map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.business_nature || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Business Segment (Subcategory)</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.business_segment}
                                                onChange={(e) => setFormData({ ...formData, business_segment: e.target.value })}
                                                disabled={!formData.business_nature}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none disabled:opacity-50`}
                                            >
                                                <option value="">Select Subcategory</option>
                                                {formData.business_nature && (BUSINESS_STRUCTURE as any)[formData.business_nature]?.map((sub: string) => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.business_segment || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Daily Turnover</p>
                                        {isEditing ? (
                                            <select
                                                value={formData.daily_turnover}
                                                onChange={(e) => setFormData({ ...formData, daily_turnover: e.target.value })}
                                                className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 w-full focus:border-${themeColor}-500 focus:outline-none`}
                                            >
                                                <option value="">Select Turnover</option>
                                                <option value="2-5k">2,000 - 5,000</option>
                                                <option value="5k-10k">5,000 - 10,000</option>
                                                <option value="10k-20k">10,000 - 20,000</option>
                                                <option value="20k-50k">20,000 - 50,000</option>
                                                <option value="50k-1l">50,000 - 1,00,000</option>
                                                <option value="1l-2l">1,00,000 - 2,00,000</option>
                                                <option value="2l-5l">2,00,000 - 5,00,000</option>
                                            </select>
                                        ) : (
                                            <p className="text-base font-semibold text-slate-900">{user.daily_turnover || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                {isMerchant && (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Visibility Settings</p>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Show Phone Number</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Display contact on locator</p>
                                            </div>
                                            <div
                                                onClick={() => toggleMerchantVisibility('show_phone')}
                                                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.show_phone ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.show_phone ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Show Shop Timing</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Display hours on locator</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {formData.show_timing && (
                                                    <button
                                                        onClick={() => setIsShopTimingModalOpen(true)}
                                                        className={`px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors`}
                                                    >
                                                        {formData.shop_timing ? 'Edit Hours' : 'Set Hours'}
                                                    </button>
                                                )}
                                                <div
                                                    onClick={() => toggleMerchantVisibility('show_timing')}
                                                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.show_timing ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.show_timing ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Google Maps Link</p>
                                        {isEditing ? (
                                            <div>
                                                <input
                                                    type="url"
                                                    value={formData.map_location_url}
                                                    onChange={(e) => setFormData({ ...formData, map_location_url: e.target.value })}
                                                    className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="https://maps.google.com/..."
                                                />
                                                <a
                                                    href="https://www.google.com/maps"
                                                    target="_blank"
                                                    className="text-[10px] text-blue-500 font-bold mt-1 inline-block"
                                                >
                                                    Open Google Maps to copy link
                                                </a>
                                            </div>
                                        ) : (
                                            <a
                                                href={user.map_location_url}
                                                target="_blank"
                                                className={`text-sm font-bold text-${themeColor}-600 underline truncate block`}
                                            >
                                                {user.map_location_url || 'Not Set'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Address Section */}


                                {/* Shop Images Section */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Shop Images</p>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <label className={`cursor-pointer bg-${themeColor}-100 text-${themeColor}-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 hover:bg-${themeColor}-200 transition-colors`}>
                                                    <ImageIcon size={14} />
                                                    Gallery
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>

                                                <label className={`cursor-pointer bg-${themeColor}-100 text-${themeColor}-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 hover:bg-${themeColor}-200 transition-colors`}>
                                                    <Camera size={14} />
                                                    Camera
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {(() => {
                                            let images: string[] = [];
                                            try {
                                                images = formData.shop_images ? JSON.parse(formData.shop_images) : [];
                                            } catch (e) { images = []; }

                                            if (images.length === 0) {
                                                if (user?.profile_image) {
                                                    images = [user.profile_image];
                                                } else {
                                                    return <p className="text-xs text-slate-400 italic">No images added</p>;
                                                }
                                            }

                                            return images.map((img: string, idx: number) => (
                                                <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={img} className="w-full h-full object-cover" alt="Shop" />
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => {
                                                                const imgUrl = images[idx];
                                                                if (imgUrl.startsWith('blob:')) {
                                                                    const firstBlobIndex = images.findIndex((i: string) => i.startsWith('blob:'));
                                                                    const newShopImageIndex = idx - firstBlobIndex;
                                                                    setNewShopImages(prev => prev.filter((_, i) => i !== newShopImageIndex));
                                                                }
                                                                const updated = images.filter((_, i) => i !== idx);
                                                                setFormData(prev => ({ ...prev, shop_images: JSON.stringify(updated) }));
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                                                        >
                                                            <LogOut className="w-3 h-3 rotate-45" /> {/* X icon workaround */}
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        })()}
                                    </div>
                                </div>

                                {/* KYC Documents Section */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-6">
                                    <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                                        <ShieldCheck size={14} className={`text-${themeColor}-500`} />
                                        KYC Documents
                                    </h3>

                                    <div className="space-y-6 mb-6">
                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Aadhar Number</p>
                                                {isAadhaarVerified ? (
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <ShieldCheck size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Lock size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Unverified</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={formData.aadhar_number}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                                                                setFormData({ ...formData, aadhar_number: val });
                                                                if (val.length === 12) checkUniqueness('aadhar', val);
                                                            }}
                                                            disabled={isAadhaarVerified || checkingUniqueness.aadhar}
                                                            className={`flex-1 text-sm font-black text-slate-900 bg-white border-2 rounded-xl px-4 py-2.5 transition-all focus:outline-none ${uniquenessErrors.aadhar ? 'border-rose-200 bg-rose-50' : isAadhaarVerified ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 focus:border-blue-500'}`}
                                                            placeholder="0000 0000 0000"
                                                        />
                                                        {!isAadhaarVerified && (
                                                            <button
                                                                onClick={handleSendAadhaarOtp}
                                                                disabled={isAadhaarVerifying || formData.aadhar_number?.length !== 12 || !!uniquenessErrors.aadhar}
                                                                className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                                            >
                                                                {isAadhaarVerifying ? 'Sending...' : aadhaarOtpSent ? 'Resend' : 'Send OTP'}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setActiveCameraCategory('aadhar_front')}
                                                            disabled={isAadhaarVerified}
                                                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                                                        >
                                                            <Camera size={18} />
                                                        </button>
                                                    </div>
                                                    {uniquenessErrors.aadhar && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight ml-1">{uniquenessErrors.aadhar}</p>}
                                                    {checkingUniqueness.aadhar && <p className="text-[9px] text-blue-500 font-bold animate-pulse uppercase tracking-widest ml-1">Verifying Uniqueness...</p>}

                                                    {aadhaarOtpSent && !isAadhaarVerified && (
                                                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Enter 6-Digit Aadhaar OTP</p>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    maxLength={6}
                                                                    value={aadhaarOtpInput}
                                                                    onChange={(e) => setAadhaarOtpInput(e.target.value.replace(/\D/g, ''))}
                                                                    placeholder="000000"
                                                                    className="flex-1 bg-white border-2 border-blue-100 rounded-xl px-4 py-2 text-center text-lg font-black tracking-[0.5em] focus:border-blue-500 focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={handleVerifyAadhaarOtp}
                                                                    disabled={isAadhaarVerifying || aadhaarOtpInput.length !== 6}
                                                                    className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                                                                >
                                                                    {isAadhaarVerifying ? 'Wait...' : 'Verify'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-base font-black text-slate-900 tracking-wider">
                                                    {user.aadhar_number ? `${user.aadhar_number.slice(0, 4)} ${user.aadhar_number.slice(4, 8)} ${user.aadhar_number.slice(8, 12)}` : 'Not Linked'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">PAN Number</p>
                                                {isPanVerified ? (
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <ShieldCheck size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Lock size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Unverified</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={formData.pan_number}
                                                            onChange={(e) => {
                                                                const val = e.target.value.toUpperCase().slice(0, 10);
                                                                setFormData({ ...formData, pan_number: val });
                                                                if (val.length === 10) checkUniqueness('pan', val);
                                                            }}
                                                            disabled={isPanVerified || checkingUniqueness.pan}
                                                            className={`flex-1 text-sm font-black text-slate-900 bg-white border-2 rounded-xl px-4 py-2.5 transition-all focus:outline-none ${uniquenessErrors.pan ? 'border-rose-200 bg-rose-50' : isPanVerified ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 focus:border-blue-500'}`}
                                                            placeholder="ABCDE1234F"
                                                        />
                                                        {!isPanVerified && (
                                                            <button
                                                                onClick={handleVerifyPan}
                                                                disabled={isPanVerifying || formData.pan_number?.length !== 10 || !!uniquenessErrors.pan}
                                                                className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                                                            >
                                                                {isPanVerifying ? 'Wait...' : 'Verify'}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setActiveCameraCategory('pan_card')}
                                                            disabled={isPanVerified}
                                                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                                                        >
                                                            <Camera size={18} />
                                                        </button>
                                                    </div>
                                                    {uniquenessErrors.pan && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight ml-1">{uniquenessErrors.pan}</p>}
                                                    {checkingUniqueness.pan && <p className="text-[9px] text-blue-500 font-bold animate-pulse uppercase tracking-widest ml-1">Verifying Uniqueness...</p>}
                                                </div>
                                            ) : (
                                                <p className="text-base font-black text-slate-900 uppercase tracking-widest">{user.pan_number || 'Not Linked'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Date of Birth</p>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={formData.date_of_birth}
                                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                                    disabled={user?.date_of_birth}
                                                    className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full ${user?.date_of_birth ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900">{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not Set'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Father's Name</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={formData.father_name}
                                                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                                    disabled={user?.father_name || user?.family_detail?.father_name}
                                                    className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full ${(user?.father_name || user?.family_detail?.father_name) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    placeholder="Father's full name"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900 uppercase">{user.father_name || user.family_detail?.father_name || 'Not Set'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Aadhar Card Front */}
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Aadhar Front</p>
                                            <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group flex items-center justify-center">
                                                {uploadingImages.aadhar_image && (
                                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                                        <div className={`w-6 h-6 border-2 border-${themeColor}-600 border-t-transparent rounded-full animate-spin mb-1`}></div>
                                                        <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">Uploading...</p>
                                                    </div>
                                                )}
                                                {(newAadharImage || user.aadhar_image) ? (
                                                    <>
                                                        <img
                                                            src={newAadharImage ? URL.createObjectURL(newAadharImage) : (user.aadhar_image?.includes('blob:') ? '' : user.aadhar_image)}
                                                            alt="Aadhar Front"
                                                            className={`w-full h-full object-cover ${uploadingImages.aadhar_image ? 'blur-[2px]' : ''}`}
                                                        />
                                                        {isEditing && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <label className="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                                                    Change
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleFileChangeAutoSave(e, 'aadhar_image')}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                                                        <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Missing<br />Front</p>
                                                        {isEditing && (
                                                            <label className={`cursor-pointer mt-2 text-[9px] font-black uppercase text-${themeColor}-600 bg-${themeColor}-50 px-2 py-1 rounded inline-block`}>
                                                                Upload
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileChangeAutoSave(e, 'aadhar_image')}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Aadhar Card Back */}
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Aadhar Back</p>
                                            <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group flex items-center justify-center">
                                                {uploadingImages.aadhar_back_image && (
                                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                                        <div className={`w-6 h-6 border-2 border-${themeColor}-600 border-t-transparent rounded-full animate-spin mb-1`}></div>
                                                        <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">Uploading...</p>
                                                    </div>
                                                )}
                                                {(newAadharBackImage || user.aadhar_back_image) ? (
                                                    <>
                                                        <img
                                                            src={newAadharBackImage ? URL.createObjectURL(newAadharBackImage) : (user.aadhar_back_image?.includes('blob:') ? '' : user.aadhar_back_image)}
                                                            alt="Aadhar Back"
                                                            className={`w-full h-full object-cover ${uploadingImages.aadhar_back_image ? 'blur-[2px]' : ''}`}
                                                        />
                                                        {isEditing && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <label className="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                                                    Change
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleFileChangeAutoSave(e, 'aadhar_back_image')}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                                                        <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Missing<br />Back</p>
                                                        {isEditing && (
                                                            <label className={`cursor-pointer mt-2 text-[9px] font-black uppercase text-${themeColor}-600 bg-${themeColor}-50 px-2 py-1 rounded inline-block`}>
                                                                Upload
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileChangeAutoSave(e, 'aadhar_back_image')}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* PAN Card */}
                                        <div className="col-span-2">
                                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                                {uploadingImages.pan_image && (
                                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                                        <div className={`w-8 h-8 border-4 border-${themeColor}-600 border-t-transparent rounded-full animate-spin mb-2`}></div>
                                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Uploading...</p>
                                                    </div>
                                                )}
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="p-3 bg-red-50 rounded-2xl">
                                                        <FileText className="w-6 h-6 text-red-600" />
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-1">PAN Card</h4>
                                                <p className="text-[10px] text-slate-500 mb-6 font-medium">Permanent Account Number</p>

                                                <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden relative group/img flex items-center justify-center">
                                                    {(newPanImage || user.pan_image) ? (
                                                        <>
                                                            <img
                                                                src={newPanImage ? URL.createObjectURL(newPanImage) : (user.pan_image?.includes('blob:') ? '' : user.pan_image)}
                                                                alt="PAN Card"
                                                                className={`w-full h-full object-cover ${uploadingImages.pan_image ? 'blur-sm' : ''}`}
                                                            />
                                                            {isEditing && (
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
                                                                        Change Image
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleFileChangeAutoSave(e, 'pan_image')}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-6">
                                                            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Image Missing</p>
                                                            {isEditing && (
                                                                <label className={`cursor-pointer mt-3 text-[10px] font-black uppercase text-${themeColor}-600 bg-${themeColor}-50 px-4 py-2 rounded-xl inline-block border border-${themeColor}-100`}>
                                                                    Upload Now
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleFileChangeAutoSave(e, 'pan_image')}
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {(!user.aadhar_image || !user.pan_image) && (
                                        <p className="mt-3 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex gap-2 items-start">
                                            <Info size={12} className="shrink-0 mt-0.5" />
                                            Please edit your profile and upload the pending KYC documents to securely verify your merchant identity.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div id="address-section" className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Location & Address</p>
                                    {isAddressLocked ? (
                                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            <ShieldCheck size={8} /> Verified & Locked
                                        </span>
                                    ) : timeLeft !== null && (
                                        <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                            <Clock size={8} /> Edit window: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required for Virtual Credit</span>
                            </div>

                            {!isAddressLocked && timeLeft !== null && isEditing && (
                                <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg mb-2">
                                    <p className="text-[9px] font-bold text-amber-800 leading-tight">
                                        ⚠️ You have {Math.floor(timeLeft / 60)} minutes to correct any mistakes. After this, address details will be locked for security.
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">Street Address</p>
                                {isEditing && !isAddressLocked ? (
                                    <textarea
                                        value={formData.street_address}
                                        onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                                        className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full min-h-[60px] resize-none`}
                                        placeholder="Building, Street, Area"
                                    />
                                ) : (
                                    <p className="text-sm font-semibold text-slate-900">{user?.business_address || user?.address || 'Not Set'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">City</p>
                                    {isEditing && !isAddressLocked ? (
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                            placeholder="City"
                                        />
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-900">{user?.city || 'Not Set'}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">State</p>
                                    {isEditing && !isAddressLocked ? (
                                        <select
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className={`text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                        >
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
                                            <option value="Andaman and Nicobar Islands">Andaman & Nicobar</option>
                                            <option value="Chandigarh">Chandigarh</option>
                                            <option value="Dadra and Nagar Haveli and Daman and Diu">DNH & DD</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Jammu and Kashmir">J&K</option>
                                            <option value="Ladakh">Ladakh</option>
                                            <option value="Lakshadweep">Lakshadweep</option>
                                            <option value="Puducherry">Puducherry</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-900">{user?.state || 'Not Set'}</p>
                                    )}
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border-2 transition-all ${!formData.postal_code ? 'bg-amber-50 border-amber-200' : isAddressLocked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-100/50 border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Regional PIN Code</p>
                                    {!formData.postal_code && <span className="text-[8px] font-black text-amber-600 animate-pulse uppercase">Mandatory ⚠️</span>}
                                    {isAddressLocked && <span className="text-[8px] font-black text-emerald-600 uppercase">Securely Locked ✅</span>}
                                </div>
                                {isEditing && !isAddressLocked ? (
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '') })}
                                        className={`text-lg font-black text-slate-900 bg-transparent border-b-2 border-slate-300 focus:border-amber-500 focus:outline-none w-full tracking-[0.2em]`}
                                        placeholder="000000"
                                    />
                                ) : (
                                    <p className="text-lg font-black text-slate-900 tracking-[0.2em]">{user?.pincode || 'NOT SET'}</p>
                                )}
                                <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase">
                                    {isAddressLocked ? 'Address verified for regional compliance.' : 'Used to verify your area with regional virtual credit policies.'}
                                </p>
                            </div>
                        </div>

                        <div id="bank-details-section" className="mt-8 mb-4 rounded-3xl p-2 transition-all duration-500">
                            <h3 className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bank Details (For Payouts)</h3>
                            {user.account_number && (
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-4 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-800">Bank details are verified and locked. Contact support to update.</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Bank Name</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.bank_name}
                                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="e.g. HDFC Bank"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.bank_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Account Number</p>
                                        {isEditing && !user.account_number ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.account_number}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setFormData({ ...formData, account_number: val });
                                                    }}
                                                    className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 ${uniquenessErrors.account ? 'border-red-500' : 'border-slate-200'} focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="Enter account number"
                                                />
                                                {uniquenessErrors.account && <p className="text-[9px] text-red-500 mt-1 font-bold animate-in fade-in transition-all">{uniquenessErrors.account}</p>}
                                                {checkingUniqueness.account && <p className="text-[9px] text-blue-500 mt-1 font-bold animate-pulse">Verifying...</p>}
                                            </>
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.account_number || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">IFSC Code</p>
                                        {isEditing && !user.account_number ? (
                                            <input
                                                type="text"
                                                value={formData.ifsc_code}
                                                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                                                className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                placeholder="HDFC0001234"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 uppercase truncate">{user.ifsc_code || 'Not Set'}</p>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">A/C Holder Name</p>
                                        {isEditing && !user.account_number ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.account_holder_name}
                                                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                                                    className={`text-sm font-medium text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-${themeColor}-500 focus:outline-none w-full`}
                                                    placeholder="As per bank records"
                                                />
                                                {formData.name.trim().toLowerCase() !== formData.account_holder_name.trim().toLowerCase() && (
                                                    <p className="text-rose-500 text-[8px] font-bold mt-1 uppercase animate-pulse">
                                                        ⚠️ Mismatch with profile name
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm font-medium text-slate-900 truncate">{user.account_holder_name || 'Not Set'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="mt-8 mb-4">
                            <div className="flex items-center justify-between px-1 mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Settings</h3>
                                <button
                                    onClick={async () => {
                                        await clearAuthState();
                                        toast.success("Logged out successfully");
                                        setTimeout(() => { window.location.href = '/'; }, 500);
                                    }}
                                    className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* About Us */}
                                <div onClick={() => router.push('/customer/about')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">About Us</span>
                                </div>
                                {/* Profile */}
                                <div
                                    onClick={() => {
                                        if (user?.role === 'MERCHANT' && user?.kyc_status === 'FULL_VERIFIED') {
                                            toast.error("Verified profiles cannot be edited.");
                                            return;
                                        }
                                        setIsEditing(true);
                                    }}
                                    className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full ${user?.role === 'MERCHANT' && user?.kyc_status === 'FULL_VERIFIED' ? 'opacity-60 grayscale' : ''}`}
                                >
                                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">Profile</span>
                                </div>
                                {/* Tutorial */}
                                <div onClick={() => setIsTutorialOpen(true)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <Lightbulb className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">Tutorial</span>
                                </div>

                                {/* Help */}
                                <div onClick={() => router.push('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                    <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">Help</span>
                                </div>
                                {/* Share & Earn */}
                                {!user?.sub_user_id && (
                                    <div onClick={() => router.push('/customer/referral')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Trophy className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 truncate">Share & Earn</span>
                                    </div>
                                )}

                                {/* Contact Us */}
                                <div onClick={() => router.push('/customer/support')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">Contact Us</span>
                                </div>
                                {/* Become a Partner */}
                                <div onClick={() => router.push('/customer/partner')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">Become a Partner</span>
                                </div>

                                {/* Dynamic Buttons */}
                                {dynamicButtons.map((btn) => (
                                    <div
                                        key={btn.id}
                                        onClick={() => router.push(`/info?slug=${btn.slug}`)}
                                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors w-full"
                                    >
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm shrink-0" style={{ backgroundColor: `${btn.text_color}1a`, color: btn.text_color }}>
                                            <Info className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 truncate">{btn.name}</span>
                                    </div>
                                ))}

                                {/* Switch to Partner Panel */}
                                {user?.is_vendor && (
                                    <div
                                        onClick={() => setIsPortalOpen(true)}
                                        className="col-span-2 bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-3 cursor-pointer hover:bg-indigo-700 transition-all border border-indigo-400/20 group mt-2"
                                    >
                                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] block font-black text-indigo-100 uppercase tracking-widest leading-none mb-1">Partner Account</span>
                                            <span className="text-xs font-bold text-white">Switch to Partner Panel</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-indigo-100/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                )}
                            </div>

                            {/* Notifications Toggle */}
                            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleNotifications}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm"><Bell className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
                                        <p className="text-[10px] font-bold text-slate-400">Manage alerts</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 ${notificationsEnabled ? `bg-${themeColor}-600` : 'bg-slate-200'} rounded-full relative shadow-inner transition-colors duration-200`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSaving}
                                        className={`flex-1 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-500 text-white py-3 px-2 rounded-xl font-bold whitespace-nowrap hover:shadow-lg transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-${themeColor}-500/20 text-[11px] uppercase tracking-wider`}
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSaving}
                                        className="flex-1 bg-slate-100 text-slate-600 py-3 px-2 rounded-xl font-bold whitespace-nowrap hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Cancel</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {user && user.role === 'MERCHANT' && (user.kyc_status === 'FULL_VERIFIED' || user.kyc_status === 'FIELD_VERIFIED') ? (
                                        <div className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold border border-emerald-200 shadow-sm flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Verified Merchant</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className={`flex-1 bg-white border border-slate-200 text-slate-900 py-3 px-2 rounded-xl font-bold whitespace-nowrap hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm text-[11px] uppercase tracking-wider`}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit Profile</span>
                                        </button>
                                    )}
                                </>
                            )}
                            <button onClick={handleChangePinClick} className={`flex-1 bg-${themeColor}-500 text-white py-3 px-2 rounded-xl font-bold whitespace-nowrap hover:bg-${themeColor}-600 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-${themeColor}-500/20 text-[11px] uppercase tracking-wider`}>
                                <Lock className="w-3.5 h-3.5" /> Change PIN
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-8 space-y-3">
                        <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Member since {new Date(user.created_at).getFullYear()}</p>
                    </div>
                </div>
            </div>

            {/* Name Mismatch Modal */}
            {showNameMismatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNameMismatch(false)}></div>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl border-2 border-rose-500 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Name Mismatch</h3>
                        <p className="text-rose-600 text-center font-bold text-sm leading-relaxed mb-8">
                            Customer Profile Name and Bank Account Holder Name must be exactly the same.
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                <p className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-1">Mismatch detected</p>
                                <p className="text-xs font-bold text-rose-700">Profile: <span className="underline">{formData.name}</span></p>
                                <p className="text-xs font-bold text-rose-700">Bank Record: <span className="underline">{formData.account_holder_name}</span></p>
                            </div>
                            <button
                                onClick={() => setShowNameMismatch(false)}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                Close & Fix
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPortalOpen && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-[#0a0f1d] text-white p-4 flex items-center justify-between shadow-md border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-white/10">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">Partner Panel</span>
                        </div>
                        <button
                            onClick={() => setIsPortalOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-500/20"
                        >
                            Exit Portal
                        </button>
                    </div>
                    <div className="flex-1 w-full h-full relative">
                        <iframe
                            src="https://agent.msmeloan.sbs"
                            className="w-full h-full border-none"
                            title="Partner Panel"
                        />
                    </div>
                </div>
            )}

            <TutorialPlayer
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onComplete={handlePinComplete}
                mode={pinModalMode}
                title={pinModalMode === 'VERIFY' ? 'Enter Current PIN' : 'Set New PIN'}
            />

            <ShopTimingModal
                isOpen={isShopTimingModalOpen}
                initialData={formData.shop_timing}
                onClose={() => setIsShopTimingModalOpen(false)}
                onSave={async (data) => {
                    setFormData(prev => ({ ...prev, shop_timing: data }));
                    if (!isEditing) {
                        try {
                            await apiFetch('/merchant/visibility', {
                                method: 'POST',
                                body: JSON.stringify({ shop_timing: JSON.stringify(data) })
                            });
                            toast.success('Shop timing updated successfully');
                        } catch (e: any) {
                            toast.error(e.message || 'Failed to update timing');
                        }
                    }
                }}
                themeColor={themeColor}
            />

            {/* Document Capture & Verification Modals */}
            {activeCameraCategory && (
                <CameraComponent
                    category={DOCUMENT_CATEGORIES.find(c => c.id === activeCameraCategory)!}
                    onCapture={handleCapture}
                />
            )}

            {capturedImages[activeCameraCategory!] && (
                <DocumentCropper
                    imageUrl={capturedImages[activeCameraCategory!]}
                    onCropComplete={handleCapture}
                    onClose={() => setActiveCameraCategory(null)}
                />
            )}

            {/* OCR Loading Overlay */}
            {isOcrLoading && (
                <div className="fixed inset-0 z-[3000] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="absolute inset-10 bg-blue-500/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="absolute inset-20 bg-blue-500/15 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        
                        <div className="relative w-28 h-36 bg-slate-800 rounded-2xl border-[3px] border-slate-700 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900" />
                            <div className="p-5 space-y-4 pt-10 relative z-10">
                                <div className="h-1.5 bg-white/5 rounded-full w-full" />
                                <div className="h-1.5 bg-white/5 rounded-full w-5/6" />
                                <div className="h-1.5 bg-white/5 rounded-full w-4/6" />
                                <div className="h-1.5 bg-white/5 rounded-full w-full" />
                                <div className="h-1.5 bg-white/5 rounded-full w-3/4" />
                            </div>
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-400 shadow-[0_0_15px_2px_rgba(59,130,246,0.8)] z-20 animate-[scanVertical_2.5s_ease-in-out_infinite]" />
                            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-500/20 to-transparent z-10 opacity-0 animate-[scanVerticalPulse_2.5s_ease-in-out_infinite]" />
                        </div>
                        
                        <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-blue-600 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-2xl animate-[bounce_2s_infinite]">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                    </div>
                    
                    <div className="text-center space-y-3 relative z-30">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Secure Processor</span>
                        </div>
                        <h2 className="text-white text-xl font-black uppercase tracking-[0.4em]">Analyzing</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Validating document authenticity</p>
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
        </div>
    );
}
