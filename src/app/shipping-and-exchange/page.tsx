'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Truck, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ShippingExchangePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight daylight-text-main flex items-center gap-2">
            <Truck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Shipping & Exchange Policy
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">Last updated: November 25, 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="apple-glass p-6 space-y-5">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3">
          <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm daylight-text-main leading-relaxed">
            <strong>100% Digital SaaS Delivery:</strong> DriveCost is an entirely cloud-native and Progressive Web Application (PWA). All purchases, premium upgrades, and software licenses are fulfilled electronically with zero physical shipping required.
          </div>
        </div>

        <h2 className="text-base font-bold daylight-text-main">1. Nature of Product & Instant Electronic Delivery</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            Because DriveCost provides software-as-a-service (SaaS) subscriptions and digital tools:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>No Physical Goods:</strong> There are no physical packages, tangible hardware, or paper materials dispatched to your postal address.</li>
            <li><strong>Delivery Timeline:</strong> Upon successful transaction authorization by Razorpay or UPI AutoPay, your DriveCost Pro tier status unlocks <strong>instantly (within 0 to 5 seconds)</strong> on your active account.</li>
            <li><strong>Delivery Confirmation:</strong> An electronic invoice and digital payment confirmation receipt is delivered immediately to your registered email address.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">2. Software Exchange & Tier Switching</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            As a digital software platform, physical product exchange is not applicable. However, you can seamlessly switch or exchange your digital subscription tier at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Monthly to Annual Upgrades:</strong> You can upgrade from a monthly subscription to an annual plan directly from the checkout page. Your remaining monthly days will be credited towards the discounted annual billing.</li>
            <li><strong>Fleet & Multi-Vehicle Conversions:</strong> If you transition from Personal to Business or Enterprise Fleet tracking, your existing garage logs, documents, and historical fuel expenses remain completely intact and accessible.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">3. Shipping Charges & Delivery Costs</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          There are <strong>zero shipping fees, handling fees, or physical dispatch charges</strong> applicable on any transaction on the DriveCost platform. All listed prices (e.g. ₹74/mo or ₹749/yr) represent the complete software subscription fee inclusive of applicable electronic delivery.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">4. Questions Regarding Digital Access</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          If you experienced any network delay during payment or if your Pro badge did not unlock immediately after checkout, please contact us at <a href="mailto:chowdhurysoham007@gmail.com" className="text-blue-600 underline font-semibold">chowdhurysoham007@gmail.com</a>. We will manually verify and synchronize your digital entitlement within minutes.
        </p>
      </Card>
    </div>
  );
}
