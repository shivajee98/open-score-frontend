'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
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
  const [tempReferralCode, setTempReferralCode] = useState('');

  // flow state: 'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'processing'
  const [flow, setFlow] = useState<'onboarding' | 'mobile_entry' | 'otp_verify' | 'role_select' | 'processing'>('onboarding');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLogoutHint, setShowLogoutHint] = useState(false);
  const isRegistering = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // Step 0: Fast path redirect if possible
      const localUserStr = localStorage.getItem('user');
      const localToken = localStorage.getItem('token');
      if (localUserStr && localToken) {
        try {
          const user = JSON.parse(localUserStr);
          redirectUser(user);
        } catch (e) { }
      }

      try {
        const userData = await apiFetch('/auth/me', { skipAuthCheck: true });
        localStorage.setItem('user', JSON.stringify(userData));
        redirectUser(userData);
      } catch (e) {
        clearAuthState();
        const seen = localStorage.getItem('hasSeenOnboarding') === 'true';
        if (seen) setFlow('mobile_entry');
        setCheckingSession(false);
      }
    };

    checkSession();

    const timer = setTimeout(() => {
      setShowLogoutHint(true);
    }, 6000);

    const checkReferral = () => {
      const code = localStorage.getItem('referral_code') || localStorage.getItem('referral code');
      if (code) setReferralCode(code);

      const temp = localStorage.getItem('temp_referral_code');
      if (temp) setTempReferralCode(temp);
    };
    checkReferral();

    window.addEventListener('storage', checkReferral);
    const customListener = () => checkReferral();
    window.addEventListener('referral_code_updated', customListener);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', checkReferral);
      window.removeEventListener('referral_code_updated', customListener);
    };
  }, [router]);

  useEffect(() => {
    if (flow === 'processing' && role) {
      handleRegister();
    }
  }, [flow, role]);

  const redirectUser = (user: any) => {
    console.log('[DEBUG] Redirecting user:', user.id, 'is_onboarded:', user.is_onboarded, 'role:', user.role);
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
    const normalizedTempCode = tempReferralCode.trim().toUpperCase();
    if (normalizedTempCode) {
      localStorage.setItem('referral_code', normalizedTempCode);
      setReferralCode(normalizedTempCode);
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
    const referralCode = localStorage.getItem('referral_code') || localStorage.getItem('referral code');

    try {
      const data = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          mobile_number: mobile,
          otp,
          referral_code: referralCode
        }),
        skipAuthCheck: true
      });

      if (data.status === 'NEW_USER') {
        setFlow('role_select');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.access_token) localStorage.setItem('token', data.access_token);
        localStorage.setItem('hasSeenOnboarding', 'true');
        if (referralCode) {
          localStorage.removeItem('referral_code');
          localStorage.removeItem('referral code');
        }

        if (data.onboarding_status === 'REQUIRED') {
          data.user.is_onboarded = false;
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.role) redirectUser(data.user);
          else setFlow('role_select');
        } else {
          data.user.is_onboarded = true;
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth-login'));
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
    if (!role || isRegistering.current) return;
    isRegistering.current = true;
    setLoading(true);
    setError('');
    const referralCode = localStorage.getItem('referral_code') || localStorage.getItem('referral code');

    try {
      console.log('[DEBUG] Sending /auth/verify request:', {
        mobile_number: mobile,
        otp,
        role,
        referral_code: referralCode
      });

      const authData = await apiFetch('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          mobile_number: mobile,
          otp,
          role,
          referral_code: referralCode
        }),
        skipAuthCheck: true
      });

      // No response.ok check needed as apiFetch throws on error
      // if (!response.ok) throw new Error(authData.error || 'Registration failed');

      console.log('[DEBUG] Registration success, user data:', authData.user);
      localStorage.setItem('user', JSON.stringify(authData.user));
      if (authData.access_token) localStorage.setItem('token', authData.access_token);
      localStorage.setItem('hasSeenOnboarding', 'true');
      window.dispatchEvent(new Event('auth-login'));
      redirectUser(authData.user);
    } catch (err: any) {
      setError(err.message);
      setFlow('role_select');
      isRegistering.current = false;
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLogout = async () => {
    await clearAuthState();
    window.location.reload();
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center animate-in fade-in duration-700">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-slate-200"></div>
        <div className="space-y-4 max-w-xs transition-all animate-in slide-in-from-bottom-5">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Syncing Session</h3>
          <p className="text-slate-500 text-sm font-medium">Please wait while we secure your connection...</p>

          {showLogoutHint && (
            <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-4">Taking too much time?</p>
              <button
                onClick={handleApplyLogout}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                Logout & Refresh
              </button>
              <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">This will clear your session and fix loading loops</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                    value={tempReferralCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      setTempReferralCode(code);
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
                    setRole(item.id as any);
                    setFlow('processing');
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

        {flow === 'processing' && (
          <div className="py-12 text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-xl shadow-primary/10"></div>
            <div>
              <h3 className="text-xl font-black mb-2">Preparing Your Space</h3>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Securing your session...</p>
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
