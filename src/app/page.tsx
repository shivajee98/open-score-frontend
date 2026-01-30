'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Smartphone, LogIn, ArrowRight, User as UserIcon, Store } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);

  // flow state: 'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'details_entry' | 'processing'
  const [flow, setFlow] = useState<'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'details_entry' | 'processing'>('onboarding');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      try {
        if (token && userStr) {
          const userData = await apiFetch('/auth/me');
          localStorage.setItem('user', JSON.stringify(userData));

          // Refresh cookies
          document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=2592000; SameSite=Lax`;

          redirectUser(userData);
        } else {
          setCheckingSession(false);
        }
      } catch (e) {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (flow === 'processing' && role === 'MERCHANT') {
      handleRegister();
    }
  }, [flow, role]);

  const redirectUser = (user: any) => {
    // Sync with Native App
    const token = localStorage.getItem('token');
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
    }

    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'LOGIN',
        token,
        user
      }));
    }

    if (!user.is_onboarded) {
      if (user.role === 'MERCHANT') router.push('/auth/merchant-onboarding');
      else router.push('/auth/onboarding');
      return;
    }

    if (user.role === 'ADMIN') router.push('/admin');
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
      setFlow('otp_verify');
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
      const data = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile, otp }),
      });

      if (data.status === 'NEW_USER') {
        setFlow('role_select');
      } else {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.onboarding_status === 'REQUIRED') {
          data.user.is_onboarded = false;
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.role) redirectUser(data.user);
          else setFlow('role_select');
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
      const authData = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile, otp, role }),
      });

      localStorage.setItem('token', authData.access_token);
      localStorage.setItem('user', JSON.stringify(authData.user));

      if (role === 'MERCHANT') {
        redirectUser(authData.user);
        return;
      }

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
      setFlow('details_entry'); // Go back to details on error
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) return null; // Let the splash from OnboardingFlow handle it if needed

  if (flow === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={(mode) => {
          if (mode === 'signup') setFlow('mobile_entry');
          else setFlow('mobile_entry'); // Both go to mobile entry for now as it's the primary gateway
        }}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-primary overflow-hidden">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-10 duration-700">

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100 mb-6">
            {error}
          </div>
        )}

        {flow === 'mobile_entry' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Enter your mobile number to continue</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none border-r border-slate-100 pr-3mr-3">+91</div>
                  <input
                    type="tel"
                    autoFocus
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-[3.8rem] font-bold text-primary text-lg focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-brand tracking-widest"
                    placeholder="00000 00000"
                  />
                </div>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || mobile.length < 10}
                className="w-full py-5 brand-gradient text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <>Get OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
            <button onClick={() => setFlow('onboarding')} className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">Back to Intro</button>
          </div>
        )}

        {flow === 'otp_verify' && (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-2xl font-black mb-2">Verify Identity</h2>
              <p className="text-slate-500 text-sm">Enter the code sent to +91 {mobile}</p>
            </div>

            <input
              type="tel"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full text-center bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-2xl tracking-[0.5em] text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-brand"
              placeholder="••••••"
            />

            <div className="space-y-4">
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full py-5 brand-gradient text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Verify Code'}
              </button>
              <button onClick={() => setFlow('mobile_entry')} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Change Number</button>
            </div>
          </div>
        )}

        {flow === 'role_select' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">Account Type</h2>
              <p className="text-slate-500 text-sm">How will you use Open Score?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon /> },
                { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const selectedRole = item.id as any;
                    setRole(selectedRole);
                    setFlow(selectedRole === 'MERCHANT' ? 'processing' : 'details_entry');
                  }}
                  className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-primary/20 text-left transition-brand group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:brand-gradient group-hover:text-white transition-all shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-lg">{item.label}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.sub}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {flow === 'details_entry' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">Create Account</h2>
              <p className="text-slate-500 text-sm">Final few details to get you started</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-primary outline-none focus:border-primary transition-brand"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-primary outline-none focus:border-primary transition-brand"
                  placeholder="name@company.com"
                />
              </div>

              <button
                onClick={() => {
                  if (name && email.includes('@')) {
                    setFlow('processing');
                    handleRegister();
                  } else setError('Please fill all details correctly.');
                }}
                disabled={loading}
                className="w-full py-5 brand-gradient text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Set Up Account'}
              </button>
            </div>
          </div>
        )}

        {flow === 'processing' && (
          <div className="py-12 text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-xl shadow-primary/10"></div>
            <div>
              <h3 className="text-xl font-black mb-2">Almost There</h3>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Pre-configuring your Store...</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
