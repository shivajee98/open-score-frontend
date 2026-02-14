"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

interface BackButtonProps {
    className?: string;
    fallback?: string;
    clearAuth?: boolean;
    children?: React.ReactNode;
}

export default function BackButton({
    className = "absolute left-4 top-4 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-50",
    fallback = "/customer",
    clearAuth = false,
    children
}: BackButtonProps) {
    const router = useRouter();
    const { navigationStack } = useStore();

    const handleBack = () => {
        if (clearAuth) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
            return;
        }

        if (navigationStack.length > 1) {
            router.back();
        } else {
            router.push(fallback);
        }
    };

    return (
        <button onClick={handleBack} className={className}>
            {children || <ArrowLeft size={20} />}
        </button>
    );
}
