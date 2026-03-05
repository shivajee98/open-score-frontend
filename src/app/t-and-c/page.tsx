'use client';

import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/20 rounded-full blur-3xl -ml-12 -mb-12"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all mb-8"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/50">
                            <FileText className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Terms & Conditions</h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Legal Agreements</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-8 relative z-20 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col gap-6 text-sm text-slate-700 leading-relaxed font-medium">
                    <p>
                        <strong>Last Updated: [Date]</strong>
                    </p>
                    <p>
                        These Terms and Conditions (“Terms”) govern the access and use of <strong>[App Name]</strong> mobile application, website, and related services operated by <strong>[Company Name]</strong> (“Company”, “we”, “our”, or “us”).
                    </p>
                    <p>
                        By registering, accessing, or using our platform, you agree to comply with and be legally bound by these Terms and Conditions.
                    </p>
                    <p>
                        If you do not agree with any part of these Terms, you should not use our services.
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">1. Platform Overview</h2>
                        <p>The platform provides a <strong>digital ecosystem connecting users and merchants</strong>, allowing registered users to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Send and receive digital payments</li>
                            <li>Transfer funds through wallet services</li>
                            <li>Make merchant payments and purchases</li>
                            <li>Receive cashback, rewards, and promotional offers</li>
                            <li>Transfer funds individually or through bulk transfer</li>
                            <li>Access loan eligibility programs offered within the platform</li>
                        </ul>
                        <p>All services are accessible through the <strong>digital wallet system provided in the application.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">2. User Eligibility</h2>
                        <p>To use the platform, users must:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Register with valid personal details</li>
                            <li>Verify their mobile number or identity if required</li>
                            <li>Meet minimum age requirements as defined by the platform</li>
                        </ul>
                        <p>The company reserves the right to <strong>suspend or terminate accounts that provide false information.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">3. Digital Wallet Services</h2>
                        <p>The platform provides a <strong>digital wallet system</strong> for transactions and payments.</p>
                        <p>Users may use the wallet for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Sending and receiving payments</li>
                            <li>Wallet-to-wallet transfers</li>
                            <li>Merchant payments</li>
                            <li>Shopping through registered merchants</li>
                            <li>Bulk transfers</li>
                            <li>Saving wallet balances for future transactions</li>
                        </ul>
                        <p>Wallet transfers within the platform may <strong>not incur additional transfer charges</strong>, and certain transactions may be eligible for <strong>cashback or reward incentives</strong>.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">4. Wallet Loading and Transfers</h2>
                        <p>Users may add funds to their wallet and use them for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Personal transfers</li>
                            <li>Merchant payments</li>
                            <li>Bulk transfers to multiple users</li>
                        </ul>
                        <p>Wallet loading <strong>does not require any membership</strong>.</p>
                        <p>The company reserves the right to apply <strong>transaction limits, security verification, or temporary restrictions</strong> when necessary.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">5. Loan Service Policy</h2>
                        <p>The platform may provide access to <strong>loan eligibility programs</strong> for registered users.</p>
                        <p>Loan services may be available for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Students</li>
                            <li>Individual users</li>
                            <li>Self-employed users</li>
                            <li>Other eligible individuals</li>
                        </ul>
                        <p>Loan eligibility may be offered <strong>without mandatory salary proof, income proof, or CIBIL score requirement</strong>, depending on internal company policies.</p>
                        <p>Loan amounts may start from <strong>₹20,000 and may increase gradually</strong> based on successful repayment history and account activity.</p>
                        <p>Loan amounts above <strong>₹50,000</strong> may be subject to additional internal review.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">6. Loan Usage Restrictions</h2>
                        <p>Loan amounts provided through the platform are <strong>digital platform credits</strong> and must be used within the application ecosystem.</p>
                        <p>Users agree that after receiving the loan:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>The loan amount <strong>cannot be withdrawn as cash</strong></li>
                            <li>The loan amount <strong>cannot be transferred to a bank account</strong></li>
                            <li>The loan amount <strong>cannot be converted into physical cash</strong></li>
                        </ul>
                        <p>Loan funds can only be used for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Merchant payments</li>
                            <li>Shopping transactions</li>
                            <li>Wallet-to-wallet transfers within the platform</li>
                            <li>Approved digital transactions inside the application</li>
                        </ul>
                        <p>The loan operates as <strong>platform credit usable only within the application network.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">7. Membership Policy for Loan Services</h2>
                        <p>Membership is <strong>not required for general wallet usage</strong>, including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Receiving payments</li>
                            <li>Sending payments</li>
                            <li>Wallet transfers</li>
                            <li>Bulk transfers</li>
                            <li>Merchant payments</li>
                        </ul>
                        <p>However, <strong>membership is mandatory only when a user applies for a loan.</strong></p>
                        <p>Membership plans may vary depending on loan amount and may range between <strong>₹800 to ₹4500 or more depending on loan category.</strong></p>
                        <p>Membership charges may include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Loan processing charges</li>
                            <li>KYC verification fees</li>
                            <li>Platform service charges</li>
                            <li>Financial eligibility review charges</li>
                        </ul>
                        <p>Membership charges are <strong>non-refundable and non-transferable.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">8. Loan Guarantee Statement</h2>
                        <p>The platform may provide loan eligibility based on internal evaluation policies.</p>
                        <p>While the platform may promote <strong>high approval probability</strong>, final approval remains subject to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>User verification</li>
                            <li>Internal compliance policies</li>
                            <li>Platform security checks</li>
                        </ul>
                        <p>The company reserves full rights to <strong>approve, reject, or modify loan offers without prior notice.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">9. Cashback and Reward Programs</h2>
                        <p>Users and merchants may receive incentives such as:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Cashback rewards</li>
                            <li>Discount coupons</li>
                            <li>Promotional offers</li>
                            <li>Reward points</li>
                        </ul>
                        <p>These programs are <strong>promotional in nature and may change or be discontinued at any time</strong> at the sole discretion of the company.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">10. Transaction Monitoring and Fraud Prevention</h2>
                        <p>The company reserves the right to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Monitor transactions</li>
                            <li>Temporarily suspend accounts</li>
                            <li>Limit wallet transfers</li>
                            <li>Block suspicious activities</li>
                        </ul>
                        <p>Accounts involved in fraud, misuse, or illegal activity may be <strong>permanently terminated without notice.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">11. Account Suspension and Termination</h2>
                        <p>The company may suspend or terminate a user account if:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>False information is provided</li>
                            <li>Fraudulent transactions are detected</li>
                            <li>Platform misuse occurs</li>
                            <li>Terms and Conditions are violated</li>
                        </ul>
                        <p>Users may also request account closure subject to pending obligations.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">12. Limitation of Liability</h2>
                        <p>The company shall not be held liable for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Financial losses due to user negligence</li>
                            <li>Unauthorized access caused by compromised credentials</li>
                            <li>Service interruptions due to technical issues</li>
                            <li>Third-party payment service failures</li>
                        </ul>
                        <p>Users are responsible for maintaining the <strong>confidentiality of their login credentials.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">13. Changes to Terms</h2>
                        <p>The company reserves the right to <strong>update or modify these Terms and Conditions at any time</strong>. Users will be notified through the application or website where necessary. Continued use of the platform indicates acceptance of updated terms.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">14. Governing Law</h2>
                        <p>These Terms and Conditions shall be governed by and interpreted in accordance with the <strong>laws of India</strong>. Any disputes arising from the use of the platform shall be subject to the jurisdiction of the <strong>competent courts in India.</strong></p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 mt-4">15. Contact Information</h2>
                        <p>For any questions regarding these Terms and Conditions, users may contact:</p>
                        <p>
                            <strong>Company Name:</strong> [Company Name]<br />
                            <strong>Email:</strong> [Support Email]<br />
                            <strong>Address:</strong> [Company Address]
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
