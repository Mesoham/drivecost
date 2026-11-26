'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { switchUserAccount, setDynamicAlert } = useAppStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const completeLogin = async (user: any) => {
    const accountKey = user.email || user.uid;
    const { vehicles: userVehicles } = await switchUserAccount(accountKey, {
      isLoggedIn: true,
      authMethod: 'google',
      identifier: user.email || '',
      displayName: user.displayName || 'DriveCost User'
    });

    setDynamicAlert({
      title: 'Signed in successfully! ✨',
      subtitle: `Welcome, ${user.displayName || user.email}`,
      icon: 'check',
      color: '#0071e3'
    });

    if (userVehicles.length === 0) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  // Handle redirect-based Google Sign-In return
  useEffect(() => {
    let active = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (active && result?.user) {
          setGoogleLoading(true);
          await completeLogin(result.user);
        }
      })
      .catch((err: any) => {
        console.error('Google Redirect Sign-In Error:', err);
        if (active && err?.code !== 'auth/popup-closed-by-user') {
          setDynamicAlert({
            title: 'Google Sign-In Failed',
            subtitle: err?.code ? `${err.code}: ${err.message}` : (err?.message || 'Please try again.'),
            icon: 'check',
            color: '#ff3b30'
          });
        }
      })
      .finally(() => {
        if (active) setGoogleLoading(false);
      });
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1-Click Clean Google Authentication via official on-device Google chooser
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      await completeLogin(result.user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const code = err?.code || '';

      // Automatically fall back to full-page redirect if popup is blocked or unsupported
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          console.error('Google Redirect Fallback Error:', redirectErr);
        }
      }

      if (code !== 'auth/popup-closed-by-user') {
        setDynamicAlert({
          title: 'Google Sign-In Failed',
          subtitle: code ? `${code}: ${err.message}` : (err.message || 'Please try again.'),
          icon: 'check',
          color: '#ff3b30'
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-10 transition-colors duration-500 py-12">
      {/* Top bar theme switcher with liquid-glass glide */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="h-16 w-16 rounded-3xl mx-auto flex items-center justify-center p-1.5 shadow-xl mb-4 transition-all duration-500 border border-white/20 shadow-blue-500/25 bg-slate-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="DriveCost Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight daylight-text-main">
            DriveCost
          </h1>
          <p className="daylight-text-muted mt-1.5 text-sm font-medium">
            Know what your vehicle really costs.
          </p>
        </div>

        {/* Clean 1-Click Sign-in Card */}
        <div className="apple-glass p-6 sm:p-8 backdrop-blur-2xl">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold daylight-text-main mb-1">
              Welcome to Your Garage
            </h2>
            <p className="text-xs daylight-text-muted">
              Sign in with your Google account to sync all vehicles, fuel logs, and reminders securely.
            </p>
          </div>

          {/* Primary 1-Click Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-4 px-4 rounded-2xl apple-glass border border-black/10 dark:border-white/15 daylight-text-main font-bold text-sm flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md cursor-pointer group bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
          >
            {googleLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Value Props */}
          <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs daylight-text-muted">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Instant sync across all your phones and tablets</span>
            </div>
            <div className="flex items-center gap-2 text-xs daylight-text-muted">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Zero SMS codes, zero passwords, zero captchas</span>
            </div>
            <div className="flex items-center gap-2 text-xs daylight-text-muted">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% private & client-side encrypted vault</span>
            </div>
          </div>
        </div>

        {/* Local privacy guarantee */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs daylight-text-muted">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Local-first vault • 100% encrypted & private to this device</span>
        </div>

        {/* Razorpay & Legal Compliance Footer */}
        <div className="pt-4 text-center space-y-1.5 text-[11px] daylight-text-muted">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium">
            <Link href="/terms" className="hover:text-blue-500 hover:underline">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-blue-500 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/cancellation-and-refund" className="hover:text-blue-500 hover:underline">
              Cancellation & Refund
            </Link>
            <span>•</span>
            <Link href="/shipping-and-exchange" className="hover:text-blue-500 hover:underline">
              Shipping & Exchange
            </Link>
            <span>•</span>
            <Link href="/contact-us" className="hover:text-blue-500 hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
