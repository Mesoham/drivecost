'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { maskRegistrationNumber } from '@/lib/calculations';
import { Bell, Sparkles, RotateCcw } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    reminders,
    settings,
    loadDemoData,
    exitDemoMode
  } = useAppStore();

  const dueRemindersCount = reminders.filter(r => r.status === 'due_soon' || r.status === 'overdue').length;
  const isDemoMode = Boolean(settings?.isDemoMode);

  return (
    <header className="sticky top-0 z-30 apple-dock rounded-none border-x-0 border-t-0 border-b border-black/5 dark:border-white/10 pl-14 pr-3 py-2 md:px-8 md:py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto w-full min-h-[36px]">
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
              className="w-full sm:w-64 h-9 appearance-none rounded-2xl apple-glass px-3.5 text-xs font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-xs truncate"
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

        {/* Right side actions: Demo/Real Switch, Theme Toggle, Notification Bell */}
        <div className="flex items-center gap-2 shrink-0">
          {isDemoMode ? (
            <button
              type="button"
              onClick={() => exitDemoMode()}
              className="h-9 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Switch back to your real garage data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Real Data</span>
              <span className="sm:hidden">Real Data</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => loadDemoData()}
              className="h-9 px-3 rounded-2xl apple-glass text-xs font-semibold daylight-text-main hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview dashboard with sample data"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span className="hidden sm:inline">Sample Data</span>
            </button>
          )}

          <ThemeToggle compact />

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
    </header>
  );
}
