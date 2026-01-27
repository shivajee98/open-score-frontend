'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Smartphone, Store, ArrowRight, ShieldCheck, User as UserIcon, Check, BadgeCheck } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  // Registration Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);

  // Steps: 0=Phone, 1=OTP, 2=Details, 3=Role
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      try {
        if (token && userStr) {
          const user = JSON.parse(userStr);
          await minSplashTime;

          // Check if onboarding is required
          if (!user.is_onboarded) {
            setStep(3);
            setShowSplash(false);
            return;
          }

          redirectUser(user);
        } else {
          throw new Error('No session');
        }
      } catch (e) {
        await minSplashTime;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cookies as well
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        setShowSplash(false);
      }
    };
    checkSession();
  }, [router]);

  const redirectUser = (user: any) => {
    // Sync with Native App
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'LOGIN',
        token: localStorage.getItem('token'),
        user: user
      }));
    }

    // Set cookies for middleware
    const token = localStorage.getItem('token');
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (!user.is_onboarded) {
      router.push('/auth/onboarding');
      return;
    }

    if (user.role === 'ADMIN') router.push('/admin');
    else if (user.role === 'MERCHANT') router.push('/merchant');
    else router.push('/customer');
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile }),
      });
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // First try to login without role (checks existence)
      const data = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile, otp }),
      });

      if (data.status === 'NEW_USER') {
        // User not found -> Proceed to Role Selection first (User Request)
        setStep(3);
      } else {
        // User found -> Login
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.onboarding_status === 'REQUIRED') {
          data.user.is_onboarded = false;
          localStorage.setItem('user', JSON.stringify(data.user));
          setStep(3); // Go to role selection instead of onboarding page immediately
        } else {
          data.user.is_onboarded = true;
          localStorage.setItem('user', JSON.stringify(data.user));
          redirectUser(data.user);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!role) return;
    setLoading(true);
    setError('');
    try {
      // 1. Create User
      const authData = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile, otp, role }),
      });

      localStorage.setItem('token', authData.access_token);

      // 2. Update Details
      await apiFetch('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: { 'Authorization': `Bearer ${authData.access_token}` }
      });

      const user = { ...authData.user, name, email, is_onboarded: true };
      localStorage.setItem('user', JSON.stringify(user));

      redirectUser(user);

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

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-2xl mb-4 shadow-lg shadow-blue-600/20">
            O
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
            OpenScore
          </h1>
          <p className="text-slate-500 font-medium text-sm">Powered by MSME Shakti</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100 mb-6">{error}</div>}

        {step === 0 && (
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
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <>Continue <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 text-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Verify Identity</h3>
              <p className="text-slate-500 text-sm">Enter the code sent to +91 {mobile}</p>
            </div>

            <div className="relative max-w-xs mx-auto">
              <input
                type="tel"
                autoFocus
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 6) setOtp(val);
                }}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-[1.2rem] p-4 font-black text-2xl tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                placeholder="••••••"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Verify'}
            </button>

            <button onClick={() => setStep(0)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Change Number</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Choose Account Type</h3>
              <p className="text-slate-500 text-sm">How will you use OpenScore?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon className="w-5 h-5" /> },
                { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store className="w-5 h-5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setRole(item.id as any);
                    setStep(2); // Go to details after role
                  }}
                  className={`w-full p-5 rounded-2xl border transition-all group relative text-left active:scale-[0.98] ${role === item.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${role === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-100 text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.sub}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Tell us about yourself</h3>
              <p className="text-slate-500 text-sm">We need a few details to set up your account.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Full Name (As per Aadhaar)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition-all"
                placeholder="rahul@example.com"
              />
            </div>

            <button
              onClick={() => {
                if (name && email.includes('@')) handleRegister();
                else setError('Please fill all details correctly.');
              }}
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Create Account'}
            </button>
          </div>
        )}

      </div>
      <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">Secure by OpenScore Protocol</p>
    </main>
  );
}
