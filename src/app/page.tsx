'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';

export default function RootPage() {
  const router = useRouter();
  const { isInitialized, settings, vehicles } = useAppStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!settings?.userAuth?.isLoggedIn) {
      router.replace('/login');
    } else if (!settings?.hasCompletedOnboarding && vehicles.length === 0) {
      router.replace('/onboarding');
    } else {
      router.replace('/dashboard');
    }
  }, [isInitialized, settings, vehicles, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center daylight-canvas">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30 animate-pulse">
          ₹
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight daylight-text-main">DriveCost</h1>
          <p className="text-xs daylight-text-muted mt-1">Starting local-first expense tracker...</p>
        </div>
      </div>
    </div>
  );
}
