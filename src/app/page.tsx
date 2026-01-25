'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [step, setStep] = useState(0); // 0: Role, 1: Mobile, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile }),
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile, otp, role }),
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      const userRole = data.user.role;
      if (userRole === 'ADMIN') router.push('/admin');
      else if (userRole === 'MERCHANT') router.push('/merchant');
      else router.push('/customer');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-black p-6 text-white font-sans selection:bg-pink-500 selection:text-white">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-pink-500 blur-3xl opacity-20 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-blue-500 blur-3xl opacity-20 rounded-full pointer-events-none"></div>

        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
          CreditLoop
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Secure Digital Wallet Ecosystem</p>

        <div className="mb-6 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-[10px] text-sky-400 font-medium text-center">
          <p className="uppercase tracking-widest font-black mb-1 opacity-70">Demo Access Enabled</p>
          Enter any mobile number and any 6-digit OTP to continue.
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

        {step === 0 ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-6">Select Account Type</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'CUSTOMER', label: 'Customer', sub: 'Spend credit via QR', icon: '👤' },
                { id: 'MERCHANT', label: 'Merchant', sub: 'Accept credit payments', icon: '🏢' },
                { id: 'ADMIN', label: 'Administrator', sub: 'Manage loans & system', icon: '🛡️' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setRole(item.id); setStep(1); }}
                  className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group relative overflow-hidden active:scale-95"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-sm tracking-tight">{item.label}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-pink-500">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="group">
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1 group-focus-within:text-pink-400 transition-colors">Mobile Number (10 Digits)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">+91</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 10) setMobile(val);
                  }}
                  className="w-full rounded-xl bg-black/20 border border-white/10 pl-14 pr-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all shadow-inner font-bold tracking-widest"
                  placeholder="00000 00000"
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || mobile.length < 10}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 py-4 font-bold shadow-lg shadow-purple-900/40 hover:from-pink-500 hover:to-purple-500 hover:shadow-purple-900/60 transition-all active:scale-[0.98] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Continue Securely'}
            </button>
            <button
              onClick={() => setStep(0)}
              className="w-full text-[10px] text-gray-500 hover:text-white transition-colors py-2 uppercase font-black tracking-[0.2em]"
            >
              ← Back to roles
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="group text-center relative p-4">
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-4 group-focus-within:text-emerald-400 transition-colors">Enter 6-Digit Verification Code</label>
              <div className="flex justify-center gap-2 relative z-10 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-10 h-14 rounded-xl flex items-center justify-center border-2 transition-all ${otp.length > i ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/20'}`}>
                    <span className="text-xl font-black text-white">{otp[i] || ''}</span>
                  </div>
                ))}
              </div>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 6) setOtp(val);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-bold shadow-lg shadow-emerald-900/40 hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-900/60 transition-all active:scale-[0.98] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              onClick={() => { setStep(1); setOtp(''); }}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors py-2 uppercase font-black tracking-widest"
            >
              ← Edit Number
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
