'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Navigation } from '@/components/navigation';
import { Header } from '@/components/header';
import { ProUpgradeModal } from '@/components/pro-modal';
import { DynamicIsland } from '@/components/dynamic-island';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialize, settings, reminders, vehicles, selectedVehicleId } = useAppStore();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Trigger real browser Push Notifications for due/upcoming reminders
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const pushEnabled =
      settings?.enableBrowserNotifications ||
      settings?.notificationPreferences?.channels?.push;
    if (!pushEnabled || Notification.permission !== 'granted') return;
    if (!reminders.length) return;

    const duePrefs = settings?.notificationPreferences?.categories?.dueReminders;
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    reminders.forEach((r) => {
      if (r.status === 'completed' || !r.dueDate) return;
      const due = new Date(r.dueDate);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const shouldNotify =
        diffDays <= 0 ||
        (diffDays <= 1 && (duePrefs?.notify1Day ?? true)) ||
        (diffDays <= 3 && (duePrefs?.notify3Days ?? true)) ||
        (diffDays <= 7 && (duePrefs?.notify7Days ?? true));

      if (!shouldNotify) return;

      const sentKey = `drivecost_notif_${r.id}_${todayKey}`;
      if (localStorage.getItem(sentKey)) return;

      const veh = vehicles.find((v) => v.id === r.vehicleId);
      const vehPrefix = veh ? `${veh.name}: ` : '';
      const dueLabel =
        diffDays < 0
          ? `Overdue by ${Math.abs(diffDays)} day(s)`
          : diffDays === 0
          ? 'Due today'
          : `Due in ${diffDays} day(s)`;

      try {
        new Notification(`DriveCost Reminder — ${vehPrefix}${r.title}`, {
          body: `${dueLabel} (${r.dueDate}). Tap to review in DriveCost.`,
          icon: '/icon.svg'
        });
        localStorage.setItem(sentKey, '1');
      } catch (err) {
        console.warn('Browser notification failed:', err);
      }
    });
  }, [settings, reminders, vehicles]);

  // Synchronize theme with html element
  useEffect(() => {
    if (settings?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings?.theme]);

  // Dynamically set CSS variables for reactive vehicle color:
  // Default theme color when 'All Vehicles' or no vehicle is selected;
  // vehicle-specific color only when a specific vehicle with a color is selected.
  const selectedVeh = selectedVehicleId !== 'all'
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : undefined;
  const activeColor = selectedVeh?.color || '#0071e3';

  useEffect(() => {
    document.documentElement.style.setProperty('--user-theme-accent', activeColor);
  }, [activeColor]);

  const isSplash = pathname === '/';
  const isOnboarding = pathname === '/onboarding';
  const isLogin = pathname === '/login';
  const isCheckout = pathname === '/checkout';

  if (isSplash || isOnboarding || isLogin || isCheckout) {
    return (
      <main className="min-h-screen relative overflow-hidden transition-colors duration-500">
        <DynamicIsland />
        <ProUpgradeModal />
        <div 
          className="vehicle-ambient-glow" 
          style={{
            background: `radial-gradient(circle at 50% 20%, ${activeColor} 0%, transparent 65%)`
          }}
        />
        <div className="relative z-10">{children}</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative transition-colors duration-500">
      {/* Apple Dynamic Island Notification Capsule */}
      <DynamicIsland />

      {/* Monetization Pro Upgrade Modal */}
      <ProUpgradeModal />

      {/* Reactive Ambient Vehicle Atmosphere Glow */}
      <div 
        className="vehicle-ambient-glow" 
        style={{
          background: `radial-gradient(circle at 15% 15%, ${activeColor} 0%, transparent 55%), radial-gradient(circle at 85% 85%, #30d158 0%, transparent 50%)`
        }}
      />

      <Navigation />
      
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-28 md:pb-10 relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
