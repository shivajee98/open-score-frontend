import AuthGuard from "@/components/AuthGuard";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
