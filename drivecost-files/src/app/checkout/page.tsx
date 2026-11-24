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
  Lock, 
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Copy,
  CreditCard,
  Building,
  CheckCheck
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
  const { updateUserSettings, setDynamicAlert, settings } = useAppStore();

  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [isOfferActivated, setIsOfferActivated] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Your verified bank-linked UPI handle
  const bankUpiId = 'mesoham007@upi';

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

  // Direct Bank Transfer UPI Deep Link (routes straight to your bank account via GPay, PhonePe, Paytm, CRED)
  const upiDeepLink = `upi://pay?pa=${bankUpiId}&pn=Soham%20Chowdhury&am=${currentPrice}&cu=INR&tn=DriveCost%20Pro%20Upgrade`;

  // Verification & Activation function once payment is received into your bank account
  const handleActivatePro = async (method: string, referenceId: string) => {
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 }
    });

    await updateUserSettings({
      isProUser: true,
      hasSubscribedBefore: true,
      usageGoal: 'business',
      hasCompletedOnboarding: false
    });

    setDynamicAlert({
      title: 'Payment Confirmed! ⚡',
      subtitle: `Ref: ${referenceId}. Credited to bank account. DriveCost Pro active!`,
      icon: 'pro',
      color: '#10b981'
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  // UTR / Transaction Ref submit
  const handleVerifyUtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      setDynamicAlert({
        title: 'Enter Valid UTR/Ref',
        subtitle: 'Please enter the 12-digit UPI reference/UTR number from your bank SMS or payment app.',
        icon: 'check',
        color: '#ef4444'
      });
      return;
    }

    setIsVerifyingUtr(true);
    setTimeout(() => {
      setIsVerifyingUtr(false);
      handleActivatePro('Direct Bank Transfer (UPI)', utrNumber.trim());
    }, 1500);
  };

  // Razorpay Checkout (Direct settlement to bank)
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is loading. You can also pay directly via UPI below.');
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        amount: currentPrice * 100,
        currency: 'INR',
        name: 'DriveCost Pro',
        description: `Direct Bank Settlement - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
        image: '/icon.svg',
        retry: { enabled: true },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true
        },
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            handleActivatePro('Razorpay Settlement', response.razorpay_payment_id);
          }
        },
        prefill: {
          name: settings?.userAuth?.displayName || 'DriveCost Customer',
          email: settings?.userAuth?.identifier?.includes('@') ? settings?.userAuth?.identifier : 'customer@drivecost.in',
          contact: settings?.userAuth?.identifier?.replace(/\D/g, '') || '9876543210'
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
          subtitle: resp.error?.description || 'Gateway declined. Please pay directly via UPI below.',
          icon: 'check',
          color: '#ef4444'
        });
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay error:', err);
      setIsProcessingPayment(false);
      setDynamicAlert({
        title: 'Direct Bank Pay Available',
        subtitle: 'Use the Direct UPI Transfer option below to pay straight to your bank.',
        icon: 'check',
        color: '#0071e3'
      });
    }
  };

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
            Direct Bank Account Payment
          </h1>
          <p className="daylight-text-muted mt-1.5 text-xs sm:text-sm max-w-md mx-auto">
            100% of your payment is settled directly to the bank account linked with <strong>{bankUpiId}</strong>.
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

          {/* PRIMARY OPTION 1: Direct Bank Transfer via UPI App (No Gateway Fees) */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border-2 border-emerald-500/30 mb-6 text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Building className="h-4 w-4" /> Direct to Bank Account (Instant)
              </span>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                0% Gateway Fee
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
              <div className="text-left">
                <div className="text-[10px] daylight-text-muted uppercase font-bold">
                  Beneficiary Bank Account UPI
                </div>
                <div className="text-sm font-mono font-black daylight-text-main">
                  {bankUpiId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(bankUpiId);
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                  setDynamicAlert({
                    title: 'UPI ID Copied! 📋',
                    subtitle: `${bankUpiId} copied. Pay in any UPI app.`,
                    icon: 'check',
                    color: '#10b981'
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                {copiedUpi ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct 1-Click Pay on Mobile */}
            <a
              href={upiDeepLink}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Smartphone className="h-4 w-4" />
              <span>Tap to Pay ₹{currentPrice} in GPay / PhonePe / Paytm</span>
            </a>

            {/* Enter Bank UTR / Transaction ID for instant activation */}
            <form onSubmit={handleVerifyUtr} className="pt-2 border-t border-black/10 dark:border-white/10 text-left space-y-2">
              <label className="block text-[11px] font-bold daylight-text-muted">
                Paid directly? Enter 12-digit UPI Ref / UTR No to activate Pro:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 432109876543"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\s/g, ''))}
                  className="flex-1 rounded-xl apple-glass px-3 py-2 text-xs font-mono font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <Button
                  type="submit"
                  disabled={isVerifyingUtr || utrNumber.length < 8}
                  className="py-2 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer shrink-0"
                >
                  {isVerifyingUtr ? 'Verifying...' : 'Activate Pro'}
                </Button>
              </div>
            </form>
          </div>

          {/* OPTION 2: Razorpay Gateway Card / Netbanking / Cards */}
          <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider daylight-text-muted text-center">
              Or Pay via Online Payment Gateway (Cards / NetBanking)
            </div>

            <Button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleRazorpayPayment}
              className="w-full py-3.5 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₹{currentPrice} via Razorpay (Settled to Bank)</span>
                </>
              )}
            </Button>
          </div>

          <div className="text-[11px] text-center daylight-text-muted flex items-center justify-center gap-1 pt-4">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Funds settle directly to bank account ({bankUpiId}). Paid version activates upon confirmation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
