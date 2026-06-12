"use client";

import {
  ArrowLeft,
  Bell,
  Shield,
  Edit2,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Plus,
  CreditCard,
  Hash,
  User,
  Info,
  Settings,
  HelpCircle,
  Trophy,
  Vault,
  Check,
  ArrowRight,
  Lock,
  Headset,
  FileText,
  Briefcase,
} from "lucide-react";
import { getStorageUrl, clearAuthState } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

interface ProfileDashboardViewProps {
  user: any;
  isAppPinMissing: boolean;
  setIsEditing: (editing: boolean) => void;
  setIsAltNumDrawerOpen: (open: boolean) => void;
  setPinModalMode: (mode: "SET" | "VERIFY") => void;
  setIsPinModalOpen: (open: boolean) => void;
  setIsPortalOpen: (open: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  router: any;
  setShowSplashScreen: (show: boolean) => void;
}

export default function ProfileDashboardView({
  user,
  isAppPinMissing,
  setIsEditing,
  setIsAltNumDrawerOpen,
  setPinModalMode,
  setIsPinModalOpen,
  setIsPortalOpen,
  notificationsEnabled,
  setNotificationsEnabled,
  router,
  setShowSplashScreen,
}: ProfileDashboardViewProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans relative pb-16 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <div className="bg-[#4C3BCE] pt-6 pb-20 px-2 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 items-center">
              <button
                onClick={() => router.push("/customer")}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm active:scale-95 transition-transform shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 px-2">
                <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight">
                  Profile & Security
                </h1>
                <p className="text-[11px] font-medium text-white/70">
                  Manage your account, security & settings
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm active:scale-95 transition-transform shrink-0">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto -mt-16 relative z-20 px-2">
        {/* Missing PIN Alert */}
        {isAppPinMissing && (
          <div className="mb-4 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-slate-800 leading-tight">
                  Set Security PIN
                </h3>
                <p className="text-[9px] font-bold text-slate-500">
                  Protect your withdrawals.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPinModalMode("SET");
                setIsPinModalOpen(true);
              }}
              className="bg-rose-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Configure
            </button>
          </div>
        )}

        {/* User Card */}
        <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#7559FF] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30 overflow-hidden">
                  {user?.profile_image ? (
                    <img
                      src={getStorageUrl(user.profile_image) || ""}
                      className="w-full h-full object-cover"
                      alt={user.name}
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || "F"
                  )}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="w-4 h-4 rounded-full bg-[#F0EEFF] text-[#7559FF] flex items-center justify-center">
                    <Edit2 size={10} strokeWidth={3} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                  {user?.name || "User"}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 bg-[#F5F3FF] border border-[#E9E4FF] px-2 py-0.5 rounded-full w-fit">
                  <ShieldCheck size={10} className="text-[#7559FF]" />
                  <span className="text-[9px] font-bold text-[#7559FF] uppercase tracking-wider">
                    {user?.role === "MERCHANT"
                      ? "Merchant Account"
                      : "Customer Account"}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="h-px w-full bg-slate-100 my-4" />

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#F4F6FB] flex items-center justify-center text-[#6A789A]">
                <Phone size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                  Mobile Number
                </p>
                <p className="text-[13px] font-black text-slate-700 tracking-tight truncate">
                  {user?.mobile_number ? `+91 ${user.mobile_number}` : "Not set"}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100 mx-2 shrink-0" />
            <div className="flex items-center gap-3 flex-1 justify-between overflow-hidden">
              <div className="overflow-hidden">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                  Alternate Number
                </p>
                <p className="text-[13px] font-black text-slate-700 tracking-tight truncate">
                  {user?.alternate_number?.phone
                    ? `+91 ${user.alternate_number?.phone}`
                    : "Not set"}
                </p>
              </div>
              <button
                onClick={() => setIsAltNumDrawerOpen(true)}
                className="w-7 h-7 shrink-0 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF3] flex items-center justify-center text-[#12B76A] border border-[#D1FADF]">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                  Your account is secure
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  Keep your information updated
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-[#7559FF] bg-[#F5F3FF] border border-[#E9E4FF] px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider active:scale-95 transition-transform">
              Security Tips <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Email Card */}
          <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex gap-3 relative">
            <div className="absolute top-4 right-4 w-[14px] h-[14px] rounded-full bg-[#12B76A] flex items-center justify-center text-white">
              <Check size={8} strokeWidth={4} />
            </div>
            <div className="w-10 h-10 shrink-0 rounded-[14px] bg-[#ECFDF3] flex items-center justify-center text-[#12B76A] border border-[#D1FADF]">
              <Mail size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              <p className="text-[11px] font-black text-slate-800 tracking-tight mb-0.5">
                Email Address
              </p>
              <p className="text-[10px] font-bold text-slate-500 truncate w-full mb-1.5">
                {user?.email || "Not set"}
              </p>
              <p className="text-[9px] font-black text-[#12B76A]">
                Verified & Secure
              </p>
            </div>
          </div>

          {/* Location Card */}
          <div
            className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex gap-3 relative cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <div className="absolute top-4 right-4 text-slate-800">
              <ChevronRight size={16} strokeWidth={2.5} />
            </div>
            <div className="w-10 h-10 shrink-0 rounded-[14px] bg-[#F5F3FF] flex items-center justify-center text-[#7559FF] border border-[#E9E4FF]">
              <MapPin size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-4">
              <p className="text-[11px] font-black text-slate-800 tracking-tight mb-0.5">
                Location & Address
              </p>
              <p className="text-[10px] font-bold text-[#12B76A] leading-tight mb-1.5">
                {user?.city
                  ? `${user.city}${user.state ? `, ${user.state}` : ""}`
                  : "Not Set"}
              </p>
              <p className="text-[9px] font-bold text-slate-500 uppercase">
                {user?.postal_code ? `PIN: ${user.postal_code}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#7559FF] border border-[#E9E4FF]">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-slate-800 tracking-tight leading-tight">
                  Bank Details (For Payouts)
                </h3>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  Add your bank details to receive payouts
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-[#7559FF] bg-[#F5F3FF] border border-[#E9E4FF] px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider active:scale-95 transition-transform"
            >
              <Plus size={12} strokeWidth={3} /> Add Bank
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="text-[#7559FF]">
                <Landmark size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Bank Name
                </p>
                <p className="text-[11px] font-black text-slate-800">
                  {user?.bank_name || "Not Set"}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="text-[#0EA5E9]">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Account Number
                </p>
                <p className="text-[11px] font-black text-slate-800">
                  {user?.account_number
                    ? `XXXXXX${user.account_number.slice(-4)}`
                    : "Not Set"}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="text-[#F59E0B]">
                <Hash size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  IFSC Code
                </p>
                <p className="text-[11px] font-black text-slate-800">
                  {user?.ifsc_code || "Not Set"}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="text-[#8B5CF6]">
                <User size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  A/C Holder Name
                </p>
                <p className="text-[11px] font-black text-slate-800 truncate w-24">
                  {user?.account_holder_name || "Not Set"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F3FF] border border-[#E9E4FF] rounded-xl p-3 flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-[#7559FF] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Info size={10} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-bold text-[#7559FF] leading-snug">
              Make sure your bank details are accurate for smooth transactions.
            </p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[13px] font-black text-slate-800 tracking-tight">
              Quick Actions
            </h3>
            <button
              onClick={async () => {
                await clearAuthState();
                toast.success("Logged out successfully");
                setTimeout(() => {
                  window.location.href = "/";
                }, 500);
              }}
              className="flex items-center gap-1 text-[#EF4444] text-[10px] font-bold tracking-wide hover:text-red-600 transition-colors"
            >
              View All <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/about")}
            >
              <ShieldCheck size={22} strokeWidth={2} className="text-[#3B82F6] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                KYC Info
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => setIsEditing(true)}
            >
              <User size={22} strokeWidth={2} className="text-[#8B5CF6] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Profile
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/settings")}
            >
              <Settings size={22} strokeWidth={2} className="text-[#F59E0B] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Settings
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/support")}
            >
              <HelpCircle size={22} strokeWidth={2} className="text-[#EF4444] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Help
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/referral")}
            >
              <Trophy size={22} strokeWidth={2} className="text-[#10B981] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Refer & Earn
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/payout")}
            >
              <CreditCard size={22} strokeWidth={2} className="text-[#0EA5E9] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Payouts
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/support")}
            >
              <Headset size={22} strokeWidth={2} className="text-[#3B82F6] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Request Support
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/privacy-policy")}
            >
              <Shield size={22} strokeWidth={2} className="text-[#10B981] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Terms & Policy
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/terms")}
            >
              <FileText size={22} strokeWidth={2} className="text-[#F59E0B] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                T & C
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-3.5 px-1 rounded-[16px] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform"
              onClick={() => router.push("/customer/legal")}
            >
              <FileText size={22} strokeWidth={2} className="text-[#14B8A6] mb-2" />
              <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                Legal Information
              </span>
            </div>

            {/* Personal Locker spanning 2 columns */}
            <div
              className="col-span-2 flex items-center justify-between p-3 rounded-[16px] bg-[#4B39EF] text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform cursor-pointer"
              onClick={() => setIsPortalOpen(true)}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[10px] bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Vault size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-tight leading-tight">
                    Personal Locker
                  </p>
                  <p className="text-[8px] font-medium text-white/90 mt-0.5">
                    Secure & Private Vault
                  </p>
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={2.5} className="text-white/80" />
            </div>

            {/* Become a Partner */}
            {!user?.is_vendor && user?.role !== 'AGENT' && (
              <div
                onClick={() => router.push("/customer/partner")}
                className="col-span-2 bg-white p-3 rounded-[16px] shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all border border-slate-50 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-50 rounded-[10px] flex items-center justify-center text-blue-500 shadow-sm">
                    <Plus size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[11px] block font-black text-slate-800 tracking-tight leading-tight">
                      Become a Partner
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 mt-0.5">
                      Join our partner program
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2.5} className="text-slate-400" />
              </div>
            )}

            {/* Switch to Partner Panel */}
            {user?.is_vendor && (
              <div
                onClick={() => setShowSplashScreen(true)}
                className="col-span-2 bg-indigo-600 p-3 rounded-[16px] shadow-lg shadow-indigo-200 flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-all border border-indigo-400/20 group active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                    <Briefcase size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[8px] block font-black text-indigo-100 uppercase tracking-widest leading-none mb-0.5">
                      Partner Account
                    </span>
                    <span className="text-[11px] font-black text-white leading-tight">
                      Switch to Partner Panel
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2.5} className="text-white/80" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-stretch gap-2 mb-6">
          {/* Notifications */}
          <div className="flex-[1.1] bg-white rounded-[18px] p-3 shadow-[0_2px_10px_rgb(0,0,0,0.04)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[#4B39EF] pl-0.5">
                <Bell size={20} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 leading-tight">
                  Notifications
                </p>
                <p className="text-[8px] font-bold text-slate-500 mt-0.5">
                  Manage alerts & updates
                </p>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full relative p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${notificationsEnabled ? "bg-[#4B39EF]" : "bg-slate-200"}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? "translate-x-4" : "translate-x-0"}`}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-white rounded-[18px] px-1 py-3 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-50 flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Edit2 size={13} className="text-slate-700 shrink-0" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black text-slate-800 whitespace-nowrap">
                Edit Profile
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPinModalMode("SET");
                setIsPinModalOpen(true);
              }}
              className="flex-1 bg-[#4B39EF] rounded-[18px] px-1 py-3 shadow-[0_4px_14px_rgba(75,57,239,0.3)] flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Lock size={13} className="text-white shrink-0" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black text-white whitespace-nowrap">
                Change PIN
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
