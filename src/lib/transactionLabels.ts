/**
 * Centralized transaction label resolver (frontend).
 *
 * Mirrors the backend TransactionLabels helper: given a transaction
 * object from the API, returns the single human-readable title string
 * that should appear in the history list.
 */

export function getTransactionLabel(tx: any): string {
    const desc = (tx.description || '').toLowerCase();
    const srcType = tx.source_type || '';

    // ── Description-based overrides ────────────────────────────
    if (desc.includes('welcome bonus')) return 'Welcome Bonus';
    if (desc.includes('referral') || desc.includes('earning')) return 'Earning';
    if (desc.includes('cashback')) return 'Cashback Reward';

    // ── Loan Repayment / EMI ───────────────────────────────────
    if (srcType === 'LOAN_REPAYMENT') {
        if (desc.includes('platform fee') || desc.includes('emi #0')) return 'Platform Fee';
        const emiMatch = desc.match(/emi\s*#?(\d+)/i);
        if (emiMatch) return `EMI #${emiMatch[1]} Payment`;
        return 'EMI Payment';
    }

    // ── Platform Fee ───────────────────────────────────────────
    if (srcType === 'PLATFORM_FEE') return 'Platform Fee';

    // ── Maintenance Charge ─────────────────────────────────────
    // ── Maintenance Charge ─────────────────────────────────────
    if (srcType === 'MAINTENANCE_CHARGE') {
        const match = (tx.description || '').match(/^\[(.*?)\]/);
        if (match) return match[1];
        return 'Maintenance Charge';
    }

    // ── Virtual Credit Disbursal ───────────────────────────────
    if (desc.includes('disbursement') || (srcType === 'LOAN' && tx.type === 'CREDIT')) {
        return 'Virtual Credit Disbursed';
    }

    // ── Wallet Recharge ────────────────────────────────────────
    if (
        desc.includes('recharge') ||
        srcType === 'WALLET_TOPUP' ||
        srcType === 'WALLET_RECHARGE'
    ) {
        return 'Wallet Recharge';
    }

    // ── Bulk Pay (Bank Transfer) ───────────────────────────────
    if (srcType === 'BANK_TRANSFER') return 'Bulk Paid';
    if (srcType === 'BANK_TRANSFER_REFUND') return 'Reverted';

    if (srcType === 'TEAM_EARNING_TRANSFER') {
        const match = tx.description?.match(/^\[(.*?)\]/);
        if (match) return match[1];
        return 'Self Transfer';
    }

    // ── System / Platform origin ───────────────────────────────
    if (
        tx.counterparty_vpa === 'System' ||
        tx.counterparty_vpa === 'Open Score'
    ) {
        return tx.type === 'CREDIT'
            ? (tx.counterparty_name || 'Open Score')
            : 'Withdrawal';
    }

    // ── Peer-to-peer ───────────────────────────────────────────
    return tx.type === 'CREDIT'
        ? `Received from ${tx.counterparty_name}`
        : `Paid to ${tx.counterparty_name}`;
}

/**
 * Returns the subtitle / VPA line shown below the title.
 */
export function getTransactionSubtitle(tx: any): string {
    const srcType = tx.source_type || '';
    
    if (tx.counterparty_vpa === 'Open Score' || tx.counterparty_vpa === 'System') {
        if (srcType === 'MAINTENANCE_CHARGE') return 'Administrative';
        if (srcType === 'PLATFORM_FEE') return 'System Fee';
        
        if (tx.type === 'DEBIT') return 'Withdrawal';
        return 'Increment Value';
    }
    
    return tx.counterparty_vpa || 'Wallet Transfer';
}
