'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootPage() {
  const router = useRouter();
  const { settings, vehicles } = useAppStore();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3000);

    const navTimer = setTimeout(() => {
      if (!settings?.userAuth?.isLoggedIn) {
        router.replace('/login');
      } else if (vehicles.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }, 3350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [settings, vehicles, router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080d] text-white overflow-hidden select-none">
      {/* Subtle Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-rose-500/15 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {!isFadingOut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/drivecost-logo.svg"
              alt="DriveCost"
              width={360}
              height={100}
              className="w-64 sm:w-80 h-auto aspect-[360/100] object-contain mb-4"
            />
            <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-tight">
              Know what your vehicle really costs.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
