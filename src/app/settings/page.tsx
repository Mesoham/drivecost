'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportDataToJSON, restoreDataFromJSON } from '@/lib/backup';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Download, 
  Upload, 
  Sparkles, 
  Bell, 
  AlertTriangle,
  LogOut,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { 
    settings, 
    updateUserSettings, 
    loadDemoData, 
    clearAllData,
    logoutUser,
    setDynamicAlert
  } = useAppStore();

  const handleLogout = async () => {
    await logoutUser();

    setDynamicAlert({
      title: 'Logged Out Successfully',
      subtitle: 'Your session has ended. Redirecting to login...',
      icon: 'check',
      color: '#0071e3'
    });

    router.push('/login');
  };

  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

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

  const handleClearDataConfirmed = async () => {
    if (typedConfirmation.trim().toUpperCase() !== 'DELETE') return;
    await clearAllData();
    setShowClearModal(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight daylight-text-main">Settings</h1>
        <p className="text-xs daylight-text-muted mt-0.5">Preferences, Notifications, Backups, and Garage Management</p>
      </div>

      {/* SECTION 1: Display & Atmosphere */}
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

      {/* SECTION 2: Clean Consolidated Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Manage push notification alerts and reminder timeline in one place
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          {/* Dropdown 1: Notification Channel */}
          <div className="flex items-center justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Notification Type</div>
              <div className="text-xs daylight-text-muted">Browser push alerts for upcoming due dates</div>
            </div>
            <select
              value={
                (settings?.enableBrowserNotifications || settings?.notificationPreferences?.channels?.push)
                  ? 'push'
                  : 'off'
              }
              onChange={async (e) => {
                const mode = e.target.value as 'push' | 'off';
                if (mode === 'push' && typeof window !== 'undefined' && 'Notification' in window) {
                  const perm = await Notification.requestPermission();
                  if (perm === 'denied') {
                    setDynamicAlert({
                      title: 'Browser Permission Blocked',
                      subtitle: 'Please allow notifications in your browser site settings.',
                      icon: 'check',
                      color: '#ef4444'
                    });
                    return;
                  }
                }
                const duePrefs = settings?.notificationPreferences?.categories?.dueReminders || {
                  enabled: true,
                  notify7Days: true,
                  notify3Days: true,
                  notify1Day: true
                };
                await updateUserSettings({
                  enableBrowserNotifications: mode === 'push',
                  notificationPreferences: {
                    channels: {
                      push: mode === 'push',
                      email: false
                    },
                    categories: {
                      dueReminders: duePrefs,
                      generalReminders: { enabled: true }
                    }
                  }
                });
                setDynamicAlert({
                  title: mode === 'push' ? 'Push Notifications Enabled' : 'Notifications Turned Off',
                  subtitle: mode === 'push' ? 'You will receive browser alerts for due reminders.' : 'All reminder alerts are muted.',
                  icon: 'check',
                  color: '#0071e3'
                });
              }}
              className="text-xs font-semibold rounded-xl apple-glass px-3 py-2 daylight-text-main focus:outline-none cursor-pointer"
            >
              <option value="push">Push Notifications</option>
              <option value="off">Off (Disabled)</option>
            </select>
          </div>

          {/* Dropdown 2: Reminder Timeline */}
          <div className="flex items-center justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Reminder Timeline</div>
              <div className="text-xs daylight-text-muted">When to notify before insurance, PUC, or service due dates</div>
            </div>
            <select
              value={(() => {
                const d = settings?.notificationPreferences?.categories?.dueReminders;
                if (!d) return 'all';
                if (d.notify7Days && d.notify3Days && d.notify1Day) return 'all';
                if (d.notify7Days && !d.notify3Days && !d.notify1Day) return '7';
                if (!d.notify7Days && d.notify3Days && !d.notify1Day) return '3';
                if (!d.notify7Days && !d.notify3Days && d.notify1Day) return '1';
                return 'all';
              })()}
              onChange={async (e) => {
                const val = e.target.value as 'all' | '7' | '3' | '1';
                const dueReminders = {
                  enabled: true,
                  notify7Days: val === 'all' || val === '7',
                  notify3Days: val === 'all' || val === '3',
                  notify1Day: val === 'all' || val === '1'
                };
                await updateUserSettings({
                  advanceWarningDays: val === '1' ? 1 : val === '3' ? 3 : 7,
                  notificationPreferences: {
                    channels: {
                      push: Boolean(settings?.enableBrowserNotifications || settings?.notificationPreferences?.channels?.push),
                      email: false
                    },
                    categories: {
                      dueReminders,
                      generalReminders: { enabled: true }
                    }
                  }
                });
                setDynamicAlert({
                  title: 'Reminder Timeline Updated',
                  subtitle: val === 'all' ? 'Alerts set for 7, 3 & 1 day before due' : `Alerts set for ${val} day(s) before due`,
                  icon: 'check',
                  color: '#10b981'
                });
              }}
              className="text-xs font-semibold rounded-xl apple-glass px-3 py-2 daylight-text-main focus:outline-none cursor-pointer"
            >
              <option value="all">All (7, 3 &amp; 1 Days Before)</option>
              <option value="7">7 Days Before</option>
              <option value="3">3 Days Before</option>
              <option value="1">1 Day Before</option>
            </select>
          </div>

          {/* Test Push Notification */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-sm font-semibold daylight-text-main">Test Push Notification</div>
              <div className="text-xs daylight-text-muted">Verify browser alerts work on this device right now</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                if (typeof window === 'undefined' || !('Notification' in window)) {
                  setDynamicAlert({
                    title: 'Not Supported',
                    subtitle: 'This browser does not support desktop push notifications.',
                    icon: 'check',
                    color: '#ef4444'
                  });
                  return;
                }
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  new Notification('DriveCost Test Alert 🚗', {
                    body: 'Push notifications are working! You will be alerted for upcoming vehicle reminders.',
                    icon: '/icon.svg'
                  });
                  setDynamicAlert({
                    title: 'Test Notification Sent!',
                    subtitle: 'Check your device notification banner.',
                    icon: 'check',
                    color: '#10b981'
                  });
                } else {
                  setDynamicAlert({
                    title: 'Permission Required',
                    subtitle: 'Please allow notifications in your browser to receive push alerts.',
                    icon: 'check',
                    color: '#ef4444'
                  });
                }
              }}
              className="text-xs gap-1.5"
            >
              <Bell className="h-3.5 w-3.5 text-purple-500" />
              <span>Send Test Alert</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Data Backup & Portability */}
      <Card>
        <CardHeader>
          <CardTitle>Data Backup & Portability</CardTitle>
          <CardDescription>Export or restore your garage records anytime.</CardDescription>
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

      {/* SECTION 4: Reset & Demo Data */}
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

      {/* SECTION 5 (BOTTOM OF PAGE): Account & Log Out */}
      <Card className="border border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <User className="h-5 w-5" />
            <span>Account & Session</span>
          </CardTitle>
          <CardDescription>Manage active login credentials and device session</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl apple-glass border border-red-500/20">
            <div>
              <div className="text-sm font-bold daylight-text-main flex items-center gap-2">
                <span>{settings?.userAuth?.displayName || 'Active Driver'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold uppercase">
                  {settings?.userAuth?.authMethod || 'Session Active'}
                </span>
              </div>
              <div className="text-xs daylight-text-muted mt-0.5">
                {settings?.userAuth?.identifier || 'Signed in to this device'}
              </div>
            </div>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-bold gap-2 cursor-pointer shadow-md shadow-red-500/25 px-5 py-2.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out of DriveCost</span>
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
