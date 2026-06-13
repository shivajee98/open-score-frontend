'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, API_BASE_URL } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, ArrowRightLeft, Plus, X, Download, Users, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';

interface Recipient {
    recipient_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    amount: string;
}

const emptyRecipient: Recipient = { recipient_name: '', bank_name: '', account_number: '', ifsc_code: '', amount: '' };

export default function TransferPage() {
    const { data: userData } = useApi('/auth/me');
    const { data: walletData } = useApi('/wallet/balance');
    const router = useRouter();
    const isAuthenticated = useAuthProtection();
    const fileRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'choose' | 'manual' | 'bulk'>('choose');
    const [recipients, setRecipients] = useState<Recipient[]>([{ ...emptyRecipient }]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastBatchId, setLastBatchId] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);

    // Bulk upload state
    const [bulkRecipients, setBulkRecipients] = useState<Recipient[]>([]);
    const [bulkFileName, setBulkFileName] = useState('');

    const balance = walletData?.balance || 0;

    const addRecipient = () => setRecipients(prev => [...prev, { ...emptyRecipient }]);

    const removeRecipient = (idx: number) => {
        if (recipients.length === 1) return;
        setRecipients(prev => prev.filter((_, i) => i !== idx));
    };

    const updateRecipient = (idx: number, field: keyof Recipient, value: string) => {
        setRecipients(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const calcTotal = (list: Recipient[]) => list.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const handleSubmit = async (recipientList: Recipient[]) => {
        for (let i = 0; i < recipientList.length; i++) {
            const r = recipientList[i];
            if (!r.recipient_name || !r.bank_name || !r.account_number || !r.ifsc_code || !r.amount) {
                toast.error(`Please fill all fields for recipient ${i + 1}`);
                return;
            }
            if (parseFloat(r.amount) <= 0) {
                toast.error(`Amount must be greater than 0 for recipient ${i + 1}`);
                return;
            }
        }

        const total = calcTotal(recipientList);
        if (total > balance) {
            toast.error(`Insufficient balance. Need ${total.toLocaleString('en-IN')} but have ${balance.toLocaleString('en-IN')}`);
            return;
        }

        setSaving(true);
        try {
            const payload = recipientList.map(r => ({
                recipient_name: r.recipient_name,
                bank_name: r.bank_name,
                account_number: r.account_number,
                ifsc_code: r.ifsc_code,
                amount: parseFloat(r.amount),
            }));

            const result = await apiFetch('/merchant/bank-transfers', {
                method: 'POST',
                body: JSON.stringify({ recipients: payload }),
            });

            setLastBatchId(result.batch_id);
            setTotalAmount(result.total_amount);
            setSuccess(true);
            toast.success(`${result.count} recipient(s) submitted! ${result.total_amount} deducted.`);
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit transfer');
        } finally {
            setSaving(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const res = await fetch(`${API_BASE_URL}/merchant/bank-transfers/export?batch_id=${lastBatchId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'text/csv' },
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `bank_transfers_${lastBatchId}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('File downloaded!');
        } catch (e: any) {
            toast.error(e.message || 'Export failed');
        }
    };

    const downloadTemplate = () => {
        const csv = 'Recipient Name,Bank Name,Account Number,IFSC Code,Amount\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'transfer_template.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Template downloaded!');
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBulkFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim());

            // Skip header row
            const parsed: Recipient[] = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length >= 5 && cols[0]) {
                    parsed.push({
                        recipient_name: cols[0],
                        bank_name: cols[1],
                        account_number: cols[2],
                        ifsc_code: cols[3].toUpperCase(),
                        amount: cols[4],
                    });
                }
            }

            if (parsed.length === 0) {
                toast.error('No valid rows found in the file. Check the format.');
                return;
            }

            setBulkRecipients(parsed);
            toast.success(`${parsed.length} recipients parsed from file!`);
        };
        reader.readAsText(file);
    };

    if (!isAuthenticated || !userData) return null;

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl max-w-md w-full">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Request Under Process</h2>
                    <p className="text-xs font-bold text-slate-400 mb-1">Batch: <span className="font-mono text-slate-600">{lastBatchId}</span></p>
                    <p className="text-sm font-bold text-slate-500 mb-2">{totalAmount.toLocaleString('en-IN')} deducted from wallet</p>
                    <p className="text-xs font-medium text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
                        Your transfer request has been submitted and is under review. You will be notified once the OpenScore team approves or rejects it.
                    </p>

                    <button
                        onClick={handleExportExcel}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 mb-3"
                    >
                        <Download size={18} />
                        Export as Excel
                    </button>

                    <button
                        onClick={() => router.push('/customer/payout')}
                        className="w-full py-3 mt-2 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Back to Cred-out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-safe font-sans">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => mode === 'choose' ? router.push('/customer/payout') : setMode('choose')} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 justify-end">
                            <ArrowRightLeft className="w-5 h-5 text-violet-600" />
                            Bank Transfer
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Balance: {balance.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {userData?.has_pending_kyc_reupload ? (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
                        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto shadow-inner ring-8 ring-rose-50/50">
                            <Lock size={48} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic text-rose-600">Transfer Restricted</h3>
                            <p className="text-slate-500 font-bold text-base leading-relaxed px-4">
                                Your bank transfer access is temporarily locked due to a pending KYC document correction request. 
                                <br/><span className="text-rose-500/80 text-sm mt-2 block italic">Please update your documents to restore full financial access.</span>
                            </p>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => router.push('/customer/loan')}
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group mx-auto"
                            >
                                Resolve KYC Issue <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Choose Mode */}
                        {mode === 'choose' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('manual')}
                            className="w-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all text-left group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                    <Users className="w-7 h-7 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Enter Manually</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Add recipients one by one with details</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('bulk')}
                            className="w-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Upload in Bulk</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Upload a CSV file with all recipients</p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Manual Entry Mode */}
                {mode === 'manual' && (
                    <div className="space-y-4">
                        {recipients.map((r, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <Users className="w-3 h-3 inline mr-1" />
                                        Recipient {idx + 1}
                                    </span>
                                    {recipients.length > 1 && (
                                        <button onClick={() => removeRecipient(idx)} className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <input type="text" placeholder="Recipient Name" value={r.recipient_name}
                                    onChange={(e) => updateRecipient(idx, 'recipient_name', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-violet-200 outline-none" />
                                <input type="text" placeholder="Bank Name" value={r.bank_name}
                                    onChange={(e) => updateRecipient(idx, 'bank_name', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-violet-200 outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Account Number" value={r.account_number}
                                        onChange={(e) => updateRecipient(idx, 'account_number', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-violet-200 outline-none font-mono" />
                                    <input type="text" placeholder="IFSC Code" value={r.ifsc_code}
                                        onChange={(e) => updateRecipient(idx, 'ifsc_code', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-violet-200 outline-none font-mono uppercase" />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300"></span>
                                    <input type="number" placeholder="Amount" value={r.amount}
                                        onChange={(e) => updateRecipient(idx, 'amount', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 pl-8 pr-4 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-violet-200 outline-none" />
                                </div>
                            </div>
                        ))}

                        <button onClick={addRecipient}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-violet-300 hover:text-violet-500 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Another Recipient
                        </button>

                        {/* Total */}
                        <div className="bg-violet-50 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-xs font-black text-violet-600 uppercase tracking-widest">Total Amount</span>
                            <span className="text-lg font-black text-violet-900">{calcTotal(recipients).toLocaleString('en-IN')}</span>
                        </div>

                        <button onClick={() => handleSubmit(recipients)} disabled={saving}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Transfer'}
                        </button>
                    </div>
                )}

                {/* Bulk Upload Mode */}
                {mode === 'bulk' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                Bulk Upload
                            </h3>

                            <button onClick={downloadTemplate}
                                className="w-full py-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download CSV Template
                            </button>

                            <div className="relative">
                                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleBulkUpload} className="hidden" />
                                <button onClick={() => fileRef.current?.click()}
                                    className="w-full py-6 border-2 border-dashed border-emerald-200 rounded-2xl text-xs font-black text-emerald-500 uppercase tracking-widest hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center gap-2">
                                    <Upload className="w-6 h-6" />
                                    {bulkFileName || 'Click to upload CSV file'}
                                </button>
                            </div>
                        </div>

                        {/* Preview parsed recipients */}
                        {bulkRecipients.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bulkRecipients.length} Recipients Parsed</span>
                                    <span className="text-xs font-black text-emerald-600">{calcTotal(bulkRecipients).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                                        {bulkRecipients.map((r, idx) => (
                                            <div key={idx} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{r.recipient_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{r.bank_name} • {r.account_number} • {r.ifsc_code}</p>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{parseFloat(r.amount || '0').toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {calcTotal(bulkRecipients) > balance && (
                                    <div className="bg-rose-50 rounded-xl p-3 flex items-center gap-2 text-rose-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold">Insufficient balance! Need {calcTotal(bulkRecipients).toLocaleString('en-IN')} but have {balance.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <button onClick={() => handleSubmit(bulkRecipients)} disabled={saving || calcTotal(bulkRecipients) > balance}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : `Submit ${bulkRecipients.length} Transfers`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
}
