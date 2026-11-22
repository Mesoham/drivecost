'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, type = 'button', ...props }, ref) => {
    // Authentic Apple visionOS / iOS 18 "Liquid Glass" base specifications:
    // - backdrop-filter: blur(28px) saturate(190%)
    // - 240ms cubic-bezier(0.25, 1, 0.5, 1) spring physics
    // - scale(0.97) tap states
    // - letter-spacing: -0.015em
    // - dual directional specular reflections (inset top highlight + bottom depth shadow)
    const baseStyles = 'liquid-glass-btn inline-flex items-center justify-center font-bold rounded-2xl select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      // Primary CTA: Apple Electric Blue (#0071e3 / #2997ff) with diagonal sheen
      primary: 'bg-gradient-to-br from-[#0071e3] to-[#005bb5] text-white hover:from-[#2997ff] hover:to-[#0071e3] border-white/25 shadow-blue-500/25',

      // Secondary: visionOS Smoky Translucent Glass container with 135deg diagonal sheen
      secondary: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.65)_45%,rgba(240,240,245,0.8)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.22)_100%)] dark:bg-[rgba(22,22,28,0.72)] daylight-text-main hover:bg-white/95 dark:hover:bg-[rgba(32,32,40,0.85)]',

      // Outline: Translucent border with ambient specular edge
      outline: 'bg-white/40 dark:bg-black/30 daylight-text-main border-black/10 dark:border-white/14 hover:bg-white/70 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/30',

      // Ghost: Minimalist translucent hover state
      ghost: 'bg-transparent daylight-text-sub hover:daylight-text-main hover:bg-black/5 dark:hover:bg-white/8 shadow-none border-transparent hover:border-black/5 dark:hover:border-white/10',

      // Danger: Apple Rose Coral (#ff375f / #ff453a)
      danger: 'bg-gradient-to-br from-[#ff375f] to-[#e0244d] text-white hover:from-[#ff4d73] hover:to-[#ff375f] border-white/25 shadow-rose-500/20',

      // Success: Apple Emerald Green (#30d158)
      success: 'bg-gradient-to-br from-[#30d158] to-[#25a845] text-white hover:from-[#40e068] hover:to-[#30d158] border-white/25 shadow-emerald-500/20',

      // Glass: Liquid Glass Pearl / Smoky surface
      glass: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.65)_45%,rgba(240,240,245,0.8)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.22)_100%)] dark:bg-[rgba(22,22,28,0.72)] daylight-text-main hover:bg-white/95 dark:hover:bg-[rgba(32,32,40,0.85)]'
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-2'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
