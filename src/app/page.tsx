'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, clearAuthState } from '@/lib/api';
import { Smartphone, LogIn, ArrowRight, User as UserIcon, Store } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import ReferralHandler from '@/components/ReferralHandler';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // flow state: 'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'details_entry' | 'processing'
  const [flow, setFlow] = useState<'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'details_entry' | 'processing'>('onboarding');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await apiFetch('/auth/me', { skipAuthCheck: true });
        // Only store non-sensitive UI-only user data in localStorage if absolutely necessary for speed,
        // but for high security we should rely on the fetch result.
        localStorage.setItem('user', JSON.stringify(userData));
        redirectUser(userData);
      } catch (e) {
        // Clear locally if session invalid
        clearAuthState();

        // Check if user has already authenticated in this browser before
        const seen = localStorage.getItem('hasSeenOnboarding') === 'true';
        if (seen) {
          setFlow('mobile_entry');
        }

        setCheckingSession(false);
      }
    };

    checkSession();

    // Check for referral code periodically or on mount
    const checkReferral = () => {
      const code = localStorage.getItem('referral_code');
      if (code) setReferralCode(code);
    };
    checkReferral();

    // Also set up a listener for storage events (cross-tab) and custom events (same-tab)
    window.addEventListener('storage', checkReferral);
    const customListener = () => checkReferral();
    window.addEventListener('referral_code_updated', customListener);

    return () => {
      window.removeEventListener('storage', checkReferral);
      window.removeEventListener('referral_code_updated', customListener);
    };
  }, [router]);

  useEffect(() => {
    if (flow === 'processing' && role === 'MERCHANT') {
      handleRegister();
    }
  }, [flow, role]);

  const redirectUser = (user: any) => {
    // Sync with Native App if needed, but avoid sending tokens over JS
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'LOGIN',
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

    // Transfer temp referral code to permanent storage if exists
    const tempCode = localStorage.getItem('temp_referral_code');
    if (tempCode && tempCode.trim()) {
      localStorage.setItem('referral_code', tempCode.trim().toUpperCase());
      localStorage.removeItem('temp_referral_code');
    }

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

    // Get Referral Code if exists
    const referralCode = localStorage.getItem('referral_code');

    try {
      // Use the internal secure login route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobile,
          otp,
          referral_code: referralCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.status === 'NEW_USER') {
        setFlow('role_select');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('hasSeenOnboarding', 'true');
        // Clear referral code after successful use
        if (referralCode) localStorage.removeItem('referral_code');

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

    // Get Referral Code if exists (might be used here too if NEW_USER flow flowed to here)
    const referralCode = localStorage.getItem('referral_code');

    try {
      // Use the internal secure login route for verification with role
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobile,
          otp,
          role,
          referral_code: referralCode
        }),
      });

      const authData = await response.json();

      if (!response.ok) {
        throw new Error(authData.error || 'Registration failed');
      }

      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('hasSeenOnboarding', 'true');

      if (role === 'MERCHANT') {
        redirectUser(authData.user);
        return;
      }

      await apiFetch('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
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
      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>
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
                  {referralCode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-right-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Applied: {referralCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Referral Code Input */}
              {!referralCode && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-4">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={localStorage.getItem('temp_referral_code') || ''}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      localStorage.setItem('temp_referral_code', code);
                    }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-primary text-lg focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-brand tracking-widest uppercase"
                    placeholder="ENTER CODE"
                    maxLength={20}
                  />
                  <p className="text-xs text-slate-400 mt-2 ml-4">
                    Have a referral code? Enter it to get bonus rewards!
                  </p>
                </div>
              )}

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

      <div className="absolute bottom-6 left-0 right-0 text-center opacity-60 pointer-events-none animate-in fade-in duration-1000 delay-500">
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Powered by MSME Shakti</p>
      </div>
    </main>
  );
}
