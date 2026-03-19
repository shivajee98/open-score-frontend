'use client';

import { ArrowLeft, ShieldCheck, Mail, Calendar, Info, Landmark, Layers, Wallet, CreditCard, Users, Gift, Database, Zap, Share2, Scale, Lock, Cookie, UserCheck, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPrivacyPolicyPage() {
    const router = useRouter();

    const sections = [
        {
            title: "1. Introduction",
            icon: <Info className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Welcome to <strong>Open Score</strong> (“Company”, “we”, “our”, “us”), a fintech service provider platform.</p>
                    <p>Open Score acts as an intermediary service provider that connects Users, Students, and Merchants to enable digital financial access, smart spending, savings, and business transactions.</p>
                    <p>We are committed to protecting your privacy and ensuring transparency in how your information is collected, used, and shared.</p>
                    <p>By accessing or using the Open Score application, you agree to this Privacy Policy.</p>
                </div>
            )
        },
        {
            title: "2. Nature of Services",
            icon: <Landmark className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Open Score is not a direct lender or financial institution. It operates as a fintech service platform that:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Connects users with listed financial and investment partners</li>
                        <li>Facilitates demand-based credit voucher services</li>
                        <li>Enables wallet-based transactions and QR payments</li>
                        <li>Provides cashback, rewards, discount coupons, and referral (share & earn) programs</li>
                        <li>Helps users improve their financial profile for future credit eligibility</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Partner Network",
            icon: <Layers className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Open Score collaborates with multiple financial and investment partners, including but not limited to:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            "Open Capital", "Srinidhi", "E Suvidha", 
                            "Cloud Revel", "Rise Pay X", "JV Finance",
                            "Other domestic and international financial partners"
                        ].map((partner) => (
                            <div key={partner} className="flex items-center gap-3 p-3 bg-[oklch(0.98_0.01_240)] rounded-xl border border-[oklch(0.95_0.01_240)]">
                                <div className="w-2 h-2 rounded-full bg-[oklch(0.7_0.15_160)]"></div>
                                <span className="text-sm font-semibold text-[oklch(0.4_0.02_240)]">{partner}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 italic mt-2">These partners provide financial services through the Open Score platform.</p>
                </div>
            )
        },
        {
            title: "4. Demand Credit Voucher Service",
            icon: <FileText className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Open Score offers a Demand Credit Voucher facility:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Voucher range: <strong>₹10,000 to ₹50,000</strong></li>
                        <li>Available regardless of initial CIBIL score</li>
                        <li>Designed for daily essential purchases</li>
                        <li>Functions as a financial access tool, not a guaranteed loan</li>
                    </ul>
                    <div className="bg-[oklch(0.98_0.03_160)] p-4 rounded-2xl border border-[oklch(0.92_0.05_160)]">
                        <h4 className="font-bold text-[oklch(0.3_0.05_160)] mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Key Conditions:
                        </h4>
                        <ul className="space-y-2 text-[oklch(0.35_0.05_160)] text-sm">
                            <li className="flex gap-2"><span>•</span> Users must complete full KYC and verification</li>
                            <li className="flex gap-2"><span>•</span> Service is provided only to users with valid and stable income</li>
                            <li className="flex gap-2"><span>•</span> Voucher access leads to profile upgrade, helping eligibility for future loans</li>
                            <li className="flex gap-2"><span>•</span> It is intended for emergency and short-term usage</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "5. Demand Voucher Fees, Charges & Cancellation Policy",
            icon: <Zap className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>If a user chooses any Demand Voucher plan based on their use case:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>The user must pay the applicable job price, service fee, and platform charges at the time of registration or plan selection.</li>
                        <li>All such charges are mandatory and must be paid upfront to activate the selected voucher plan.</li>
                        <li>All fees and charges are <strong>strictly non-refundable under any circumstances</strong>.</li>
                        <li>Once a Demand Voucher plan is selected and activated, it cannot be cancelled, modified, or reversed.</li>
                    </ul>
                    <p className="font-bold text-[oklch(0.2_0.02_240)] border-l-4 border-[oklch(0.7_0.15_160)] pl-4 py-2 bg-[oklch(0.98_0.01_240)] rounded-r-xl">By selecting a Demand Voucher plan, the user explicitly agrees to these fee, non-refund, and no-cancellation terms.</p>
                </div>
            )
        },
        {
            title: "6. Wallet System (Elite Wallet)",
            icon: <Wallet className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Voucher value is credited into the <strong>Elite Wallet</strong>.</p>
                    <p>Users can:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Make QR payments to merchants</li>
                        <li>Transfer Value to other users, students, or merchants</li>
                        <li>No deductions on transfers within the platform</li>
                        <li>Used for daily transactions, business, and savings optimization</li>
                    </ul>
                </div>
            )
        },
        {
            title: "7. EMI & Repayment Terms",
            icon: <RefreshCw className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>EMI options: 1 to 7 days (Zero Interest)</li>
                        <li>Above 7 days: charges applicable as per selected plan</li>
                        <li>Flexible repayment as per user convenience</li>
                        <li>Timely repayment helps in credit profile improvement</li>
                    </ul>
                </div>
            )
        },
        {
            title: "8. User Categories",
            icon: <Users className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Open Score supports:</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                        {["Users (Normal Individuals)", "Students", "Merchants"].map(u => (
                            <span key={u} className="px-3 py-1 bg-[oklch(0.95_0.01_240)] rounded-full font-bold text-[oklch(0.4_0.02_240)]">{u}</span>
                        ))}
                    </div>
                    <p>All categories can:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Send and receive funds</li>
                        <li>Use vouchers</li>
                        <li>Participate in earning and reward systems</li>
                    </ul>
                </div>
            )
        },
        {
            title: "9. Rewards, Cashback & Earnings",
            icon: <Gift className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Open Score provides:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Cashback benefits</li>
                        <li>Discount coupons</li>
                        <li>Reward programs</li>
                        <li>Referral earnings (Share & Earn model)</li>
                    </ul>
                    <div className="bg-[oklch(0.98_0.03_70)] p-4 rounded-xl border border-[oklch(0.92_0.05_70)]">
                        <p className="text-[oklch(0.3_0.05_70)] font-semibold mb-1">Merchants Incentives:</p>
                        <p className="text-[oklch(0.4_0.05_70)] text-sm">Merchants may receive incentives (up to 2%) based on daily transactions and holding balance duration.</p>
                    </div>
                </div>
            )
        },
        {
            title: "10. Information We Collect",
            icon: <Database className="w-5 h-5" />,
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-2">10.1 Personal Information</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Name, Mobile Number, Email Address, Address, Date of Birth</li>
                            <li>Identity Documents (KYC)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-2">10.2 Financial & Usage Data</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Wallet transactions, Voucher usage and repayment</li>
                            <li>Transfer activity, Merchant interaction</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-2">10.3 Technical Data</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Device ID, IP Address, App usage behavior, Location data (if permitted)</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "11. How We Use Your Information",
            icon: <Zap className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Your information is used to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Provide and manage services, Verify identity and eligibility</li>
                        <li>Connect you with financial partners, Process transactions and vouchers</li>
                        <li>Improve platform experience, Prevent fraud and misuse</li>
                        <li>Offer personalized services and upgrade eligibility</li>
                    </ul>
                </div>
            )
        },
        {
            title: "12. Data Sharing",
            icon: <Share2 className="w-5 h-5" />,
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-1 leading-relaxed">12.1 Financial Partners</h4>
                        <p>To provide services and evaluate eligibility.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-1 leading-relaxed">12.2 Service Providers</h4>
                        <p>For KYC verification, Payment processing, and Technical infrastructure.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[oklch(0.2_0.02_240)] mb-1 leading-relaxed">12.3 Legal Authorities</h4>
                        <p>If required by law or to prevent fraud.</p>
                    </div>
                </div>
            )
        },
        {
            title: "13. User Eligibility & Verification",
            icon: <UserCheck className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Service is available only after complete verification (KYC)</li>
                        <li>Users must provide accurate and valid information</li>
                        <li>Access depends on income validation and internal risk checks</li>
                    </ul>
                </div>
            )
        },
        {
            title: "14. Credit Profile Impact",
            icon: <Zap className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Voucher usage may help improve creditworthiness</li>
                        <li>Open Score may track repayment behavior</li>
                        <li>Future loan eligibility depends on user performance and partner evaluation</li>
                    </ul>
                </div>
            )
        },
        {
            title: "15. Data Security",
            icon: <Lock className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>We use industry-standard measures: <strong>Data encryption, Secure servers, Access control systems</strong>.</p>
                    <p className="text-[oklch(0.5_0.02_240)] italic">However, users are responsible for maintaining account confidentiality.</p>
                </div>
            )
        },
        {
            title: "16. Cookies & Tracking",
            icon: <Cookie className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>We may use cookies and tracking tools to enhance performance, analyze user behavior, and personalize services.</p>
                </div>
            )
        },
        {
            title: "17. User Rights",
            icon: <Scale className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>Users have the right to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Access their data, Update or correct information</li>
                        <li>Request deletion (subject to compliance rules), Withdraw consent (may limit services)</li>
                    </ul>
                </div>
            )
        },
        {
            title: "18. Limitation of Liability",
            icon: <AlertTriangle className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Open Score acts only as a service facilitator</li>
                        <li>Financial decisions and approvals are managed by partner entities</li>
                        <li>Voucher service does not guarantee loan approval</li>
                    </ul>
                </div>
            )
        },
        {
            title: "19. Policy Updates",
            icon: <RefreshCw className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>We may update this policy periodically. Users will be notified through the app or official communication channels.</p>
                </div>
            )
        },
        {
            title: "20. Contact Information",
            icon: <Mail className="w-5 h-5" />,
            content: (
                <div className="space-y-2 bg-[oklch(0.98_0.01_240)] p-6 rounded-2xl border border-[oklch(0.95_0.01_240)]">
                    <p><strong>Company Name:</strong> Open Score</p>
                    <p><strong>Email:</strong> c.care@openscore.sbs</p>
                    <p><strong>Address:</strong> [Insert Address]</p>
                </div>
            )
        },
        {
            title: "21. Consent",
            icon: <UserCheck className="w-5 h-5" />,
            content: (
                <div className="space-y-4">
                    <p>By using Open Score, you confirm that:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>You understand that Open Score is a fintech service provider</li>
                        <li>You consent to data sharing with partner companies</li>
                        <li>You agree to verification, eligibility, and usage policies</li>
                        <li>You accept all terms related to vouchers, wallet, fees, and services</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[oklch(0.98_0.01_240)] selection:bg-[oklch(0.7_0.15_160)] selection:text-white pb-20">
            {/* Header / Hero */}
            <div className="bg-[oklch(0.2_0.02_240)] pt-12 pb-24 px-6 rounded-b-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[oklch(0.7_0.15_160/0.05)] rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[oklch(0.6_0.15_260/0.03)] rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl text-[oklch(0.8_0.02_240)] font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer mb-14 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end gap-7">
                        <div className="w-24 h-24 bg-gradient-to-br from-[oklch(0.7_0.15_160)] to-[oklch(0.5_0.15_160)] rounded-[2.5rem] flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 transform -rotate-3 hover:rotate-0 transition-all duration-700 ease-out">
                            <ShieldCheck className="text-white w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 py-1 px-3 bg-white/5 rounded-full border border-white/5 w-fit">
                                <Calendar className="w-3.5 h-3.5 text-[oklch(0.7_0.15_160)]" />
                                <p className="text-[oklch(0.6_0.02_240)] font-bold text-[10px] uppercase tracking-[0.3em]">Last Updated: 19th March 2026</p>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.9] flex flex-col">
                                <span>Privacy</span>
                                <span className="text-[oklch(0.7_0.15_160)]">Policy</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 -mt-12 relative z-20 max-w-4xl mx-auto">
                <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] border border-[oklch(0.95_0.01_240)] divide-y divide-[oklch(0.95_0.01_240)]">
                    {sections.map((section, idx) => (
                        <article key={idx} className="py-14 first:pt-0 last:pb-0 group">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-14 h-14 bg-[oklch(0.98_0.01_240)] group-hover:bg-[oklch(0.7_0.15_160/0.05)] rounded-[1.25rem] flex items-center justify-center text-[oklch(0.6_0.02_240)] group-hover:text-[oklch(0.7_0.15_160)] transition-all duration-500 shadow-sm border border-[oklch(0.95_0.01_240)] rotate-0 group-hover:rotate-6">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-[oklch(0.2_0.02_240)] tracking-tight">{section.title}</h2>
                            </div>
                            <div className="text-[16px] text-[oklch(0.4_0.02_240)] leading-relaxed font-medium md:pl-20">
                                {section.content}
                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom Card */}
                <div className="mt-16 p-1 bg-[oklch(0.2_0.02_240)] rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="p-10 md:p-16 rounded-[2.9rem] border border-white/5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[oklch(0.7_0.15_160/0.15)] rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-[oklch(0.7_0.15_160/0.25)] transition-all duration-1000"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="space-y-4 text-center md:text-left">
                                <h3 className="text-3xl font-black text-white leading-tight">Your data is safe <br/> with us.</h3>
                                <p className="text-[oklch(0.7_0.02_240)] text-base font-medium max-w-sm">We employ advanced encryption and security protocols to ensure your financial integrity.</p>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <button className="px-10 py-5 bg-[oklch(0.7_0.15_160)] hover:bg-[oklch(0.75_0.15_160)] text-[oklch(0.15_0.05_160)] rounded-[1.5rem] font-black text-sm transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-8px_rgba(0,0,0,0.4)] whitespace-nowrap">
                                    Download Full Agreement
                                </button>
                                <p className="text-[oklch(0.5_0.02_240)] text-[11px] text-center font-bold uppercase tracking-[0.2em]">Available in PDF format</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
