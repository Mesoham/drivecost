'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, HardDrive, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
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
            <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Privacy Policy
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">Last updated: November 25, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="apple-glass p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HardDrive className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm daylight-text-main">100% Local-First Storage</h3>
          <p className="text-xs daylight-text-muted leading-relaxed">
            All vehicle registrations, odometer numbers, financial expenses, and document expiry dates are saved exclusively in your browser&apos;s IndexedDB on this physical device.
          </p>
        </Card>

        <Card className="apple-glass p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm daylight-text-main">Zero Ads & Tracking</h3>
          <p className="text-xs daylight-text-muted leading-relaxed">
            There are no third-party ad networks, telemetry trackers, or profiling cookies bundled into DriveCost. Your automotive records remain 100% private.
          </p>
        </Card>
      </div>

      <Card className="apple-glass p-6 space-y-4">
        <h2 className="text-base font-bold daylight-text-main">1. Information We Collect</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            DriveCost is engineered with a strict privacy-first architecture:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Details:</strong> When you log in with Google, we receive your basic profile identity (name, email address, profile avatar) strictly to associate your account and display your garage.</li>
            <li><strong>Automotive Records:</strong> Fuel entries, maintenance logs, vehicle numbers, and mileage data are stored locally on your device within IndexedDB and are not sent to any advertising or analytics servers.</li>
            <li><strong>Payment & Transaction Information:</strong> When you subscribe to DriveCost Pro, payment processing is handled exclusively by our RBI-licensed payment gateway partner, <strong>Razorpay</strong>. We never store, process, or have access to your full credit/debit card numbers, CVV codes, or netbanking passwords. Razorpay processes your transaction under bank-grade PCI-DSS Level 1 compliance.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">2. How We Use Your Information</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-1">
          <p>We use your information solely for the following essential purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain your digital vehicle garage, expense calculations, and reminders.</li>
            <li>To verify and activate your DriveCost Pro subscription entitlements.</li>
            <li>To deliver customer support, billing updates, and transaction invoices.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">3. Data Sharing & Third Parties</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          We do not sell, rent, trade, or transfer your personal or vehicle data to third parties. Information is only shared with our trusted payment processor (Razorpay) to the extent strictly required to execute subscription charges, renewals, and refunds.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">4. Data Retention & Deletion Rights</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          You retain complete ownership of your data. You can delete all your stored vehicles, expenses, and document records at any time directly through the <strong>Settings</strong> $\rightarrow$ <strong>Clear All Data</strong> option, or request complete account erasure by contacting us at <a href="mailto:chowdhurysoham007@gmail.com" className="text-blue-600 underline font-semibold">chowdhurysoham007@gmail.com</a>.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">5. Contact Grievance Officer</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          In accordance with the Information Technology Act, 2000 and Digital Personal Data Protection (DPDP) Act, if you have any questions or grievances regarding this Privacy Policy, please contact Soham Chowdhury (Grievance Officer) at <a href="mailto:chowdhurysoham007@gmail.com" className="text-blue-600 underline font-semibold">chowdhurysoham007@gmail.com</a>.
        </p>
      </Card>
    </div>
  );
}
