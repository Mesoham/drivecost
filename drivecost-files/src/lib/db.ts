import Dexie, { type Table } from 'dexie';
import type { Vehicle, Expense, Reminder, OdometerLog, UserSettings, VehicleDocument } from '@/types';

export class DriveCostDatabase extends Dexie {
  vehicles!: Table<Vehicle, string>;
  expenses!: Table<Expense, string>;
  reminders!: Table<Reminder, string>;
  odometerLogs!: Table<OdometerLog, string>;
  documents!: Table<VehicleDocument, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor(dbName = 'DriveCostIndiaDB_guest') {
    super(dbName);
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

const ACTIVE_USER_STORAGE_KEY = 'drivecost_active_user_key';

export function sanitizeUserKey(identifier: string): string {
  return identifier
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'guest';
}

export function getActiveUserKey(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem(ACTIVE_USER_STORAGE_KEY) || 'guest';
}

let activeDb: DriveCostDatabase | null = null;
let activeDbKey: string | null = null;

export function getDb(): DriveCostDatabase {
  const userKey = getActiveUserKey();
  if (!activeDb || activeDbKey !== userKey) {
    if (activeDb) {
      activeDb.close();
    }
    activeDbKey = userKey;
    activeDb = new DriveCostDatabase(`DriveCostIndiaDB_${userKey}`);
  }
  return activeDb;
}

export function switchActiveUserDb(identifier: string | null): DriveCostDatabase {
  const nextKey = identifier ? sanitizeUserKey(identifier) : 'guest';
  if (typeof window !== 'undefined') {
    if (identifier) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, nextKey);
    } else {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  }
  if (activeDb && activeDbKey !== nextKey) {
    activeDb.close();
    activeDb = null;
  }
  activeDbKey = nextKey;
  activeDb = new DriveCostDatabase(`DriveCostIndiaDB_${nextKey}`);
  return activeDb;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark', // iOS 18 visionOS dark default
  language: 'en',
  currency: 'INR',
  mileageMetric: 'km/l',
  advanceWarningDays: 7,
  enableBrowserNotifications: false,
  hasCompletedOnboarding: false,
  usageGoal: 'personal',
  cloudSyncEnabled: false,
  isProUser: false,
  hasSubscribedBefore: false,
  isDemoMode: false,
  activeVehicleColor: '#0071e3',
  lastSelectedVehicleId: 'all',
  userAuth: {
    isLoggedIn: false
  },
  notificationPreferences: {
    channels: {
      push: false,
      email: false
    },
    categories: {
      dueReminders: {
        enabled: true,
        notify7Days: true,
        notify3Days: true,
        notify1Day: true
      },
      generalReminders: {
        enabled: true
      }
    }
  }
};

export async function getSettings(): Promise<UserSettings> {
  const database = getDb();
  const record = await database.settings.get('user_settings');
  if (record) {
    const { id: _, ...settings } = record;
    return { ...DEFAULT_SETTINGS, ...settings } as UserSettings;
  }
  await database.settings.put({ id: 'user_settings', ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const database = getDb();
  const current = await getSettings();
  const next = { ...current, ...updates };
  await database.settings.put({ id: 'user_settings', ...next });
  return next;
}
