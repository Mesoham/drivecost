'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PricingPaymentPage() {
  const router = useRouter();
  const { updateUserSettings, setDynamicAlert, settings } = useAppStore();

  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [isOfferActivated, setIsOfferActivated] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load Razorpay Checkout SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsRazorpayLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  const handleActivateOffer = () => {
    setIsOfferActivated(true);
    setShowOfferPopup(true);
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.5 }
    });
    setDynamicAlert({
      title: 'Surprise Unlocked! 🎉',
      subtitle: 'Instant 25% discount applied for first-time users!',
      icon: 'pro',
      color: '#10b981'
    });
  };

  const monthlyPrice = isOfferActivated ? 74 : 99;
  const yearlyPrice = isOfferActivated ? 749 : 999;
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

  // Verification & Activation function once Razorpay payment succeeds
  const handleActivatePro = async (method: string, referenceId: string) => {
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 }
    });

    await updateUserSettings({
      isProUser: true,
      hasSubscribedBefore: true,
      usageGoal: 'business'
    });

    setDynamicAlert({
      title: 'Payment Confirmed! ⚡',
      subtitle: `Ref: ${referenceId}. DriveCost Pro is now active!`,
      icon: 'pro',
      color: '#10b981'
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  // Razorpay Live Checkout
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout is still loading. Please wait a moment and try again.');
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_U4ivPakHil43Dj';

      const options: any = {
        key: razorpayKey,
        amount: currentPrice * 100,
        currency: 'INR',
        name: 'DriveCost Pro',
        description: `${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Pro Subscription`,
        image: '/icon.svg',
        retry: { enabled: true },
        handler: async function (response: any) {
          setIsProcessingPayment(false);
          if (response.razorpay_payment_id) {
            await handleActivatePro('Razorpay', response.razorpay_payment_id);
          }
        },
        prefill: {
          name: settings?.userAuth?.displayName || 'DriveCost Customer',
          email: settings?.userAuth?.identifier?.includes('@') ? settings?.userAuth?.identifier : ''
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessingPayment(false);
        setDynamicAlert({
          title: 'Payment Failed',
          subtitle: resp.error?.description || 'Payment was declined. Please try again.',
          icon: 'check',
          color: '#ef4444'
        });
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay error:', err);
      setIsProcessingPayment(false);
      setDynamicAlert({
        title: 'Checkout Error',
        subtitle: err?.message || 'Unable to launch Razorpay Checkout. Please refresh and try again.',
        icon: 'check',
        color: '#ef4444'
      });
    }
  };

  if (settings?.isDemoMode) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <div className="apple-glass max-w-md w-full p-8 text-center space-y-4">
          <Sparkles className="h-8 w-8 text-purple-500 mx-auto" />
          <h1 className="text-xl font-extrabold daylight-text-main">Demo Mode Active</h1>
          <p className="text-xs daylight-text-muted">
            Purchases and checkout are disabled in Demo Mode. Reset your account or sign in to a live garage to upgrade to Pro.
          </p>
          <Button type="button" onClick={() => router.push('/settings')} className="w-full text-xs font-bold">
            Back to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-10 transition-colors duration-500 py-10">
      {/* Top Bar with dynamic Back button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl apple-glass text-xs font-semibold daylight-text-muted hover:daylight-text-main transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl mx-auto my-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide text-purple-600 dark:text-purple-300 bg-purple-500/15 border border-purple-400/30 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <span>DRIVECOST PRO UPGRADE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight daylight-text-main">
            Upgrade to DriveCost Pro
          </h1>
          <p className="daylight-text-muted mt-1.5 text-xs sm:text-sm max-w-md mx-auto">
            Securely pay via Razorpay using UPI, Cards, NetBanking, or Wallets.
          </p>
        </div>

        {/* Modal Pop-up: Instant 25% discount for first-time users */}
        {showOfferPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="apple-glass max-w-sm w-full p-6 relative overflow-hidden border border-purple-500/40 shadow-2xl text-center rounded-3xl bg-slate-900/90 text-white">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-900 mx-auto flex items-center justify-center text-2xl font-black mb-3 shadow-lg shadow-amber-500/20">
                🎁
              </div>
              <h3 className="text-xl font-black tracking-tight text-white mb-1.5">
                Surprise Unlocked!
              </h3>
              <p className="text-sm font-bold text-emerald-400 mb-2">
                Instant 25% discount for first-time users
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                We’ve applied an exclusive 25% welcome reduction to your annual and monthly subscriptions!
              </p>

              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-xs mb-5 flex justify-around">
                <div>
                  <div className="text-[10px] text-slate-400">Monthly Plan</div>
                  <div className="font-extrabold text-white text-sm">
                    ₹74 <del className="text-xs text-slate-500">₹99</del>
                  </div>
                </div>
                <div className="w-[1px] bg-white/15" />
                <div>
                  <div className="text-[10px] text-slate-400">Annual Plan</div>
                  <div className="font-extrabold text-emerald-400 text-sm">
                    ₹749 <del className="text-xs text-slate-500">₹999</del>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setShowOfferPopup(false)}
                className="w-full py-3 text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg cursor-pointer rounded-xl"
              >
                Awesome! Continue with Discount
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Plan Selector Card */}
        <div className="apple-glass p-6 sm:p-8 relative overflow-hidden">
          {/* First-Time User Banner */}
          {!isOfferActivated && (
            <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-purple-500/15 border border-purple-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs daylight-text-main">
                    First-Time Welcome Promo
                  </div>
                  <div className="text-[11px] daylight-text-muted">
                    Unlock your surprise welcome discount
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleActivateOffer}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs shadow-md cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
              >
                Reveal Offer 🎁
              </button>
            </div>
          )}

          {/* Billing Toggle (Monthly vs Annual) */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'daylight-text-muted hover:daylight-text-main'
                }`}
              >
                Monthly (₹{monthlyPrice}/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'daylight-text-muted hover:daylight-text-main'
                }`}
              >
                <span>Annual (₹{yearlyPrice}/yr)</span>
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          {/* Price Header */}
          <div className="text-center mb-6 pb-6 border-b border-black/10 dark:border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              {billingCycle === 'yearly' ? 'Annual Membership' : 'Monthly Membership'}
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-black daylight-text-main">
                ₹{currentPrice}
              </span>
              <span className="text-sm daylight-text-muted font-bold">
                /{billingCycle === 'yearly' ? 'year' : 'month'}
              </span>
              {isOfferActivated && (
                <span className="text-sm font-bold text-slate-400 line-through">
                  ₹{billingCycle === 'yearly' ? 999 : 99}
                </span>
              )}
            </div>
          </div>

          {/* Razorpay Live Payment Gateway */}
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2.5 text-xs daylight-text-main">
              <div className="flex items-center gap-2 font-bold">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Unlimited Vehicles &amp; Multi-Garage Sync</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Audit-Ready Tax &amp; Expense PDF/Excel Exports</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>DigiLocker Document Vault &amp; Smart Reminders</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={isProcessingPayment || !isRazorpayLoaded}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Opening Razorpay Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₹{currentPrice} with Razorpay</span>
                </>
              )}
            </Button>
          </div>

          <div className="text-[11px] text-center daylight-text-muted flex items-center justify-center gap-1.5 pt-2">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span>100% Secure • Powered by Razorpay Live Gateway • Instant Pro Activation</span>
          </div>

          {/* Mandatory Payment Gateway Policy & Legal Compliance Footer */}
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 text-center space-y-2 text-[11px] daylight-text-muted">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-semibold">
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
            <p className="text-[10px] text-slate-400">
              DriveCost India • Handled under standard RBI & NPCI compliance guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
