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
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Bell, 
  AlertTriangle,
  LogOut,
  User,
  Mail,
  Check,
  Calendar,
  Layers,
  Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { 
    settings, 
    vehicles, 
    updateUserSettings, 
    loadDemoData, 
    clearAllData,
    setDynamicAlert
  } = useAppStore();

  const handleLogout = async () => {
    await updateUserSettings({
      userAuth: {
        isLoggedIn: false,
        authMethod: 'phone',
        identifier: '',
        displayName: ''
      }
    });

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

      {/* SECTION 2: Unified & Consolidated Notifications Hub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure channels (Push, Email) and reminder timing (7d, 3d, 1d, General) in one unified place
          </CardDescription>
        </CardHeader>

        <div className="space-y-6">
          {/* 1. Delivery Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider daylight-text-muted mb-2.5">
              1. Delivery Channels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Push Channel */}
              <div 
                onClick={async () => {
                  const currentPush = settings?.notificationPreferences?.channels?.push ?? true;
                  if (!currentPush && 'Notification' in window) {
                    await Notification.requestPermission();
                  }
                  await updateUserSettings({
                    notificationPreferences: {
                      channels: {
                        push: !currentPush,
                        email: settings?.notificationPreferences?.channels?.email ?? false
                      },
                      emailAddress: settings?.notificationPreferences?.emailAddress || settings?.userAuth?.identifier || '',
                      categories: settings?.notificationPreferences?.categories || {
                        dueReminders: { enabled: true, notify7Days: true, notify3Days: true, notify1Day: true },
                        generalReminders: { enabled: true }
                      }
                    }
                  });
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  (settings?.notificationPreferences?.channels?.push ?? true)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-black/10 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold daylight-text-main">Push Notifications</div>
                    <div className="text-[11px] daylight-text-muted">Instant on-device banner popups</div>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                  (settings?.notificationPreferences?.channels?.push ?? true)
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-400'
                }`}>
                  {(settings?.notificationPreferences?.channels?.push ?? true) && (
                    <Check className="h-3 w-3 stroke-[3]" />
                  )}
                </div>
              </div>

              {/* Email Channel */}
              <div 
                onClick={async () => {
                  const currentEmail = settings?.notificationPreferences?.channels?.email ?? false;
                  await updateUserSettings({
                    notificationPreferences: {
                      channels: {
                        push: settings?.notificationPreferences?.channels?.push ?? true,
                        email: !currentEmail
                      },
                      emailAddress: settings?.notificationPreferences?.emailAddress || settings?.userAuth?.identifier || '',
                      categories: settings?.notificationPreferences?.categories || {
                        dueReminders: { enabled: true, notify7Days: true, notify3Days: true, notify1Day: true },
                        generalReminders: { enabled: true }
                      }
                    }
                  });
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  (settings?.notificationPreferences?.channels?.email ?? false)
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-black/10 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold daylight-text-main">Email Notifications</div>
                    <div className="text-[11px] daylight-text-muted">Direct inbox delivery & summaries</div>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                  (settings?.notificationPreferences?.channels?.email ?? false)
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-400'
                }`}>
                  {(settings?.notificationPreferences?.channels?.email ?? false) && (
                    <Check className="h-3 w-3 stroke-[3]" />
                  )}
                </div>
              </div>
            </div>

            {/* Email Address Input (if email channel is enabled) */}
            {(settings?.notificationPreferences?.channels?.email ?? false) && (
              <div className="mt-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <label className="block text-[11px] font-bold daylight-text-muted mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  defaultValue={settings?.notificationPreferences?.emailAddress || settings?.userAuth?.identifier || ''}
                  onBlur={(e) => {
                    updateUserSettings({
                      notificationPreferences: {
                        channels: settings?.notificationPreferences?.channels || { push: true, email: true },
                        emailAddress: e.target.value.trim(),
                        categories: settings?.notificationPreferences?.categories || {
                          dueReminders: { enabled: true, notify7Days: true, notify3Days: true, notify1Day: true },
                          generalReminders: { enabled: true }
                        }
                      }
                    });
                    setDynamicAlert({
                      title: 'Email Saved',
                      subtitle: `Alerts will be sent to ${e.target.value.trim()}`,
                      icon: 'check',
                      color: '#0071e3'
                    });
                  }}
                  className="w-full rounded-xl apple-glass px-3.5 py-2 text-xs font-semibold daylight-text-main focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            )}
          </div>

          {/* 2. Notification Timing & Categories */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider daylight-text-muted mb-2">
              2. Reminder Schedules & Categories
            </h4>

            {/* Category A: Due Date Triggers (7d, 3d, 1d) */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold daylight-text-main">Due Date Reminders (PUC, Insurance, Tax, EMI)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                  Automatic
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: 'notify7Days', label: 'Due in 7 Days', sub: 'Early advance notice' },
                  { key: 'notify3Days', label: 'Due in 3 Days', sub: 'Preparation reminder' },
                  { key: 'notify1Day', label: 'Due in 1 Day', sub: 'Final 24-hr urgent alert' }
                ].map((item) => {
                  const isChecked = (settings?.notificationPreferences?.categories?.dueReminders as any)?.[item.key] ?? true;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={async () => {
                        await updateUserSettings({
                          notificationPreferences: {
                            channels: settings?.notificationPreferences?.channels || { push: true, email: false },
                            emailAddress: settings?.notificationPreferences?.emailAddress,
                            categories: {
                              dueReminders: {
                                enabled: true,
                                notify7Days: item.key === 'notify7Days' ? !isChecked : (settings?.notificationPreferences?.categories?.dueReminders?.notify7Days ?? true),
                                notify3Days: item.key === 'notify3Days' ? !isChecked : (settings?.notificationPreferences?.categories?.dueReminders?.notify3Days ?? true),
                                notify1Day: item.key === 'notify1Day' ? !isChecked : (settings?.notificationPreferences?.categories?.dueReminders?.notify1Day ?? true)
                              },
                              generalReminders: {
                                enabled: settings?.notificationPreferences?.categories?.generalReminders?.enabled ?? true
                              }
                            }
                          }
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-black/10 dark:border-white/10 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold daylight-text-main">{item.label}</div>
                        <div className="text-[10px] daylight-text-muted">{item.sub}</div>
                      </div>
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        isChecked ? 'bg-emerald-500 text-white' : 'border border-slate-400'
                      }`}>
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category B: General Maintenance & Service Reminders */}
            <div 
              onClick={async () => {
                const current = settings?.notificationPreferences?.categories?.generalReminders?.enabled ?? true;
                await updateUserSettings({
                  notificationPreferences: {
                    channels: settings?.notificationPreferences?.channels || { push: true, email: false },
                    emailAddress: settings?.notificationPreferences?.emailAddress,
                    categories: {
                      dueReminders: settings?.notificationPreferences?.categories?.dueReminders || {
                        enabled: true,
                        notify7Days: true,
                        notify3Days: true,
                        notify1Day: true
                      },
                      generalReminders: {
                        enabled: !current
                      }
                    }
                  }
                });
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                (settings?.notificationPreferences?.categories?.generalReminders?.enabled ?? true)
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : 'border-black/10 dark:border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold daylight-text-main">General & Periodic Reminders</div>
                  <div className="text-[11px] daylight-text-muted">Chain lubrication, tyre rotation, service & custom vehicle tasks</div>
                </div>
              </div>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                (settings?.notificationPreferences?.categories?.generalReminders?.enabled ?? true)
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-400'
              }`}>
                {(settings?.notificationPreferences?.categories?.generalReminders?.enabled ?? true) && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>
            </div>
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
