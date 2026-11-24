import Dexie, { type Table } from 'dexie';
import type { Vehicle, Expense, Reminder, OdometerLog, UserSettings, VehicleDocument } from '@/types';

export class DriveCostDatabase extends Dexie {
  vehicles!: Table<Vehicle, string>;
  expenses!: Table<Expense, string>;
  reminders!: Table<Reminder, string>;
  odometerLogs!: Table<OdometerLog, string>;
  documents!: Table<VehicleDocument, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor() {
    super('DriveCostIndiaDB');
    this.version(2).stores({
      vehicles: 'id, name, type, registrationNumber, archived, createdAt',
      expenses: 'id, vehicleId, date, category, paymentMethod, isRecurring, createdAt',
      reminders: 'id, vehicleId, type, status, dueDate, dueOdometer, createdAt',
      odometerLogs: 'id, vehicleId, date, odometer, createdAt',
      documents: 'id, vehicleId, type, isDigiLockerVerified, createdAt',
      settings: 'id'
    });
  }
}

export const db = new DriveCostDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark', // iOS 18 visionOS dark default
  language: 'en',
  currency: 'INR',
  mileageMetric: 'km/l',
  advanceWarningDays: 15,
  enableBrowserNotifications: false,
  hasCompletedOnboarding: false,
  usageGoal: 'personal',
  cloudSyncEnabled: false,
  isProUser: false,
  activeVehicleColor: '#0071e3',
  userAuth: {
    isLoggedIn: false
  }
};

export async function getSettings(): Promise<UserSettings> {
  const record = await db.settings.get('user_settings');
  if (record) {
    const { id: _, ...settings } = record;
    return { ...DEFAULT_SETTINGS, ...settings } as UserSettings;
  }
  await db.settings.put({ id: 'user_settings', ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const next = { ...current, ...updates };
  await db.settings.put({ id: 'user_settings', ...next });
  return next;
}
