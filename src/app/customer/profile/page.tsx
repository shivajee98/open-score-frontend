"use client";

import PinModal from "@/components/PinModal";
import ShopTimingModal from "@/components/ShopTimingModal";
import TutorialPlayer from "@/components/TutorialPlayer";
import CameraComponent from "@/components/loan/Camera";
import { toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/useApi";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { apiFetch, clearAuthState } from "@/lib/api";
import { Capacitor } from "@capacitor/core";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AlternateNumberDrawer from "./_components/AlternateNumberDrawer";
import NameMismatchModal from "./_components/NameMismatchModal";
import OcrLoadingOverlay from "./_components/OcrLoadingOverlay";
import PartnerPanelPortal from "./_components/PartnerPanelPortal";
import ProfileDashboardView from "./_components/ProfileDashboardView";
import ProfileEditFormView from "./_components/ProfileEditFormView";
import SplashScreen from "./_components/SplashScreen";

export default function Profile() {
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    mutate: mutateUser,
  } = useApi("/auth/me");
  const { data: pinData, mutate: mutatePin } = useApi("/wallet/check-pin");

  const [isEditing, setIsEditing] = useState(false);
  const [isAltNumDrawerOpen, setIsAltNumDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initialDataLoaded = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    business_segment: "",
    business_type: "",
    business_nature: "",
    customer_segment: "",
    daily_turnover: "",
    map_location_url: "",
    shop_images: "[]",
    business_name: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    show_phone: true,
    show_timing: true,
    shop_timing: null as any,
    aadhar_number: "",
    pan_number: "",
    date_of_birth: "",
    father_name: "",
  });
  const [newShopImages, setNewShopImages] = useState<File[]>([]);
  const [newAadharImage, setNewAadharImage] = useState<File | null>(null);
  const [newAadharBackImage, setNewAadharBackImage] = useState<File | null>(
    null,
  );
  const [newPanImage, setNewPanImage] = useState<File | null>(null);
  const [isShopTimingModalOpen, setIsShopTimingModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"SET" | "VERIFY">("VERIFY");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [dynamicButtons, setDynamicButtons] = useState<any[]>([]);
  const [bankSuggestions, setBankSuggestions] = useState<any[]>([]);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);
  const [ifscSuggestions, setIfscSuggestions] = useState<any[]>([]);
  const [showIfscSuggestions, setShowIfscSuggestions] = useState(false);
  const [uniquenessErrors, setUniquenessErrors] = useState<{
    aadhar?: string;
    pan?: string;
    account?: string;
  }>({});
  const [checkingUniqueness, setCheckingUniqueness] = useState<{
    aadhar?: boolean;
    pan?: boolean;
    account?: boolean;
  }>({});
  const [uploadingImages, setUploadingImages] = useState<
    Record<string, boolean>
  >({});
  const [isAppPinMissing, setIsAppPinMissing] = useState(false);
  const hasPromptedPin = useRef(false);
  const lastCheckedValues = useRef<Record<string, string>>({});

  // Alternate Number Verification States
  const [alternatePhone, setAlternatePhone] = useState(
    user?.alternate_number?.phone || "",
  );
  const [altOtp, setAltOtp] = useState("");
  const [altOtpSent, setAltOtpSent] = useState(false);
  const [isAltOtpSending, setIsAltOtpSending] = useState(false);
  const [isAltOtpVerifying, setIsAltOtpVerifying] = useState(false);

  // KYC Verification States
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(
    !!user?.aadhar_number,
  );
  const [isPanVerified, setIsPanVerified] = useState(!!user?.pan_number);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [activeCameraCategory, setActiveCameraCategory] = useState<
    string | null
  >(null);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>(
    {},
  );
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  const DOCUMENT_CATEGORIES = [
    {
      id: "aadhar_front",
      label: "Aadhaar Front",
      desc: "Face side of your Aadhaar card",
    },
    {
      id: "aadhar_back",
      label: "Aadhaar Back",
      desc: "Address side of your Aadhaar card",
    },
    { id: "pan_card", label: "PAN Card", desc: "Front side of your PAN card" },
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
        setPinModalMode("SET");
        setIsPinModalOpen(true);
        hasPromptedPin.current = true;
      }
    } else {
      setIsAppPinMissing(false);
    }
  }, [pinData]);

  const fetchSuggestions = async (search: string, type: "bank" | "ifsc") => {
    try {
      const data = await apiFetch(
        `/wallet/banks?search=${search}&type=${type}`,
      );
      if (type === "bank") {
        setBankSuggestions(data || []);
        setShowBankSuggestions(data?.length > 0);
      } else {
        setIfscSuggestions(data || []);
        setShowIfscSuggestions(data?.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const checkUniqueness = async (
    type: "aadhar" | "pan" | "account",
    value: string,
    ifsc?: string,
  ) => {
    const cacheKey = `${type}:${value}${ifsc ? ":" + ifsc : ""}`;
    if (lastCheckedValues.current[type] === cacheKey) return;

    setCheckingUniqueness((prev) => ({ ...prev, [type]: true }));
    try {
      const apiType = type === "account" ? "account_number" : type;
      const res = await apiFetch("/loans/check-kyc-uniqueness", {
        method: "POST",
        body: JSON.stringify({ type: apiType, value, ifsc_code: ifsc }),
      });

      lastCheckedValues.current[type] = cacheKey;

      if (!res.unique) {
        setUniquenessErrors((prev) => ({
          ...prev,
          [type]: "यह विवरण पहले से ही किसी अन्य खाते से लिंक है।",
        }));
      } else {
        setUniquenessErrors((prev) => ({ ...prev, [type]: undefined }));
      }
    } catch (e) {
      console.error("Failed to check uniqueness", e);
    } finally {
      setCheckingUniqueness((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleCapture = async (blob: Blob, corners?: string) => {
    if (corners === "CLOSE") {
      setActiveCameraCategory(null);
      return;
    }

    setIsOcrLoading(true);
    const toastId = toast.loading("Neural Identity Engine active...");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", blob, "identity.jpg");
      uploadFormData.append(
        "type",
        activeCameraCategory === "pan_card" ? "pan" : "aadhar",
      );

      const res = await apiFetch("/kyc/extract-ocr", {
        method: "POST",
        body: uploadFormData,
      });

      if (res && !res.error) {
        const ocr_data = res;
        const update: any = {};

        if (activeCameraCategory === "aadhar_front") {
          if (ocr_data.aadhaar_number)
            update.aadhar_number = ocr_data.aadhaar_number;
          if (ocr_data.name) update.name = ocr_data.name;
          if (ocr_data.dob) {
            const parts = ocr_data.dob.split(/[-/]/);
            update.date_of_birth =
              parts.length === 3
                ? parts[2].length === 4
                  ? `${parts[2]}-${parts[1]}-${parts[0]}`
                  : ocr_data.dob
                : ocr_data.dob;
          }
        } else if (activeCameraCategory === "pan_card") {
          if (ocr_data.pan_number) update.pan_number = ocr_data.pan_number;
        }

        setFormData((prev) => ({ ...prev, ...update }));

        if (update.aadhar_number)
          checkUniqueness("aadhar", update.aadhar_number);
        if (update.pan_number) checkUniqueness("pan", update.pan_number);

        toast.success("Document scanned successfully", { id: toastId });
      } else {
        toast.error(res?.error || "Extraction failed", { id: toastId });
      }

      // Create a preview URL for the captured image if needed
      const url = URL.createObjectURL(blob);
      setCapturedImages((prev) => ({ ...prev, [activeCameraCategory!]: url }));
      setActiveCameraCategory(null);
    } catch (err: any) {
      console.error("Capture error:", err);
      toast.error(err.message || "Capture processing failed.", { id: toastId });
    } finally {
      setIsOcrLoading(false);
    }
  };

  const BUSINESS_STRUCTURE = {
    "Food & Daily Essentials": [
      "Grocery / Kirana Store",
      "Dairy / Milk Booth",
      "Fruit & Vegetable Vendor",
      "Bakery",
      "Sweet Shop / Mithai Shop",
      "Fast Food Stall",
      "Tea / Coffee Stall",
      "Juice Shop",
      "Restaurant",
      "Dhaba",
      "Hotel / Lodge",
    ],
    "Health & Medical": [
      "Pharmacy / Medical Store",
      "Clinic",
      "Pathology Lab",
      "Medical Equipment Shop",
      "Ayurvedic / Herbal Store",
    ],
    "Retail Shops": [
      "General Store",
      "Departmental Store",
      "Clothing / Garment Shop",
      "Footwear Shop",
      "Mobile Shop",
      "Electronics Shop",
      "Gift Shop",
      "Cosmetic / Beauty Store",
      "Stationery Shop",
      "Toy Shop",
    ],
    "Street Vendors / Small Traders": [
      "Street Food Cart",
      "Paan Shop",
      "Ice Cream Cart",
      "Egg / Chicken Vendor",
      "Fish / Meat Shop",
      "Flower Vendor",
    ],
    "Services (Daily Use)": [
      "Barber / Salon",
      "Beauty Parlour",
      "Laundry / Dry Cleaner",
      "Tailor",
      "Repair Shop (Mobile / Electronics)",
      "Bike / Car Garage",
      "Photocopy / Printing Shop",
      "Cyber Cafe",
    ],
    "Home & Utility": [
      "Hardware Store",
      "Electrical Shop",
      "Plumbing Store",
      "Paint Shop",
      "Furniture Shop",
      "Mattress Shop",
      "Kitchenware / Utensils Store",
    ],
    "Agriculture & Rural": [
      "Fertilizer Shop",
      "Seeds Store",
      "Animal Feed Shop",
      "Pesticide Store",
      "Dairy Farm",
    ],
    "Education & Others": [
      "Book Store",
      "Coaching Institute",
      "Computer Training Center",
      "Play School / Daycare",
    ],
  };

  const hasPin = pinData?.has_pin || false;
  const router = useRouter();
  const isAuthenticated = useAuthProtection();

  useEffect(() => {
    const saved = localStorage.getItem("audio_enabled");
    if (saved === "true") setNotificationsEnabled(true);
  }, []);

  const hasNativePushSupport = () => {
    if (typeof window === "undefined") return false;
    return Capacitor.isPluginAvailable("PushNotifications");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const isEdit = searchParams.get("edit") === "true";
      const editBank = searchParams.get("editBank") === "true";
      const section = searchParams.get("section");

      if (isEdit || editBank) {
        if (
          user?.role === "MERCHANT" &&
          user?.kyc_status === "FULL_VERIFIED" &&
          user.aadhar_image &&
          user.pan_image
        ) {
          toast.error("Verified profile cannot be edited.");
          return;
        }
        setIsEditing(true);

        const targetId = editBank
          ? "bank-details-section"
          : section
            ? `${section}-section`
            : null;

        if (targetId) {
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.classList.add(
                "ring-4",
                "ring-indigo-500",
                "ring-offset-4",
                "transition-all",
              );
              setTimeout(
                () =>
                  element.classList.remove(
                    "ring-4",
                    "ring-indigo-500",
                    "ring-offset-4",
                    "transition-all",
                  ),
                3000,
              );
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
      toast.info(
        "Please set your 6-digit PIN code to unlock virtual credit plans.",
      );

      // Focus on address section
      setTimeout(() => {
        const element = document.getElementById("address-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add(
            "ring-4",
            "ring-amber-500",
            "ring-offset-4",
            "transition-all",
          );
          setTimeout(
            () =>
              element.classList.remove(
                "ring-4",
                "ring-amber-500",
                "ring-offset-4",
                "transition-all",
              ),
            3000,
          );
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
          if (!url || url.includes("blob:")) return "";
          return url;
        };

        setFormData({
          name: user.name || "",
          email: user.email || "",
          bank_name: user.bank_name || "",
          account_number: user.account_number || "",
          ifsc_code: user.ifsc_code || "",
          account_holder_name: user.account_holder_name || "",
          business_segment: user.business_segment || "",
          business_type: user.business_type || "",
          business_nature: user.business_nature || "",
          customer_segment: user.customer_segment || "",
          daily_turnover: user.daily_turnover || "",
          map_location_url: user.map_location_url || "",
          shop_images: (() => {
            const items = Array.isArray(user.shop_images)
              ? user.shop_images
              : JSON.parse(user.shop_images || "[]");
            return JSON.stringify(
              items.filter((img: string) => img && !img.includes("blob:")),
            );
          })(),
          business_name: user.business_name || "",
          street_address: user.business_address || "",
          city: user.city || "",
          state: user.state || "",
          postal_code: user.pincode || "",
          show_phone: user.show_phone ?? true,
          show_timing: user.show_timing ?? true,
          shop_timing: user.shop_timing || null,
          aadhar_number: user.aadhar_number || "",
          pan_number: user.pan_number || "",
          date_of_birth: user.date_of_birth
            ? user.date_of_birth.split("T")[0]
            : "",
          father_name:
            user.father_name || user.family_detail?.father_name || "",
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
          console.error("Failed to fetch dynamic buttons", error);
        }
      };
      fetchDynamicButtons();
    }
  }, [user?.role]);

  useEffect(() => {
    if (
      isEditing &&
      formData.aadhar_number.length === 12 &&
      formData.aadhar_number !== user?.aadhar_number
    ) {
      const timer = setTimeout(() => {
        checkUniqueness("aadhar", formData.aadhar_number);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setUniquenessErrors((prev) => ({ ...prev, aadhar: undefined }));
    }
  }, [formData.aadhar_number, isEditing, user?.aadhar_number]);

  useEffect(() => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (
      isEditing &&
      formData.pan_number.length === 10 &&
      panRegex.test(formData.pan_number) &&
      formData.pan_number !== user?.pan_number
    ) {
      const timer = setTimeout(() => {
        checkUniqueness("pan", formData.pan_number);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setUniquenessErrors((prev) => ({ ...prev, pan: undefined }));
    }
  }, [formData.pan_number, isEditing, user?.pan_number]);

  useEffect(() => {
    const isNewBank =
      formData.account_number !== user?.account_number ||
      formData.ifsc_code !== user?.ifsc_code;
    if (
      isEditing &&
      formData.account_number.length >= 9 &&
      formData.ifsc_code.length === 11 &&
      isNewBank
    ) {
      const timer = setTimeout(() => {
        checkUniqueness("account", formData.account_number, formData.ifsc_code);
      }, 1000); // Increased debounce for bank details
      return () => clearTimeout(timer);
    } else {
      setUniquenessErrors((prev) => ({ ...prev, account: undefined }));
    }
  }, [
    formData.account_number,
    formData.ifsc_code,
    isEditing,
    user?.account_number,
    user?.ifsc_code,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        isEditing &&
        formData.bank_name.trim().length > 1 &&
        formData.bank_name !== user?.bank_name
      ) {
        fetchSuggestions(formData.bank_name, "bank");
      } else {
        setBankSuggestions([]);
        setShowBankSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.bank_name, user?.bank_name, isEditing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        isEditing &&
        formData.ifsc_code.trim().length > 1 &&
        formData.ifsc_code !== user?.ifsc_code
      ) {
        fetchSuggestions(formData.ifsc_code, "ifsc");
      } else {
        setIfscSuggestions([]);
        setShowIfscSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.ifsc_code, user?.ifsc_code, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBankSuggestions || showIfscSuggestions) {
        const target = event.target as HTMLElement;
        if (!target.closest("#bank-details-section")) {
          setShowBankSuggestions(false);
          setShowIfscSuggestions(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showBankSuggestions, showIfscSuggestions]);

  const toggleNotifications = async () => {
    if (typeof window === "undefined") return;

    const platform = Capacitor.getPlatform();
    const isNative = hasNativePushSupport();

    console.log(
      `[PushDebug] Platform detected: ${platform}, isNative: ${isNative}`,
    );

    if (isNative) {
      try {
        const { PushNotifications } =
          await import("@capacitor/push-notifications");

        // If we are turning it OFF
        if (notificationsEnabled) {
          console.log("[PushDebug] Disabling notifications");
          setNotificationsEnabled(false);
          localStorage.setItem("audio_enabled", "false");
          toast.success("Notifications Disabled");
          return;
        }

        // If we are turning it ON
        console.log("[PushDebug] Attempting native push registration...");
        let perm = await PushNotifications.checkPermissions();

        if (perm.receive === "prompt" || perm.receive === "denied") {
          perm = await PushNotifications.requestPermissions();
        }

        const granted = perm.receive === "granted";
        if (granted) {
          setNotificationsEnabled(true);
          localStorage.setItem("audio_enabled", "true");
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
        toast.error(
          "Native push error. Ensure you are using the installed App.",
        );
      }
      return;
    }

    // Standard Browser logic (Fallback for web)
    console.log("[PushDebug] Using Web Push fallback logic");
    if (!("Notification" in window)) {
      const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent,
      );
      if (isMobileBrowser) {
        toast.error(
          `Mobile browsers don't support web push. Open the installed App.`,
        );
      } else {
        toast.error(
          `Notifications not supported in this browser (${platform})`,
        );
      }
      return;
    }

    if (Notification.permission === "granted") {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      localStorage.setItem("audio_enabled", newState.toString());
      toast.success(
        newState ? "Notifications Enabled" : "Notifications Disabled",
      );
    } else if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("audio_enabled", "true");
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

  const toggleMerchantVisibility = async (
    field: "show_phone" | "show_timing",
  ) => {
    const newValue = !formData[field];

    // Always update local state for UI feedback
    setFormData((prev) => ({ ...prev, [field]: newValue }));

    // If not in editing mode, sync with backend immediately
    if (!isEditing) {
      try {
        const res = await apiFetch("/merchant/visibility", {
          method: "POST",
          body: JSON.stringify({ [field]: newValue }),
        });
        if (res.error) throw new Error(res.error);
        toast.success("Visibility updated");
        await mutateUser();
      } catch (e: any) {
        toast.error(e.message || "Failed to update visibility");
        // Revert local state on error
        setFormData((prev) => ({ ...prev, [field]: !newValue }));
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
        const diff = updateTime + 3 * 60 * 1000 - now;
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
      const element = document.getElementById("address-section");
      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (user?.role === "ADMIN") router.push("/admin");
    else router.push("/customer"); // Unified dashboard
  };

  const uploadSingleImage = async (field: string, file: File) => {
    setUploadingImages((prev) => ({ ...prev, [field]: true }));
    try {
      const uploadData = new FormData();
      uploadData.append(field, file);

      const res = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: uploadData,
      });

      if (res.error) throw new Error(res.error);

      toast.success(
        `${field.replace(/_/g, " ").toUpperCase()} updated successfully!`,
      );
      await mutateUser();
    } catch (e: any) {
      toast.error(e.message || `Failed to update ${field}`);
    } finally {
      setUploadingImages((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleFileChangeAutoSave = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
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

    if (
      uniquenessErrors.aadhar ||
      uniquenessErrors.pan ||
      uniquenessErrors.account
    ) {
      toast.error(
        "Please resolve KYC or Bank uniqueness issues before saving.",
      );
      return;
    }

    // Validate Aadhaar number
    const hasAadharImage =
      !!user?.aadhar_image ||
      !!user?.aadhar_back_image ||
      !!newAadharImage ||
      !!newAadharBackImage;
    const aadharVal = (formData.aadhar_number || "").trim();
    if (hasAadharImage && !aadharVal) {
      toast.error(
        "Aadhaar number is required since Aadhaar images are uploaded.",
      );
      return;
    }
    if (aadharVal && (aadharVal.length !== 12 || !/^\d{12}$/.test(aadharVal))) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    // Validate PAN number
    const hasPanImage = !!user?.pan_image || !!newPanImage;
    const panVal = (formData.pan_number || "").trim();
    if (hasPanImage && !panVal) {
      toast.error("PAN number is required since the PAN image is uploaded.");
      return;
    }
    if (panVal) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(panVal)) {
        toast.error("Please enter a valid 10-character PAN number.");
        return;
      }
    }

    if (!formData.postal_code || formData.postal_code.length !== 6) {
      toast.error("Valid 6-digit PIN Code is required.");
      const element = document.getElementById("address-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-4", "ring-amber-500", "ring-offset-4");
        setTimeout(
          () =>
            element.classList.remove(
              "ring-4",
              "ring-amber-500",
              "ring-offset-4",
            ),
          3000,
        );
      }
      return;
    }

    setIsSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.append("name", formData.name);
      uploadData.append("email", formData.email);
      uploadData.append("business_name", formData.business_name);
      uploadData.append("business_nature", formData.business_nature);
      uploadData.append("business_segment", formData.business_segment);
      uploadData.append("customer_segment", formData.customer_segment);
      uploadData.append("daily_turnover", formData.daily_turnover);
      if (!isAddressLocked) {
        uploadData.append("business_address", formData.street_address);
        uploadData.append("city", formData.city);
        uploadData.append("state", formData.state);
        uploadData.append("pincode", formData.postal_code);
        uploadData.append("map_location_url", formData.map_location_url);
      }
      uploadData.append("show_phone", formData.show_phone ? "1" : "0");
      uploadData.append("show_timing", formData.show_timing ? "1" : "0");
      uploadData.append("aadhar_number", formData.aadhar_number);
      uploadData.append("pan_number", formData.pan_number);
      uploadData.append("date_of_birth", formData.date_of_birth);
      uploadData.append("father_name", formData.father_name);

      // Bank details
      if (!user?.account_number) {
        uploadData.append("bank_name", formData.bank_name);
        uploadData.append("account_number", formData.account_number);
        uploadData.append("ifsc_code", formData.ifsc_code);
        uploadData.append("account_holder_name", formData.account_holder_name);
      }

      let currentImages: string[] = [];
      try {
        if (typeof formData.shop_images === "string") {
          currentImages = JSON.parse(formData.shop_images);
        }
      } catch (e) {
        currentImages = [];
      }

      // Filter out blob preview URLs from retained images to prevent 404s
      currentImages
        .filter((img) => !img.includes("blob:"))
        .forEach((img) => {
          uploadData.append("retained_shop_images[]", img);
        });

      newShopImages.forEach((file) => {
        uploadData.append("shop_images[]", file);
      });

      if (newAadharImage) {
        uploadData.append("aadhar_image", newAadharImage);
      }

      if (newAadharBackImage) {
        uploadData.append("aadhar_back_image", newAadharBackImage);
      }

      if (newPanImage) {
        uploadData.append("pan_image", newPanImage);
      }

      const res = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: uploadData,
      });
      if (res.error) throw new Error(res.error);

      // Immediate sync: update SWR cache and localStorage
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        await mutateUser(res.user, false);

        // Clear blob previews from form data by re-parsing from saved user
        try {
          setFormData((prev) => ({
            ...prev,
            shop_images: JSON.stringify(res.user.shop_images || []),
          }));
        } catch (e) {}
      } else {
        await mutateUser(); // Fallback to refetch if user not returned
      }

      setIsEditing(false);
      setNewShopImages([]);
      setNewAadharImage(null);
      setNewAadharBackImage(null);
      setNewPanImage(null);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePinClick = () => {
    if (hasPin) {
      setPinModalMode("VERIFY");
      setIsPinModalOpen(true);
    } else {
      setPinModalMode("SET");
      setIsPinModalOpen(true);
    }
  };

  const handlePinComplete = async (pin: string) => {
    if (pinModalMode === "VERIFY") {
      try {
        const res = await apiFetch("/wallet/verify-pin", {
          method: "POST",
          body: JSON.stringify({ pin }),
        });
        if (res.valid) {
          setIsPinModalOpen(false);
          setTimeout(() => {
            setPinModalMode("SET");
            setIsPinModalOpen(true);
          }, 200);
        } else {
          toast.error("Incorrect PIN");
        }
      } catch (e) {
        toast.error("Failed to verify PIN");
      }
    } else {
      // Set new PIN
      try {
        await apiFetch("/auth/set-pin", {
          method: "POST",
          body: JSON.stringify({
            pin,
            pin_confirmation: pin,
          }),
        });
        toast.success("PIN updated successfully!");
        mutatePin(); // Refresh pin status
        setIsPinModalOpen(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to update PIN");
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
      const res = await apiFetch("/auth/alternate-number/otp", {
        method: "POST",
        body: JSON.stringify({ phone: alternatePhone }),
      });
      if (res.error) throw new Error(res.error);
      setAltOtpSent(true);
      if (alternatePhone.startsWith("99999999")) {
        setAltOtp("123456");
        toast.success("Magic number detected! Bypassing OTP with '123456'");
      } else {
        toast.success("OTP sent to your alternate number");
      }
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
      const res = await apiFetch("/auth/alternate-number/verify", {
        method: "POST",
        body: JSON.stringify({ phone: alternatePhone, otp: altOtp }),
      });
      if (res.error) throw new Error(res.error);
      toast.success("Alternate number verified successfully!");
      setAltOtpSent(false);
      setAltOtp("");
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
    setNewShopImages((prev) => [...prev, file]);
    toast.success("Image added to upload list");

    // UI Smoothing: Clear file input so it can be used again
    e.target.value = "";

    // Add local preview to formData for immediate UI feedback
    const previewUrl = URL.createObjectURL(file);
    let currentImages: string[] = [];
    try {
      currentImages = formData.shop_images
        ? JSON.parse(formData.shop_images)
        : [];
    } catch (err) {
      currentImages = [];
    }

    const updatedImages = [...currentImages, previewUrl];
    setFormData((prev) => ({
      ...prev,
      shop_images: JSON.stringify(updatedImages),
    }));
  };

  const isMerchant = user?.role === "MERCHANT";
  const isNameLocked = isMerchant && !!user?.name;
  const themeColor = isMerchant ? "emerald" : "blue";

  if (userError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {userError.message || "Please check your internet connection."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={async () => {
              await clearAuthState();
              window.location.href = "/";
            }}
            className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userLoading || !user)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-xs animate-pulse">
        Loading Profile...
      </div>
    );

  return (
    <>
      {!isEditing ? (
        <ProfileDashboardView
          user={user}
          isAppPinMissing={isAppPinMissing}
          setIsEditing={setIsEditing}
          setIsAltNumDrawerOpen={setIsAltNumDrawerOpen}
          setPinModalMode={setPinModalMode}
          setIsPinModalOpen={setIsPinModalOpen}
          setIsPortalOpen={setIsPortalOpen}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          router={router}
          setShowSplashScreen={setShowSplashScreen}
        />
      ) : (
        <ProfileEditFormView
          user={user}
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
          isMerchant={isMerchant}
          isNameLocked={isNameLocked}
          themeColor={themeColor}
          uploadingImages={uploadingImages}
          newShopImages={newShopImages}
          setNewShopImages={setNewShopImages}
          newAadharImage={newAadharImage}
          newAadharBackImage={newAadharBackImage}
          newPanImage={newPanImage}
          setNewAadharImage={setNewAadharImage}
          setNewAadharBackImage={setNewAadharBackImage}
          setNewPanImage={setNewPanImage}
          handleFileChangeAutoSave={handleFileChangeAutoSave}
          handleUpdateProfile={handleUpdateProfile}
          setIsEditing={setIsEditing}
          isAddressLocked={isAddressLocked}
          timeLeft={timeLeft}
          uniquenessErrors={uniquenessErrors}
          checkingUniqueness={checkingUniqueness}
          checkUniqueness={checkUniqueness}
          bankSuggestions={bankSuggestions}
          showBankSuggestions={showBankSuggestions}
          setShowBankSuggestions={setShowBankSuggestions}
          ifscSuggestions={ifscSuggestions}
          showIfscSuggestions={showIfscSuggestions}
          setShowIfscSuggestions={setShowIfscSuggestions}
          setActiveCameraCategory={setActiveCameraCategory}
          handleImageUpload={handleImageUpload}
          isAadhaarVerified={isAadhaarVerified}
          isPanVerified={isPanVerified}
          toggleMerchantVisibility={toggleMerchantVisibility}
          setIsShopTimingModalOpen={setIsShopTimingModalOpen}
          handleChangePinClick={handleChangePinClick}
          setIsAltNumDrawerOpen={setIsAltNumDrawerOpen}
          BUSINESS_STRUCTURE={BUSINESS_STRUCTURE}
        />
      )}

      {/* Shared Modals, Portals, and Drawers */}
      <AlternateNumberDrawer
        isOpen={isAltNumDrawerOpen}
        onClose={() => setIsAltNumDrawerOpen(false)}
        user={user}
        alternatePhone={alternatePhone}
        setAlternatePhone={setAlternatePhone}
        altOtp={altOtp}
        setAltOtp={setAltOtp}
        altOtpSent={altOtpSent}
        setAltOtpSent={setAltOtpSent}
        isAltOtpSending={isAltOtpSending}
        isAltOtpVerifying={isAltOtpVerifying}
        handleRequestAltOtp={handleRequestAltOtp}
        handleVerifyAltOtp={handleVerifyAltOtp}
      />

      <NameMismatchModal
        isOpen={showNameMismatch}
        onClose={() => setShowNameMismatch(false)}
        profileName={formData.name}
        bankAccountHolderName={formData.account_holder_name}
      />

      <PartnerPanelPortal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />

      <TutorialPlayer
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onComplete={handlePinComplete}
        mode={pinModalMode}
        title={pinModalMode === "VERIFY" ? "Enter Current PIN" : "Set New PIN"}
      />

      <ShopTimingModal
        isOpen={isShopTimingModalOpen}
        initialData={formData.shop_timing}
        onClose={() => setIsShopTimingModalOpen(false)}
        onSave={async (data) => {
          setFormData((prev) => ({ ...prev, shop_timing: data }));
          if (!isEditing) {
            try {
              await apiFetch("/merchant/visibility", {
                method: "POST",
                body: JSON.stringify({ shop_timing: JSON.stringify(data) }),
              });
              toast.success("Shop timing updated successfully");
            } catch (e: any) {
              toast.error(e.message || "Failed to update timing");
            }
          }
        }}
        themeColor={themeColor}
      />

      <SplashScreen
        isVisible={showSplashScreen}
        onClose={() => setShowSplashScreen(false)}
      />

      {activeCameraCategory && (
        <CameraComponent
          label={
            DOCUMENT_CATEGORIES.find((c) => c.id === activeCameraCategory)
              ?.label || "Document Capture"
          }
          onCapture={handleCapture}
        />
      )}

      <OcrLoadingOverlay isLoading={isOcrLoading} />
    </>
  );
}
