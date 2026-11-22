'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportDataToJSON, restoreDataFromJSON } from '@/lib/backup';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Cloud, 
  Bell, 
  AlertTriangle 
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    settings, 
    vehicles, 
    expenses, 
    updateUserSettings, 
    loadDemoData, 
    clearAllData,
    setProModalOpen 
  } = useAppStore();

  const [notificationMsg, setNotificationMsg] = useState('');
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const vehiclesMap = vehicles.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {} as Record<string, string>);

  const handleBackupJSON = async () => {
    const json = await exportDataToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DriveCost_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await restoreDataFromJSON(reader.result as string);
      if (result.success) {
        setImportStatus(`Restored ${result.count.vehicles} vehicles, ${result.count.expenses} expenses, and ${result.count.reminders} reminders.`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };



  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationMsg('Browser notifications are not supported on this browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await updateUserSettings({ enableBrowserNotifications: true });
      setNotificationMsg('Browser notifications enabled successfully!');
    } else {
      await updateUserSettings({ enableBrowserNotifications: false });
      setNotificationMsg('Notification permission was not granted. In-app alerts remain active.');
    }
  };

  const handleClearDataConfirmed = async () => {
    if (typedConfirmation.trim().toUpperCase() !== 'DELETE') return;
    await clearAllData();
    setShowClearModal(false);
    window.location.href = '/onboarding';
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight daylight-text-main">
          Settings & Local Data Management
        </h1>
        <p className="text-xs daylight-text-muted mt-1">
          Configure visual themes, subscription tier, and backup controls.
        </p>
      </div>

      {/* Monetization / Pro Subscription Banner */}
      <div className="apple-glass p-6 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white tracking-wide">
              {settings?.isProUser ? 'PRO VERSION ACTIVE' : 'FREE BASIC PLAN'}
            </span>
            <span className="text-xs daylight-text-muted">
              {settings?.isProUser ? 'Unlimited Vehicles & Cloud Vault' : '1 Vehicle Limit Active'}
            </span>
          </div>
          <p className="text-xs daylight-text-sub mt-2 leading-relaxed">
            {settings?.isProUser
              ? 'You have full access to unlimited vehicles, digital document vaults, and audit-ready tax exports.'
              : 'Upgrade to DriveCost Pro for ₹74/month or ₹749/year (25% first-time discount applied) to manage unlimited vehicles.'}
          </p>
        </div>

        {!settings?.isProUser ? (
          <Link href="/checkout">
            <Button
              className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-xs cursor-pointer"
            >
              Activate Pro Mode
            </Button>
          </Link>
        ) : (
          <div className="shrink-0 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lifetime / Active Pro Account</span>
          </div>
        )}
      </div>

      {/* Visual Atmosphere & Daylight/Darkside Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display & Theme Atmosphere</CardTitle>
          <CardDescription>Daylight (soft liquid glass) and Darkside (OLED iOS 18 mode)</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Theme Mode</div>
              <div className="text-xs daylight-text-muted">High-contrast Daylight and visionOS Darkside</div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Default Currency</div>
              <div className="text-xs daylight-text-muted">Indian Rupees (INR) with standard lakh formatting</div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl apple-glass">
              ₹ INR
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Mileage Metric</div>
              <div className="text-xs daylight-text-muted">Preferred fuel efficiency display unit</div>
            </div>
            <select
              value={settings?.mileageMetric || 'km/l'}
              onChange={(e) => updateUserSettings({ mileageMetric: e.target.value as any })}
              className="text-xs rounded-xl apple-glass px-3 py-1.5 daylight-text-main focus:outline-none"
            >
              <option value="km/l">Kilometres per Litre (km/l)</option>
              <option value="l/100km">Litres per 100 km (L/100km)</option>
              <option value="km/kWh">Kilometres per kWh (EV)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Browser Notification Controls */}
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
          <CardDescription>Optionally receive system-level reminders before documents expire</CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <p className="text-xs daylight-text-sub leading-relaxed">
            Due reminders always appear inside DriveCost regardless of browser notification permissions. If enabled, the browser can send an alert when a document due date is approaching.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestNotificationPermission}
            className="text-xs gap-1.5"
          >
            <Bell className="h-4 w-4" />
            <span>Enable Browser Notifications</span>
          </Button>

          {notificationMsg && (
            <div className="text-xs text-blue-500 font-medium">
              {notificationMsg}
            </div>
          )}
        </div>
      </Card>

      {/* Backup and Data Ownership */}
      <Card>
        <CardHeader>
          <CardTitle>Data Backup & Portability</CardTitle>
          <CardDescription>All your data belongs to you. Export or restore at any time.</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl apple-glass">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Full JSON Backup</div>
              <div className="text-xs daylight-text-muted">Saves all vehicles, logs, expenses and reminders in one file.</div>
            </div>
            <Button size="sm" onClick={handleBackupJSON} className="gap-1.5 text-xs">
              <Download className="h-4 w-4" />
              <span>Download JSON Backup</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl apple-glass">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Restore from Backup</div>
              <div className="text-xs daylight-text-muted">Restore your database from an existing DriveCost JSON file.</div>
            </div>
            <label className="inline-flex items-center justify-center font-medium rounded-2xl h-9 px-3.5 text-xs gap-1.5 apple-glass cursor-pointer hover:opacity-80">
              <Upload className="h-4 w-4" />
              <span>Select File</span>
              <input type="file" accept=".json" onChange={handleRestoreJSON} className="hidden" />
            </label>
          </div>

          {importStatus && (
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
              {importStatus}
            </div>
          )}


        </div>
      </Card>

      {/* Demo Data & Danger Zone */}
      <Card className="border border-rose-500/20">
        <CardHeader>
          <CardTitle className="text-rose-500">Reset & Demo Data</CardTitle>
          <CardDescription>Reload sample records or wipe local storage</CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Load Demo Data</div>
              <div className="text-xs daylight-text-muted">Replaces database with sample Activa & Swift data</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadDemoData()} className="text-xs gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Load Sample Data</span>
            </Button>
          </div>

          <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-rose-500">Clear All Local Data</div>
              <div className="text-xs daylight-text-muted">Irreversibly deletes all vehicles and expenses</div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)} className="text-xs">
              Clear All Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="apple-glass rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-500/30">
            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Type &quot;DELETE&quot; to Confirm
            </h3>
            <p className="text-xs daylight-text-sub leading-relaxed">
              This will erase all vehicles, expenses, and reminders saved in this browser. To proceed, please type <strong>DELETE</strong> below:
            </p>
            <input
              type="text"
              placeholder="Type DELETE"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              className="w-full rounded-2xl apple-glass px-4 py-2.5 text-sm uppercase daylight-text-main focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowClearModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={typedConfirmation.trim().toUpperCase() !== 'DELETE'}
                onClick={handleClearDataConfirmed}
              >
                Erase Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
