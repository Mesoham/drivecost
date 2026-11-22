'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootPage() {
  const router = useRouter();
  const { isInitialized, settings, vehicles } = useAppStore();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 2-second splash screen hold, then trigger fade transition
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Route transition after fade completes
    const redirectTimer = setTimeout(() => {
      if (!settings?.userAuth?.isLoggedIn) {
        router.replace('/login');
      } else if (!settings?.hasCompletedOnboarding && vehicles.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [settings, vehicles, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090a0f] text-white overflow-hidden select-none">
      <AnimatePresence>
        {!isFadingOut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center p-6"
          >
            {/* Catchy Neon Solar Blaze Logo Icon */}
            <motion.div 
              initial={{ y: 15 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6"
            >
              {/* Ambient Neon Backlight Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 blur-2xl opacity-40 animate-pulse" />
              
              <div className="relative w-full h-full rounded-3xl p-1 bg-gradient-to-tr from-white/20 via-white/5 to-transparent border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon.svg"
                  alt="DriveCost Logo"
                  className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(255,59,48,0.35)]"
                />
              </div>
            </motion.div>

            {/* Brand Title with Shimmer */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2"
            >
              Drive<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500">Cost</span>
            </motion.h1>

            {/* Official Tagline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide"
            >
              Know what your vehicle really costs.
            </motion.p>

            {/* Subtle Minimal Loader Ring */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-8 flex items-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
