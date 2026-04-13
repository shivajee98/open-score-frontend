'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import PinModal from '@/components/PinModal';
import { Scan, X, ArrowRight, ArrowLeft, Smartphone, Search, Home, QrCode, Receipt, Lock, Landmark, History, Clock, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { useApi } from '@/hooks/useApi';

function CustomerPayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [lockedBalance, setLockedBalance] = useState(0);
    const [cashbackBalance, setCashbackBalance] = useState(0);
    const [useCashback, setUseCashback] = useState(true);
    const [payees, setPayees] = useState([]);
    const [payee, setPayee] = useState<any>(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef<any>(null);
    const [successData, setSuccessData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentPayees, setRecentPayees] = useState<any[]>([]);
    const { data: user, mutate: mutateUser } = useApi('/auth/me');
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    
    // Error Popup State
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupErrorMessage, setPopupErrorMessage] = useState('');

    const cleanErrorMessage = (msg: string) => {
        if (!msg) return 'An unexpected error occurred';
        // Remove hex codes (0x followed by hex chars) - often scary for users
        let cleaned = msg.replace(/\b0x[a-fA-F0-9]{6,}\b/g, '');
        
        // Remove other common technical noise
        cleaned = cleaned.replace(/at\s+.*:\d+:\d+/g, ''); // Source maps/stack traces
        
        // Specific scary technical terms to simplify
        if (cleaned.includes('Internal Server Error') || cleaned.toLowerCase().includes('database') || cleaned.includes('SQLSTATE')) {
            return 'Something went wrong on our end. Please try again later or contact support.';
        }
        
        // If everything was hex and became empty
        if (!cleaned.trim()) return 'Connection error or invalid data received.';
        
        return cleaned.trim();
    };

    const triggerErrorPopup = (msg: string) => {
        setPopupErrorMessage(cleanErrorMessage(msg));
        setShowErrorPopup(true);
    };

    const isPayeeMerchant = payee?.role === 'MERCHANT';

    useEffect(() => {
        if (isPayeeMerchant) {
            setUseCashback(false);
        }
    }, [isPayeeMerchant]);

    useEffect(() => {
        const handleUpdate = () => {
            mutateUser();
        };
        window.addEventListener('userStateUpdate', handleUpdate);
        return () => window.removeEventListener('userStateUpdate', handleUpdate);
    }, [mutateUser]);

    const scannerInitializing = useRef(false);
    const hasScanned = useRef(false);

    const navItems = [
        { label: 'Overview', href: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Scan & Pay', href: '/customer/pay', icon: <Smartphone className="w-5 h-5" /> },
        { label: 'My QR', href: '/customer/qr', icon: <QrCode className="w-5 h-5" /> },
        { label: 'Payout', href: '/customer/payout', icon: <Landmark className="w-5 h-5" /> },
        { label: 'Activity', href: '/customer/transactions', icon: <Receipt className="w-5 h-5" /> },
    ];

    useEffect(() => {
        if (searchParams.get('scan') === 'true') {
            startScanner();
        }

        apiFetch('/wallet/balance').then(data => {
            setBalance(data.balance || 0);
            setLockedBalance(data.locked_balance || 0);
            setCashbackBalance(data.cashback_balance || 0);
        });

        apiFetch('/wallet/transactions').then(res => {
            const data = res.data || [];
            const transferPayees = data
                .filter((tx: any) => tx.source_type === 'TRANSFER' && tx.type === 'DEBIT')
                .map((tx: any) => ({
                    name: tx.counterparty_name,
                    vpa: tx.counterparty_vpa,
                    id: tx.counterparty_vpa?.split('@')[0] || tx.reference_id
                }));

            // Deduplicate by VPA
            const unique = Array.from(new Map(transferPayees.map((p: any) => [p.vpa, p])).values());
            setRecentPayees(unique.slice(0, 4));
        });
    }, [searchParams]);

    // Debounce Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length >= 3) { // Min 3 chars to search
                try {
                    const results = await apiFetch(`/payment/search?query=${searchQuery}`);
                    setSearchSuggestions(results);
                } catch (err) {
                    console.error("Search error:", err);
                    setSearchSuggestions([]);
                }
            } else {
                setSearchSuggestions([]);
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const startScanner = async () => {
        if (scannerInitializing.current || scanning) return;

        scannerInitializing.current = true;
        setScanning(true);
        setError('');
        hasScanned.current = false;

        // Dynamic import to avoid SSR issues
        const { Html5Qrcode } = await import('html5-qrcode');

        setTimeout(async () => {
            try {
                const element = document.getElementById("reader");
                if (!element) {
                    scannerInitializing.current = false;
                    setScanning(false);
                    return;
                }

                // Clean up previous instance
                if (scannerRef.current) {
                    try {
                        if (scannerRef.current.getState() === 2) {
                            await scannerRef.current.stop();
                        }
                    } catch (e) { }
                    scannerRef.current = null;
                }

                const instance = new Html5Qrcode("reader");
                scannerRef.current = instance;

                await instance.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                );
                scannerInitializing.current = false;
            } catch (err: any) {
                console.error("Scanner Error:", err);
                const errorMessage = err?.name === 'NotAllowedError'
                    ? "Camera permission denied"
                    : (err?.message || "Failed to start camera");

                toast.error(errorMessage);
                setError(errorMessage);
                setScanning(false);
                scannerRef.current = null;
                scannerInitializing.current = false;
            }
        }, 400); // Slightly longer timeout
    };

    const stopScanner = async () => {
        console.log("Stopping scanner...");
        scannerInitializing.current = false;
        if (scannerRef.current) {
            try {
                if (scannerRef.current.getState() === 2) {
                    await scannerRef.current.stop();
                }
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                if (scannerRef.current.getState() === 2) {
                    scannerRef.current.stop().catch(() => { });
                }
                scannerRef.current = null;
            }
        };
    }, []);

    function onScanSuccess(decodedText: string) {
        if (hasScanned.current) return;
        hasScanned.current = true;

        stopScanner();
        console.log("Scanned QR:", decodedText);

        // Sanitize Input: Extract ID if it's a redirection URL
        let finalId = decodedText;
        if (decodedText.includes('openscore.msmeloan.sbs/qr')) {
            try {
                const url = new URL(decodedText);
                const idFromUrl = url.searchParams.get('id');
                if (idFromUrl) {
                    finalId = idFromUrl;
                    console.log("Extracted ID from URL:", finalId);
                }
            } catch (e) {
                console.error("Failed to parse QR URL:", e);
            }
        }

        fetchPayeeDetails(finalId);
    }

    function onScanFailure(error: any) { }

    const fetchPayeeDetails = async (id: string) => {
        if (!id) return;
        setLoading(true);
        setError('');
        console.log("Fetching details for:", id);
        try {
            // First try as a payment payee
            try {
                const data = await apiFetch(`/payment/payee/${id}`);
                setPayee(data);
                setStep(2);
                setSearchSuggestions([]);
                setSearchQuery('');
                setLoading(false);
                return;
            } catch (err) {
                // Not a payee, try as a coupon
                console.log("Not a payee, checking if it's a coupon...");
            }

            // try to claim as a coupon
            try {
                const res = await apiFetch('/auth/coupons/claim', {
                    method: 'POST',
                    body: JSON.stringify({ code: id })
                });
                toast.success(`Coupon Claimed: ${res.amount} Cashback!`);
                router.push('/customer/rewards');
                return;
            } catch (couponErr: any) {
                // If it's a specific coupon error (already claimed, etc), show it
                if (couponErr.message && (couponErr.message.includes('coupon') || couponErr.message.includes('batch'))) {
                    throw couponErr;
                }
                // Otherwise fallback to general error
                throw new Error('Invalid QR or User Not Found');
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            const msg = cleanErrorMessage(err.message || 'Invalid QR or User Not Found');
            setError(msg);
            triggerErrorPopup(msg);
            hasScanned.current = false; // Allow retry
        } finally {
            setLoading(false);
        }
    }

    const selectPayee = (p: any) => {
        console.log("Selecting payee from suggestion:", p);
        setPayee({
            id: p.user_id,
            name: p.name,
            role: p.role,
            payee_wallet_uuid: p.wallet_uuid,
            vpa: p.vpa
        });
        setStep(2);
        setSearchSuggestions([]);
        setSearchQuery('');
    };

    const [pinModalOpen, setPinModalOpen] = useState(false);

    const handleInitiatePay = () => {
        if (!amount || parseFloat(amount) <= 0) return;

        const payAmount = parseFloat(amount);

        if (payAmount > balance) {
            if (payAmount <= (balance + lockedBalance)) {
                setError('Insufficient available balance. This amount is currently in LOCKED state – Please Contact Agent for release.');
            } else {
                setError('Insufficient wallet balance');
            }
            return;
        }
        setPinModalOpen(true);
    };

    const handlePay = async (pin: string) => {
        setPinModalOpen(false);
        setLoading(true);
        setError('');

        try {
            const [res] = await Promise.all([
                apiFetch('/payment/pay', {
                    method: 'POST',
                    body: JSON.stringify({
                        payee_wallet_uuid: payee.payee_wallet_uuid,
                        amount: parseFloat(amount),
                        pin: pin,
                        use_cashback: useCashback
                    })
                }),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);

            setSuccessData({
                amount: amount,
                payeeName: payee.name,
                id: res.id,
                ref: res.ref,
                date: res.created_at,
                isMerchant: payee.role === 'MERCHANT',
                merchantId: payee.merchant_id || payee.id
            });
        } catch (err: any) {
            triggerErrorPopup(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const isMerchant = user?.role === 'MERCHANT';
    const themeColor = isMerchant ? 'emerald' : 'blue';

    return (
        <DashboardLayout title="Scan & Pay" navItems={navItems}>
            <div className="max-w-xl mx-auto">
                <PaymentSuccessModal
                    isOpen={!!successData}
                    amount={successData?.amount || '0'}
                    payeeName={successData?.payeeName || ''}
                    date={successData?.date || new Date().toISOString()}
                    transactionId={successData?.id || ''}
                    referenceId={successData?.ref || ''}
                    isMerchant={successData?.isMerchant}
                    merchantId={successData?.merchantId}
                    onClose={() => router.push('/customer')}
                />

                <PinModal
                    isOpen={pinModalOpen}
                    title={`Pay ${amount}`}
                    onComplete={handlePay}
                    onClose={() => setPinModalOpen(false)}
                />

                {showErrorPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                            <div className="p-8 text-center bg-gradient-to-b from-slate-50/50 to-white">
                                {(() => {
                                    const isSpentLimit = popupErrorMessage.includes('Spent today');
                                    const isLimitError = isSpentLimit || popupErrorMessage.toLowerCase().includes('limit reached');
                                    const statusColor = isLimitError ? 'amber' : 'rose';
                                    
                                    return (
                                        <>
                                            <div className={`w-20 h-20 bg-${statusColor}-100 text-${statusColor}-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-${statusColor}-50/50`}>
                                                {isLimitError ? <Clock size={40} strokeWidth={2.5} /> : <X size={40} strokeWidth={2.5} />}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">
                                                {isLimitError ? 'Limit Reached' : 'Payment Error'}
                                            </h3>
                                            
                                            {isSpentLimit ? (
                                                <div className="space-y-4 mb-8">
                                                    <p className="text-slate-600 font-bold text-sm leading-relaxed px-2">
                                                        {popupErrorMessage.split('\n\n')[0]}
                                                    </p>
                                                    
                                                    <details className="group overflow-hidden border border-emerald-100 rounded-2xl bg-emerald-50/50 transition-all">
                                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
                                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                                                                How to increase limit?
                                                            </span>
                                                            <ChevronDown size={14} className="text-emerald-500 group-open:rotate-180 transition-transform duration-300" />
                                                        </summary>
                                                        <div className="px-4 pb-4 space-y-3">
                                                            <p className="text-[11px] font-bold text-emerald-800/80 leading-relaxed text-left">
                                                                We suggest 10–12 transfers of just under 1,000 each to build your history.
                                                            </p>
                                                            <div className="pt-3 border-t border-emerald-100/50">
                                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider text-left">
                                                                    Note: Single transfer limit will not increase.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </details>
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8 px-2 whitespace-pre-line">
                                                    {popupErrorMessage}
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
                                <button
                                    onClick={() => setShowErrorPopup(false)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">{error}</div>}

                {(!user?.account_number || !user?.ifsc_code) ? (
                    <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                            <Landmark size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">Bank Setup Required</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed px-4">
                                You must set up your bank details before you can send money securely via Open Score.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/customer/profile?editBank=true')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Setup Bank Details <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : step === 1 ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                            <div className={`absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-${themeColor}-500 to-${isMerchant ? 'teal' : 'purple'}-500`}></div>

                            <BackButton
                                className="absolute left-6 top-6 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 z-20"
                                fallback="/customer"
                            />

                            <div className="mb-8 text-center mt-2">
                                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-${themeColor}-600 to-${isMerchant ? 'teal' : 'purple'}-600 rounded-2xl flex items-center justify-center shadow-lg shadow-${themeColor}-600/30`}>
                                    <Search className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Pay Anyone</h3>
                                <p className="text-slate-500 font-medium">Enter mobile number or Open Score ID</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="relative">
                                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter mobile number or Open Score ID"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-14 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                    />

                                    {/* Search Suggestions */}
                                    {searchSuggestions.length > 0 ? (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {searchSuggestions.map((p, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => selectPayee(p)}
                                                    className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                                            {p.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{p.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.vpa}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={16} className="text-slate-300" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (searchQuery.length >= 3 && !loading) && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No users found</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        if (searchQuery.length >= 10 || searchQuery.includes('@')) {
                                            fetchPayeeDetails(searchQuery.trim());
                                        } else {
                                            toast.error('Enter a full mobile number or ID');
                                        }
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-base shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            {recentPayees.length > 0 && searchQuery.length < 1 && (
                                <div className="mb-8">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Recent Payees</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        {recentPayees.map((p, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSearchQuery(p.id);
                                                    fetchPayeeDetails(p.id);
                                                }}
                                                className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                                                    {p.name?.[0]}
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter text-center line-clamp-1">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">Or</span>
                                </div>
                            </div>

                            <button
                                onClick={startScanner}
                                disabled={scanning}
                                className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Scan className="w-5 h-5" /> Scan QR Code
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200 border border-slate-100 animate-in slide-in-from-bottom-8 duration-500 relative max-w-sm mx-auto">
                        <button
                            onClick={() => setStep(1)}
                            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 z-20"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div className="text-center mt-4 mb-6">
                            <div className="w-12 h-12 mx-auto rounded-lg bg-slate-900 text-white flex items-center justify-center text-lg font-bold mb-3 shadow-lg shadow-slate-200">
                                {payee?.name?.[0]}
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 tracking-tight">{payee?.name}</h4>
                            <div className="mt-1">
                                <span className="text-blue-600 font-medium text-[10px] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 tracking-wide">
                                    {payee?.vpa || 'Verified Merchant'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            <div className="relative group">
                                <div className="border border-blue-600 rounded-xl px-4 py-3 flex items-center justify-center bg-blue-50/20 active-focus-within:ring-2 ring-blue-100 transition-all">
                                    <span className="text-2xl font-bold text-slate-800 mr-1"></span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-transparent text-3xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none w-32 text-center"
                                        placeholder="0"
                                    />
                                    {/* Cursor blinker simulation if needed, or rely on browser default */}
                                </div>
                            </div>

                            {/* Cashback Usage Preview */}
                            {amount && parseFloat(amount) > 0 && user?.cashback_usage_percentage > 0 && (
                                <div className={`px-4 py-3 rounded-xl border-2 transition-all ${useCashback && !isPayeeMerchant ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${useCashback && !isPayeeMerchant ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                                                <History size={12} strokeWidth={3} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className={`text-[10px] font-black uppercase tracking-widest block truncate ${useCashback && !isPayeeMerchant ? 'text-emerald-900' : 'text-slate-400'}`}>
                                                    Use Cashback Wallet
                                                </span>
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => !isPayeeMerchant && setUseCashback(!useCashback)}
                                            className={`w-10 h-5 rounded-full shrink-0 relative cursor-pointer transition-all duration-300 ${useCashback && !isPayeeMerchant ? 'bg-emerald-500 shadow-inner' : 'bg-slate-300'} ${isPayeeMerchant ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${useCashback && !isPayeeMerchant ? 'right-1 shadow-md' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    
                                    {isPayeeMerchant && (
                                        <div className="p-2 bg-slate-100/50 rounded-lg border border-slate-200/50 flex items-start gap-2">
                                            <div className="text-slate-400 mt-0.5"><Lock size={10} /></div>
                                            <p className="text-[8px] font-bold text-slate-500 leading-tight uppercase tracking-tight">
                                                Merchants cannot accept Cashback Wallet funds.
                                            </p>
                                        </div>
                                    )}

                                    {useCashback && !isPayeeMerchant && (
                                        <div className="space-y-1.5 pt-1 border-t border-emerald-100/50">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-emerald-700/60 font-bold uppercase tracking-tighter">Your Current Cashback</span>
                                                <span className="text-emerald-900 font-black">{Number(cashbackBalance).toLocaleString()}</span>
                                            </div>
                                            
                                            {cashbackBalance >= (user?.cashback_threshold_amount || 0) ? (
                                                <>
                                                    <div className="flex justify-between items-center text-[11px]">
                                                        <span className="text-emerald-700 font-bold">Contribution ({user.cashback_usage_percentage}%)</span>
                                                        <span className="text-emerald-600 font-black">
                                                            - {Math.min(
                                                                parseFloat(amount) * (user.cashback_usage_percentage / 100),
                                                                cashbackBalance
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[11px] pt-1 mt-1 border-t border-emerald-100 italic">
                                                        <span className="text-slate-600 font-black uppercase tracking-widest text-[8px]">Net Wallet Debit</span>
                                                        <span className="text-slate-900 font-black">{(parseFloat(amount) - Math.min(parseFloat(amount) * (user.cashback_usage_percentage / 100), cashbackBalance)).toFixed(2)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                                                    <div className="text-amber-600 mt-0.5"><Lock size={10} /></div>
                                                    <p className="text-[8px] font-bold text-amber-700 leading-tight uppercase tracking-tight">
                                                        Cashback below {user.cashback_threshold_amount}. Full amount will be debited from Main Wallet.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Available Balance</span>
                                <span className="text-sm font-black text-slate-900">{balance.toLocaleString('en-IN')}</span>
                            </div>
                            {lockedBalance > 0 && (
                                <div className="flex justify-between items-center px-4 pt-1 pb-2">
                                    <span className="text-[9px] font-bold uppercase text-amber-500 flex items-center gap-1">
                                        <Lock size={10} /> Locked
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{lockedBalance.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <button
                                onClick={handleInitiatePay}
                                disabled={loading || !amount}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? 'Processing...' : 'Proceed to Pay'}
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                            >
                                Cancel Transaction
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {scanning && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                    <div id="reader" className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-white/20"></div>
                    <button
                        onClick={stopScanner}
                        className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2"
                    >
                        <X className="w-5 h-5" /> Cancel Scan
                    </button>
                    <p className="text-white/50 text-xs mt-4 uppercase tracking-widest font-bold">Align QR code within frame</p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default function CustomerPay() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center" aria-label="Loading payment page">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CustomerPayPage />
        </Suspense>
    );
}
