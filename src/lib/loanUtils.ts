
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
            { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, cashback: 25, val: 'Daily Savings' },
            { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, cashback: 30 },
            { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 0, cashback: 40 },
            { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 0, cashback: 50, isBestValue: true, val: 'Max Cashback' },
        ]
    },
    30000: {
        amount: 30000,
        title: "Micro Start",
        description: "Interest Free with High Cashback",
        tenures: [3],
        color: "from-emerald-500 to-teal-600",
        payoutOptions: (tenure) => [
            // 30K Loan. 3 Month. Interest Free 0%. Repayment 30k.
            { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, cashback: 25, val: 'Big Cashback', isBestValue: true },
            { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, cashback: 30, val: 'Recommended' },
            { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 0, cashback: 40, val: 'Recommended' },
            { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 0, cashback: 50, val: 'Cashback' },
        ]
    },
    50000: {
        amount: 50000,
        title: "Growth Pro",
        description: "Flexible Interest & Cashback Options",
        tenures: [3, 6],
        color: "from-blue-600 to-indigo-700",
        payoutOptions: (tenure) => {
            if (tenure === 3) {
                // 50K Loan - 3 Month
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, cashback: 10, val: '0% Interest' },
                    { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, cashback: 20 },
                    { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 2, cashback: 30 },
                    { id: '15days', label: 'Every 15 Days', frequency: '15 Days', interestRate: 3, cashback: 40 },
                    { id: '20days', label: 'Every 20 Days', frequency: '20 Days', interestRate: 4 },
                    { id: '25days', label: 'Every 25 Days', frequency: '25 Days', interestRate: 5 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 6 },
                    { id: 'quarterly', label: 'Quarterly', frequency: 'Quarterly', interestRate: 10, isBestValue: true },
                ];
            } else {
                // 50K Loan - 6 Month
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', interestRate: 0, cashback: 10, val: 'Long Term 0%' },
                    { id: '7days', label: 'Every 7 Days', frequency: '7 Days', interestRate: 0, cashback: 20 },
                    { id: '10days', label: 'Every 10 Days', frequency: '10 Days', interestRate: 3, cashback: 30 },
                    { id: '15days', label: 'Every 15 Days', frequency: '15 Days', interestRate: 4, cashback: 30 },
                    { id: '20days', label: 'Every 20 Days', frequency: '20 Days', interestRate: 5 },
                    { id: '25days', label: 'Every 25 Days', frequency: '25 Days', interestRate: 7 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', interestRate: 14, isBestValue: true },
                    { id: 'halfyearly', label: 'Half Yearly', frequency: 'Half Yearly', interestRate: 16 },
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

        // Build Breakdown String
        let parts = [];

        // Interest Part
        if (option.interestRate === 0) {
            parts.push("0% Interest");
        } else {
            parts.push(`${option.interestRate}% Interest`);
        }

        // Cashback Part
        if (option.cashback) {
            parts.push(`Earn ₹${option.cashback} Cashback`);
        } else {
            // Only add per/payout if no cashback or explicitly needed? 
            // The prompt implies straightforward display.
            // Let's keep it simple.
        }

        // Combine: "0% Interest • Earn ₹25 Cashback"
        // Or just "Earn ₹25 Cashback" if 0%? 
        // User prompt for 50k says: "Daily 0% cashback Rs 10". So show both.

        const breakdownText = `${parts.join(" • ")} • ₹${emi.toLocaleString()} / repayment`;

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
