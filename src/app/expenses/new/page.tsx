'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateFuelRefillMetrics } from '@/lib/calculations';
import type { ExpenseCategory, PaymentMethod, ExpenseTag } from '@/types';
import { ArrowLeft, Fuel, Zap, Wrench, ShieldAlert, Check, Image as ImageIcon } from 'lucide-react';

function ExpenseFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { vehicles, expenses, selectedVehicleId, addExpense } = useAppStore();

  const preselectedVehicleId = searchParams.get('vehicleId') || (selectedVehicleId !== 'all' ? selectedVehicleId : vehicles[0]?.id || '');
  const preselectedCategory = (searchParams.get('category') as ExpenseCategory) || 'Fuel refill';

  const [vehicleId, setVehicleId] = useState(preselectedVehicleId);
  const [category, setCategory] = useState<ExpenseCategory>(preselectedCategory);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-11-20T12:00');

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 16));
  }, []);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState('');
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<ExpenseTag[]>(['personal']);
  const [isRecurring, setIsRecurring] = useState(false);

  // Fuel Specific fields
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('');
  const [fuelQuantityLitres, setFuelQuantityLitres] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [isPartialFill, setIsPartialFill] = useState(false);
  const [stationLocation, setStationLocation] = useState('');

  // EV charging specific
  const [unitsConsumedKwh, setUnitsConsumedKwh] = useState('');
  const [chargingType, setChargingType] = useState<'Home' | 'Public charger' | 'Fast charger' | 'Other'>('Home');

  // Receipt attachment
  const [receiptAttachment, setReceiptAttachment] = useState<string | undefined>(undefined);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active vehicle & its default fuel price
  const activeVehicle = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (activeVehicle?.defaultFuelPrice && !fuelPricePerLitre && category === 'Fuel refill') {
      setFuelPricePerLitre(activeVehicle.defaultFuelPrice.toString());
    }
  }, [activeVehicle, category, fuelPricePerLitre]);

  // Two-way calculation for fuel
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const amtNum = parseFloat(val);
    const priceNum = parseFloat(fuelPricePerLitre);
    if (!isNaN(amtNum) && !isNaN(priceNum) && priceNum > 0) {
      setFuelQuantityLitres((amtNum / priceNum).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setFuelPricePerLitre(val);
    const priceNum = parseFloat(val);
    const amtNum = parseFloat(amount);
    const qtyNum = parseFloat(fuelQuantityLitres);
    if (!isNaN(priceNum) && priceNum > 0) {
      if (!isNaN(amtNum) && amtNum > 0) {
        setFuelQuantityLitres((amtNum / priceNum).toFixed(2));
      } else if (!isNaN(qtyNum) && qtyNum > 0) {
        setAmount((qtyNum * priceNum).toFixed(2));
      }
    }
  };

  const handleLitresChange = (val: string) => {
    setFuelQuantityLitres(val);
    const qtyNum = parseFloat(val);
    const priceNum = parseFloat(fuelPricePerLitre);
    if (!isNaN(qtyNum) && !isNaN(priceNum) && priceNum > 0) {
      setAmount((qtyNum * priceNum).toFixed(2));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Receipt image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptAttachment(reader.result as string);
      setReceiptName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Preview verified mileage feedback before submit
  let mileagePreview = null;
  if (category === 'Fuel refill' && odometer && isFullTank) {
    const previousFill = expenses
      .filter(e => e.vehicleId === vehicleId && e.category === 'Fuel refill' && typeof e.odometer === 'number')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (previousFill) {
      mileagePreview = calculateFuelRefillMetrics(
        {
          odometer: Number(odometer),
          fuelQuantityLitres: Number(fuelQuantityLitres),
          isFullTank: true,
          amount: Number(amount)
        },
        previousFill
      );
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setErrorMsg('Please select a vehicle.');
      return;
    }
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        vehicleId,
        date: new Date(date).toISOString(),
        category,
        amount: amtNum,
        amountInPaise: Math.round(amtNum * 100),
        paymentMethod,
        merchant: merchant.trim() || undefined,
        odometer: odometer ? Number(odometer) : undefined,
        notes: notes.trim() || undefined,
        receiptAttachment,
        receiptName,
        tags: selectedTags,
        isRecurring,

        // Fuel
        fuelPricePerLitre: fuelPricePerLitre ? Number(fuelPricePerLitre) : undefined,
        fuelQuantityLitres: fuelQuantityLitres ? Number(fuelQuantityLitres) : undefined,
        isFullTank: category === 'Fuel refill' ? isFullTank : undefined,
        isPartialFill: category === 'Fuel refill' ? isPartialFill : undefined,
        stationLocation: stationLocation.trim() || undefined,

        // EV
        unitsConsumedKwh: unitsConsumedKwh ? Number(unitsConsumedKwh) : undefined,
        chargingType: category === 'EV charging' ? chargingType : undefined
      });

      router.push('/expenses');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record expense.');
      setIsSubmitting(false);
    }
  };

  const categories: ExpenseCategory[] = [
    'Fuel refill',
    'EV charging',
    'Service',
    'Repair',
    'Insurance',
    'PUC',
    'EMI',
    'Toll',
    'Parking',
    'Washing/detailing',
    'Tyres',
    'Battery',
    'Accessories',
    'Fine/challan',
    'Road tax',
    'Other'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/expenses">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Record New Expense
          </h1>
          <p className="text-xs text-slate-500">Record fuel refills, services, and running costs</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vehicle & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle *
              </label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fuel Refill Specialized Sub-Section */}
          {category === 'Fuel refill' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel className="h-4 w-4" /> Fuel Refill Details
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullTank(true);
                      setIsPartialFill(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isFullTank
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Full Tank
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullTank(false);
                      setIsPartialFill(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isPartialFill
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Partial Fill
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fuel Price / Litre (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 104.50"
                    value={fuelPricePerLitre}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 4.78"
                    value={fuelQuantityLitres}
                    onChange={(e) => handleLitresChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Verified Mileage Live Calculation Preview */}
              {mileagePreview?.hasVerifiedMileage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span>
                    🎉 Distance: <strong>{mileagePreview.distanceKm} km</strong> • Verified Efficiency:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {mileagePreview.mileageKmPerLitre} km/l
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amount field if not fuel refill */}
          {category !== 'Fuel refill' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount in INR (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank transfer">Net Banking / NEFT</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Date & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Odometer Reading (km)
              </label>
              <input
                type="number"
                min="0"
                placeholder={`Current: ${activeVehicle?.currentOdometer || 0} km`}
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Merchant / Place */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Merchant / Fuel Station / Garage (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Indian Oil Baner, Bosch Car Service, Shell"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Notes & Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or work done..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Attachment (Local only)
              </label>
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ImageIcon className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {receiptName || 'Click to select receipt (Max 2MB)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/expenses">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? 'Saving Expense...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
      <ExpenseFormInner />
    </Suspense>
  );
}
