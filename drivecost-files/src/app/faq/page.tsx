'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  HelpCircle, 
  Fuel, 
  CheckCircle, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  Smartphone, 
  Calculator,
  Lock,
  Layers,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Fuel Efficiency & Mileage',
      icon: Fuel,
      q: 'How does DriveCost calculate vehicle mileage, especially with partial refills?',
      a: (
        <div className="space-y-2">
          <p>
            DriveCost uses the internationally recognized <strong>Full-to-Full (Tank-to-Tank) method</strong>. It is the only 100% accurate way to measure real-world mileage without expensive onboard computer hardware.
          </p>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-[11px]">
            <strong className="text-blue-600 dark:text-blue-400 block font-bold">Simple Real-World Example:</strong>
            <p>1. <strong>Stop 1 (Full Tank):</strong> You fill your car to full at <strong>10,000 km</strong>.</p>
            <p>2. <strong>Driving:</strong> You drive the car for several days.</p>
            <p>3. <strong>Stop 2 (Next Full Tank):</strong> You fill the tank to full again at <strong>10,500 km</strong>. The pump dispensed <strong>25 Litres</strong>.</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-blue-500/20">
              Calculation: (10,500 km - 10,000 km) ÷ 25 Litres = 500 km ÷ 25 L = <strong>20.0 km/l</strong>
            </p>
          </div>
          <p className="text-[11px] daylight-text-muted">
            <strong>What happens with Partial Refills?</strong> If you only add ₹500 or 5 Litres without filling to the brim, you cannot tell how much fuel is left in the tank. DriveCost keeps track of those partial litres in the background. As soon as you next fill the tank to 100% full, it combines all those partial litres together with the final fill and calculates your true, accurate average for the entire period.
          </p>
        </div>
      )
    },
    {
      category: 'Offline & Local-First Architecture',
      icon: ShieldCheck,
      q: 'Does DriveCost work completely offline without an internet connection?',
      a: 'Yes, 100%. DriveCost is engineered as a local-first Progressive Web App (PWA). All vehicle logs, fuel fills, maintenance records, and reminders are stored securely on your device inside an IndexedDB database. You can record expenses in underground basements, remote highways, or hill stations without any network signal.'
    },
    {
      category: 'Vehicle Color & Adaptive UI',
      icon: Palette,
      q: 'How does the "Your vehicle color is your app color" feature work?',
      a: 'During onboarding or when adding any vehicle, you can select your vehicle\'s exact exterior shade using the curated presets or continuous rainbow spectrum slider. DriveCost dynamically updates the ambient atmospheric lighting aura, active tab gliders, and brand emblems to reflect your vehicle\'s color in real time across both Daylight and Darkside modes.'
    },
    {
      category: 'PWA & Mobile Installation',
      icon: Smartphone,
      q: 'How can I download and use DriveCost as an app on my phone?',
      a: 'On Android (Chrome): tap the three dots in the top right and select "Install app" or "Add to Home screen". On iOS (Safari): tap the Share button in the bottom bar and choose "Add to Home Screen". The app installs as a native-like icon on your home screen and operates full-screen with offline support.'
    },
    {
      category: 'Free Tier vs. Pro Version',
      icon: Sparkles,
      q: 'What is the difference between the Free tier and DriveCost Pro?',
      a: 'The Free tier allows complete expense and mileage tracking for 1 vehicle forever. DriveCost Pro unlocks unlimited vehicles (cars, bikes, scooters, commercial trucks), digital document vaults (RC, insurance, PUC storage), audit-ready tax exports in Excel & PDF formats, and advanced cost-per-km variance analytics for ₹74/month or ₹749/year (with 25% first-time discount applied).'
    },
    {
      category: 'Data Privacy & Security',
      icon: Lock,
      q: 'Are my vehicle documents, registration numbers, and expenses tracked or uploaded?',
      a: 'Never. DriveCost has zero third-party telemetry, zero advertisement trackers, and zero remote analytics. Your data lives exclusively within your browser/device sandbox. You also have full one-click backup and restore options in the Settings tab to export or import your data anytime.'
    },
    {
      category: 'Cost Per Kilometre Insights',
      icon: Calculator,
      q: 'How is "Cost Per Kilometre" calculated?',
      a: 'DriveCost continuously calculates two cost metrics: Total Running Cost per km (all maintenance, insurance, fuel, repairs, and fees divided by total distance recorded) and Pure Fuel Cost per km (total fuel expense divided by distance between logged odometer intervals).'
    },
    {
      category: 'Odometer Corrections',
      icon: Layers,
      q: 'What should I do if I mistyped an odometer reading?',
      a: 'You can edit any expense at any time by clicking the Edit icon on the Expenses page, or update your vehicle\'s live odometer directly on the Vehicle Details page. DriveCost will automatically recalculate mileage sequences without corrupting prior records.'
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight daylight-text-main">
            Frequently Asked Questions
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">
            Everything you need to know about DriveCost, mileage calculations & offline storage
          </p>
        </div>
      </div>

      {/* Accordion FAQ List with Apple Liquid Glass Sheen */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const Icon = faq.icon;

          return (
            <div
              key={index}
              className="apple-glass rounded-2xl border border-black/8 dark:border-white/10 overflow-hidden transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-4.5 text-left flex items-center justify-between gap-4 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl apple-glass flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs border border-black/5 dark:border-white/10">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-sm daylight-text-main group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {faq.q}
                    </h3>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="h-7 w-7 rounded-full apple-glass flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 text-slate-500"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs daylight-text-sub leading-relaxed border-t border-black/5 dark:border-white/5 pl-16">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Helpful Guarantee Footnote */}
      <div className="p-4 rounded-2xl apple-glass border border-emerald-500/20 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-xs daylight-text-sub leading-relaxed">
          <strong>DriveCost Guarantee:</strong> All numbers, calculations, and vehicle documents remain 100% on your device with offline reliability.
        </p>
      </div>
    </div>
  );
}
