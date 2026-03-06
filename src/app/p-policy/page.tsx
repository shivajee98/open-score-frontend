'use client';

import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-600/20 rounded-full blur-3xl -ml-12 -mb-12"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all mb-8"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Data Protection</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-8 relative z-20 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col gap-6 text-sm text-slate-700 leading-relaxed font-medium">
                    <p>
                        <strong>Last Updated: 19/02/2026</strong>
                    </p>
                    <p>
                        This Privacy Policy describes how <strong>Open Score</strong> (“Company”, “we”, “our”, or “us”) collects, uses, stores, processes, and protects user information when users access or use our mobile application, website, and related digital services.
                    </p>
                    <p>
                        Our platform provides a digital ecosystem where customers and merchants connect with each other for payments, transactions, shopping, rewards, and financial service eligibility.
                    </p>
                    <p>
                        By accessing or using our application or services, you agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">1. Information We Collect</h2>
                        <p>To provide our services effectively, we may collect the following categories of information.</p>

                        <h3 className="font-bold text-slate-800">1.1 Personal Information</h3>
                        <p>When users register or create an account, we may collect:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Full Name</li>
                            <li>Mobile Number</li>
                            <li>Email Address</li>
                            <li>Date of Birth</li>
                            <li>Address or location information</li>
                            <li>Profile information</li>
                            <li>Identification details (if required for verification)</li>
                        </ul>
                        <p>This information is used for account creation, user identification, and service delivery.</p>

                        <h3 className="font-bold text-slate-800">1.2 Financial and Transaction Information</h3>
                        <p>To operate our payment and digital wallet services, we may collect:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Payment transaction records</li>
                            <li>Wallet activity</li>
                            <li>Transfer details</li>
                            <li>Cashback and reward records</li>
                            <li>Invoice and merchant purchase data</li>
                            <li>Payment recipient information</li>
                        </ul>
                        <p>These records help maintain secure transactions and accurate reward calculations.</p>

                        <h3 className="font-bold text-slate-800">1.3 Device and Technical Information</h3>
                        <p>When users access the platform, we may automatically collect:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Device type and model</li>
                            <li>Operating system version</li>
                            <li>IP address</li>
                            <li>Device identifiers</li>
                            <li>Log data and usage analytics</li>
                        </ul>
                        <p>This information helps us maintain platform security and improve service performance.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">2. Platform Services</h2>
                        <p>Our platform provides various services to registered users, including but not limited to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Digital wallet services</li>
                            <li>Wallet-to-wallet transfers</li>
                            <li>Payment transfer services</li>
                            <li>Merchant payment systems</li>
                            <li>Online and offline shopping support</li>
                            <li>Cashback and reward programs</li>
                            <li>Value Card services</li>
                            <li>Savings wallet functionality</li>
                            <li>Bulk transfer services</li>
                        </ul>
                        <p>These services allow users and merchants to connect, transact, and grow business through a unified platform.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">3. Wallet and Payment Services</h2>
                        <p>Users may use the platform for digital payments and transfers.</p>

                        <h3 className="font-bold text-slate-800">3.1 Savings Wallet</h3>
                        <p>Users may store or maintain funds within their wallet for saving or future transactions within the platform ecosystem.</p>
                        <p>The wallet may be used for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Saving funds</li>
                            <li>Making payments</li>
                            <li>Shopping transactions</li>
                            <li>Merchant payments</li>
                            <li>Wallet transfers</li>
                        </ul>

                        <h3 className="font-bold text-slate-800">3.2 Wallet to Wallet Transfer</h3>
                        <p>Users may transfer funds from one wallet to another user wallet. No additional transfer charge may apply for wallet-to-wallet transfers within the platform. Users may receive promotional benefits such as cashback or reward incentives depending on active campaigns.</p>

                        <h3 className="font-bold text-slate-800">3.3 Bulk Transfer</h3>
                        <p>The platform may also support bulk transfer functionality, allowing users or merchants to transfer funds to multiple recipients through the system.</p>
                        <p>Bulk transfer features may be subject to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Platform limits</li>
                            <li>Security verification</li>
                            <li>Compliance policies</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">4. Shopping and Merchant Payments</h2>
                        <p>Users may use transferred funds or wallet balances for shopping and merchant payments. Our platform connects business owners and customers, allowing:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Online shopping transactions</li>
                            <li>Offline merchant purchases</li>
                            <li>Invoice-based payments</li>
                            <li>Cashback rewards</li>
                            <li>Discount coupons</li>
                        </ul>
                        <p>Every eligible transaction may provide promotional incentives such as cashback, discount offers, or reward benefits, depending on company programs.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">5. Cashback, Rewards and Promotional Programs</h2>
                        <p>Registered users may receive promotional benefits such as:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Cashback on eligible transactions</li>
                            <li>Discount coupons</li>
                            <li>Reward points</li>
                            <li>Promotional offers</li>
                            <li>Savings incentives</li>
                        </ul>
                        <p>These promotional programs are subject to company rules and may change without prior notice. The company reserves the right to modify, suspend, or terminate any reward or incentive program at its sole discretion.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">6. Loan Eligibility and Membership Policy</h2>
                        <p>Our platform may offer financial service eligibility programs, including loan access for certain users such as:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Students (minimum age requirements apply)</li>
                            <li>Individual users</li>
                            <li>Self-employed individuals</li>
                        </ul>
                        <h3 className="font-bold text-slate-800">Membership Policy</h3>
                        <p>Membership is not required for general platform usage, including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Receiving payments</li>
                            <li>Sending payments</li>
                            <li>Wallet transfers</li>
                            <li>Shopping transactions</li>
                        </ul>
                        <p>Membership is only required if a user chooses to apply for loan eligibility programs.</p>
                        <p>Membership plans may range from ₹800 to ₹4500, depending on the loan eligibility category or amount requested.</p>
                        <p>Membership fees are used for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Verification processes</li>
                            <li>Financial service eligibility review</li>
                            <li>Platform service management</li>
                        </ul>
                        <p>Loan approval remains subject to internal review, eligibility checks, and company policies. The company reserves the right to approve or reject loan requests without obligation to provide specific reasons.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">7. How We Use Your Information</h2>
                        <p>We may use collected information for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To create and manage user accounts</li>
                            <li>To enable wallet services and transactions</li>
                            <li>To process payments and transfers</li>
                            <li>To provide cashback and reward benefits</li>
                            <li>To facilitate merchant and customer connections</li>
                            <li>To process financial service eligibility requests</li>
                            <li>To maintain system security</li>
                            <li>To improve platform performance and features</li>
                            <li>To prevent fraud or misuse of services</li>
                            <li>To comply with legal and regulatory requirements</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">8. Information Sharing and Disclosure</h2>
                        <p>We respect user privacy and do not sell or rent personal data to third parties. Information may be shared only in the following situations:</p>

                        <h3 className="font-bold text-slate-800">Service Providers</h3>
                        <p>With trusted third-party partners including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Payment gateway providers</li>
                            <li>Technology infrastructure providers</li>
                            <li>SMS or email communication services</li>
                        </ul>

                        <h3 className="font-bold text-slate-800">Merchant Partners</h3>
                        <p>Limited information may be shared with merchants for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Transaction processing</li>
                            <li>Purchase confirmation</li>
                            <li>Customer service support</li>
                        </ul>

                        <h3 className="font-bold text-slate-800">Legal Compliance</h3>
                        <p>Information may be disclosed if required by:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Government authorities</li>
                            <li>Legal proceedings</li>
                            <li>Regulatory compliance</li>
                        </ul>

                        <h3 className="font-bold text-slate-800">Fraud Prevention</h3>
                        <p>Information may be used to detect or prevent:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Fraudulent transactions</li>
                            <li>Unauthorized platform usage</li>
                            <li>Security risks</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">9. Data Security</h2>
                        <p>We implement strong security practices to protect user information, including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Secure server systems</li>
                            <li>Encrypted data transmission</li>
                            <li>Access control mechanisms</li>
                            <li>Continuous system monitoring</li>
                        </ul>
                        <p>While we take reasonable steps to protect user information, no digital system can guarantee absolute security. Users are responsible for protecting their login credentials and account access.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">10. Data Retention</h2>
                        <p>User data may be retained for a period necessary to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Provide platform services</li>
                            <li>Maintain financial and transaction records</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes or security issues</li>
                        </ul>
                        <p>After the required retention period, data may be deleted or anonymized securely.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">11. User Rights</h2>
                        <p>Users may have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Access their personal data</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request account deletion (subject to regulatory obligations)</li>
                            <li>Contact support for privacy-related inquiries</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">12. Changes to Privacy Policy</h2>
                        <p>The Company reserves the right to update or modify this Privacy Policy at any time. Any changes will be published on the application or website with an updated revision date. Continued use of the platform indicates acceptance of the updated policy.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">13. Contact Information</h2>
                        <p>If you have any questions regarding this Privacy Policy, please contact us:</p>
                        <p>
                            <strong>Company Name:</strong> MSME SHAKTI ( OPEN SCORE )<br />
                            <strong>Email:</strong> c.care@msmeloan.sbs
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
