'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Fuel, CheckCircle, ShieldCheck } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How is verified fuel efficiency (km/l) calculated?',
      a: 'DriveCost follows the standard full-tank method: when you fill your fuel tank completely, record your odometer. On your next full refill, DriveCost calculates the exact kilometres driven divided by the litres consumed during that interval. Partial fills are logged as expenses but do not produce misleading mileage figures.'
    },
    {
      q: 'Does DriveCost work without an internet connection?',
      a: 'Yes! DriveCost is a Progressive Web App (PWA) with a local IndexedDB engine. Once loaded in your browser or installed on your phone home screen, you can record fuel fills, services, and check reminders without any internet or network connection.'
    },
    {
      q: 'How do I install DriveCost as an app on my phone?',
      a: 'On Android Chrome: tap the 3-dots menu and select "Install app" or "Add to Home Screen". On iPhone Safari: tap the Share button and select "Add to Home Screen".'
    },
    {
      q: 'What should I do if my odometer goes backwards?',
      a: 'If you made an accidental typo in a previous expense or vehicle odometer, DriveCost will ask you to confirm whether it is an intentional correction before updating.'
    },
    {
      q: 'Can I export my data to Excel or Google Sheets?',
      a: 'Yes. Visit the Settings or Reports page and click "Export CSV" to download a clean spreadsheet with all your expenses, fuel amounts, and merchant details.'
    }
  ];

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
            Help & Frequently Asked Questions
          </h1>
          <p className="text-xs text-slate-500">Getting the most out of DriveCost India</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">
                ?
              </span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              {faq.a}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
