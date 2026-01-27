
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Types ---

export type TenureMonths = 3 | 6;

export type PayoutFrequency = 'Daily' | '5 Days' | '7 Days' | '10 Days' | '15 Days' | '20 Days' | '25 Days' | 'Monthly' | 'Quarterly' | 'Half Yearly';

export interface PayoutOption {
    id: string;
    label: string; // e.g. "Daily"
    frequency: PayoutFrequency;
    fixedAmount?: number;      // Fixed EMI amount. If not provided, calculated from interest.
    interestRate?: number;     // Interest Rate % (Flat for the tenure). 0 means 0% interest.
    cashback?: number;         // Cashback amount per EMI
    val?: string; // e.g. "Best Value", "Recommended"
    isBestValue?: boolean;
}

export interface LoanPlan {
    amount: number;
    title: string;
    description: string;
    tenures: TenureMonths[];
    payoutOptions: (tenure: TenureMonths) => PayoutOption[];
    color: string;
}

// --- Configuration ---

export const LOAN_PLANS: Record<number, LoanPlan> = {
    20000: {
        amount: 20000,
        title: "Starter Boost",
        description: "Earn cashback on repayments",
        tenures: [3],
        color: "from-orange-500 to-red-600",
        payoutOptions: (tenure) => [
            // 20k Loan. 3 Months.
            // Screenshot: Daily -> Cashback ₹25
            // 7 Days -> Cashback ₹30
            // 10 Days -> Cashback ₹40
            // Monthly -> Cashback ₹50
            // Assumption: Repayment is purely principal / count? Or with some interest? 
            // The prompt says "EMI & Cashback". Usually if it's a "Cashback" focus, the interest might be standard or 0.
            // Let's assume a standard flat fee/interest is baked into the EMI, or it's 0% interest + Cashback.
            // Given "micro-loans" usually have high interest, but "Cashback" suggests an incentive.
            // Let's assume 0% interest for now to keep it simple, or a small fee?
            // "Daily EMI -> Cashback Earn ₹25". 
            // If I Pay 20000/90 = 222. Cashback 25. Net 197.
            // Let's set interestRate to 0 for these for now, or use fixedAmount if we want specific numbers.
            // Since no interest rate is shown in the screenshot for 20k (unlike 50k), I will assume 0% Interest (Principal Only) but with Cashback.

            { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, cashback: 25, val: 'Daily Savings' },
            { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, cashback: 30 },
            { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 0, cashback: 40 },
            { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 0, cashback: 50, isBestValue: true, val: 'Max Cashback' },
        ]
    },
    30000: {
        amount: 30000,
        title: "Micro Start",
        description: "Quick funding for small needs",
        tenures: [3],
        color: "from-emerald-500 to-teal-600",
        payoutOptions: (tenure) => [
            // Previous config, keeping as fallback or updated if needed. 
            // User didn't provide screenshot for 30k this time, but previously we set it.
            // Let's keep the one we built.
            { id: 'daily', label: 'Daily', frequency: 'Daily', fixedAmount: 400, val: 'Recommended' },
            { id: '7days', label: 'Every 7 Days', frequency: '7 Days', fixedAmount: 3000 },
            { id: '10days', label: 'Every 10 Days', frequency: '10 Days', fixedAmount: 4000 },
            { id: 'monthly', label: 'Monthly', frequency: 'Monthly', fixedAmount: 12050, isBestValue: true, val: 'Best Value' },
        ]
    },
    50000: {
        amount: 50000,
        title: "Growth Pro",
        description: "Expansion capital",
        tenures: [3, 6],
        color: "from-blue-600 to-indigo-700",
        payoutOptions: (tenure) => {
            if (tenure === 3) {
                // Screenshot 2: 50k, 3 Months
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, val: '0% Interest' },
                    { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, val: '0% Interest' },
                    { id: '5days', label: 'Every 5 Days', frequency: '5 Days', interestRate: 3 }, // Screenshot order mixed, I'll order by frequency logic
                    { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 2 },
                    { id: '20days', label: 'Every 20 Days', frequency: '20 Days', interestRate: 4 },
                    { id: '25days', label: 'Every 25 Days', frequency: '25 Days', interestRate: 5 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 6 },
                    { id: 'quarterly', label: 'Quarterly', frequency: 'Quarterly', interestRate: 16 },
                ];
            } else {
                // Screenshot 3: 50k, 6 Months
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, val: '0% Interest' },
                    { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0 },
                    { id: '5days', label: 'Every 5 Days', frequency: '5 Days', interestRate: 4 },
                    { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 3 },
                    { id: '20days', label: 'Every 20 Days', frequency: '20 Days', interestRate: 5 },
                    { id: '25days', label: 'Every 25 Days', frequency: '25 Days', interestRate: 7 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 14 },
                    { id: 'halfyearly', label: 'Half Yearly', frequency: 'Half Yearly', interestRate: 17 },
                ];
            }
        }
    }
};

// --- Utilities ---

export function calculateRepayment(amount: number, tenureMonths: number, option: PayoutOption): { total: number, breakdown: string, count: number, emi: number } {
    let count = 0;
    const days = tenureMonths * 30;

    switch (option.frequency) {
        case 'Daily': count = days; break;
        case '5 Days': count = Math.floor(days / 5); break;
        case '7 Days': count = Math.floor(days / 7); break;
        case '10 Days': count = Math.floor(days / 10); break;
        case '15 Days': count = Math.floor(days / 15); break;
        case '20 Days': count = Math.floor(days / 20); break;
        case '25 Days': count = Math.floor(days / 25); break;
        case 'Monthly': count = tenureMonths; break;
        case 'Quarterly': count = Math.floor(tenureMonths / 3); break;
        case 'Half Yearly': count = Math.floor(tenureMonths / 6); break;
        default: count = 1;
    }

    if (option.fixedAmount) {
        // Legacy/Fixed mode
        const total = count * option.fixedAmount;
        return {
            total,
            breakdown: `₹${option.fixedAmount.toLocaleString()} x ${count}`,
            count,
            emi: option.fixedAmount
        };
    }

    if (option.interestRate !== undefined) {
        // Interest Rate Calculation
        // Total = Principal + (Principal * Rate / 100)
        const principal = amount;
        const totalInterest = (principal * option.interestRate) / 100;
        const total = principal + totalInterest;
        const emi = Math.ceil(total / count);

        let breakdownText = "";
        if (option.interestRate === 0) {
            breakdownText = `0% Interest • ₹${emi.toLocaleString()}/payout`;
        } else {
            breakdownText = `${option.interestRate}% Interest • ₹${emi.toLocaleString()}/payout`;
        }

        if (option.cashback) {
            breakdownText = `Returns ₹${option.cashback} Cashback • ₹${emi.toLocaleString()}/payout`;
        }

        return {
            total,
            breakdown: breakdownText,
            count,
            emi
        };
    }

    return { total: 0, breakdown: '-', count: 0, emi: 0 };
}

// Deprecated: Alias for backward compatibility during refactor if needed
export const calculateEarnings = calculateRepayment;


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
