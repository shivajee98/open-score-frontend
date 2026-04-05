'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info, Shield, Lock, Phone, CreditCard, Wallet, TrendingUp, Heart, CheckCircle2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function AboutUsPage() {
    const router = useRouter();

    const sections = [
        {
            title: "Our Foundation",
            icon: <Shield className="text-blue-500" />,
            content: "Open Score is backed by MSME Shakti Finance Company, a growing financial services organization that has been working towards financial inclusion, credit accessibility, small business enablement, and digital transaction adoption. This experience allows Open Score to deliver a platform that is both innovative and reliable.",
            list: ["Financial inclusion", "Credit accessibility", "Small business enablement", "Digital transaction adoption"]
        },
        {
            title: "Our Core Idea",
            icon: <Lock className="text-rose-500" />,
            content: "In today’s market, most financial and payment apps require bank account linking and depend on OTP-based approvals, exposing users to risks like fraud calls, unauthorized access, and data misuse. Open Score was built to eliminate these risks completely.",
        },
        {
            title: "Unique & Secure System",
            icon: <CheckCircle2 className="text-emerald-500" />,
            subtitle: "Market-Different Model",
            content: "We provide a 100% safe transaction environment with no bank account linking and no OTP-based transaction risk.",
            features: [
                {
                    label: "No Bank Account Linking",
                    desc: "You do NOT need to link your bank account. No direct bank integration for daily transactions ensures your details remain completely private."
                },
                {
                    label: "No OTP-Based Risk",
                    desc: "Open Score never asks for OTP for transactions. This ensures zero risk of OTP fraud or social engineering scams."
                },
                {
                    label: "No Third-Party Fraud Calls",
                    desc: "No company call will ever ask for OTP, passwords, or bank details. This eliminates fake calls and scam attempts."
                }
            ]
        },
        {
            title: "Advanced Security Architecture",
            icon: <Shield className="text-indigo-500" />,
            content: "Our system is designed with a closed-loop financial ecosystem where transactions happen within the Open Score environment, funds are managed through Elite Wallet, and payments are executed via a secure QR-based system.",
            benefits: ["No external banking exposure", "Controlled transaction environment", "Reduced fraud entry points", "High-level internal monitoring"]
        },
        {
            title: "Zero Hidden Charges Policy",
            icon: <Heart className="text-rose-400" />,
            content: "We believe in complete transparency. No hidden fees or unexpected deductions. All charges are clearly shown before confirmation, ensuring users always know what and why they are paying."
        },
        {
            title: "Unique Financial Model",
            icon: <CreditCard className="text-blue-600" />,
            subtitle: "Demand Credit Voucher System",
            content: "Our system allows users to access credit value ranging from 15,000 to 50,000 via a wallet-based ecosystem (Elite Wallet) with flexible short-term EMI options.",
            advantages: [
                "Initial access without strict dependency on CIBIL score",
                "Zero-interest for short tenure (1–7 days)",
                "Designed for daily needs and emergency usage",
                "Acts as a financial stepping stone for future credit eligibility"
            ]
        },
        {
            title: "Elite Wallet Ecosystem",
            icon: <Wallet className="text-purple-500" />,
            content: "Open Score operates on a closed-loop wallet system called the Elite Wallet, enabling instant fund availability, seamless QR-based transfer value for internal registered club members, and peer-to-peer transfers with no internal deductions.",
        },
        {
            title: "Earning & Growth System",
            icon: <TrendingUp className="text-emerald-600" />,
            content: "Open Score is also about earning and growth. Users and Merchants benefit from cashback, reward-based incentives, referral programs, and merchant-level earning benefits up to 2%.",
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 selection:bg-blue-100 selection:text-blue-900">
            {/* Premium Header */}
            <div className="bg-slate-900 pt-12 pb-24 px-6 relative overflow-hidden rounded-b-[3rem] shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="max-w-xl mx-auto relative z-10">
                    <BackButton className="mb-8 flex items-center gap-2 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </BackButton>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-white">
                            <Info size={30} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none mb-1">About Us</h1>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Open Score Protocol</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-6 -mt-12 space-y-8 relative z-20">
                {/* Hero Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-100 text-center">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-3">Redefining Financial Access with Security, Simplicity & Trust</h2>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed mb-6 italic">
                        "Open Score is a next-generation fintech service platform built to transform how people manage their daily financial needs — with a strong focus on security, transparency, and user control."
                    </p>
                    <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                {/* Sub-Hero Description */}
                <div className="p-2">
                    <p className="text-sm font-bold text-slate-600 leading-relaxed text-center opacity-80">
                        Designed to provide a safe, smart, and accessible financial ecosystem for Users, Students, and Merchants across India.
                    </p>
                </div>

                {/* Main Content Sections */}
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-inner border border-slate-100 shrink-0">
                                {section.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none mb-1">{section.title}</h3>
                                {section.subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.subtitle}</p>}
                            </div>
                        </div>

                        <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6">{section.content}</p>

                        {section.list && (
                            <div className="grid grid-cols-2 gap-3">
                                {section.list.map((item, i) => (
                                    <div key={i} className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {item}
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.benefits && (
                            <div className="space-y-2">
                                {section.benefits.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                        <CheckCircle2 size={14} className="text-indigo-500 shrink-0" /> {item}
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.features && (
                            <div className="space-y-4">
                                {section.features.map((f, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{f.label}</h4>
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.advantages && (
                            <div className="space-y-3">
                                {section.advantages.map((adv, i) => (
                                    <div key={i} className="p-3 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 text-xs font-bold text-blue-700">
                                        {adv}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Safety Promise */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-black tracking-tight uppercase mb-6 relative z-10">Customer-Centric Safety Promise</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {["Values are safeguarded", "End-to-end privacy", "Encrypted transfers", "Honest pricing"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-black text-blue-300 uppercase tracking-widest leading-tight">
                                <CheckCircle2 size={14} className="text-white shrink-0" /> {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Commitment */}
                <div className="text-center p-8 bg-white/50 rounded-[2.5rem] border border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-3">Our Commitment</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed px-4">
                        Protecting users from fraud, building trust through transparency, and delivering long-term value to every individual.
                    </p>
                    <div className="mt-8">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Experience Financial Freedom</p>
                    </div>
                </div>

                <div className="flex justify-center pb-10">
                    <BackButton className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Close About Us
                    </BackButton>
                </div>
            </main>
        </div>
    );
}
