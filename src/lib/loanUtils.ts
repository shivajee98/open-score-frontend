
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Types ---

export type TenureMonths = 3 | 6;

export type PayoutFrequency = 'Daily' | '7 Days' | '10 Days' | '15 Days' | '20 Days' | '25 Days' | 'Monthly' | 'Quarterly' | 'Half Yearly';

export interface PayoutOption {
    id: string;
    label: string; // e.g. "Daily"
    frequency: PayoutFrequency;
    returnPercentage?: number; // Deprecated in favor of calculation logic, but kept for type compat if needed
    fixedAmount?: number;      // Fixed EMI amount
    isBestValue?: boolean;
    val?: string; // e.g. "Best Value", "Recommended"
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
    30000: {
        amount: 30000,
        title: "Micro Start",
        description: "Quick funding for small needs",
        tenures: [3],
        color: "from-emerald-500 to-teal-600",
        payoutOptions: (tenure) => [
            // Loan: 30k. Tenure: 3 months (~90 days).
            // Total Repayment Target: ~36,000 (20% flat interest)
            // Daily: 36000 / 90 = 400
            // Weekly: 36000 / 12 = 3000
            // 10 Days: 36000 / 9 = 4000
            // Monthly: 36000 / 3 = 12000
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
            // Loan: 50k. 
            // 3 Months Target: ~60k.
            // 6 Months Target: ~70k.
            if (tenure === 3) {
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', fixedAmount: 670, val: 'Fast Track' },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', fixedAmount: 20000, isBestValue: true, val: 'Best Value' },
                ];
            } else {
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', fixedAmount: 390 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', fixedAmount: 11800, isBestValue: true },
                    { id: 'halfyearly', label: 'Half Yearly', frequency: 'Half Yearly', fixedAmount: 70000 }, // One shot?
                ];
            }
        }
    }
};

// --- Utilities ---

export function calculateRepayment(amount: number, tenureMonths: number, option: PayoutOption): { total: number, breakdown: string, count: number } {
    let count = 0;
    const days = tenureMonths * 30;

    switch (option.frequency) {
        case 'Daily': count = days; break;
        case '7 Days': count = Math.floor(days / 7); break; // ~12
        case '10 Days': count = Math.floor(days / 10); break; // 9
        case '15 Days': count = Math.floor(days / 15); break; // 6
        case 'Monthly': count = tenureMonths; break; // 3
        case 'Quarterly': count = Math.floor(tenureMonths / 3); break;
        case 'Half Yearly': count = Math.floor(tenureMonths / 6); break;
        default: count = 1;
    }

    if (option.fixedAmount) {
        const total = count * option.fixedAmount;
        return {
            total,
            breakdown: `₹${option.fixedAmount.toLocaleString()} x ${count}`,
            count
        };
    }

    // Fallback if no fixed amount (shouldn't happen with new config)
    return { total: 0, breakdown: '-', count: 0 };
}

// Deprecated: Alias for backward compatibility during refactor if needed
export const calculateEarnings = calculateRepayment;


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
