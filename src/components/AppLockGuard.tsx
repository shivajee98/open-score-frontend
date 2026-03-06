"use client";

import { useEffect, useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { apiFetch, clearAuthState } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

export default function AppLockGuard({ children }: { children: React.ReactNode }) {
    const [isLocked, setIsLocked] = useState(false);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState(1); // 1 = Entry/Setup, 2 = Confirm Setup
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const checkLockStatus = () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setInitialized(true);
                return;
            }

            const user = JSON.parse(userStr);
            const isUnlocked = sessionStorage.getItem("app_unlocked") === "true";

            // logical fix: if not onboarded, don't force app lock (handled in onboarding)
            if (!user.is_onboarded) {
                setIsLocked(false);
                setInitialized(true);
                return;
            }

            if (!user.has_app_pin) {
                // If no PIN is set, do NOT force setup. Just unlock.
                // User can set it up later from profile/settings.
                setNeedsSetup(false);
                setIsLocked(false);
            } else if (!isUnlocked) {
                setIsLocked(true);
            }
            setInitialized(true);
        };

        checkLockStatus();
        window.addEventListener('auth-login', checkLockStatus);
        return () => window.removeEventListener('auth-login', checkLockStatus);
    }, []);

    const handleVerify = async () => {
        if (pin.length !== 4) return;
        setLoading(true);
        try {
            await apiFetch("/auth/verify-app-pin", {
                method: "POST",
                body: JSON.stringify({ pin })
            });
            sessionStorage.setItem("app_unlocked", "true");
            setIsLocked(false);
        } catch (err: any) {
            if (err.message === "Unauthenticated." || err.message === "Account not found" || err.message === "No PIN set. Please login via OTP.") {
                clearAuthState();
                window.location.href = "/";
                return;
            }
            toast.error("Invalid Security PIN");
            setPin("");
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        if (pin !== confirmPin) {
            toast.error("PINs do not match");
            setPin("");
            setConfirmPin("");
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            await apiFetch("/auth/set-app-pin", {
                method: "POST",
                body: JSON.stringify({ pin, pin_confirmation: confirmPin })
            });

            // Update local user state
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                user.has_app_pin = true;
                localStorage.setItem("user", JSON.stringify(user));
            }

            sessionStorage.setItem("app_unlocked", "true");
            setIsLocked(false);
            setNeedsSetup(false);
            toast.success("Security PIN set successfully");
        } catch (err: any) {
            toast.error(err.message || "Failed to set PIN");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) return null;

    if (isLocked) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6">
                        {needsSetup ? <ShieldCheck className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {needsSetup ? "Set App Lock PIN" : "Enter Security PIN"}
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium">
                            {needsSetup
                                ? (step === 1 ? "Create a 4-digit PIN to secure your account." : "Confirm your new 4-digit security PIN.")
                                : "Protecting your financial data."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-center gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-14 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-primary transition-all shadow-sm">
                                    {(step === 1 ? pin[i] : confirmPin[i]) ? <span className="w-3 h-3 bg-primary rounded-full animate-in zoom-in"></span> : ""}
                                </div>
                            ))}
                        </div>

                        {/* Numeric Keypad */}
                        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "delete"].map((key, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const current = step === 1 ? pin : confirmPin;
                                        if (key === "clear") {
                                            step === 1 ? setPin("") : setConfirmPin("");
                                        } else if (key === "delete") {
                                            step === 1 ? setPin(pin.slice(0, -1)) : setConfirmPin(confirmPin.slice(0, -1));
                                        } else if (current.length < 4) {
                                            step === 1 ? setPin(pin + key) : setConfirmPin(confirmPin + key);
                                        }
                                    }}
                                    className="h-16 rounded-2xl bg-white border border-slate-100 font-bold text-xl text-slate-700 hover:bg-slate-50 active:scale-90 transition-all shadow-sm flex items-center justify-center"
                                >
                                    {key === "clear" ? "C" : key === "delete" ? "←" : key}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (needsSetup) {
                                    if (step === 1 && pin.length === 4) setStep(2);
                                    else if (step === 2 && confirmPin.length === 4) handleSetup();
                                } else {
                                    handleVerify();
                                }
                            }}
                            disabled={loading || (step === 1 ? pin.length !== 4 : confirmPin.length !== 4)}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                                needsSetup
                                    ? (step === 1 ? <>Continue <ArrowRight className="w-5 h-5" /></> : "Set PIN")
                                    : "Unlock App"
                            )}
                        </button>

                        {!needsSetup && (
                            <div className="pt-2 text-center">
                                <button
                                    onClick={() => {
                                        clearAuthState();
                                        window.location.href = "/";
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                                >
                                    Forgot PIN?
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
