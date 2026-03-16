'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, clearAuthState } from '@/lib/api';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Smartphone, LogIn, ArrowRight, User as UserIcon, Store, GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function Home() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT' | 'STUDENT' | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [tempReferralCode, setTempReferralCode] = useState('');

  // flow state: 'onboarding' | 'mobile_entry' | 'otp_verify' | 'pin_login' | 'pin_reset_setup' | 'role_select' | 'processing'
  const [flow, setFlow] = useState<'onboarding' | 'mobile_entry' | 'otp_verify' | 'pin_login' | 'pin_reset_setup' | 'role_select' | 'processing'>('onboarding');
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLogoutHint, setShowLogoutHint] = useState(false);

  // Account Check States
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

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
          window.dispatchEvent(new Event('auth-login'));
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
      if (code) {
        if (code.toUpperCase().startsWith('SU')) {
          localStorage.removeItem('referral_code');
          localStorage.removeItem('referral code');
          setReferralCode(null);
        } else {
          setReferralCode(code);
        }
      }

      const temp = localStorage.getItem('temp_referral_code');
      if (temp) {
        if (temp.toUpperCase().startsWith('SU')) {
          localStorage.removeItem('temp_referral_code');
          setTempReferralCode('');
        } else {
          setTempReferralCode(temp);
        }
      }
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

  // Resend OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (flow === 'processing' && role) {
      handleRegister();
    }
  }, [flow, role]);

  // Debounced User Existence Check
  useEffect(() => {
    if (mobile.length === 10) {
      setIsCheckingUser(true);
      const handler = setTimeout(async () => {
        try {
          const data = await apiFetch(`/auth/check-user/${mobile}`, { skipAuthCheck: true });
          setUserExists(data.exists);
          setHasPin(data.has_pin);
        } catch (e) {
          setUserExists(null);
          setHasPin(null);
        } finally {
          setIsCheckingUser(false);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(handler);
    } else {
      setUserExists(null);
      setIsCheckingUser(false);
    }
  }, [mobile]);

  const registerPush = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      console.log('[Push] Requesting permissions and registering...');
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === 'prompt') {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive === 'granted') {
        await PushNotifications.register();
        console.log('[Push] Native register() called successfully');
      } else {
        console.warn('[Push] Permission denied');
      }
    } catch (e) {
      console.error('[Push] Registration error:', e);
    }
  };

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

  const handleSendOtp = async (isReset = false) => {
    setLoading(true);
    setError('');

    if (isReset) {
      setIsResettingPin(true);
    } else {
      setIsResettingPin(false);
    }

    const normalizedTempCode = tempReferralCode.trim().toUpperCase();
    if (normalizedTempCode) {
      if (normalizedTempCode.startsWith('SU')) {
        // Discard sub-user referral codes for regular onboarding
        localStorage.removeItem('temp_referral_code');
        setTempReferralCode('');
        setReferralCode(null);
      } else {
        localStorage.setItem('referral_code', normalizedTempCode);
        setReferralCode(normalizedTempCode);
        localStorage.removeItem('temp_referral_code');
      }
    }

    try {
      await apiFetch('/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ mobile_number: mobile }),
      });
      setFlow('otp_verify');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login-via-pin', {
        method: 'POST',
        body: JSON.stringify({
          mobile_number: mobile,
          pin
        }),
        skipAuthCheck: true
      });

      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.access_token) localStorage.setItem('token', data.access_token);
      localStorage.setItem('hasSeenOnboarding', 'true');

      // Prevent AppLockGuard from triggering immediately since they just entered their PIN
      sessionStorage.setItem("app_unlocked", "true");

      if (data.user.role === 'ADMIN' || data.user.role === 'SUPPORT') {
        redirectUser(data.user);
        return;
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
        registerPush();
        redirectUser(data.user);
      }
    } catch (err: any) {
      setError(err.message);
      setPin(''); // clear on fail
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

      if (isResettingPin) {
        setFlow('pin_reset_setup');
        // keep token for later use when setting pin
        localStorage.setItem('temp_reset_token', data.access_token);
        return;
      }

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
          // Trigger Push Registration Breakthrough
          registerPush();
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
      // Trigger Push Registration Breakthrough
      registerPush();
      redirectUser(authData.user);
    } catch (err: any) {
      setError(err.message);
      setFlow('role_select');
      isRegistering.current = false;
    } finally {
      setLoading(false);
      isRegistering.current = false;
    }
  };

  const handlePinReset = async () => {
    if (pin !== confirmPin) {
      setError("PINs do not match");
      setPin("");
      setConfirmPin("");
      return;
    }

    setLoading(true);
    setError("");
    const token = localStorage.getItem('temp_reset_token');

    try {
      // Need to include token in this specific call as it's not in the main localStorage 'token' yet
      const headers = { 'Authorization': `Bearer ${token}` };

      await apiFetch("/auth/set-app-pin", {
        method: "POST",
        headers,
        body: JSON.stringify({ pin, pin_confirmation: confirmPin })
      });

      // Verification successful, now we can log them in properly
      const userData = await apiFetch('/auth/me', { headers });
      localStorage.setItem('user', JSON.stringify(userData));
      if (token) localStorage.setItem('token', token);
      localStorage.removeItem('temp_reset_token'); // Cleanup
      localStorage.setItem('hasSeenOnboarding', 'true');

      sessionStorage.setItem("app_unlocked", "true");
      window.dispatchEvent(new Event('auth-login'));
      registerPush();
      redirectUser(userData);

    } catch (err: any) {
      setError(err.message || "Failed to set PIN");
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
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none border-r border-slate-100 pr-3 mr-3">+91</div>
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

              {/* Add Referral Code Input - Only show if user does NOT exist */}
              {(!referralCode && userExists === false) && (
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

              {/* Continue Button - Hidden until user existence is checked */}
              {mobile.length === 10 && !isCheckingUser && userExists !== null && (
                <button
                  onClick={() => {
                    if (hasPin) {
                      setFlow('pin_login');
                    } else {
                      handleSendOtp(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-5 brand-gradient text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group animate-in fade-in slide-in-from-bottom-2"
                >
                  {loading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                  ) : (
                    <>
                      {userExists ? 'Login with PIN' : 'Get OTP'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}

              {/* Loading State for account check */}
              {isCheckingUser && (
                <div className="w-full py-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                  <span className="animate-spin w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full"></span>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Checking Account...</span>
                </div>
              )}
            </div>

            <button onClick={() => setFlow('onboarding')} className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">Back to Intro</button>
          </div>
        )}

        {flow === 'pin_login' && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div>
              <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm font-medium">Enter your 4-digit Security PIN</p>
            </div>

            <div className="flex justify-center gap-4 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-14 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-primary transition-all shadow-sm">
                  {pin[i] ? <span className="w-3 h-3 bg-primary rounded-full animate-in zoom-in"></span> : ""}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "delete"].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === "clear") {
                      setPin("");
                    } else if (key === "delete") {
                      setPin(pin.slice(0, -1));
                    } else if (pin.length < 4) {
                      setPin(pin + key);
                    }
                  }}
                  className="h-16 rounded-2xl bg-white border border-slate-100 font-bold text-xl text-slate-700 hover:bg-slate-50 active:scale-90 transition-all shadow-sm flex items-center justify-center"
                >
                  {key === "clear" ? "C" : key === "delete" ? "←" : key}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handlePinLogin}
                disabled={loading || pin.length !== 4}
                className="w-full py-5 brand-gradient text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Unlock'}
              </button>
              <div className="flex justify-between px-2">
                <button onClick={() => { setFlow('mobile_entry'); setPin(''); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Change Number</button>
                <button onClick={() => { handleSendOtp(true); }} className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest">Forgot PIN?</button>
              </div>
            </div>
          </div>
        )}

        {flow === 'pin_reset_setup' && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
            <div>
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-2">Create New PIN</h2>
              <p className="text-slate-500 text-sm font-medium">
                {pin.length === 4 ? "Confirm your new 4-digit PIN" : "Enter a new 4-digit Security PIN"}
              </p>
            </div>

            <div className="flex justify-center gap-4 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-14 h-16 bg-slate-50 border-2 ${pin.length === 4 ? 'border-emerald-100' : 'border-slate-100'} rounded-2xl flex items-center justify-center text-2xl font-black text-primary transition-all shadow-sm`}>
                  {(pin.length === 4 ? confirmPin[i] : pin[i]) ? <span className={`w-3 h-3 ${pin.length === 4 ? 'bg-emerald-500' : 'bg-primary'} rounded-full animate-in zoom-in`}></span> : ""}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "delete"].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isConfirming = pin.length === 4;
                    if (key === "clear") {
                      isConfirming ? setConfirmPin("") : setPin("");
                    } else if (key === "delete") {
                      isConfirming ? setConfirmPin(confirmPin.slice(0, -1)) : setPin(pin.slice(0, -1));
                    } else {
                      if (isConfirming && confirmPin.length < 4) setConfirmPin(confirmPin + key);
                      else if (!isConfirming && pin.length < 4) setPin(pin + key);
                    }
                  }}
                  className="h-16 rounded-2xl bg-white border border-slate-100 font-bold text-xl text-slate-700 hover:bg-slate-50 active:scale-90 transition-all shadow-sm flex items-center justify-center"
                >
                  {key === "clear" ? "C" : key === "delete" ? "←" : key}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handlePinReset}
                disabled={loading || confirmPin.length !== 4}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Set New PIN & Login'}
              </button>
            </div>
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

              <div className="flex flex-col items-center gap-4">
                <button onClick={() => setFlow('mobile_entry')} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Change Number</button>

                <div className="pt-2">
                  {resendTimer > 0 ? (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resend OTP in <span className="text-slate-900">{resendTimer}s</span></p>
                  ) : (
                    <button
                      onClick={() => handleSendOtp(isResettingPin)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 active:scale-95 transition-all"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {flow === 'role_select' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 text-xl font-black shadow-inner shadow-blue-200/50">
                  O
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tighter">Account Type</h2>
                <p className="text-slate-500 text-sm font-medium italic">How will you use Open Score?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'CUSTOMER', label: 'Personal Account', sub: 'Pay, save, and borrow.', icon: <UserIcon /> },
                  { id: 'MERCHANT', label: 'Merchant Account', sub: 'Accept payments & grow.', icon: <Store /> },
                  { id: 'STUDENT', label: 'Student Account', sub: 'Learn, achieve, and borrow.', icon: <GraduationCap /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRole(item.id as any);
                      setFlow('processing');
                    }}
                    className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-blue-600/20 text-left transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.label}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 text-center border-t border-slate-100">
                <button
                  onClick={() => {
                    setFlow('mobile_entry');
                    setOtp('');
                    setRole(null);
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Start Over
                </button>
              </div>
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

      <div className="mt-8 mb-4 text-center opacity-60 pointer-events-none animate-in fade-in duration-1000 delay-500 pb-2">
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Powered by MSME Shakti</p>
      </div>
    </main>
  );
}
