'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { settings, updateUserSettings } = useAppStore();
  const currentTheme = settings?.theme || 'light';
  const isDark = currentTheme === 'dark';

  const toggleTheme = async (mode: 'light' | 'dark') => {
    if (settings?.theme === mode) return;
    await updateUserSettings({ theme: mode });
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div
      role="group"
      aria-label="Theme mode switcher"
      className="relative flex items-center p-1 rounded-full apple-glass border border-black/10 dark:border-white/15 shadow-xs cursor-pointer select-none backdrop-blur-2xl"
    >
      {/* Sliding Liquid Glass Glider with Apple Spring Physics */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 35
        }}
        className="absolute top-1 bottom-1 rounded-full shadow-md backdrop-blur-xl border border-white/40 dark:border-white/20"
        style={{
          left: !isDark ? '4px' : 'calc(50% + 2px)',
          width: 'calc(50% - 6px)',
          background: !isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.82))'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.88))'
        }}
      />

      {/* Daylight Pill Option */}
      <button
        type="button"
        onClick={() => toggleTheme('light')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors duration-250 cursor-pointer ${
          !isDark
            ? 'text-amber-600 drop-shadow-xs'
            : 'daylight-text-tertiary hover:daylight-text-sub'
        }`}
      >
        <Sun className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[11px] tracking-tight">Daylight</span>
      </button>

      {/* Darkside Pill Option */}
      <button
        type="button"
        onClick={() => toggleTheme('dark')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors duration-250 cursor-pointer ${
          isDark
            ? 'text-blue-400 drop-shadow-xs'
            : 'daylight-text-tertiary hover:daylight-text-sub'
        }`}
      >
        <Moon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[11px] tracking-tight">Darkside</span>
      </button>
    </div>
  );
}
