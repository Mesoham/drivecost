'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function CancellationRefundPage() {
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
            <RotateCcw className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">Last updated: November 25, 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="apple-glass p-6 space-y-5">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm daylight-text-main leading-relaxed">
            <strong>Customer Satisfaction Guarantee:</strong> We want you to love DriveCost Pro. If you are not completely satisfied with your premium experience, you can cancel your subscription at any time with zero cancellation penalty.
          </div>
        </div>

        <h2 className="text-base font-bold daylight-text-main">1. Subscription Cancellation</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            You can cancel your DriveCost Pro subscription at any moment directly from your account settings:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Navigate to <strong>Settings</strong> $\rightarrow$ <strong>Subscription Management</strong> in the app.</li>
            <li>Alternatively, you can cancel or pause recurring AutoPay mandates through your bank or payment app (Google Pay, PhonePe, Paytm, or netbanking portal) at least 24 hours before the scheduled renewal date.</li>
            <li>Upon cancellation, your Pro benefits will remain active until the end of your current paid billing period. No further recurring debits will occur thereafter.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">2. 7-Day Money-Back Refund Policy</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            We offer a <strong>7-Day Full Refund Window</strong> for first-time DriveCost Pro subscribers:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Eligibility:</strong> If you experience technical defects, accidental double payments, or are unsatisfied with Pro within <strong>7 days</strong> of your initial purchase or annual renewal, you are entitled to a 100% full refund.</li>
            <li><strong>How to Request:</strong> Email our support team at <a href="mailto:chowdhurysoham007@gmail.com" className="text-blue-600 underline font-semibold">chowdhurysoham007@gmail.com</a> with your registered email ID and Razorpay Payment ID or UPI UTR reference number.</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">3. Refund Processing Timeline</h2>
        <div className="text-xs sm:text-sm daylight-text-muted leading-relaxed space-y-2">
          <p>
            Once your refund request is submitted and validated:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refunds are initiated within <strong>24 to 48 hours</strong> of verification.</li>
            <li>In accordance with Indian banking norms and Reserve Bank of India (RBI) guidelines, credited amounts will reflect in your original payment source (bank account, UPI handle, or credit/debit card) within <strong>5 to 7 business days</strong>.</li>
            <li>You will receive an automated confirmation email once the refund is dispatched by our payment gateway partner (Razorpay).</li>
          </ul>
        </div>

        <h2 className="text-base font-bold daylight-text-main pt-2">4. Non-Refundable Scenarios</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          Refund requests made after the 7-day money-back guarantee period has lapsed are non-refundable. Mid-term cancellations for monthly plans will not be refunded on a pro-rata basis, but your account will remain unlocked until the current billing month ends.
        </p>

        <h2 className="text-base font-bold daylight-text-main pt-2">5. Contact Support for Payment Inquiries</h2>
        <p className="text-xs sm:text-sm daylight-text-muted leading-relaxed">
          If you noticed any erroneous charges, failed transaction deductions, or mandate synchronization errors, reach out to us at <a href="mailto:chowdhurysoham007@gmail.com" className="text-blue-600 underline font-semibold">chowdhurysoham007@gmail.com</a>. We respond to all billing inquiries within 24 hours.
        </p>
      </Card>
    </div>
  );
}
