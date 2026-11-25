'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Terms & Conditions
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">Last updated: November 25, 2026</p>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="apple-glass p-6 space-y-4">
        <h2 className="text-base font-bold daylight-text-main">1. Acceptance of Terms</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          Welcome to DriveCost (referred to as &quot;DriveCost&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the DriveCost web application, mobile PWA, or related subscription services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our platform.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">2. Description of Service</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          DriveCost is a digital vehicle expense, fuel efficiency (mileage), service reminder, and compliance management platform tailored for vehicle owners, businesses, and fleet operators in India. The application operates primarily as a local-first software allowing users to log, monitor, and generate mathematical reports regarding automotive ownership costs.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">3. User Accounts and Authentication</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          You may access DriveCost via 1-click Google OAuth authentication. You are responsible for maintaining the confidentiality of your account access credentials and for all activities that take place under your logged-in session. You agree to notify us immediately of any unauthorized use or security vulnerability.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">4. DriveCost Pro Subscription & Billing</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            DriveCost offers optional premium subscriptions (&quot;DriveCost Pro&quot;) providing access to unlimited vehicle registrations, commercial fleet tracking, audit-ready compliance exports, and multi-driver management.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Billing Cycles:</strong> Subscriptions are billed on a recurring monthly or annual basis as selected during checkout.</li>
            <li><strong>Payment Gateways:</strong> Payments are processed securely via authorized Reserve Bank of India (RBI) compliant payment partners, including Razorpay and UPI AutoPay.</li>
            <li><strong>Price Changes:</strong> DriveCost reserves the right to modify subscription fees with reasonable advance notice before recurring renewals take effect.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">5. Data Accuracy & Calculations Disclaimer</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          Calculations such as cost-per-kilometre, monthly fleet fuel efficiency, and maintenance forecasts are mathematical estimations derived strictly from user-provided odometer and expense inputs. DriveCost does not warrant that these estimations will meet vehicle manufacturer specifications or legal transport audit requirements.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">6. Prohibited Activities</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          You agree not to reverse engineer, decompile, maliciously probe, tamper with automated subscription callbacks, scrape user data, or use DriveCost for fraudulent fleet tax reporting or unlawful purposes.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">7. Limitation of Liability</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          To the maximum extent permitted by applicable Indian law, DriveCost, its founder, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from lost vehicle receipts, missed statutory reminder dates (e.g. PUCC or Insurance expiry), or hardware malfunction.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">8. Governing Law & Jurisdiction</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in West Bengal, India.
        </p>
      </Card>
    </div>
  );
}
