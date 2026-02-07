'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Zap, Clock, ShieldCheck, Lock, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { LOAN_PLANS, cn } from '@/lib/loanUtils';

export default function LoanList() {
    const router = useRouter();

    const [recentLoan, setRecentLoan] = useState<any>(null);
    const [kycLoan, setKycLoan] = useState<any>(null);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [cooldown, setCooldown] = useState({ active: false, daysRemaining: 0 });
    const [closedAmounts, setClosedAmounts] = useState<Set<number>>(new Set());

    const [unlockedAmount, setUnlockedAmount] = useState<number>(50000); // Default unlock up to 50k

    const fetchLoans = () => {
        apiFetch('/loans').then((data: any) => {
            const loans = Array.isArray(data) ? data : (data?.data || []);
            if (loans && loans.length > 0) {
                const filteredRecent = loans.filter((l: any) => l.status !== 'CANCELLED');
                const sorted = filteredRecent.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentLoan(sorted[0]);

                const pendingKyc = loans.find((l: any) => l.status === 'KYC_SENT');
                if (pendingKyc) setKycLoan(pendingKyc);

                const active = loans.find((l: any) => {
                    const statusMatch = ['PENDING', 'PROCEEDED', 'KYC_SENT', 'FORM_SUBMITTED', 'APPROVED', 'PREVIEW'].includes(l.status);
                    const isUnpaidDisbursed = l.status === 'DISBURSED' && Number(l.paid_amount || 0) < Number(l.amount);
                    return statusMatch || isUnpaidDisbursed;
                });
                setActiveLoan(active);

                // Track all CLOSED or fully paid DISBURSED loan amounts
                const closed = new Set<number>(
                    loans
                        .filter((l: any) => l.status === 'CLOSED' || (l.status === 'DISBURSED' && Number(l.paid_amount || 0) >= Number(l.amount)))
                        .map((l: any) => Number(l.amount))
                );
                setClosedAmounts(closed);

                // Legacy: Keep highest closed for backward compatibility if needed elsewhere
                // const highestClosed = Math.max(0, ...Array.from(closed));

                // Check for 15-day cooldown from last disbursement
                // We IGNORE cooldown if the loan is CLOSED (Paid) or fully repaid
                const lastDisbursed = sorted.find((l: any) => {
                    if (!l.disbursed_at) return false;
                    if (l.status === 'CLOSED') return false;
                    // If fully paid, it doesn't trigger a wait
                    if (l.status === 'DISBURSED' && Number(l.paid_amount || 0) >= Number(l.amount)) return false;
                    return true;
                });

                if (lastDisbursed) {
                    const disbursedDate = new Date(lastDisbursed.disbursed_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - disbursedDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days elapsed since disbursement

                    // If it's been less than 15 days, we restrict.
                    if (diffDays <= 15) {
                        setCooldown({ active: true, daysRemaining: 16 - diffDays });
                    }
                }
            }
        }).catch(err => {
            console.error("Failed to fetch recent loan activity", err);
        });
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    // State for Dynamic Plans
    const [loanPlans, setLoanPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch('/loan-plans', { cache: 'no-store' });
                // Map API data to UI format expected by this page
                // The page expects: amount, title, description, color
                const mapped = data.map((p: any) => {
                    const firstConfig = p.configurations && p.configurations.length > 0 ? p.configurations[0] : null;
                    return {
                        id: p.id,
                        amount: parseFloat(p.amount),
                        title: p.tag_text || 'Standard Loan',
                        description: firstConfig
                            ? `${firstConfig.tenure_days} Days • ${firstConfig.interest_rate}% Interest`
                            : 'Details Pending',
                        color: p.plan_color ? p.plan_color.replace('bg-', 'from-').replace('500', '400') + ' to-' + p.plan_color.replace('bg-', '').replace('500', '600') : 'from-blue-400 to-blue-600',
                        rawColor: p.plan_color,
                        is_locked: p.is_locked, // Pass through backend flag
                    };
                });
                const sorted = mapped.sort((a: any, b: any) => a.amount - b.amount);
                setLoanPlans(sorted);
            } catch (e) {
                console.error("Failed to fetch plans", e);
            }
        };
        fetchPlans();
    }, []);

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this loan application?")) return;
        try {
            await apiFetch(`/loans/${id}/cancel`, { method: 'POST' });
            alert("Application cancelled successfully.");
            setActiveLoan(null);
            fetchLoans();
        } catch (e) {
            alert("Failed to cancel application.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.push('/customer')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="mb-6">
                <h1 className="text-xl font-black text-slate-900 mb-1">Open Your Loan Score</h1>
                <p className="text-slate-500 font-medium text-xs">Choose Credit As Your Need</p>
            </div>

            {/* Recent Activity / History Highlight - MOVED TO TOP */}
            {recentLoan && (
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                        <button onClick={() => router.push('/customer/loan/history')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div
                        onClick={() => router.push('/customer/loan/history')}
                        className="bg-slate-900 rounded-xl p-3 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {['DISBURSED', 'CLOSED'].includes(recentLoan.status) ? (
                                        <Check className={recentLoan.status === 'CLOSED' ? "text-slate-400 w-4 h-4" : "text-emerald-400 w-4 h-4"} />
                                    ) : (
                                        <Clock className="text-blue-400 w-4 h-4" />
                                    )}
                                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                                        {recentLoan.status === 'CLOSED' ? 'Loan Successfully Repaid' :
                                            recentLoan.status === 'DISBURSED' ? 'Your loan score is open on this disbursal' :
                                                recentLoan.status === 'CANCELLED' ? 'Cancelled Application' :
                                                    recentLoan.status === 'REJECTED' ? 'Rejected Application' :
                                                        'Last Application'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black mb-1">₹ {recentLoan.amount.toLocaleString()} Loan</h3>
                                <p className="text-xs font-medium text-slate-400">
                                    Applied on {new Date(recentLoan.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} •
                                    <span className={`ml-1 ${recentLoan.status === 'CLOSED' || (recentLoan.status === 'DISBURSED' && Number(recentLoan.paid_amount || 0) >= Number(recentLoan.amount))
                                        ? 'text-slate-700 font-black'
                                        : recentLoan.status === 'DISBURSED' ? 'text-emerald-400' :
                                            recentLoan.status === 'CANCELLED' ? 'text-rose-400' :
                                                recentLoan.status === 'REJECTED' ? 'text-rose-600' :
                                                    'text-amber-400'
                                        }`}>
                                        {recentLoan.status === 'CLOSED' || (recentLoan.status === 'DISBURSED' && Number(recentLoan.paid_amount || 0) >= Number(recentLoan.amount)) ? 'Completed' :
                                            recentLoan.status === 'DISBURSED' ? 'Active' :
                                                recentLoan.status === 'CANCELLED' ? 'Cancelled' :
                                                    recentLoan.status === 'REJECTED' ? 'Rejected' :
                                                        'In Progress'}
                                    </span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Loan Alert - RESTRICTION */}
            {activeLoan && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
                                    <Clock size={20} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Loan In Progress</span>
                            </div>

                            <h2 className="text-xl font-black mb-2 leading-none">Application Active</h2>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 max-w-[280px]">
                                You have a loan of <span className="text-white font-bold">₹{activeLoan.amount.toLocaleString()}</span> currently in the <span className="text-emerald-400 font-bold uppercase">{activeLoan.status.replace('_', ' ')}</span> stage.
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push(`/customer/loan/status/${activeLoan.id}`)}
                                    className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Track Status
                                </button>
                                {activeLoan.status !== 'DISBURSED' && (
                                    <button
                                        onClick={() => handleCancel(activeLoan.id)}
                                        className="px-3 py-2.5 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KYC Alert/Import - Only show if not already showing the primary active loan block above */}
            {kycLoan && !activeLoan && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <Link href={`/customer/loan/status/${kycLoan.id}`}>
                        <div className="p-3 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center gap-3 active:scale-[0.98] transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-sm uppercase tracking-tight">Important Action Needed</h4>
                                <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest leading-tight mt-0.5 opacity-80">Please complete KYC for your existing Loan #{kycLoan.id} before applying for a new one.</p>
                            </div>
                            <ChevronRight className="ml-auto text-indigo-400" size={20} />
                        </div>
                    </Link>
                </div>
            )}

            {/* Virtual Credit */}
            <div className="mb-4">
                {loanPlans.filter((p: any) => p.amount === 10000).map((plan: any) => (
                    <div
                        key={plan.id}
                        onClick={() => {
                            if (activeLoan) {
                                alert("Application Under Process: You already have a loan application in progress. Please revoke (cancel) your current application if you wish to apply for a new one.");
                                return;
                            }
                            if (cooldown.active) {
                                alert(`Cool-down Period: You can apply for a new loan in ${cooldown.daysRemaining} days. We require a 15-day interval between loans.`);
                                return;
                            }
                            router.push(`/customer/loan/${plan.amount}?planId=${plan.id}`);
                        }}
                        className={cn(
                            "bg-[#0f1021] rounded-[2rem] p-4 relative overflow-hidden group cursor-pointer shadow-sm active:scale-[0.98] transition-all flex items-center justify-between mx-auto max-w-[95%]",
                            (activeLoan || cooldown.active) && "opacity-75 grayscale-[0.5]"
                        )}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="bg-indigo-600 p-1 rounded-md shadow-sm">
                                    <Zap size={10} className="text-white fill-white" />
                                </div>
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Priority Fast-Track</span>
                            </div>

                            <h2 className="text-lg font-black text-white leading-none">Virtual Credit</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-2xl font-black text-white tracking-tighter leading-none">₹10,000</span>
                                <div className="bg-white/5 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                                    <span className="text-[8px] font-black text-[#8e94f2] uppercase tracking-widest">Instant</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-white group-hover:bg-white group-hover:text-slate-900 transition-all shadow-sm">
                                {cooldown.active ? <Lock size={14} /> : <ChevronRight size={18} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loan Plans List Section */}
            <div>
                <div className="flex justify-between items-end mb-4 px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Term Loan</h3>
                    <span className="text-[10px] font-bold text-slate-400">Fixed Tenure</span>
                </div>
                <div className="flex flex-col gap-2.5 mb-8">
                    {loanPlans.filter((p: any) => p.amount > 10000).map((plan: any) => {
                        const isLocked = plan.is_locked;

                        const fullIndex = loanPlans.findIndex(lp => lp.id === plan.id);
                        const prevPlan = fullIndex > 0 ? loanPlans[fullIndex - 1] : null;

                        // Extract color name from plan config
                        const sourceColor = plan.rawColor || plan.color || '';
                        let colorName = 'blue';

                        if (sourceColor) {
                            const match = sourceColor.match(/(?:bg|from|text)-([a-z]+)-/);
                            if (match) {
                                colorName = match[1];
                            }
                        }

                        // Use switch for explicit class strings (Tailwind v4 compatibility)
                        let solidColorClass = 'bg-blue-600';
                        let badgeClasses = 'bg-blue-600 text-white';

                        switch (colorName) {
                            case 'slate': solidColorClass = 'bg-slate-600'; badgeClasses = 'bg-slate-600 text-white'; break;
                            case 'gray': solidColorClass = 'bg-gray-600'; badgeClasses = 'bg-gray-600 text-white'; break;
                            case 'zinc': solidColorClass = 'bg-zinc-600'; badgeClasses = 'bg-zinc-600 text-white'; break;
                            case 'neutral': solidColorClass = 'bg-neutral-600'; badgeClasses = 'bg-neutral-600 text-white'; break;
                            case 'stone': solidColorClass = 'bg-stone-600'; badgeClasses = 'bg-stone-600 text-white'; break;
                            case 'red': solidColorClass = 'bg-red-600'; badgeClasses = 'bg-red-600 text-white'; break;
                            case 'orange': solidColorClass = 'bg-orange-600'; badgeClasses = 'bg-orange-600 text-white'; break;
                            case 'amber': solidColorClass = 'bg-amber-600'; badgeClasses = 'bg-amber-600 text-white'; break;
                            case 'yellow': solidColorClass = 'bg-yellow-600'; badgeClasses = 'bg-yellow-600 text-white'; break;
                            case 'lime': solidColorClass = 'bg-lime-600'; badgeClasses = 'bg-lime-600 text-white'; break;
                            case 'green': solidColorClass = 'bg-green-600'; badgeClasses = 'bg-green-600 text-white'; break;
                            case 'emerald': solidColorClass = 'bg-emerald-600'; badgeClasses = 'bg-emerald-600 text-white'; break;
                            case 'teal': solidColorClass = 'bg-teal-600'; badgeClasses = 'bg-teal-600 text-white'; break;
                            case 'cyan': solidColorClass = 'bg-cyan-600'; badgeClasses = 'bg-cyan-600 text-white'; break;
                            case 'sky': solidColorClass = 'bg-sky-600'; badgeClasses = 'bg-sky-600 text-white'; break;
                            case 'blue': solidColorClass = 'bg-blue-600'; badgeClasses = 'bg-blue-600 text-white'; break;
                            case 'indigo': solidColorClass = 'bg-indigo-600'; badgeClasses = 'bg-indigo-600 text-white'; break;
                            case 'violet': solidColorClass = 'bg-violet-600'; badgeClasses = 'bg-violet-600 text-white'; break;
                            case 'purple': solidColorClass = 'bg-purple-600'; badgeClasses = 'bg-purple-600 text-white'; break;
                            case 'fuchsia': solidColorClass = 'bg-fuchsia-600'; badgeClasses = 'bg-fuchsia-600 text-white'; break;
                            case 'pink': solidColorClass = 'bg-pink-600'; badgeClasses = 'bg-pink-600 text-white'; break;
                            case 'rose': solidColorClass = 'bg-rose-600'; badgeClasses = 'bg-rose-600 text-white'; break;
                        }

                        return (
                            <div
                                key={plan.id}
                                onClick={() => {
                                    if (activeLoan) {
                                        alert("Application Under Process: You already have a loan application in progress. Please revoke (cancel) your current application if you wish to apply for a new one.");
                                        return;
                                    }
                                    if (cooldown.active) {
                                        alert(`Cool-down Period: You can apply for a new loan in ${cooldown.daysRemaining} days. We require a 15-day interval between loans.`);
                                        return;
                                    }
                                    if (isLocked) {
                                        alert(`Eligibility Required: You're currently not eligible for the ${plan.amount >= 100000 ? `${plan.amount / 100000} Lakh` : plan.amount} loan. Please build your eligibility by successfully repaying your previous ₹${prevPlan?.amount.toLocaleString()} loan.`);
                                        return;
                                    }
                                    router.push(`/customer/loan/${plan.amount}?planId=${plan.id}`);
                                }}
                                className={cn(
                                    "bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 relative overflow-hidden group cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between",
                                    "hover:border-blue-200"
                                )}
                            >
                                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${solidColorClass}`}></div>

                                <div className="flex items-center gap-4 flex-1 ml-2">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shrink-0 border-2 ${isLocked
                                        ? "bg-amber-50 border-amber-100 text-amber-500"
                                        : "bg-slate-50 border-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                                        }`}>
                                        {isLocked ? <Lock size={18} strokeWidth={2.5} /> : <Zap size={18} className="fill-current" />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit",
                                                badgeClasses
                                            )}>
                                                {plan.title.replace('Standard Loan', 'Growth Pro')}
                                            </span>
                                            {isLocked && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Locked</span>}
                                        </div>
                                        <h3 className="text-[18px] font-black text-slate-900 tracking-tighter leading-none">
                                            ₹{plan.amount.toLocaleString()}
                                        </h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">
                                            {isLocked ? 'Building Eligibility...' : plan.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Other Loans */}
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">More Options</h3>
                <div className="flex flex-col gap-3">
                    <div
                        onClick={() => router.push('/customer/loan/business')}
                        className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-2xl grayscale">💼</div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm">Business Loan</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">For heavy inventory</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Apply</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-100 opacity-60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl grayscale">🏠</div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm">Personal Loan</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">For personal use</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Upcoming</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
