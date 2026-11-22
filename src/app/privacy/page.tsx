'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, HardDrive, EyeOff, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Privacy & Data Ownership
          </h1>
          <p className="text-xs text-slate-500">Your vehicle records never leave your control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
            <HardDrive className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Local-First Storage</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All vehicle registrations, odometer numbers, financial expenses, and document expiry dates are saved exclusively in your browser&apos;s IndexedDB on this physical device.
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Tracking & No Ads</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are no advertising networks, tracking pixels, behavioral telemetries, or third-party analytical cookies bundled into this software.
          </p>
        </Card>
      </div>

      <Card className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Important Privacy Commitments</h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            <strong>Registration Number Masking:</strong> Vehicle numbers are masked on shared overview screens (e.g. MH 12 •••• 1433) to protect your privacy when showing friends or family your expense charts.
          </p>

          <p>
            <strong>No Automatic Receipt Uploads:</strong> When you attach a photo of a fuel receipt or garage bill, it is stored locally within your browser database. It is never transmitted across the network.
          </p>

          <p>
            <strong>Optional Cloud Sync:</strong> If future multi-device cloud synchronization is enabled, it requires explicit opt-in consent and will never sync unencrypted credentials or private data silently.
          </p>

          <p>
            <strong>No Legal or Financial Advice:</strong> Fuel efficiency calculations and expense insights are mathematical summaries derived strictly from numbers you input. DriveCost does not provide legal advice, insurance guarantees, or financial advisory recommendations.
          </p>
        </div>
      </Card>
    </div>
  );
}
