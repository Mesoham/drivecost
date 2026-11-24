import type { Vehicle, Expense, Reminder, UserSettings } from '@/types';

/**
 * Interface definition for Storage Repository
 * Allows plugging in Supabase, Firebase, or Custom Remote Sync in the future
 * without breaking the local Dexie-first database interface.
 */
export interface IDriveCostRepository {
  // Vehicle sync
  getVehicles(): Promise<Vehicle[]>;
  saveVehicle(vehicle: Vehicle): Promise<void>;
  deleteVehicle(id: string): Promise<void>;

  // Expense sync
  getExpenses(): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  // Reminders sync
  getReminders(): Promise<Reminder[]>;
  saveReminder(reminder: Reminder): Promise<void>;
  deleteReminder(id: string): Promise<void>;

  // Sync health check
  isAvailable(): Promise<boolean>;
}

/**
 * Future Supabase Database Schema Guide:
 * 
 * CREATE TABLE vehicles (
 *   id TEXT PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   name TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   manufacturer TEXT NOT NULL,
 *   model TEXT NOT NULL,
 *   registration_number TEXT,
 *   current_odometer NUMERIC NOT NULL DEFAULT 0,
 *   fuel_type TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE expenses (
 *   id TEXT PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
 *   date TIMESTAMPTZ NOT NULL,
 *   category TEXT NOT NULL,
 *   amount NUMERIC NOT NULL,
 *   payment_method TEXT NOT NULL,
 *   odometer NUMERIC,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security (RLS)
 * ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
 */

export class SupabaseSyncClient {
  private isConfigured = false;

  constructor() {
    // In local-first mode, credentials are never required
    this.isConfigured = false;
  }

  public getStatus() {
    return {
      connected: false,
      ready: false,
      message: 'Cloud Sync is currently in preview. Your data is stored safely on this device.'
    };
  }

  public async sync(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Supabase sync is optional and not active. DriveCost operates in 100% offline local-first mode.'
    };
  }
}

export const syncClient = new SupabaseSyncClient();
