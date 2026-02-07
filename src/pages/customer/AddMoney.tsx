'use client';

/**
 * ============================================================
 * ADD MONEY PAGE - DUMMY UPI PAYMENT INTEGRATION
 * ============================================================
 * 
 * This page allows users to add money to their wallet.
 * Currently, this is a DUMMY implementation as we don't have
 * a real UPI payment gateway integration yet.
 * 
 * TODO: When integrating real UPI payment:
 * 1. Replace the dummy handlePayment function with actual UPI API calls
 * 2. Integrate with payment gateway (Razorpay, PayU, Paytm, etc.)
 * 3. Add proper error handling and transaction verification
 * 4. Implement webhook for payment confirmation from gateway
 * 5. Update wallet balance only after confirmed payment
 * 
 * SECURITY NOTES:
 * - Never process wallet credits client-side
 * - Always verify payment status on backend
 * - Use webhooks for payment confirmation
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, CreditCard, Smartphone, CheckCircle, AlertTriangle, IndianRupee } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

// Predefined amount options
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

export default function AddMoneyPage() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    // const [upiId, setUpiId] = useState(''); // Removed as we use intent
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

    /**
     * DUMMY PAYMENT HANDLER
     * 
     * TODO: Replace this with actual UPI/Payment Gateway integration
     * 
     * Real implementation should:
     * 1. Call backend to create payment order
     * 2. Open payment gateway SDK (Razorpay, etc.)
     * 3. Handle payment callback
     * 4. Backend verifies payment and credits wallet
     */
    const handlePayment = async () => {
        if (!amount || Number(amount) < 1) {
            toast.error('Minimum amount is ₹1');
            return;
        }

        setProcessing(true);
        setPaymentStatus('processing');

        // UPI Intent Logic
        const payeeVpa = "9430083275@naviaxis";
        const payeeName = "OpenScore";
        const transactionRef = `TXN${Date.now()}`;
        const transactionNote = "Wallet Topup";
        const currency = "INR";

        // Construct the UPI Intent URL
        // upi://pay?pa=...&pn=...&tr=...&tn=...&am=...&cu=...
        const upiUrl = `upi://pay?pa=${payeeVpa}&pn=${payeeName}&tr=${transactionRef}&tn=${transactionNote}&am=${amount}&cu=${currency}`;

        // Create a hidden link and click it - standard way to trigger intent on mobile
        const link = document.createElement('a');
        link.href = upiUrl;
        link.click();

        toast.info("Opening UPI App...");

        // We can't verify transaction status on frontend for UPI intents easily.
        // Resetting state after a delay.
        setTimeout(() => {
            setProcessing(false);
            setPaymentStatus('idle');
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 pt-8 pb-16 rounded-b-3xl shadow-xl relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white mb-1">Add Money</h1>
                        <p className="text-emerald-100 font-medium text-sm">Top up your Open Score wallet</p>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-10 relative z-20 space-y-4">
                {/* Amount Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 p-5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Enter Amount</label>

                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 pl-10 text-3xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                            disabled={processing}
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {QUICK_AMOUNTS.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setAmount(amt.toString())}
                                disabled={processing}
                                className={`py-2.5 rounded-xl font-bold text-sm transition-all ${amount === amt.toString()
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                ₹{amt.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 p-5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</label>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => setPaymentMethod('upi')}
                            disabled={processing}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'upi'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className={`font-bold text-sm ${paymentMethod === 'upi' ? 'text-emerald-700' : 'text-slate-600'}`}>UPI App</span>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('card')}
                            disabled={processing}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-emerald-700' : 'text-slate-600'}`}>Card</span>
                        </button>
                    </div>

                    {/* Card Notice */}
                    {paymentMethod === 'card' && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-amber-700 text-xs font-medium">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                Card payments coming soon! Please use UPI.
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Status */}
                {paymentStatus !== 'idle' && (
                    <div className={`rounded-2xl p-5 flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${paymentStatus === 'processing' ? 'bg-blue-50 border border-blue-100' :
                        paymentStatus === 'success' ? 'bg-emerald-50 border border-emerald-100' :
                            'bg-rose-50 border border-rose-100'
                        }`}>
                        {paymentStatus === 'processing' && (
                            <>
                                <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" />
                                <p className="text-blue-800 font-bold">Opening UPI App...</p>
                            </>
                        )}
                        {paymentStatus === 'success' && (
                            <>
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                                <p className="text-emerald-800 font-bold">Payment Initiated</p>
                            </>
                        )}
                        {paymentStatus === 'failed' && (
                            <>
                                <AlertTriangle className="w-12 h-12 text-rose-600" />
                                <p className="text-rose-800 font-bold">Payment Failed</p>
                            </>
                        )}
                    </div>
                )}

                {/* Pay Button */}
                {paymentStatus !== 'success' && (
                    <button
                        onClick={handlePayment}
                        disabled={processing || !amount || paymentMethod === 'card'}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                        ) : (
                            <>
                                <IndianRupee className="w-5 h-5" />
                                Pay ₹{amount ? Number(amount).toLocaleString() : '0'}
                            </>
                        )}
                    </button>
                )}

                {/* Info Notice */}
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-500 text-xs font-medium text-center">
                        🔒 All payments are secured with 256-bit encryption
                    </p>
                </div>
            </div>
        </div>
    );
}
