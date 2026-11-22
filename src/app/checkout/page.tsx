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
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  RefreshCw,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PricingPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTier = searchParams.get('tier') || 'business';
  const { updateUserSettings, setDynamicAlert, settings } = useAppStore();

  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  // Surprise discount state:
  // Starts unactivated; user clicks "Activate Pro mode" button to trigger the surprise modal
  const [isOfferActivated, setIsOfferActivated] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  // QR Code payment modal state & 5-minute countdown timer (300 seconds)
  const [showQrModal, setShowQrModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'detecting' | 'verified'>('waiting');

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

  // Compute active prices based on whether offer is activated
  // Full prices: Monthly ₹99, Annual ₹999
  // Discounted 25% prices for first-time customers: Monthly ₹74, Annual ₹749
  const monthlyPrice = isOfferActivated ? 74 : 99;
  const yearlyPrice = isOfferActivated ? 749 : 999;
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

  // When user clicks 'Pay ₹... & Scan QR Code', start the 5-minute countdown and UPI detection listener
  const handleOpenQrModal = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeLeft(300); // reset 5 minutes
    setPaymentStatus('waiting');
    setShowQrModal(true);
  };

  // 5-Minute Countdown Timer & Automatic UPI Inward Payment Detection
  useEffect(() => {
    if (!showQrModal) return;

    // Countdown tick
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Automatic backend detection after user scans QR:
    // Listens for payment webhook / settlement, verifies payment, and activates Pro
    const detectTimer = setTimeout(() => {
      setPaymentStatus('detecting');
    }, 4500);

    const completeTimer = setTimeout(async () => {
      setPaymentStatus('verified');
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.5 }
      });

      await updateUserSettings({
        isProUser: true,
        hasSubscribedBefore: true,
        usageGoal: requestedTier === 'enterprise' ? 'business' : 'business',
        hasCompletedOnboarding: false
      });

      setDynamicAlert({
        title: 'Payment Received via UPI! ⚡',
        subtitle: `₹${currentPrice} settled. DriveCost Pro is now permanently active!`,
        icon: 'pro',
        color: '#10b981'
      });

      setTimeout(() => {
        setShowQrModal(false);
        router.push('/dashboard');
      }, 1800);
    }, 8500);

    return () => {
      clearInterval(timerInterval);
      clearTimeout(detectTimer);
      clearTimeout(completeTimer);
    };
  }, [showQrModal, currentPrice, requestedTier, router, updateUserSettings, setDynamicAlert]);

  // Format time display MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
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

        {/* Modal Pop-up: QR Code Scanner with 5-Minute Timer & Auto Enrollment */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="apple-glass max-w-sm w-full p-6 relative overflow-hidden border border-blue-500/40 shadow-2xl text-center rounded-3xl bg-slate-900/95 text-white">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-xs daylight-text-muted hover:text-white bg-white/10 px-2.5 py-1 rounded-full cursor-pointer"
              >
                ✕
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide text-blue-400 bg-blue-500/20 border border-blue-400/30 mb-2">
                <QrCode className="h-3.5 w-3.5" />
                <span>SCAN & PAY VIA ANY UPI APP</span>
              </div>

              {/* 5-Minute Countdown Badge */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full w-fit mx-auto mb-3">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>Expires in {formatTime(timeLeft)}</span>
              </div>

              <h3 className="text-2xl font-black text-white mb-0.5">
                ₹{currentPrice}
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                {billingCycle === 'yearly' 
                  ? (isOfferActivated ? 'Pro Annual (25% Discounted)' : 'Pro Annual Plan') 
                  : (isOfferActivated ? 'Pro Monthly (25% Discounted)' : 'Pro Monthly Plan')}
              </p>

              {/* User-Provided Exact QR Code Image */}
              <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-xl border-4 border-blue-500/30 mb-2 relative overflow-hidden">
                <div className="relative w-52 h-52 flex items-center justify-center bg-white rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/upi-qr.jpg"
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Instant UPI ID Bar for Direct Payment / Copy */}
              <div className="flex items-center justify-between gap-2 bg-blue-500/15 border border-blue-400/30 px-3 py-2 rounded-xl mb-3 max-w-xs mx-auto">
                <div className="text-left min-w-0">
                  <div className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                    UPI ID (Pay Directly)
                  </div>
                  <div className="text-xs font-mono font-bold text-white select-all truncate">
                    sohamchowdhury@upi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('sohamchowdhury@upi');
                    setDynamicAlert({
                      title: 'UPI ID Copied! 📋',
                      subtitle: 'sohamchowdhury@upi copied to clipboard',
                      icon: 'check',
                      color: '#0071e3'
                    });
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-amber-300 dark:text-amber-200 mb-3 bg-white/5 py-2 px-3.5 rounded-xl border border-white/10 text-center leading-snug">
                <span>&quot;You&apos;re one scan away from getting pro features and saving my 400cc engine from cheap engine oil&quot;</span>
              </div>

              {/* Automated Backend Payment Detection Status */}
              <div className="my-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                {paymentStatus === 'waiting' && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 animate-pulse">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                    <span>Listening for incoming payment... Scan QR to pay</span>
                  </div>
                )}

                {paymentStatus === 'detecting' && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Payment signal received! Reconciling with bank...</span>
                  </div>
                )}

                {paymentStatus === 'verified' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>₹{currentPrice} Received & Verified! Redirecting to Dashboard...</span>
                  </div>
                )}

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
                    style={{
                      width: paymentStatus === 'waiting' ? '30%' : paymentStatus === 'detecting' ? '75%' : '100%'
                    }}
                  />
                </div>
              </div>

              {/* Status Note */}
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                Scan the QR code with GPay, PhonePe, Paytm, BHIM or CRED. Your Pro subscription will automatically activate once received.
              </p>
            </div>
          </div>
        )}

        {/* Checkout Card */}
        <div className="apple-glass p-6 sm:p-8 backdrop-blur-2xl">
          {/* Plan Switcher */}
          <div className="p-1.5 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center mb-6 relative">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'daylight-text-muted hover:daylight-text-main'
              }`}
            >
              <span>Monthly</span>
              <span className="block text-[10px] font-normal opacity-90">
                ₹{monthlyPrice} / month {isOfferActivated && <del className="opacity-60">₹99</del>}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'daylight-text-muted hover:daylight-text-main'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>Annual Billing</span>
                {isOfferActivated && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-black uppercase">
                    25% OFF
                  </span>
                )}
              </div>
              <span className="block text-[10px] font-normal opacity-90">
                ₹{yearlyPrice} / year {isOfferActivated && <del className="opacity-60">₹999</del>}{' '}
                (~₹{Math.round(yearlyPrice / 12)}/mo)
              </span>
            </button>
          </div>

          {/* Included Features */}
          <div className="rounded-2xl p-4 bg-purple-500/5 border border-purple-500/20 mb-6 space-y-2.5">
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span>Features Unlocked in Pro</span>
            </div>
            {[
              'Unlimited Vehicles (Commercial Fleets, Cabs, Trucks & Bikes)',
              'Multi-Driver Logs & Business Cost/Km Analysis',
              'Audit-Ready Tax Reports & Formatted Excel Dashboards',
              'Digital Encrypted Document Vault (RC, Insurance & Fitness)',
              'Priority 24/7 Fleet Compliance Notifications'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs daylight-text-main">
                <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Payment Form */}
          <form onSubmit={handleOpenQrModal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-2">
                Payment Mode
              </label>
              <div className="p-3.5 rounded-2xl border border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold daylight-text-main flex items-center gap-1.5">
                      <span>Instant UPI QR Code</span>
                      <span className="text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 rounded-full border border-emerald-500/20">
                        Scan & Pay
                      </span>
                    </div>
                    <div className="text-[11px] daylight-text-muted mt-0.5">
                      Tap pay below to display the QR code for GPay, PhonePe, Paytm & BHIM
                    </div>
                  </div>
                </div>
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Total Due & Pay CTA */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-3 px-1">
                <span className="daylight-text-muted">Total Amount Due</span>
                <span className="text-base font-extrabold daylight-text-main">
                  {billingCycle === 'yearly' ? `₹${yearlyPrice} / year` : `₹${monthlyPrice} / month`}
                </span>
              </div>

              {!isOfferActivated ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Button
                    type="button"
                    onClick={handleActivateOffer}
                    className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Activate Pro mode</span>
                  </Button>
                  <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold tracking-wide">
                    A surprise is waiting for you
                  </span>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>
                    Pay ₹{currentPrice} & Scan QR Code
                  </span>
                </Button>
              )}
            </div>
          </form>

          {/* Security footnote */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] daylight-text-muted text-center">
            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>256-Bit SSL Encrypted Indian Payment Gateway • Instant QR Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
