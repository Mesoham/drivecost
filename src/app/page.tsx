'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootPage() {
  const router = useRouter();
  const { isInitialized, settings, vehicles } = useAppStore();

  // Animation sequence states:
  // 1. 'logo_d'       -> Static / pulsing glowing 'D' monogram with car aesthetic (0s - 1.2s)
  // 2. 'morphing_car' -> Morphing into a streamlined sports car facing the road (1.2s - 2.2s)
  // 3. 'driving_away' -> Revs up, headlights flash, sports car accelerates forward across the screen (2.2s - 3.0s)
  // 4. 'navigating'   -> Screen fades smoothly into login or dashboard (3.0s)
  const [animStage, setAnimStage] = useState<'logo_d' | 'morphing_car' | 'driving_away'>('logo_d');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1 -> Stage 2: Transform D to sleek sports car
    const morphTimer = setTimeout(() => {
      setAnimStage('morphing_car');
    }, 1200);

    // Stage 2 -> Stage 3: Accelerate and drive away down the asphalt road
    const driveTimer = setTimeout(() => {
      setAnimStage('driving_away');
    }, 2200);

    // Stage 4: Trigger scene fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3000);

    // Stage 5: Target Route Navigation
    // Logged in -> directly /dashboard (or /onboarding if first vehicle)
    // Not logged in -> /login
    const navTimer = setTimeout(() => {
      if (!settings?.userAuth?.isLoggedIn) {
        router.replace('/login');
      } else if (!settings?.hasCompletedOnboarding && vehicles.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }, 3400);

    return () => {
      clearTimeout(morphTimer);
      clearTimeout(driveTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [settings, vehicles, router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080c] text-white overflow-hidden select-none">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-full blur-[100px]" />
        
        {/* Perspective Road Surface */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black via-[#0d0e15] to-transparent border-t border-white/5 flex flex-col items-center justify-end pb-8">
          {/* Animated Speed Lane Lines on Road */}
          <div className="w-full max-w-lg h-1 flex justify-center gap-6 overflow-hidden opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: animStage === 'driving_away' ? [-20, 200] : [0, 20],
                  opacity: animStage === 'driving_away' ? [1, 0] : [0.3, 0.7, 0.3]
                }}
                transition={{
                  repeat: Infinity,
                  duration: animStage === 'driving_away' ? 0.35 : 1.2,
                  ease: 'linear'
                }}
                className="w-12 h-0.5 bg-amber-400 rounded-full shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isFadingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md"
          >
            {/* The Morphing Canvas: 'D' Monogram -> Sleek Sports Car */}
            <div className="relative w-72 h-44 flex items-center justify-center mb-6">
              
              {/* Dynamic Vehicle / 'D' Body */}
              <motion.div
                className="relative"
                animate={
                  animStage === 'logo_d'
                    ? { x: 0, y: 0, scale: 1, rotate: 0 }
                    : animStage === 'morphing_car'
                    ? { x: 0, y: 15, scale: 1.08, rotate: 0 }
                    : { x: [0, -30, 480], y: [15, 12, 10], scale: [1.08, 1.12, 0.95] }
                }
                transition={
                  animStage === 'driving_away'
                    ? {
                        duration: 0.9,
                        times: [0, 0.15, 1],
                        ease: [0.65, 0, 0.35, 1] // Aggressive car launch curve
                      }
                    : {
                        duration: 0.8,
                        type: 'spring',
                        stiffness: 120,
                        damping: 14
                      }
                }
              >
                {/* Car Exhaust Boost Flame when driving away */}
                {animStage === 'driving_away' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4, x: -10 }}
                    animate={{ opacity: [0, 1, 0.8, 0], scale: [0.6, 1.4, 1.8, 0.2], x: [-20, -55] }}
                    transition={{ duration: 0.45, repeat: Infinity }}
                    className="absolute left-2 bottom-5 w-12 h-3.5 bg-gradient-to-l from-cyan-400 via-rose-500 to-transparent rounded-full blur-xs -z-10"
                  />
                )}

                {/* Headlight Beams projecting forward when driving */}
                {(animStage === 'morphing_car' || animStage === 'driving_away') && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 0.75, scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute right-0 top-6 w-56 h-14 bg-gradient-to-r from-cyan-400/35 via-cyan-300/10 to-transparent -z-10 origin-left blur-sm pointer-events-none"
                    style={{ clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)' }}
                  />
                )}

                {/* SVG Vector with Smooth Transition between Monogram D and Car Profile */}
                <svg
                  viewBox="0 0 280 140"
                  className="w-64 h-32 drop-shadow-[0_12px_28px_rgba(255,59,48,0.45)]"
                >
                  <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff9f0a" />
                      <stop offset="50%" stopColor="#ff3b30" />
                      <stop offset="100%" stopColor="#ff007a" />
                    </linearGradient>

                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e2230" />
                      <stop offset="100%" stopColor="#0c0d12" />
                    </linearGradient>

                    <linearGradient id="laserCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f5d4" />
                      <stop offset="100%" stopColor="#00b4d8" />
                    </linearGradient>
                  </defs>

                  {/* 1. Vehicle / 'D' Main Aerodynamic Chassis */}
                  {/* In 'logo_d', path portrays the distinctive curved D spine and bow */}
                  {/* In 'morphing_car', path flattens and extends into a streamlined coupe silhouette */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 60 20 C 180 20, 220 50, 220 70 C 220 90, 180 120, 60 120 C 50 120, 45 110, 45 70 C 45 30, 50 20, 60 20 Z'
                        : 'M 25 90 C 28 65, 55 58, 85 55 C 110 32, 160 30, 195 52 C 230 55, 260 70, 265 90 C 265 98, 255 100, 240 100 C 235 100, 220 85, 195 85 C 170 85, 160 100, 115 100 C 110 100, 95 85, 70 85 C 45 85, 35 100, 25 100 Z'
                    }
                    fill="url(#bodyGrad)"
                    animate={{
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }}
                  />

                  {/* 2. Cockpit Window / Inner 'D' Counter */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 85 42 C 145 42, 175 58, 175 70 C 175 82, 145 98, 85 98 C 75 98, 72 90, 72 70 C 72 50, 75 42, 85 42 Z'
                        : 'M 98 56 C 115 38, 155 38, 188 54 C 188 64, 155 64, 105 64 Z'
                    }
                    fill="url(#glassGrad)"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={animStage === 'logo_d' ? '3' : '2'}
                    animate={{
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }}
                  />

                  {/* 3. Laser Headlight Slit */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 195 65 Q 210 70 195 75'
                        : 'M 252 82 L 268 85 L 250 88 Z'
                    }
                    fill="url(#laserCyan)"
                    animate={{
                      opacity: animStage === 'logo_d' ? 0.4 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* 4. Front Wheel */}
                  <motion.g
                    animate={{
                      opacity: animStage === 'logo_d' ? 0 : 1,
                      scale: animStage === 'logo_d' ? 0.2 : 1,
                      rotate: animStage === 'driving_away' ? 720 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.4 },
                      rotate: { duration: 0.8, ease: 'linear' }
                    }}
                    style={{ originX: '215px', originY: '100px' }}
                  >
                    <circle cx="215" cy="100" r="18" fill="#11131a" stroke="#ff3b30" strokeWidth="4" />
                    <circle cx="215" cy="100" r="8" fill="#00f5d4" />
                    <line x1="215" y1="84" x2="215" y2="116" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <line x1="199" y1="100" x2="231" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  </motion.g>

                  {/* 5. Rear Wheel */}
                  <motion.g
                    animate={{
                      opacity: animStage === 'logo_d' ? 0 : 1,
                      scale: animStage === 'logo_d' ? 0.2 : 1,
                      rotate: animStage === 'driving_away' ? 720 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.4 },
                      rotate: { duration: 0.8, ease: 'linear' }
                    }}
                    style={{ originX: '70px', originY: '100px' }}
                  >
                    <circle cx="70" cy="100" r="18" fill="#11131a" stroke="#ff3b30" strokeWidth="4" />
                    <circle cx="70" cy="100" r="8" fill="#00f5d4" />
                    <line x1="70" y1="84" x2="70" y2="116" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <line x1="54" y1="100" x2="86" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  </motion.g>
                </svg>
              </motion.div>
            </div>

            {/* Typography & Subtitle */}
            <motion.div
              animate={{
                opacity: animStage === 'driving_away' ? 0 : 1,
                y: animStage === 'driving_away' ? 10 : 0
              }}
              transition={{ duration: 0.4 }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                <span>Drive</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500">
                  Cost
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {animStage === 'morphing_car' || animStage === 'driving_away' ? (
                  <span className="text-amber-400 font-semibold tracking-wider uppercase text-[11px] animate-pulse">
                    Ignition On • Ready to Roll
                  </span>
                ) : (
                  'Know what your vehicle really costs.'
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
