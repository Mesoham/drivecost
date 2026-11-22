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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();
  const { reminders, settings, setProModalOpen } = useAppStore();
  const [showCreatorModal, setShowCreatorModal] = React.useState(false);

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
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Privacy & Security', href: '/privacy', icon: ShieldCheck }
  ];

  return (
    <>
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

        <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 py-6">
          {/* Main Navigation with Liquid Glass Glider */}
          <nav className="space-y-1.5 relative">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold relative group select-none transition-colors duration-200',
                    isActive
                      ? 'daylight-text-main'
                      : 'daylight-text-sub hover:daylight-text-main'
                  )}
                >
                  {/* Apple Liquid Glass Glider for Main Nav */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveGlider"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 35
                      }}
                      className="absolute inset-0 rounded-2xl border border-white/40 dark:border-white/15 shadow-md -z-10 backdrop-blur-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.18) 0%, rgba(0, 113, 227, 0.08) 100%)'
                      }}
                    />
                  )}

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

          <div className="pt-6 border-t border-black/8 dark:border-white/8 space-y-3">
            {/* Pro Upgrade Floating Button in Sidebar */}
            <Link
              href="/checkout"
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
                {settings?.isProUser ? 'Pro Plan Active' : 'Activate Pro mode'}
              </p>
            </Link>

            {/* Secondary Links (Settings, FAQ, Privacy & Security) with Liquid Glass Glider */}
            <div className="space-y-1 relative">
              {secondaryLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold relative select-none transition-colors duration-200',
                      isActive ? 'daylight-text-main' : 'daylight-text-muted hover:daylight-text-main'
                    )}
                  >
                    {/* Apple Liquid Glass Glider for Secondary Nav */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarSecondaryGlider"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 35
                        }}
                        className="absolute inset-0 rounded-2xl border border-white/30 dark:border-white/10 shadow-xs -z-10 backdrop-blur-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.15) 0%, rgba(0, 113, 227, 0.05) 100%)'
                        }}
                      />
                    )}

                    <Icon className={cn(
                      'h-4 w-4 relative z-10',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'
                    )} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              {/* "Who made this thing ?" Button */}
              <button
                type="button"
                onClick={() => setShowCreatorModal(true)}
                className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold select-none transition-colors duration-200 daylight-text-muted hover:daylight-text-main hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
              >
                <UserCheck className="h-4 w-4 text-purple-500 shrink-0" />
                <span>Who made this thing ?</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Apple Frosted Acrylic Dock with Glider */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 apple-dock px-3 py-2 flex items-center justify-around shadow-2xl">
        {[
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Vehicles', href: '/vehicles', icon: CarFront },
          { label: 'Expenses', href: '/expenses', icon: Receipt },
          { label: 'Reports', href: '/reports', icon: BarChart3 },
          { label: 'More', href: '/settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/settings' 
            ? (pathname.startsWith('/settings') || pathname.startsWith('/reminders') || pathname.startsWith('/privacy') || pathname.startsWith('/faq') || pathname.startsWith('/documents'))
            : (pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href)));

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all relative',
                isActive ? 'text-blue-600 dark:text-blue-400 scale-105' : 'daylight-text-muted hover:daylight-text-main'
              )}
            >
              {/* Smooth Glider Pill Indicator under active tab */}
              {isActive && (
                <motion.div
                  layoutId="activeTabGlider"
                  className="absolute inset-0 rounded-2xl bg-black/5 dark:bg-white/10 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.label === 'More' && dueRemindersCount > 0 && (
                <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
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
                    // Fallback to stylized monogram if user hasn't uploaded custom photo yet
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl font-black text-white">SC</span>';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-purple-400 bg-purple-500/15 border border-purple-500/30 uppercase mb-2">
              Creator & Architect
            </div>

            <h3 className="text-xl font-black tracking-tight text-white mb-1">
              Soham Chowdhury
            </h3>

            {/* Quirky Quote */}
            <div className="my-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-amber-300 dark:text-amber-200 text-xs italic font-medium leading-relaxed">
              &quot;I built this because spreadsheets made me cry, and my 400cc engine deserves better fuel than my own body runs on.&quot;
            </div>

            <p className="text-[11px] text-slate-400">
              Crafted with high-precision engineering for vehicle owners across India.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
