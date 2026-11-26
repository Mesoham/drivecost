'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { formatINR, maskRegistrationNumber, calculateOverallVehicleStats } from '@/lib/calculations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Bike, 
  Plus, 
  Gauge, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  Trash2
} from 'lucide-react';

function getBadgeColors(rawColor?: string): { bg: string; isLight: boolean } {
  const hex = rawColor && /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : '#0071e3';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return { bg: hex, isLight: luminance > 0.65 };
}

export default function VehiclesPage() {
  const { vehicles, expenses, reminders, settings, setProModalOpen, deleteVehicle } = useAppStore();
  const [vehicleToDelete, setVehicleToDelete] = useState<{ id: string; name: string } | null>(null);

  const isFreeTierLimitReached = !settings?.isProUser && vehicles.length >= 1;

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    await deleteVehicle(vehicleToDelete.id);
    setVehicleToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight daylight-text-main">
              My Vehicles ({vehicles.length})
            </h1>
            {!settings?.isProUser ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Free Plan (1 Vehicle)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Pro Version
              </span>
            )}
          </div>
          <p className="text-xs daylight-text-muted mt-1">
            Manage your cars, scooters, bikes and commercial fleet.
          </p>
        </div>

        {isFreeTierLimitReached ? (
          <Button
            onClick={() => setProModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold"
          >
            <Sparkles className="h-4 w-4" />
            <span>Add Vehicle (Unlock Pro)</span>
          </Button>
        ) : (
          <Link href="/vehicles/new">
            <Button className="gap-2 font-bold shadow-md shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </Button>
          </Link>
        )}
      </div>

      {isFreeTierLimitReached && (
        <div className="apple-glass p-5 border border-purple-500/30 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold daylight-text-main flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" /> Need more than 1 vehicle?
            </h4>
            <p className="text-xs daylight-text-muted mt-1">
              DriveCost Pro allows unlimited vehicles, digital document vaults, and export tax summaries for ₹74/month or ₹749/year (25% Off).
            </p>
          </div>
          <Button
            onClick={() => setProModalOpen(true)}
            className="shrink-0 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            View Pro Plans
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vehicles.map((v) => {
          const vehExpenses = expenses.filter(e => e.vehicleId === v.id);
          const vehStats = calculateOverallVehicleStats(vehExpenses, v.currentOdometer);
          const vehReminders = reminders.filter(r => r.vehicleId === v.id && r.status !== 'completed');
          const hasOverdue = vehReminders.some(r => r.status === 'overdue');
          const hasDueSoon = vehReminders.some(r => r.status === 'due_soon');
          const badgeColors = getBadgeColors(v.color);

          return (
            <Card key={v.id} className="relative overflow-hidden flex flex-col justify-between">
              {/* Top Bar */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md border border-black/10 dark:border-white/15 shrink-0 ${badgeColors.isLight ? 'text-slate-900' : 'text-white'}`}
                      style={{ backgroundColor: badgeColors.bg }}
                    >
                      {v.type === 'Bike' || v.type === 'Scooter' ? (
                        <Bike className="h-6 w-6" />
                      ) : (
                        <Car className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg daylight-text-main leading-tight">
                        {v.name}
                      </h3>
                      <div className="text-xs daylight-text-muted mt-0.5">
                        {v.manufacturer} {v.model} {v.variant ? `• ${v.variant}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {hasOverdue ? (
                    <Badge variant="danger">Overdue Alert</Badge>
                  ) : hasDueSoon ? (
                    <Badge variant="warning">Due Soon</Badge>
                  ) : (
                    <Badge variant="success">Healthy</Badge>
                  )}
                </div>

                {/* Key specs pill bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs py-2 border-y border-black/5 dark:border-white/5 my-3">
                  <span className="font-bold daylight-text-main">
                    {maskRegistrationNumber(v.registrationNumber) || 'No Reg No'}
                  </span>
                  <span className="opacity-30">•</span>
                  <span className="daylight-text-sub">{v.fuelType}</span>
                  <span className="opacity-30">•</span>
                  <span className="daylight-text-sub flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5 opacity-50" />
                    {v.currentOdometer.toLocaleString('en-IN')} km
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-3 rounded-2xl apple-glass">
                    <div className="text-[11px] daylight-text-muted">Total Spend</div>
                    <div className="text-sm font-bold daylight-text-main mt-0.5">
                      {formatINR(vehStats.totalSpend)}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl apple-glass">
                    <div className="text-[11px] daylight-text-muted">Verified Mileage</div>
                    <div className="text-sm font-bold daylight-text-main mt-0.5">
                      {vehStats.lastVerifiedMileage ? `${vehStats.lastVerifiedMileage} km/l` : '—'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl apple-glass">
                    <div className="text-[11px] daylight-text-muted">Cost/km</div>
                    <div className="text-sm font-bold daylight-text-main mt-0.5">
                      {vehStats.costPerKm ? `₹${vehStats.costPerKm}` : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="text-xs daylight-text-muted">
                  {vehReminders.length > 0 ? (
                    <span className="text-amber-500 font-medium">
                      {vehReminders.length} active alert{vehReminders.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span>All documents valid</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVehicleToDelete({ id: v.id, name: v.name })}
                    className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 h-8 rounded-xl transition-colors"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Link href={`/vehicles/${v.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="apple-glass bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold daylight-text-main">Delete Vehicle?</h3>
            </div>
            <p className="text-xs daylight-text-sub leading-relaxed">
              Are you sure you want to delete <strong className="daylight-text-main">{vehicleToDelete.name}</strong>? All associated fuel refills, service records, and reminders will also be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setVehicleToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Yes, Delete Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
