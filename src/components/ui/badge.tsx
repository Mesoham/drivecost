import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'info' | 'purple' | 'teal';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'daylight-text-sub bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10',
    info: 'badge-teal font-bold',
    success: 'badge-green font-bold',
    warning: 'badge-orange font-bold',
    danger: 'badge-red font-bold',
    purple: 'badge-purple font-bold',
    teal: 'badge-teal font-bold',
    outline: 'border border-black/15 dark:border-white/15 daylight-text-sub'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
