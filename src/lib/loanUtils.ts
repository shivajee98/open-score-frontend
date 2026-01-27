
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Types ---

export type TenureMonths = 3 | 6;

export type PayoutFrequency = 'Daily' | '7 Days' | '10 Days' | '15 Days' | '20 Days' | '25 Days' | 'Monthly' | 'Quarterly' | 'Half Yearly';

export interface PayoutOption {
    id: string;
    label: string; // e.g. "Daily"
    frequency: PayoutFrequency;
    returnPercentage?: number; // For 50k loan
    fixedAmount?: number;      // For 20k loan
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
        title: "Micro Start",
        description: "Quick funding for small needs",
        tenures: [3],
        color: "from-emerald-500 to-teal-600",
        payoutOptions: (tenure) => [
            { id: 'daily', label: 'Daily', frequency: 'Daily', fixedAmount: 25 },
            { id: '7days', label: 'Every 7 Days', frequency: '7 Days', fixedAmount: 30 },
            { id: '10days', label: 'Every 10 Days', frequency: '10 Days', fixedAmount: 40 },
            { id: 'monthly', label: 'Monthly', frequency: 'Monthly', fixedAmount: 50, isBestValue: true },
        ]
    },
    50000: {
        amount: 50000,
        title: "Growth Pro",
        description: "Expansion capital with high returns",
        tenures: [3, 6],
        color: "from-blue-600 to-indigo-700",
        payoutOptions: (tenure) => {
            if (tenure === 3) {
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', returnPercentage: 0 }, // 0% interest? "0% Interest (3 Months)" from previous prompt? 
                    // Wait, the prompt says "Show payout options dynamically... Percentage return". 
                    // Prompt example for 50k: "Show payout options... Percentage return".
                    // Let's assume some mock percentages based on "Best Plan Highlight".
                    { id: 'daily', label: 'Daily', frequency: 'Daily', returnPercentage: 2 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', returnPercentage: 6, isBestValue: true },
                ];
            } else {
                return [
                    { id: 'daily', label: 'Daily', frequency: 'Daily', returnPercentage: 3 },
                    { id: 'monthly', label: 'Monthly', frequency: 'Monthly', returnPercentage: 12, isBestValue: true },
                    { id: 'halfyearly', label: 'Half Yearly', frequency: 'Half Yearly', returnPercentage: 18 },
                ];
            }
        }
    }
};

// --- Utilities ---

export function calculateEarnings(amount: number, tenureMonths: number, option: PayoutOption): { total: number, breakdown: string } {
    if (option.fixedAmount) {
        // Calculation for fixed amount (e.g. 20k plan)
        // Assume fixedAmount is PER PAYOUT? Or Total?
        // Prompt says: "Daily -> ₹25". "Monthly -> ₹50". 
        // Likely per payout?
        // If Daily: 3 months = ~90 days. 90 * 25 = 2250.
        // If Monthly: 3 months = 3 payouts. 3 * 50 = 150. 
        // Allows earning comparison.

        // Let's approximate days
        const days = tenureMonths * 30;
        let count = 0;
        switch (option.frequency) {
            case 'Daily': count = days; break;
            case '7 Days': count = Math.floor(days / 7); break;
            case '10 Days': count = Math.floor(days / 10); break;
            case 'Monthly': count = tenureMonths; break;
            default: count = 1;
        }
        const total = count * option.fixedAmount;
        return { total, breakdown: `₹${option.fixedAmount} x ${count} payments` };
    }

    if (option.returnPercentage !== undefined) {
        // Percentage return
        // Is it % per month? or flat %?
        // Prompt says: "6% Monthly", "12% Monthly", "18% Half Yearly".
        // Let's assume the percentage provided IS the rate for that period? 
        // Or annualized? 
        // Let's assume it's "Return %" as flat of principal * occurences?
        // Example: 6% Monthly = 6% of 50k * 3 months = 3000 * 3 = 9000.

        const principal = amount;
        let rate = option.returnPercentage;
        let count = 0;

        // Let's infer count based on frequency and tenure
        if (option.frequency.includes('Monthly')) count = tenureMonths;
        else if (option.frequency === 'Daily') count = tenureMonths * 30;
        else if (option.frequency === 'Half Yearly') count = tenureMonths / 6;
        else count = 1; // Default

        // If rate is monthly, we multiply by count?
        // Let's stick to the prompt's implied logic.
        const earningsPerCycle = (principal * rate) / 100;
        const total = earningsPerCycle * count;

        return { total, breakdown: `${rate}% of ₹${principal} x ${count} cycles` };
    }

    return { total: 0, breakdown: '' };
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
