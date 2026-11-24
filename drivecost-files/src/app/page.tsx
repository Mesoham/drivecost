'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootPage() {
  const router = useRouter();
  const { settings, vehicles } = useAppStore();

  // 4-Stage Precision Cinematic Automotive Sequence:
  // 1. 'logo_d'       -> Monogram 'D' with glowing sports-car aerodynamics (0s - 1.1s)
  // 2. 'morphing_car' -> Precision automotive morph into a realistic GT coupe profile with glowing headlights (1.1s - 2.1s)
  // 3. 'driving_away' -> Exhaust boost fires, alloy wheels spin, and car accelerates smoothly down the highway (2.1s - 2.9s)
  // 4. 'navigating'   -> Scene transition smoothly to login or dashboard (2.9s+)
  const [animStage, setAnimStage] = useState<'logo_d' | 'morphing_car' | 'driving_away'>('logo_d');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const morphTimer = setTimeout(() => {
      setAnimStage('morphing_car');
    }, 1100);

    const driveTimer = setTimeout(() => {
      setAnimStage('driving_away');
    }, 2100);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2900);

    const navTimer = setTimeout(() => {
      if (!settings?.userAuth?.isLoggedIn) {
        router.replace('/login');
      } else if (!settings?.hasCompletedOnboarding && vehicles.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }, 3300);

    return () => {
      clearTimeout(morphTimer);
      clearTimeout(driveTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [settings, vehicles, router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080d] text-white overflow-hidden select-none">
      {/* Background Cinematic Track Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Supercar Atmosphere Bloom */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/15 via-rose-500/20 to-indigo-600/15 rounded-full blur-[120px]" />
        
        {/* Highway Asphalt & Speed Markers */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-[#0a0d14] to-transparent border-t border-white/8 flex flex-col items-center justify-end pb-10">
          {/* Animated Speed Lane Strips on Asphalt */}
          <div className="w-full max-w-2xl h-1 flex justify-center gap-8 overflow-hidden opacity-35">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: animStage === 'driving_away' ? [-40, 240] : [0, 25],
                  opacity: animStage === 'driving_away' ? [1, 0.1] : [0.2, 0.7, 0.2]
                }}
                transition={{
                  repeat: Infinity,
                  duration: animStage === 'driving_away' ? 0.28 : 1.2,
                  ease: 'linear'
                }}
                className="w-16 h-1 bg-amber-400/90 rounded-full shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
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
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-lg"
          >
            {/* The Morphing Canvas: 'D' Monogram -> Realistic GT Supercar */}
            <div className="relative w-80 h-44 flex items-center justify-center mb-6">
              
              {/* Dynamic Vehicle Body */}
              <motion.div
                className="relative"
                animate={
                  animStage === 'logo_d'
                    ? { x: 0, y: 0, scale: 1, rotate: 0 }
                    : animStage === 'morphing_car'
                    ? { x: 0, y: 12, scale: 1.08, rotate: 0 }
                    : { x: [0, -25, 520], y: [12, 10, 8], scale: [1.08, 1.12, 0.96] }
                }
                transition={
                  animStage === 'driving_away'
                    ? {
                        duration: 0.85,
                        times: [0, 0.12, 1],
                        ease: [0.6, 0.05, 0.2, 1] // Authentic supercar high-torque launch curve
                      }
                    : {
                        duration: 0.8,
                        type: 'spring',
                        stiffness: 140,
                        damping: 16
                      }
                }
              >
                {/* Twin Exhaust Boost Flares when Launching */}
                {animStage === 'driving_away' && (
                  <>
                    <motion.div
                      animate={{ opacity: [0, 1, 0.7, 0], scale: [0.8, 1.8, 2.2, 0.2], x: [-15, -60] }}
                      transition={{ duration: 0.35, repeat: Infinity }}
                      className="absolute left-2 bottom-6 w-14 h-4 bg-gradient-to-l from-cyan-400 via-rose-500 to-transparent rounded-full blur-xs -z-10"
                    />
                    <motion.div
                      animate={{ opacity: [0, 0.9, 0.4, 0], scale: [0.5, 1.4, 1.6, 0.1], x: [-10, -45] }}
                      transition={{ duration: 0.25, repeat: Infinity, delay: 0.05 }}
                      className="absolute left-2 bottom-8 w-10 h-3 bg-gradient-to-l from-amber-400 via-rose-500 to-transparent rounded-full blur-xs -z-10"
                    />
                  </>
                )}

                {/* Laser Headlight Beams cutting through night mist */}
                {(animStage === 'morphing_car' || animStage === 'driving_away') && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 0.85, scaleX: 1 }}
                    transition={{ duration: 0.35 }}
                    className="absolute right-0 top-7 w-64 h-16 bg-gradient-to-r from-cyan-400/40 via-cyan-300/15 to-transparent -z-10 origin-left blur-sm pointer-events-none"
                    style={{ clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)' }}
                  />
                )}

                {/* High-Fidelity Vector Canvas (Morph between 'D' and Supercar) */}
                <svg
                  viewBox="0 0 320 150"
                  className="w-72 h-36 drop-shadow-[0_16px_32px_rgba(255,59,48,0.5)]"
                >
                  <defs>
                    <linearGradient id="supercarFinish" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff9500" />
                      <stop offset="45%" stopColor="#ff3b30" />
                      <stop offset="100%" stopColor="#d90429" />
                    </linearGradient>

                    <linearGradient id="cabinGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    <linearGradient id="laserCyanLed" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f5d4" />
                      <stop offset="100%" stopColor="#00b4d8" />
                    </linearGradient>
                  </defs>

                  {/* 1. Main Aerodynamic Chassis */}
                  {/* In 'logo_d': Bold structural 'D' with upright spine and sweeping curve */}
                  {/* In 'morphing_car': Slams down into aggressive Grand Touring Coupe */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 70 20 C 190 20, 240 50, 240 75 C 240 100, 190 130, 70 130 C 58 130, 52 120, 52 75 C 52 30, 58 20, 70 20 Z'
                        : 'M 30 100 C 35 72, 65 65, 95 62 C 125 36, 185 34, 225 58 C 265 62, 295 78, 302 100 C 302 108, 290 110, 275 110 C 270 110, 255 92, 225 92 C 195 92, 185 110, 135 110 C 130 110, 115 92, 85 92 C 55 92, 45 110, 30 110 Z'
                    }
                    fill="url(#supercarFinish)"
                    animate={{
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }}
                  />

                  {/* 2. Cockpit Canopy / Inner 'D' Void */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 98 44 C 160 44, 195 60, 195 75 C 195 90, 160 106, 98 106 C 85 106, 82 96, 82 75 C 82 54, 85 44, 98 44 Z'
                        : 'M 112 64 C 130 44, 178 44, 218 62 C 218 72, 180 72, 120 72 Z'
                    }
                    fill="url(#cabinGlass)"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={animStage === 'logo_d' ? '3.5' : '2.5'}
                    animate={{
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }}
                  />

                  {/* 3. Aggressive Laser Headlight Projector */}
                  <motion.path
                    d={
                      animStage === 'logo_d'
                        ? 'M 218 70 Q 235 75 218 80'
                        : 'M 285 92 L 304 95 L 284 98 Z'
                    }
                    fill="url(#laserCyanLed)"
                    animate={{
                      opacity: animStage === 'logo_d' ? 0.35 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* 4. Front Multi-Spoke Alloy Wheel */}
                  <motion.g
                    animate={{
                      opacity: animStage === 'logo_d' ? 0 : 1,
                      scale: animStage === 'logo_d' ? 0.1 : 1,
                      rotate: animStage === 'driving_away' ? 1080 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.35 },
                      rotate: { duration: 0.85, ease: 'linear' }
                    }}
                    style={{ originX: '248px', originY: '110px' }}
                  >
                    <circle cx="248" cy="110" r="20" fill="#0b0f19" stroke="#ff3b30" strokeWidth="4.5" />
                    <circle cx="248" cy="110" r="10" fill="#00f5d4" />
                    <line x1="248" y1="92" x2="248" y2="128" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                    <line x1="230" y1="110" x2="266" y2="110" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                    <line x1="235" y1="97" x2="261" y2="123" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="235" y1="123" x2="261" y2="97" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  </motion.g>

                  {/* 5. Rear Multi-Spoke Alloy Wheel */}
                  <motion.g
                    animate={{
                      opacity: animStage === 'logo_d' ? 0 : 1,
                      scale: animStage === 'logo_d' ? 0.1 : 1,
                      rotate: animStage === 'driving_away' ? 1080 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.35 },
                      rotate: { duration: 0.85, ease: 'linear' }
                    }}
                    style={{ originX: '85px', originY: '110px' }}
                  >
                    <circle cx="85" cy="110" r="20" fill="#0b0f19" stroke="#ff3b30" strokeWidth="4.5" />
                    <circle cx="85" cy="110" r="10" fill="#00f5d4" />
                    <line x1="85" y1="92" x2="85" y2="128" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                    <line x1="67" y1="110" x2="103" y2="110" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                    <line x1="72" y1="97" x2="98" y2="123" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="72" y1="123" x2="98" y2="97" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  </motion.g>
                </svg>
              </motion.div>
            </div>

            {/* Typography & High-Energy Subtitle */}
            <motion.div
              animate={{
                opacity: animStage === 'driving_away' ? 0 : 1,
                y: animStage === 'driving_away' ? 12 : 0
              }}
              transition={{ duration: 0.35 }}
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
                  <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    V8 Ignition Active • Hitting the Asphalt
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
