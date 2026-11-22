'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Shield, Zap, Percent } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export function ProUpgradeModal() {
  const { isProModalOpen, setProModalOpen, updateUserSettings, setDynamicAlert, settings } = useAppStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Surprise discount state: hidden until "Activate Pro mode" is clicked
  const isFirstTimeUser = !settings?.hasSubscribedBefore;
  const [isOfferActivated, setIsOfferActivated] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  if (!isProModalOpen) return null;

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

  const handleUpgrade = () => {
    setProModalOpen(false);
    window.location.href = '/checkout';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="apple-glass max-w-lg w-full p-6 sm:p-8 relative overflow-hidden text-white border border-white/20 shadow-2xl"
          style={{ background: 'rgba(20, 20, 26, 0.92)' }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setProModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Pro Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide text-purple-300 bg-purple-500/20 border border-purple-400/30 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>DRIVECOST PRO</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Supercharge with DriveCost Pro
          </h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Manage unlimited vehicles, backup documents, and unlock audit-ready tax reports.
          </p>

          {/* First-Time User Surprise / Activate Pro Mode Card */}
          {isFirstTimeUser && (
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-purple-500/15 border border-purple-400/30 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      DriveCost Pro Mode
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {isOfferActivated ? '25% discount applied' : 'Special promo available'}
                    </div>
                  </div>
                </div>

                {!isOfferActivated ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <Button
                      type="button"
                      onClick={handleActivateOffer}
                      className="py-1.5 px-3 text-[11px] font-black bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md rounded-xl cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      <span>Activate Pro mode</span>
                    </Button>
                    <span className="text-[10px] text-purple-300 font-medium">
                      A surprise is waiting for you
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>25% Discount Applied</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing Cycle Switcher */}
          <div className="p-1.5 rounded-2xl bg-white/10 flex items-center mb-6 relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Monthly</span>
              <span className="block text-[10px] font-normal opacity-90">
                ₹{monthlyPrice} / mo {isOfferActivated && <del className="opacity-60">₹99</del>}
              </span>
            </button>

            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>Annual</span>
                {isOfferActivated && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-extrabold uppercase">
                    25% OFF
                  </span>
                )}
              </div>
              <span className="block text-[10px] font-normal opacity-90">
                ₹{yearlyPrice} / yr {isOfferActivated && <del className="opacity-60">₹999</del>}{' '}
                (~₹{Math.round(yearlyPrice / 12)}/mo)
              </span>
            </button>
          </div>

          {/* Key Pro Features */}
          <div className="space-y-3 mb-6">
            {[
              'Unlimited Vehicles (Cars, Bikes, Scooters & Commercial Fleet)',
              'Digital RC, Insurance & PUC Document Vault Storage',
              'Audit-Ready Tax Reports & Formatted PDF / Excel Export',
              'Trip-by-Trip Fuel Consumption & Cost/Km Variance',
              'Encrypted Cloud Synchronization & Multi-Device Access'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing CTA */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full py-4 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 border border-white/20 cursor-pointer"
            >
              Continue to Secure Payment (₹{billingCycle === 'yearly' ? yearlyPrice : monthlyPrice})
            </Button>
            <div className="text-[11px] text-center text-slate-400">
              Instant activation via official UPI QR Code verification.
            </div>
          </div>
        </motion.div>

        {/* Modal Pop-up: Instant 25% discount for first-time users */}
        {showOfferPopup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <div className="apple-glass max-w-sm w-full p-6 relative overflow-hidden border border-purple-500/40 shadow-2xl text-center rounded-3xl bg-slate-900/95 text-white">
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
      </div>
    </AnimatePresence>
  );
}
