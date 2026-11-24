'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { formatINR, maskRegistrationNumber, calculateOverallVehicleStats } from '@/lib/calculations';
import { formatDateIndian } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Fuel, 
  Wrench, 
  Calendar, 
  Gauge, 
  Plus, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { vehicles, expenses, reminders, deleteVehicle, updateVehicle } = useAppStore();
  const vehicle = vehicles.find(v => v.id === id);

  const [isUpdatingOdo, setIsUpdatingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!vehicle) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500">This vehicle might have been removed or does not exist.</p>
        <Link href="/vehicles">
          <Button variant="outline">Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  const vehExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
  const stats = calculateOverallVehicleStats(vehExpenses, vehicle.currentOdometer);
  const vehReminders = reminders.filter(r => r.vehicleId === vehicle.id);

  const handleUpdateOdometer = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newOdo);
    if (isNaN(val) || val < 0) return;

    if (val < vehicle.currentOdometer) {
      const confirmLower = window.confirm(
        `The entered reading (${val} km) is lower than current odometer (${vehicle.currentOdometer} km). Are you sure this is a correction?`
      );
      if (!confirmLower) return;
    }

    await updateVehicle(vehicle.id, { currentOdometer: val });
    setIsUpdatingOdo(false);
    setNewOdo('');
  };

  const handleDelete = async () => {
    await deleteVehicle(vehicle.id);
    router.push('/vehicles');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/vehicles">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {vehicle.name}
              </h1>
              <Badge variant="outline">{vehicle.type}</Badge>
            </div>
            <p className="text-xs text-slate-500">
              {vehicle.manufacturer} {vehicle.model} {vehicle.variant ? `• ${vehicle.variant}` : ''} •{' '}
              {vehicle.registrationNumber || 'No reg'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Vehicle?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong>{vehicle.name}</strong>? All associated fuel refills, expenses, and reminders will also be permanently deleted from this device.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Yes, Delete Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Stats Card */}
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="pt-2 sm:pt-0">
            <div className="text-xs text-slate-400">Current Odometer</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {vehicle.currentOdometer.toLocaleString('en-IN')} km
            </div>
            <button
              onClick={() => setIsUpdatingOdo(true)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-1 font-medium"
            >
              Update Reading
            </button>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="text-xs text-slate-400">Total Recorded Cost</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {formatINR(stats.totalSpend)}
            </div>
            <span className="text-[11px] text-slate-400">{vehExpenses.length} transactions</span>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="text-xs text-slate-400">Verified Mileage</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {stats.lastVerifiedMileage ? `${stats.lastVerifiedMileage} km/l` : '—'}
            </div>
            <span className="text-[11px] text-slate-400">
              {stats.averageMileage ? `Avg: ${stats.averageMileage} km/l` : 'Needs 2 full tanks'}
            </span>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="text-xs text-slate-400">Cost per km</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {stats.costPerKm ? `₹${stats.costPerKm}/km` : '—'}
            </div>
            <span className="text-[11px] text-slate-400">
              Fuel: {stats.fuelCostPerKm ? `₹${stats.fuelCostPerKm}` : '—'}
            </span>
          </div>
        </div>

        {/* Update Odometer Inline Form */}
        {isUpdatingOdo && (
          <form onSubmit={handleUpdateOdometer} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="number"
              required
              min="0"
              placeholder={`Enter new odometer (current: ${vehicle.currentOdometer})`}
              value={newOdo}
              onChange={(e) => setNewOdo(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />
            <Button type="submit" size="sm" className="h-8 text-xs">
              Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUpdatingOdo(false)} className="h-8 text-xs">
              Cancel
            </Button>
          </form>
        )}
      </Card>

      {/* Document Expiry Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="text-xs text-slate-400">Insurance Policy</div>
          <div className="font-semibold text-sm text-slate-900 dark:text-white">
            {vehicle.insuranceExpiryDate ? formatDateIndian(vehicle.insuranceExpiryDate) : 'Not recorded'}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="text-xs text-slate-400">PUC Certificate</div>
          <div className="font-semibold text-sm text-slate-900 dark:text-white">
            {vehicle.pucExpiryDate ? formatDateIndian(vehicle.pucExpiryDate) : 'Not recorded'}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="text-xs text-slate-400">Next Service Due</div>
          <div className="font-semibold text-sm text-slate-900 dark:text-white">
            {vehicle.serviceDueDate ? formatDateIndian(vehicle.serviceDueDate) : 'Not scheduled'}
            {vehicle.serviceDueOdometer ? ` (${vehicle.serviceDueOdometer} km)` : ''}
          </div>
        </div>
      </div>

      {/* Vehicle Expense History */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History ({vehExpenses.length})</CardTitle>
        </CardHeader>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {vehExpenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {exp.category === 'Fuel refill' && <Fuel className="h-4 w-4 text-blue-500" />}
                  {exp.category === 'Service' && <Wrench className="h-4 w-4 text-emerald-500" />}
                  {exp.category !== 'Fuel refill' && exp.category !== 'Service' && <FileText className="h-4 w-4 text-amber-500" />}
                </div>
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{exp.category}</span>
                    {exp.isFullTank && <Badge variant="info">Full Tank</Badge>}
                    {exp.isPartialFill && <Badge variant="outline">Partial</Badge>}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDateIndian(exp.date)} {exp.merchant ? `• ${exp.merchant}` : ''}
                    {exp.odometer ? ` • ${exp.odometer} km` : ''}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatINR(exp.amount)}
                </div>
                <span className="text-[11px] text-slate-400">{exp.paymentMethod}</span>
              </div>
            </div>
          ))}

          {vehExpenses.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No expenses recorded yet for {vehicle.name}.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
