"use client";

import React from "react";
import {
  ArrowLeft,
  Camera,
  Lock,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Phone,
  Smartphone,
  Mail,
  Briefcase,
  MapPin,
  Landmark,
  CreditCard,
  Hash,
  User,
  Check,
  X,
  ImageIcon,
  Clock,
  Info,
} from "lucide-react";
import { getStorageUrl } from "@/lib/api";

interface ProfileEditFormViewProps {
  user: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  isMerchant: boolean;
  isNameLocked: boolean;
  themeColor: string;
  uploadingImages: Record<string, boolean>;
  newShopImages: any[];
  setNewShopImages: React.Dispatch<React.SetStateAction<any[]>>;
  newAadharImage: File | null;
  setNewAadharImage: React.Dispatch<React.SetStateAction<File | null>>;
  newAadharBackImage: File | null;
  setNewAadharBackImage: React.Dispatch<React.SetStateAction<File | null>>;
  newPanImage: File | null;
  setNewPanImage: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileChangeAutoSave: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  handleUpdateProfile: () => void;
  setIsEditing: (editing: boolean) => void;
  isAddressLocked: boolean;
  timeLeft: number | null;
  uniquenessErrors: {
    aadhar?: string;
    pan?: string;
    account?: string;
  };
  checkingUniqueness: {
    aadhar?: boolean;
    pan?: boolean;
    account?: boolean;
  };
  checkUniqueness: (type: "aadhar" | "pan" | "account", value: string, ifsc?: string) => void;
  bankSuggestions: string[];
  showBankSuggestions: boolean;
  setShowBankSuggestions: (show: boolean) => void;
  ifscSuggestions: any[];
  showIfscSuggestions: boolean;
  setShowIfscSuggestions: (show: boolean) => void;
  setActiveCameraCategory: (cat: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAadhaarVerified: boolean;
  isPanVerified: boolean;
  toggleMerchantVisibility: (field: "show_phone" | "show_timing") => void;
  setIsShopTimingModalOpen: (open: boolean) => void;
  handleChangePinClick: () => void;
  setIsAltNumDrawerOpen: (open: boolean) => void;
  BUSINESS_STRUCTURE: Record<string, string[]>;
}

export default function ProfileEditFormView({
  user,
  formData,
  setFormData,
  isSaving,
  isMerchant,
  isNameLocked,
  themeColor,
  uploadingImages,
  newShopImages,
  setNewShopImages,
  newAadharImage,
  newAadharBackImage,
  newPanImage,
  handleFileChangeAutoSave,
  handleUpdateProfile,
  setIsEditing,
  isAddressLocked,
  timeLeft,
  uniquenessErrors,
  checkingUniqueness,
  checkUniqueness,
  bankSuggestions,
  showBankSuggestions,
  setShowBankSuggestions,
  ifscSuggestions,
  showIfscSuggestions,
  setShowIfscSuggestions,
  setActiveCameraCategory,
  handleImageUpload,
  isAadhaarVerified,
  isPanVerified,
  toggleMerchantVisibility,
  setIsShopTimingModalOpen,
  handleChangePinClick,
  setIsAltNumDrawerOpen,
  BUSINESS_STRUCTURE,
}: ProfileEditFormViewProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans relative pb-16 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <div className="bg-[#4C3BCE] pt-6 pb-20 px-2 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm active:scale-95 transition-transform shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 px-2">
                <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight">
                  Edit Profile
                </h1>
                <p className="text-[11px] font-medium text-white/70">
                  Update your personal & business information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto -mt-16 relative z-20 px-2">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4">
          {/* Profile Photo Section */}
          <div className="relative text-center mb-8 flex flex-col items-center">
            <label
              htmlFor="profile-photo-upload-component"
              className="cursor-pointer block relative group"
            >
              <div className="w-24 h-24 bg-[#7559FF] text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/30 overflow-hidden relative border-4 border-white">
                {uploadingImages.profile_image && (
                  <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {user.profile_image ? (
                  <img
                    src={getStorageUrl(user.profile_image) || ""}
                    className={`w-full h-full object-cover ${uploadingImages.profile_image ? "blur-sm" : ""}`}
                    alt={user.name}
                  />
                ) : (
                  <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
            </label>
            <input
              type="file"
              id="profile-photo-upload-component"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChangeAutoSave(e, "profile_image")}
            />

            <div className="mt-4 w-full max-w-sm">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 text-left">
                Full Name
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    !isNameLocked &&
                    setFormData({ ...formData, name: e.target.value })
                  }
                  readOnly={isNameLocked}
                  className={`text-sm font-semibold text-slate-900 bg-slate-50 border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:border-[#7559FF] ${isNameLocked ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-75" : "border-slate-200"}`}
                  placeholder="Full Name"
                />
                {isNameLocked && (
                  <div
                    className="absolute right-3 top-3 text-slate-400"
                    title="Name cannot be changed after saving"
                  >
                    <Lock size={14} />
                  </div>
                )}
              </div>
              {!isNameLocked &&
                formData.name.trim().toLowerCase() !==
                  formData.account_holder_name.trim().toLowerCase() &&
                formData.account_holder_name && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tighter text-left animate-pulse">
                    ⚠️ Must match account holder name
                  </p>
                )}
              {isNameLocked && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">
                  Verified Profile Name
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Mobile Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                  <Phone className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                    Mobile Number
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    +91 {user.mobile_number}
                  </p>
                </div>
              </div>

              {/* Alternate Mobile Number */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                    Alternate Number
                  </p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.alternate_number?.phone ? `+91 ${user.alternate_number.phone}` : "Not set"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAltNumDrawerOpen(true)}
                  className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                <Mail className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                  Email Address
                </p>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                  placeholder="name@example.com"
                />
                {user?.email_verified_at && (
                  <p className="text-[9px] font-medium text-slate-400 mt-1">
                    Note: Changing your email will require re-verification.
                  </p>
                )}
              </div>
            </div>

            {isMerchant && (
              <>
                <div className="h-px bg-slate-100 my-4" />
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-[#7559FF]" />
                  Business Information
                </h3>

                {/* Business Name */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                      Business Name
                    </p>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business_name: e.target.value,
                        })
                      }
                      className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                      placeholder="Enter Business Name"
                    />
                  </div>
                </div>

                {/* Business Select Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Merchant Type
                    </p>
                    <select
                      value={formData.customer_segment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_segment: e.target.value,
                        })
                      }
                      className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none shadow-sm"
                    >
                      <option value="">Select Segment</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Retail">Retail</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Super Distributor">Super Distributor</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Supplier">Supplier</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Business Nature (Category)
                    </p>
                    <select
                      value={formData.business_nature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business_nature: e.target.value,
                          business_segment: "",
                        })
                      }
                      className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none shadow-sm"
                    >
                      <option value="">Select Category</option>
                      {Object.keys(BUSINESS_STRUCTURE).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Business Segment (Subcategory)
                    </p>
                    <select
                      value={formData.business_segment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business_segment: e.target.value,
                        })
                      }
                      disabled={!formData.business_nature}
                      className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none disabled:opacity-50 shadow-sm"
                    >
                      <option value="">Select Subcategory</option>
                      {formData.business_nature &&
                        BUSINESS_STRUCTURE[formData.business_nature]?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Daily Turnover
                    </p>
                    <select
                      value={formData.daily_turnover}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_turnover: e.target.value,
                        })
                      }
                      className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none shadow-sm"
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
                  </div>
                </div>

                {/* Visibility Settings */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                    Visibility Settings
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Show Phone Number
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Display contact on locator
                      </p>
                    </div>
                    <div
                      onClick={() => toggleMerchantVisibility("show_phone")}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.show_phone ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.show_phone ? "right-1" : "left-1"}`}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Show Shop Timing
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Display hours on locator
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {formData.show_timing && (
                        <button
                          type="button"
                          onClick={() => setIsShopTimingModalOpen(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-slate-200"
                        >
                          {formData.shop_timing ? "Edit Hours" : "Set Hours"}
                        </button>
                      )}
                      <div
                        onClick={() => toggleMerchantVisibility("show_timing")}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.show_timing ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.show_timing ? "right-1" : "left-1"}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps Link */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1">
                    Google Maps Link
                  </p>
                  <input
                    type="url"
                    value={formData.map_location_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        map_location_url: e.target.value,
                      })
                    }
                    className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                    placeholder="https://maps.google.com/..."
                  />
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 font-bold mt-1.5 inline-block"
                  >
                    Open Google Maps to copy link
                  </a>
                </div>

                {/* Shop Images */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Shop Images
                    </p>
                    <div className="flex gap-2">
                      <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors border border-indigo-100">
                        <ImageIcon size={14} />
                        Gallery
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>

                      <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors border border-indigo-100">
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
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(() => {
                      let images: string[] = [];
                      try {
                        images = formData.shop_images
                          ? JSON.parse(formData.shop_images)
                          : [];
                      } catch (e) {
                        images = [];
                      }

                      if (images.length === 0) {
                        if (user?.profile_image) {
                          images = [user.profile_image];
                        } else {
                          return (
                            <p className="text-xs text-slate-400 italic">
                              No images added
                            </p>
                          );
                        }
                      }

                      return images.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <img
                            src={getStorageUrl(img) || ""}
                            className="w-full h-full object-cover"
                            alt="Shop"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const imgUrl = images[idx];
                              if (imgUrl.startsWith("blob:")) {
                                const firstBlobIndex = images.findIndex(
                                  (i: string) => i.startsWith("blob:"),
                                );
                                const newShopImageIndex = idx - firstBlobIndex;
                                setNewShopImages((prev) =>
                                  prev.filter((_, i) => i !== newShopImageIndex),
                                );
                              }
                              const updated = images.filter((_, i) => i !== idx);
                              setFormData((prev: any) => ({
                                ...prev,
                                shop_images: JSON.stringify(updated),
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}

            {/* Address Section */}
            <div id="address-section-component" className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    Location & Address
                  </p>
                  {isAddressLocked ? (
                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ShieldCheck size={8} /> Verified & Locked
                    </span>
                  ) : (
                    timeLeft !== null && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                        <Clock size={8} /> Edit window:{" "}
                        {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    )
                  )}
                </div>
                <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  Required for Virtual Credit
                </span>
              </div>

              {!isAddressLocked && timeLeft !== null && (
                <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                  <p className="text-[9px] font-bold text-amber-800 leading-tight">
                    ⚠️ You have {Math.floor(timeLeft / 60)} minutes to correct
                    any mistakes. After this, address details will be locked
                    for security.
                  </p>
                </div>
              )}

              <div>
                <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">
                  Street Address
                </p>
                {!isAddressLocked ? (
                  <textarea
                    value={formData.street_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        street_address: e.target.value,
                      })
                    }
                    className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full min-h-[60px] resize-none py-1"
                    placeholder="Building, Street, Area"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.business_address || user?.address || "Not Set"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">
                    City
                  </p>
                  {!isAddressLocked ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                      placeholder="City"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.city || "Not Set"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest mb-1">
                    State
                  </p>
                  {!isAddressLocked ? (
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 w-full focus:border-[#7559FF] focus:outline-none"
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
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.state || "Not Set"}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 transition-all ${!formData.postal_code ? "bg-amber-50 border-amber-200" : isAddressLocked ? "bg-emerald-50 border-emerald-100" : "bg-slate-100/50 border-slate-100"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    Regional PIN Code
                  </p>
                  {!formData.postal_code && (
                    <span className="text-[8px] font-black text-amber-600 animate-pulse uppercase">
                      Mandatory ⚠️
                    </span>
                  )}
                  {isAddressLocked && (
                    <span className="text-[8px] font-black text-emerald-600 uppercase">
                      Securely Locked ✅
                    </span>
                  )}
                </div>
                {!isAddressLocked ? (
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postal_code: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="text-lg font-black text-slate-900 bg-transparent border-b-2 border-slate-300 focus:border-amber-500 focus:outline-none w-full tracking-[0.2em]"
                    placeholder="000000"
                  />
                ) : (
                  <p className="text-lg font-black text-slate-900 tracking-[0.2em]">
                    {user?.pincode || "NOT SET"}
                  </p>
                )}
                <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase">
                  {isAddressLocked
                    ? "Address verified for regional compliance."
                    : "Used to verify your area with regional virtual credit policies."}
                </p>
              </div>
            </div>

            {/* Bank Details Section */}
            <div id="bank-details-section-component" className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Bank Details (For Payouts)
              </h3>
              {user.account_number && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-800">
                    Bank details are verified and locked. Contact support to update.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                    Bank Name
                  </p>
                  {!user.account_number ? (
                    <>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            bank_name: e.target.value,
                          });
                          setShowBankSuggestions(true);
                        }}
                        onFocus={() => setShowBankSuggestions(true)}
                        className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                        placeholder="e.g. HDFC Bank"
                      />
                      {showBankSuggestions && bankSuggestions.length > 0 && (
                        <div className="absolute z-100 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-[160px] overflow-y-auto">
                          {bankSuggestions.map((name, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  bank_name: name,
                                });
                                setShowBankSuggestions(false);
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                            >
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                <Landmark size={14} />
                              </div>
                              <div className="text-[10px] font-bold text-slate-800">
                                {name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.bank_name || "Not Set"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                    Account Number
                  </p>
                  {!user.account_number ? (
                    <>
                      <input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, account_number: val });
                        }}
                        className={`text-sm font-semibold text-slate-900 bg-transparent border-b ${uniquenessErrors.account ? "border-red-500" : "border-slate-200"} focus:border-[#7559FF] focus:outline-none w-full py-0.5`}
                        placeholder="Enter account number"
                      />
                      {uniquenessErrors.account && (
                        <p className="text-[9px] text-red-500 mt-1 font-bold animate-in fade-in transition-all">
                          {uniquenessErrors.account}
                        </p>
                      )}
                      {checkingUniqueness.account && (
                        <p className="text-[9px] text-blue-500 mt-1 font-bold animate-pulse">
                          Verifying...
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.account_number || "Not Set"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      IFSC Code
                    </p>
                    {!user.account_number ? (
                      <>
                        <input
                          type="text"
                          value={formData.ifsc_code}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              ifsc_code: e.target.value.toUpperCase(),
                            });
                            setShowIfscSuggestions(true);
                          }}
                          onFocus={() => setShowIfscSuggestions(true)}
                          className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                          placeholder="HDFC0001234"
                        />
                        {showIfscSuggestions && ifscSuggestions.length > 0 && (
                          <div className="absolute z-100 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-[160px] overflow-y-auto">
                            {ifscSuggestions.map((item: any, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    ifsc_code: item.ifsc,
                                  });
                                  setShowIfscSuggestions(false);
                                }}
                                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                              >
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                                  <Hash size={14} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-slate-900">
                                    {item.ifsc}
                                  </div>
                                  <div className="text-[8px] font-bold text-slate-400">
                                    {item.bank_name} - {item.branch_name}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 uppercase truncate">
                        {user.ifsc_code || "Not Set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      A/C Holder Name
                    </p>
                    {!user.account_number ? (
                      <>
                        <input
                          type="text"
                          value={formData.account_holder_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account_holder_name: e.target.value,
                            })
                          }
                          className="text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-[#7559FF] focus:outline-none w-full py-0.5"
                          placeholder="As per bank records"
                        />
                        {formData.name.trim().toLowerCase() !==
                          formData.account_holder_name.trim().toLowerCase() && (
                          <p className="text-rose-500 text-[8px] font-bold mt-1 uppercase animate-pulse">
                            ⚠️ Mismatch with profile name
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user.account_holder_name || "Not Set"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Documents Section */}
            {isMerchant && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-6">
                <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  KYC Documents
                </h3>

                {/* Aadhaar Input */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Aadhar Number
                    </p>
                    {isAadhaarVerified ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Unverified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.aadhar_number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
                          setFormData({
                            ...formData,
                            aadhar_number: val,
                          });
                          if (val.length === 12) checkUniqueness("aadhar", val);
                        }}
                        disabled={isAadhaarVerified || checkingUniqueness.aadhar}
                        className={`flex-1 text-sm font-black text-slate-800 bg-white border-2 rounded-xl px-4 py-2.5 transition-all focus:outline-none ${uniquenessErrors.aadhar ? "border-rose-200 bg-rose-50" : isAadhaarVerified ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 focus:border-[#7559FF]"}`}
                        placeholder="0000 0000 0000"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveCameraCategory("aadhar_front")}
                        disabled={isAadhaarVerified}
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                    {uniquenessErrors.aadhar && (
                      <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight ml-1">
                        {uniquenessErrors.aadhar}
                      </p>
                    )}
                    {checkingUniqueness.aadhar && (
                      <p className="text-[9px] text-blue-500 font-bold animate-pulse uppercase tracking-widest ml-1">
                        Verifying Uniqueness...
                      </p>
                    )}
                  </div>
                </div>

                {/* PAN Input */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      PAN Number
                    </p>
                    {isPanVerified ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Unverified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.pan_number}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().slice(0, 10);
                          setFormData({ ...formData, pan_number: val });
                          if (val.length === 10) checkUniqueness("pan", val);
                        }}
                        disabled={isPanVerified || checkingUniqueness.pan}
                        className={`flex-1 text-sm font-black text-slate-800 bg-white border-2 rounded-xl px-4 py-2.5 transition-all focus:outline-none ${uniquenessErrors.pan ? "border-rose-200 bg-rose-50" : isPanVerified ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 focus:border-[#7559FF]"}`}
                        placeholder="ABCDE1234F"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveCameraCategory("pan_card")}
                        disabled={isPanVerified}
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                    {uniquenessErrors.pan && (
                      <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight ml-1">
                        {uniquenessErrors.pan}
                      </p>
                    )}
                    {checkingUniqueness.pan && (
                      <p className="text-[9px] text-blue-500 font-bold animate-pulse uppercase tracking-widest ml-1">
                        Verifying Uniqueness...
                      </p>
                    )}
                  </div>
                </div>

                {/* DOB and Father's Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Date of Birth
                    </p>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                      disabled={user?.date_of_birth}
                      className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none shadow-sm ${user?.date_of_birth ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">
                      Father's Name
                    </p>
                    <input
                      type="text"
                      value={formData.father_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          father_name: e.target.value,
                        })
                      }
                      disabled={user?.father_name || user?.family_detail?.father_name}
                      className={`text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 w-full focus:border-[#7559FF] focus:outline-none shadow-sm ${user?.father_name || user?.family_detail?.father_name ? "opacity-60 cursor-not-allowed" : ""}`}
                      placeholder="Father's full name"
                    />
                  </div>
                </div>

                {/* Aadhaar Images Uploads */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Aadhar Front */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                      Aadhar Front
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group">
                      <label className="w-full h-full flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAutoSave(e, "aadhar_image")}
                        />
                        {uploadingImages.aadhar_image && (
                          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#7559FF] border-t-transparent rounded-full animate-spin mb-1"></div>
                            <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
                              Uploading...
                            </p>
                          </div>
                        )}
                        {newAadharImage || user.aadhar_image ? (
                          <div className="relative w-full h-full">
                            <img
                              src={
                                newAadharImage
                                  ? URL.createObjectURL(newAadharImage)
                                  : getStorageUrl(user.aadhar_image) || ""
                              }
                              alt="Aadhar Front"
                              className={`w-full h-full object-cover ${uploadingImages.aadhar_image ? "blur-[2px]" : ""}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                Change
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                            <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                              Missing Front
                            </p>
                            <div className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                              Upload
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Aadhar Back */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                      Aadhar Back
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group">
                      <label className="w-full h-full flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAutoSave(e, "aadhar_back_image")}
                        />
                        {uploadingImages.aadhar_back_image && (
                          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#7559FF] border-t-transparent rounded-full animate-spin mb-1"></div>
                            <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
                              Uploading...
                            </p>
                          </div>
                        )}
                        {newAadharBackImage || user.aadhar_back_image ? (
                          <div className="relative w-full h-full">
                            <img
                              src={
                                newAadharBackImage
                                  ? URL.createObjectURL(newAadharBackImage)
                                  : getStorageUrl(user.aadhar_back_image) || ""
                              }
                              alt="Aadhar Back"
                              className={`w-full h-full object-cover ${uploadingImages.aadhar_back_image ? "blur-[2px]" : ""}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                Change
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                            <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                              Missing Back
                            </p>
                            <div className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                              Upload
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* PAN Card Image */}
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                    PAN Card Image
                  </p>
                  <div className="relative aspect-video max-w-sm rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group">
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChangeAutoSave(e, "pan_image")}
                      />
                      {uploadingImages.pan_image && (
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#7559FF] border-t-transparent rounded-full animate-spin mb-1"></div>
                          <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
                            Uploading...
                          </p>
                        </div>
                      )}
                      {newPanImage || user.pan_image ? (
                        <div className="relative w-full h-full">
                          <img
                            src={
                              newPanImage
                                ? URL.createObjectURL(newPanImage)
                                : getStorageUrl(user.pan_image) || ""
                            }
                            alt="PAN Card"
                            className={`w-full h-full object-cover ${uploadingImages.pan_image ? "blur-[2px]" : ""}`}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                              Change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                          <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                            Missing PAN Card Image
                          </p>
                          <div className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                            Upload
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Additional Merchant Doc Uploads */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  {/* Electricity Bill */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                      Electricity Bill <span className="text-rose-500 font-black ml-1 text-[8px]">*REQ</span>
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group">
                      <label className="w-full h-full flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAutoSave(e, "electricity_bill")}
                        />
                        {uploadingImages.electricity_bill && (
                          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#7559FF] border-t-transparent rounded-full animate-spin mb-1"></div>
                            <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
                              Uploading...
                            </p>
                          </div>
                        )}
                        {user.electricity_bill ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getStorageUrl(user.electricity_bill) || ""}
                              alt="Electricity Bill"
                              className={`w-full h-full object-cover ${uploadingImages.electricity_bill ? "blur-[2px]" : ""}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                Change
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                            <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                              Missing Bill
                            </p>
                            <div className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                              Upload
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Shop Rent Document */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                      Shop Rent Doc <span className="text-rose-500 font-black ml-1 text-[8px]">*REQ</span>
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden group">
                      <label className="w-full h-full flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAutoSave(e, "shop_rent_doc")}
                        />
                        {uploadingImages.shop_rent_doc && (
                          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#7559FF] border-t-transparent rounded-full animate-spin mb-1"></div>
                            <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
                              Uploading...
                            </p>
                          </div>
                        )}
                        {user.shop_rent_doc ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getStorageUrl(user.shop_rent_doc) || ""}
                              alt="Shop Rent Doc"
                              className={`w-full h-full object-cover ${uploadingImages.shop_rent_doc ? "blur-[2px]" : ""}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg">
                                Change
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 w-full h-full flex flex-col items-center justify-center">
                            <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                              Missing Agreement
                            </p>
                            <div className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                              Upload
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="flex-1 bg-[#4C3BCE] hover:bg-[#3b2db0] text-white py-3 px-2 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider disabled:opacity-50"
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
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-3 px-2 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleChangePinClick}
              className="flex-1 bg-[#EBE9FE] hover:bg-[#DDD9FE] text-[#4C3BCE] py-3 px-2 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change PIN</span>
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Member since {new Date(user.created_at).getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
