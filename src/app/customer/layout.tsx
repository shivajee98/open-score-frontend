import AuthGuard from "@/components/AuthGuard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
