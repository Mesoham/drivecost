'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Navigation } from '@/components/navigation';
import { Header } from '@/components/header';
import { ProUpgradeModal } from '@/components/pro-modal';
import { DynamicIsland } from '@/components/dynamic-island';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialize, settings } = useAppStore();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Synchronize theme with html element
  useEffect(() => {
    if (settings?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings?.theme]);

  // Dynamically set CSS variables for reactive vehicle color
  const activeColor = settings?.activeVehicleColor || '#0071e3';

  useEffect(() => {
    document.documentElement.style.setProperty('--user-theme-accent', activeColor);
  }, [activeColor]);

  const isOnboarding = pathname === '/onboarding';
  const isLogin = pathname === '/login';
  const isCheckout = pathname === '/checkout';

  if (isOnboarding || isLogin || isCheckout) {
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
