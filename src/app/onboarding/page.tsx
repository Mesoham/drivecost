'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ColorSpectrumPicker } from '@/components/color-spectrum-picker';
import { 
  Car, 
  Bike, 
  Fuel, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Check,
  Building2,
  Users,
  Lock
} from 'lucide-react';
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

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addVehicle, loadDemoData, updateUserSettings, setDynamicAlert, setProModalOpen, settings } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [goal, setGoal] = useState<'personal' | 'business' | 'enterprise'>('personal');

  // Only advance to Step 2 if user explicitly returned from checkout with ?unlocked=pro
  useEffect(() => {
    if (searchParams.get('unlocked') === 'pro') {
      const tierParam = searchParams.get('tier');
      if (tierParam === 'enterprise' || tierParam === 'business') {
        setGoal(tierParam);
      }
      setStep(2);
    }
  }, [searchParams]);

  // Vehicle form state
  const [vehName, setVehName] = useState('');
  const [vehType, setVehType] = useState<'Car' | 'Bike' | 'Scooter' | 'EV' | 'Commercial vehicle'>('Bike');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG' | 'Electric'>('Petrol');
  const [color, setColor] = useState('#0071e3');
  const [surpriseTriggered, setSurpriseTriggered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleColorSelect = async (hex: string) => {
    setColor(hex);
    setSurpriseTriggered(true);
    await updateUserSettings({ activeVehicleColor: hex });
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    setDynamicAlert({
      title: 'Surprise Unlocked! 🎨',
      subtitle: 'Theme dynamically matched to your vehicle color!',
      icon: 'car',
      color: hex
    });
  };

  const handleGoalSelect = (id: 'personal' | 'business' | 'enterprise') => {
    setGoal(id);
    if (id === 'enterprise') {
      setVehType('Commercial vehicle');
      if (!vehName) setVehName('Fleet Truck / Delivery Van');
      if (!manufacturer) setManufacturer('Tata');
      if (!model) setModel('Ace Gold / 407');
    } else if (id === 'business') {
      setVehType('Car');
      if (!vehName) setVehName('Business Cab / Commercial Unit');
      if (!manufacturer) setManufacturer('Maruti Suzuki');
      if (!model) setModel('Tour S / Dzire');
    } else {
      setVehType('Car');
      if (!vehName) setVehName('Family Car');
      if (!manufacturer) setManufacturer('Maruti Suzuki');
      if (!model) setModel('Swift');
    }
  };

  const handleContinue = () => {
    // If user selected Business & Fleet or Enterprise Onboarding, redirect to payments page to purchase paid tier
    if (goal === 'business' || goal === 'enterprise') {
      router.push(`/checkout?tier=${goal}`);
    } else {
      setStep(2);
    }
  };

  const handleFinishCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName.trim() || !manufacturer.trim() || !model.trim()) return;

    setIsSubmitting(true);
    try {
      await addVehicle({
        name: vehName.trim(),
        type: vehType,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        currentOdometer: Number(odometer) || 0,
        fuelType: fuelType,
        color: color
      });

      await updateUserSettings({
        hasCompletedOnboarding: true,
        usageGoal: goal === 'enterprise' ? 'business' : goal,
        activeVehicleColor: color
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleUseDemoData = async () => {
    setIsSubmitting(true);
    await loadDemoData();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-10 transition-colors duration-500">
      {/* Top Bar with Daylight/Darkside switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl mx-auto">
        {/* Brand header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings?.theme === 'light' ? '/drivecost-logo.svg' : '/drivecost-logo-dark.svg'}
            alt="DriveCost"
            width={360}
            height={100}
            className="h-14 sm:h-16 w-auto mx-auto aspect-[360/100] object-contain mb-3"
          />
          <p className="daylight-text-muted mt-1 text-sm sm:text-base font-medium">
            Know what your vehicle really costs.
          </p>
        </div>

        {step === 1 && (
          <div className="apple-glass p-6 sm:p-8 backdrop-blur-2xl">
            <h2 className="text-xl font-bold daylight-text-main mb-2">What do you want to track?</h2>
            <p className="text-sm daylight-text-muted mb-6">
              Select your primary usage tier to personalize categories, reports, and fleet compliance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { 
                  id: 'personal', 
                  title: 'Personal', 
                  desc: 'Car, bike or scooter for family & daily commutes',
                  icon: Car,
                  badge: 'Free Tier',
                  badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                },
                { 
                  id: 'business', 
                  title: 'Business & Fleet', 
                  desc: 'Delivery, cabs, logistics, or transport units',
                  icon: Building2,
                  badge: 'Pro Tier Feature',
                  badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                },
                { 
                  id: 'enterprise', 
                  title: 'Enterprise Onboarding', 
                  desc: 'Multi-driver, company fleets & audit compliance',
                  icon: Users,
                  badge: 'Pro Tier Feature',
                  badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }
              ].map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleGoalSelect(opt.id as any)}
                    className={`p-4.5 rounded-2xl apple-glass text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-500/5 shadow-lg scale-[1.02] ring-2 ring-blue-500/20'
                        : 'border border-black/8 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-sm daylight-text-main mb-1">{opt.title}</div>
                      <div className="text-xs daylight-text-muted leading-relaxed mb-3">{opt.desc}</div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block w-fit ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <Button onClick={handleContinue} className="w-full py-3.5 text-base font-semibold cursor-pointer">
                <span>
                  {goal === 'business' || goal === 'enterprise'
                    ? 'Continue to Payment & Upgrade'
                    : 'Continue to Vehicle Details'}
                </span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <button
                type="button"
                onClick={handleUseDemoData}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl apple-glass border border-dashed border-black/15 dark:border-white/20 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Skip and explore with sample data (Honda Activa + Maruti Swift)</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="apple-glass p-6 sm:p-8 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold daylight-text-main">
                  {goal === 'enterprise' ? 'Enterprise Fleet Vehicle' : goal === 'business' ? 'Business Vehicle Setup' : 'Add Your First Vehicle'}
                </h2>
                <p className="text-xs daylight-text-muted mt-0.5">
                  Step 2 of 2 • Basic specifications & custom theme color
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/30">
                {goal === 'enterprise' ? 'Enterprise Mode' : goal === 'business' ? 'Business Mode' : 'Personal Mode'}
              </span>
            </div>

            <form onSubmit={handleFinishCustom} className="space-y-5">
              {/* Color Spectrum Picker: Pre-Selected & Continuous Spectrum Options */}
              <ColorSpectrumPicker
                selectedColor={color}
                onColorChange={handleColorSelect}
                surpriseUnlocked={surpriseTriggered}
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                  Vehicle Type
                </label>
                <div className={`grid gap-2 ${goal === 'personal' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-5'}`}>
                  {(goal === 'personal' 
                    ? (['Bike', 'Scooter', 'Car', 'EV'] as const)
                    : (['Bike', 'Scooter', 'Car', 'EV', 'Commercial vehicle'] as const)
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setVehType(t)}
                      className={`py-2 px-1 text-center text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        vehType === t
                          ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                          : 'apple-glass border-black/8 dark:border-white/10 daylight-text-sub hover:daylight-text-main'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                  Vehicle Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Daily Activa, City Swift, Delivery Unit 1"
                  value={vehName}
                  onChange={(e) => setVehName(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda, Maruti, Tata"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Activa 6G, Swift ZXi"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                    Current Odometer (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 8450"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1.5">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3 text-xs font-semibold cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !vehName.trim() || !manufacturer.trim() || !model.trim()}
                  className="flex-1 py-3 text-sm font-bold text-white shadow-lg cursor-pointer"
                  style={{ backgroundColor: color }}
                >
                  {isSubmitting ? 'Saving...' : 'Finish & Go to Dashboard'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Local privacy assurance */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs daylight-text-muted">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>All data remains strictly on your device. Works completely offline.</span>
        </div>
      </div>
    </div>
  );
}
