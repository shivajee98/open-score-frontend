'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function CustomerPay() {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [merchants, setMerchants] = useState([]);
    const [merchant, setMerchant] = useState<any>(null);
    const [error, setError] = useState('');

    const navItems = [
        { label: 'Overview', href: '/customer', icon: '🏠' },
        { label: 'Pay Merchant', href: '/customer/pay', icon: '💳' },
        { label: 'Loans', href: '/customer/loans', icon: '💰' },
        { label: 'Transactions', href: '/customer/transactions', icon: '📜' },
    ];

    useEffect(() => {
        apiFetch('/wallet/balance').then(data => setBalance(data.balance));
        apiFetch('/merchants').then(data => setMerchants(data));
    }, []);

    const handleSelectMerchant = (m: any) => {
        setLoading(true);
        setTimeout(() => {
            setMerchant(m);
            setStep(2);
            setLoading(false);
        }, 1000);
    };

    const handlePay = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        setError('');
        try {
            await apiFetch('/payment/pay', {
                method: 'POST',
                body: JSON.stringify({
                    merchant_wallet_uuid: merchant.wallet_uuid,
                    amount: parseFloat(amount)
                })
            });
            alert('Payment Successful!');
            window.location.href = '/customer';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Scan to Pay" navItems={navItems}>
            <div className="max-w-xl mx-auto space-y-8">
                {error && <p className="text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-center">{error}</p>}

                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="relative aspect-square w-full rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-12 text-center group transition-all hover:bg-slate-800/50">
                            <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mb-6 text-sky-500">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h4 className="text-xl font-bold mb-2">Simulate QR Scan</h4>
                            <p className="text-slate-500 text-sm">Select a verified merchant below to simulate a QR scan detection.</p>
                            <div className="mt-8 flex gap-4 overflow-x-auto pb-4 w-full">
                                {merchants.map((m: any) => (
                                    <button
                                        key={m.wallet_uuid}
                                        onClick={() => handleSelectMerchant(m)}
                                        disabled={loading}
                                        className="flex-shrink-0 w-24 space-y-2 group"
                                    >
                                        <div className="w-full aspect-square rounded-2xl bg-slate-800 flex items-center justify-center text-3xl border border-slate-700 group-hover:border-sky-500 transition-all active:scale-95 group-hover:bg-sky-500/10">🏢</div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{m.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </div>
                            <h4 className="text-2xl font-black mb-1">{merchant?.name}</h4>
                            <p className="text-slate-500 text-sm mb-8">Verified Digital Merchant</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-600">₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/40 rounded-2xl p-8 pl-14 text-4xl font-black text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-800"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex justify-between p-4 bg-slate-800/40 rounded-2xl text-xs">
                                    <span className="text-slate-500">Current Balance</span>
                                    <span className="font-bold text-sky-400">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <button
                                    onClick={handlePay}
                                    disabled={loading}
                                    className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-sky-900/40 hover:bg-sky-500 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Send Credit'}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full py-4 text-slate-600 font-bold hover:text-slate-400 transition-all">Cancel Payment</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
