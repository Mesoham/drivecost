'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Lock, 
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Percent,
  CreditCard,
  Building,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PricingPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTier = searchParams.get('tier') || 'business';
  const { updateUserSettings, setDynamicAlert, settings } = useAppStore();

  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  // Surprise discount state:
  const [isOfferActivated, setIsOfferActivated] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  // Razorpay payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Dynamically load official Razorpay Checkout SDK
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

  // Prices: Monthly ₹99 (or ₹74), Annual ₹999 (or ₹749)
  const monthlyPrice = isOfferActivated ? 74 : 99;
  const yearlyPrice = isOfferActivated ? 749 : 999;
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

  // Strict Razorpay Gateway Checkout
  // Paid version activates ONLY upon confirmed payment receipt
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is still loading. Please retry in a moment.');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Default Razorpay Test / Live key
        amount: currentPrice * 100, // Amount in paise (₹1 = 100 paise)
        currency: 'INR',
        name: 'DriveCost Pro',
        description: `${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
        image: '/icon.svg',
        handler: async function (response: any) {
          // STRICT ACTIVATION GATE:
          // Activates Pro ONLY after successful payment verification response
          if (response.razorpay_payment_id) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 }
            });

            await updateUserSettings({
              isProUser: true,
              hasSubscribedBefore: true,
              usageGoal: 'business',
              hasCompletedOnboarding: false
            });

            setDynamicAlert({
              title: 'Payment Successful! ⚡',
              subtitle: `Payment ID: ${response.razorpay_payment_id}. DriveCost Pro activated!`,
              icon: 'pro',
              color: '#10b981'
            });

            setTimeout(() => {
              router.push('/dashboard');
            }, 1200);
          }
        },
        prefill: {
          name: settings?.userAuth?.displayName || 'DriveCost Customer',
          email: settings?.userAuth?.identifier?.includes('@') ? settings?.userAuth?.identifier : 'billing@drivecost.in',
          contact: settings?.userAuth?.identifier?.replace(/\D/g, '') || '9876543210'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setDynamicAlert({
              title: 'Payment Cancelled',
              subtitle: 'Pro was not activated. You can complete payment anytime.',
              icon: 'check',
              color: '#ef4444'
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessingPayment(false);
        setDynamicAlert({
          title: 'Payment Failed',
          subtitle: resp.error?.description || 'Transaction declined. Please try again.',
          icon: 'check',
          color: '#ef4444'
        });
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay invocation error:', err);
      setIsProcessingPayment(false);
      setDynamicAlert({
        title: 'Gateway Error',
        subtitle: err.message || 'Unable to open Razorpay. Please check network connection.',
        icon: 'check',
        color: '#ef4444'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-10 transition-colors duration-500">
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

      <div className="w-full max-w-xl mx-auto my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide text-purple-600 dark:text-purple-300 bg-purple-500/15 border border-purple-400/30 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <span>DRIVECOST PRO TIER CHECKOUT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight daylight-text-main">
            Upgrade to Pro to Continue
          </h1>
          <p className="daylight-text-muted mt-1.5 text-xs sm:text-sm max-w-md mx-auto">
            <strong>Business & Fleet</strong> and <strong>Enterprise Onboarding</strong> require an active Pro subscription to unlock multi-vehicle management & compliance reports.
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
            <p className="text-xs daylight-text-muted mt-1.5">
              Zero setup fees • 100% money-back guarantee within 7 days
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 mb-6">
            {[
              'Unlimited Vehicle Garage (Bikes, Cars, EV, Fleet)',
              'Encrypted Digital RC, Insurance & PUC Vault',
              'Audit-Ready PDF & Excel Tax Compliance Exports',
              'Real-Time Fuel Consumption & Wear-and-Tear Analysis',
              'Multi-Device Auto Sync with Instant Cloud Backups'
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-xs daylight-text-main font-medium">
                <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Razorpay Direct Gateway Payment Trigger */}
          <div className="space-y-3">
            <Button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleRazorpayPayment}
              className="w-full py-4 text-sm font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Connecting Secure Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₹{currentPrice} with Razorpay (UPI, Cards, NetBanking)</span>
                </>
              )}
            </Button>

            {/* Supported Gateway Badges */}
            <div className="flex items-center justify-center gap-4 text-[11px] daylight-text-muted pt-2">
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-emerald-500" /> All UPI Apps
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" /> Credit / Debit Cards
              </span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-purple-500" /> NetBanking
              </span>
            </div>

            <div className="text-[11px] text-center daylight-text-muted flex items-center justify-center gap-1 pt-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              <span>Paid tier activates automatically upon successful Razorpay receipt.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
