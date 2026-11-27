'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateIndianRegistration } from '@/lib/calculations';
import { ColorSpectrumPicker } from '@/components/color-spectrum-picker';
import { ArrowLeft, Car, ShieldAlert, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const APPLE_PALETTE = [
  { name: 'Electric Blue', hex: '#0071e3' },
  { name: 'Ferrari Crimson', hex: '#ff3b30' },
  { name: 'Emerald Green', hex: '#34c759' },
  { name: 'Sunset Amber', hex: '#ff9500' },
  { name: 'Vision Purple', hex: '#af52de' },
  { name: 'Cyber Yellow', hex: '#ffd60a' },
  { name: 'Alpine White', hex: '#f2f2f7' },
  { name: 'Space Black', hex: '#1c1c1e' }
];

export default function NewVehiclePage() {
  const router = useRouter();
  const { vehicles, settings, addVehicle, setProModalOpen, updateUserSettings, setDynamicAlert } = useAppStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'Car' | 'Bike' | 'Scooter' | 'EV' | 'Auto-rickshaw' | 'Commercial vehicle' | 'Other'>('Car');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG' | 'LPG' | 'Electric' | 'Hybrid' | 'Other'>('Petrol');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expectedMileage, setExpectedMileage] = useState('');
  const [tankCapacity, setTankCapacity] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');
  const [pucExpiryDate, setPucExpiryDate] = useState('');
  const [serviceDueDate, setServiceDueDate] = useState('');
  const [serviceDueOdometer, setServiceDueOdometer] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#0071e3');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pro tier gate: Free tier allows 1 vehicle
  const isFreeTierLimitReached = !settings?.isProUser && vehicles.length >= 1;

  const handleColorPick = async (hex: string) => {
    setColor(hex);
    await updateUserSettings({ activeVehicleColor: hex });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setDynamicAlert({
      title: 'Surprise Unlocked! 🎨',
      subtitle: `Interface adapted to your vehicle's live color!`,
      icon: 'car',
      color: hex
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreeTierLimitReached) {
      setProModalOpen(true);
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Vehicle nickname is required.');
      return;
    }
    if (!manufacturer.trim() || !model.trim()) {
      setErrorMsg('Manufacturer and model are required.');
      return;
    }
    if (currentOdometer === '' || isNaN(Number(currentOdometer)) || Number(currentOdometer) < 0) {
      setErrorMsg('Current odometer reading is required.');
      return;
    }

    const regValidation = validateIndianRegistration(registrationNumber);
    if (!regValidation.valid && regValidation.error) {
      setErrorMsg(regValidation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await addVehicle({
        name: name.trim(),
        type,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        variant: variant.trim() || undefined,
        registrationNumber: regValidation.formatted || undefined,
        currentOdometer: Number(currentOdometer) || 0,
        fuelType,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        purchaseDate: purchaseDate || undefined,
        expectedMileage: expectedMileage ? Number(expectedMileage) : undefined,
        tankCapacity: tankCapacity ? Number(tankCapacity) : undefined,
        insuranceExpiryDate: insuranceExpiryDate || undefined,
        pucExpiryDate: pucExpiryDate || undefined,
        serviceDueDate: serviceDueDate || undefined,
        serviceDueOdometer: serviceDueOdometer ? Number(serviceDueOdometer) : undefined,
        emiAmount: emiAmount ? Number(emiAmount) : undefined,
        notes: notes.trim() || undefined,
        color
      });

      // Reset all fields so adding another vehicle starts completely blank
      setName('');
      setManufacturer('');
      setModel('');
      setVariant('');
      setRegistrationNumber('');
      setCurrentOdometer('');
      setPurchasePrice('');
      setPurchaseDate('');
      setExpectedMileage('');
      setTankCapacity('');
      setInsuranceExpiryDate('');
      setPucExpiryDate('');
      setServiceDueDate('');
      setServiceDueOdometer('');
      setEmiAmount('');
      setNotes('');
      setErrorMsg('');

      router.push(`/vehicles/${newId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/vehicles">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight daylight-text-main">
            Add New Vehicle
          </h1>
          <p className="text-xs daylight-text-muted">Record details and customize your experience</p>
        </div>
      </div>

      {isFreeTierLimitReached && (
        <div className="apple-glass p-5 border border-purple-500/30 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" /> Free Tier Limit (1 Vehicle Active)
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              You are currently on the free tier. Upgrade to <strong>DriveCost Pro</strong> to manage unlimited cars, bikes, and fleet vehicles.
            </p>
          </div>
          <Button
            onClick={() => setProModalOpen(true)}
            className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold"
          >
            Upgrade (25% Off)
          </Button>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Surprise Vehicle Color Picker with Spectrum & Curated Options */}
          <ColorSpectrumPicker
            selectedColor={color}
            onColorChange={handleColorPick}
            surpriseUnlocked={true}
          />

          {/* Section 2: Basic Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider daylight-text-muted">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Vehicle Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Honda Activa, Family Creta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Motorcycle</option>
                  <option value="Scooter">Scooter</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Auto-rickshaw">Auto-rickshaw</option>
                  <option value="Commercial vehicle">Commercial vehicle / Van</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti, Honda, Tata"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swift, Activa, Nexon"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZXi, DLX, Creative"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm uppercase daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Current Odometer (km) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 15400"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold daylight-text-sub mb-1">
                  Fuel Type *
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/vehicles">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
            >
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
