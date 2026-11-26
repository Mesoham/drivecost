'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { maskRegistrationNumber } from '@/lib/calculations';
import { Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
  const { vehicles, selectedVehicleId, setSelectedVehicleId, reminders } = useAppStore();

  const dueRemindersCount = reminders.filter(r => r.status === 'due_soon' || r.status === 'overdue').length;

  return (
    <header className="sticky top-0 z-30 apple-dock rounded-none border-x-0 border-t-0 border-b border-black/5 dark:border-white/10 px-3 py-2.5 md:px-8 md:py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4 max-w-7xl mx-auto">
        {/* Row 1 on Mobile: Logo & DriveCost name (cleared from fixed hamburger button) */}
        <div className="flex items-center justify-between md:hidden pl-12 min-h-[36px]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-900 shadow-blue-500/30 flex items-center justify-center shadow-md border border-white/20 p-0.5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="DriveCost Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-base tracking-tight daylight-text-main">
              DriveCost
            </span>
          </Link>
        </div>

        {/* Row 2 on Mobile (Full single row on Desktop): Vehicle Selector + ThemeToggle + Bell */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Vehicle Filter Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 md:flex-initial min-w-0">
            <label htmlFor="vehicle-select" className="text-xs font-semibold daylight-text-sub hidden sm:inline shrink-0">
              Active Vehicle:
            </label>
            <div className="relative inline-block w-full sm:w-auto min-w-0">
              <select
                id="vehicle-select"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full sm:w-64 appearance-none rounded-2xl apple-glass px-3.5 py-2 text-xs font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-xs truncate"
              >
                <option value="all">🚗 All Vehicles ({vehicles.length})</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.type === 'Bike' || v.type === 'Scooter' ? '🛵 ' : '🚘 '}
                    {v.name} {v.registrationNumber ? `(${maskRegistrationNumber(v.registrationNumber)})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right side actions: Daylight/Darkside mode right beside Notification Bell */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <Link 
              href="/reminders" 
              className="relative p-2 rounded-2xl apple-glass text-slate-700 hover:text-black dark:text-slate-200 dark:hover:text-white transition-colors"
              title="Reminders & Alerts"
            >
              <Bell className="h-4 w-4" />
              {dueRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {dueRemindersCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
