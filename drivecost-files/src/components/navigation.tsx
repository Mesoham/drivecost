'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Bell, 
  CarFront, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  FolderOpen,
  UserCheck,
  X,
  Copy,
  Mail,
  ExternalLink,
  Check,
  Download,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();
  const { reminders, settings, setDynamicAlert } = useAppStore();
  const [showCreatorModal, setShowCreatorModal] = React.useState(false);
  const [showEmailOptions, setShowEmailOptions] = React.useState(false);
  const [emailCopied, setEmailCopied] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile drawer on route navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const dueRemindersCount = reminders.filter(r => r.status === 'due_soon' || r.status === 'overdue').length;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', href: '/vehicles', icon: CarFront },
    { label: 'Expenses', href: '/expenses', icon: Receipt },
    { 
      label: 'Reminders', 
      href: '/reminders', 
      icon: Bell,
      badge: dueRemindersCount > 0 ? dueRemindersCount : undefined
    },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Documents', href: '/documents', icon: FolderOpen }
  ];

  const secondaryLinks = [
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Download the app', href: '/drivecost.apk', icon: Download, download: true },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
    { label: 'Terms & Conditions', href: '/terms', icon: ShieldCheck },
    { label: 'Cancellation & Refund', href: '/cancellation-and-refund', icon: ShieldCheck },
    { label: 'Shipping & Exchange', href: '/shipping-and-exchange', icon: ShieldCheck },
    { label: 'Contact Us', href: '/contact-us', icon: Mail }
  ];

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 py-6">
      {/* Main Navigation links */}
      <nav className="space-y-1.5 relative">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider daylight-text-muted">
          Navigation
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold relative group select-none transition-colors duration-200',
                isActive
                  ? 'daylight-text-main bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'daylight-text-sub hover:daylight-text-main hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <Icon className={cn(
                  'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70 group-hover:opacity-100'
                )} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="relative z-10 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary & System Links */}
      <div className="pt-6 border-t border-black/8 dark:border-white/8 space-y-3">
        {/* Pro Upgrade Floating Button in Sidebar */}
        {settings?.isProUser ? (
          <button
            type="button"
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
              setDynamicAlert({
                title: 'Yeh! You are already a PRO',
                subtitle: 'Your DriveCost Pro plan is active.',
                icon: 'pro',
                color: '#a855f7'
              });
            }}
            className="block w-full p-3.5 rounded-2xl apple-glass border border-purple-500/30 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> DriveCost Pro
              </span>
              <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-black">
                PRO
              </span>
            </div>
            <p className="text-[11px] daylight-text-muted leading-tight">
              Pro Plan Active
            </p>
          </button>
        ) : (
          <Link
            href="/checkout"
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className="block w-full p-3.5 rounded-2xl apple-glass border border-purple-500/30 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> DriveCost Pro
              </span>
              <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-black">
                PRO
              </span>
            </div>
            <p className="text-[11px] daylight-text-muted leading-tight">
              Activate Pro mode
            </p>
          </Link>
        )}

        {/* Secondary Links (Settings, FAQ, Privacy & Security, Download) */}
        <div className="space-y-1 relative">
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider daylight-text-muted">
            Preferences & Tools
          </div>
          {secondaryLinks.map((item: any) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                {...(item.download ? { download: 'DriveCost.apk', target: '_blank' } : {})}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold relative select-none transition-colors duration-200',
                  isActive
                    ? 'daylight-text-main bg-black/5 dark:bg-white/10 text-blue-600 dark:text-blue-400 font-bold'
                    : 'daylight-text-muted hover:daylight-text-main hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 relative z-10',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'
                )} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}

          {/* "Who made this thing ?" Button */}
          <button
            type="button"
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
              setShowCreatorModal(true);
            }}
            className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold select-none transition-colors duration-200 daylight-text-muted hover:daylight-text-main hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
          >
            <UserCheck className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Who made this thing ?</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Mobile Bar Toggle Header Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2.5 rounded-2xl apple-glass shadow-lg border border-black/10 dark:border-white/15 text-slate-800 dark:text-slate-100 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Left Sidebar: Apple HIG Frosted Liquid Glass */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 apple-glass rounded-none border-y-0 border-l-0 border-r border-black/8 dark:border-white/10 text-slate-800 dark:text-slate-100">
        <div className="flex h-20 items-center justify-between px-6 border-b border-black/8 dark:border-white/8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 border border-white/20 shadow-blue-500/20 bg-slate-900 flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="DriveCost Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight daylight-text-main block leading-none">
                DriveCost
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-1 tracking-tight">
                Know what your vehicle really costs.
              </span>
            </div>
          </Link>
        </div>

        {renderSidebarContent(false)}
      </aside>

      {/* Full-Feature Mobile Drawer: EXACT SAME options as Desktop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-4/5 max-w-xs h-full apple-glass border-r border-black/10 dark:border-white/15 text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl overflow-hidden bg-slate-900/98"
            >
              {/* Drawer Header */}
              <div className="flex h-18 items-center justify-between px-5 border-b border-black/8 dark:border-white/8">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="h-9 w-9 rounded-2xl overflow-hidden border border-white/20 bg-slate-900 p-1 flex items-center justify-center shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon.svg" alt="DriveCost Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-black text-base tracking-tight text-white block leading-none">
                      DriveCost
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 block mt-0.5">
                      Vehicle Cost Intelligence
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creator Profile Modal ("Who made this thing ?") */}
      {showCreatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="apple-glass max-w-sm w-full p-6 relative rounded-3xl border border-purple-500/30 shadow-2xl text-center bg-slate-900/95 text-white">
            <button
              type="button"
              onClick={() => setShowCreatorModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Creator Photo / Avatar */}
            <div className="w-24 h-24 rounded-full mx-auto p-1 bg-gradient-to-tr from-purple-500 via-blue-500 to-indigo-500 shadow-xl mb-4 relative">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/creator.jpg"
                  alt="Creator"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl font-black text-white">SC</span>';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full text-[11px] font-black tracking-wide text-purple-400 bg-purple-500/15 border border-purple-500/30 mb-2">
              I made this thing
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-0.5">
              Hiii, Myself
            </div>

            <h3 className="text-xl font-black tracking-tight text-white mb-1">
              Soham Chowdhury
            </h3>

            {/* Quirky Quote */}
            <div className="my-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-amber-300 dark:text-amber-200 text-xs italic font-medium leading-relaxed">
              &quot;I built this because spreadsheets made me cry, and my 400cc engine deserves better fuel than my own body runs on.&quot;
            </div>

            {/* Contact / Email CTA with Interactive Options & Spring Animations */}
            <div className="pt-2 border-t border-white/10 relative">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">
                Got thoughts, feedback or want to talk bikes? Hit me up at:
              </p>

              {/* Email Trigger Button with Hover/Tap Animations */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowEmailOptions(!showEmailOptions)}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-400/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md group"
              >
                <Mail className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-mono tracking-tight text-[11px] sm:text-xs">
                  chowdhurysoham007@gmail.com
                </span>
              </motion.button>

              {/* Expandable Action Palette for Email with Spring Transitions */}
              <AnimatePresence>
                {showEmailOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="mt-3 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 grid grid-cols-2 gap-2 shadow-xl"
                  >
                    {/* Action 1: Copy Email */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText('chowdhurysoham007@gmail.com');
                        setEmailCopied(true);
                        setTimeout(() => setEmailCopied(false), 2000);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-all cursor-pointer"
                    >
                      {emailCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-purple-300" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </motion.button>

                    {/* Action 2: Open Mailbox */}
                    <motion.a
                      whileTap={{ scale: 0.95 }}
                      href="mailto:chowdhurysoham007@gmail.com"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Mail</span>
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
