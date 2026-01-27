'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Smartphone, Store, ArrowRight, ShieldCheck, User } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [step, setStep] = useState(0); // 0: Role, 1: Mobile, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // Wait at least 2 seconds for splash effect
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      try {
        if (token && userStr) {
          const user = JSON.parse(userStr);
          await minSplashTime;

          if (user.role === 'ADMIN') router.push('/admin');
          else if (user.role === 'MERCHANT') router.push('/merchant');
          else router.push('/customer');
        } else {
          throw new Error('No session');
        }
      } catch (e) {
        await minSplashTime;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowSplash(false);
      }
    };

    checkSession();
  }, [router]);

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

      // Sync with Native App
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOGIN',
          token: data.access_token,
          user: data.user
        }));
      }

      // Check Onboarding Status
      if (data.onboarding_status === 'REQUIRED' || data.onboarding_status === 'NEW_USER') {
        router.push('/auth/onboarding');
        return;
      }

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

  if (showSplash) return <SplashScreen />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden">

        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-2xl mb-4 shadow-lg shadow-blue-600/20">
            O
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
            OpenScore
          </h1>
          <p className="text-slate-500 font-medium text-sm">Next-Gen Financial Ecosystem</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100 mb-6">{error}</div>}

        {step === 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Choose Account Type</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'CUSTOMER', label: 'Personal', sub: 'Spend & Transfer', icon: <User className="w-5 h-5" /> },
                { id: 'MERCHANT', label: 'Merchant', sub: 'Power your payments', icon: <Store className="w-5 h-5" /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setRole(item.id); setStep(1); }}
                  className="w-full p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all group relative text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.sub}</p>
                    </div>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3 h-3 inline mr-1 -mt-0.5" /> Secure Banking Protocol
              </p>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none border-r border-slate-200 pr-3 mr-3">+91</div>
                <input
                  type="tel"
                  autoFocus
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 10) setMobile(val);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-5 pl-[4.5rem] font-bold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300 tracking-widest"
                  placeholder="00000 00000"
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || mobile.length < 10}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>Continue <ArrowRight className="w-5 h-5" /></>}
            </button>
            <button
              onClick={() => setStep(0)}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest pt-2"
            >
              Change Role
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 text-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Verify Identity</h3>
              <p className="text-slate-500 text-sm">Enter the code sent to +91 {mobile}</p>
            </div>

            <div className="relative max-w-xs mx-auto">
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-12 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${otp.length > i ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                    <span className="text-2xl font-black">{otp[i] || ''}</span>
                  </div>
                ))}
              </div>

              {/* Hidden Input for OTP */}
              <input
                type="tel"
                autoFocus
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 6) setOtp(val);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Verify & Login'}
            </button>

            <button
              onClick={() => { setStep(1); setOtp(''); }}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Use Different Number
            </button>
          </div>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">© 2026 OpenScore Financial</p>
    </main>
  );
}
