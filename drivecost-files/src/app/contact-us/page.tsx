'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export default function ContactUsPage() {
  const { setDynamicAlert } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setDynamicAlert({
      title: 'Message Sent! ✉️',
      subtitle: 'Thank you for reaching out. We will get back to you within 24 hours.',
      icon: 'check',
      color: '#10b981'
    });
  };

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
            <MessageSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Contact Us
          </h1>
          <p className="text-xs daylight-text-muted mt-0.5">We&apos;re here to help with your vehicle tracking & subscription queries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information & Registered Business Profile */}
        <Card className="apple-glass p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold daylight-text-main mb-1">Get in Touch</h2>
            <p className="text-xs daylight-text-muted">
              Have questions regarding DriveCost Pro, billing, fleet integrations, or custom vehicle reports? Reach out to our founder directly.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] daylight-text-muted uppercase font-bold">Email Support</div>
                <a 
                  href="mailto:chowdhurysoham007@gmail.com" 
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline block mt-0.5"
                >
                  chowdhurysoham007@gmail.com
                </a>
                <span className="text-[10px] daylight-text-muted">Response time: within 12 - 24 hours</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] daylight-text-muted uppercase font-bold">Founder & Lead Developer</div>
                <div className="font-bold daylight-text-main mt-0.5">Soham Chowdhury</div>
                <span className="text-[10px] daylight-text-muted">DriveCost India • Built for Indian motorists & fleets</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] daylight-text-muted uppercase font-bold">Location & Registered Address</div>
                <div className="font-bold daylight-text-main mt-0.5">Kolkata, West Bengal, India</div>
                <span className="text-[10px] daylight-text-muted">PIN: 700001 • Operational across all Indian states</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] daylight-text-muted uppercase font-bold">Operational Hours</div>
                <div className="font-bold daylight-text-main mt-0.5">Monday to Saturday: 9:00 AM – 7:00 PM IST</div>
                <span className="text-[10px] daylight-text-muted">Critical payment disputes handled 24/7</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[11px] daylight-text-muted flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Official merchant support channel for Razorpay & UPI AutoPay compliance.</span>
          </div>
        </Card>

        {/* Interactive Query Form */}
        <Card className="apple-glass p-6">
          <h2 className="text-base font-bold daylight-text-main mb-1">Send a Message</h2>
          <p className="text-xs daylight-text-muted mb-4">
            Fill in your details below and we will follow up with you by email.
          </p>

          {isSubmitted ? (
            <div className="p-6 text-center space-y-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm daylight-text-main">Message Received!</h3>
              <p className="text-xs daylight-text-muted leading-relaxed">
                Thank you for reaching out. We have logged your request and our team will get in touch with you shortly.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-2 text-xs font-semibold cursor-pointer"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl apple-glass px-3.5 py-2 text-xs font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl apple-glass px-3.5 py-2 text-xs font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment inquiry, Pro tier activation, Bug report"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl apple-glass px-3.5 py-2 text-xs font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl apple-glass px-3.5 py-2 text-xs font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Message</span>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
