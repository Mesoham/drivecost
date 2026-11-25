import type { Vehicle, Expense, Reminder, OdometerLog } from '@/types';
import { getDb } from '@/lib/db';

export interface DriveCostBackup {
  version: number;
  appName: string;
  exportedAt: string;
  data: {
    vehicles: Vehicle[];
    expenses: Expense[];
    reminders: Reminder[];
    odometerLogs: OdometerLog[];
  };
}

/**
 * Generate a complete JSON backup of all user vehicle data
 */
export async function exportDataToJSON(): Promise<string> {
  const db = getDb();
  const [vehicles, expenses, reminders, odometerLogs] = await Promise.all([
    db.vehicles.toArray(),
    db.expenses.toArray(),
    db.reminders.toArray(),
    db.odometerLogs.toArray()
  ]);

  const backup: DriveCostBackup = {
    version: 1,
    appName: 'DriveCost India',
    exportedAt: new Date().toISOString(),
    data: {
      vehicles,
      expenses,
      reminders,
      odometerLogs
    }
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Validate and restore data from a JSON backup file
 */
export async function restoreDataFromJSON(jsonString: string): Promise<{ success: boolean; count: { vehicles: number; expenses: number; reminders: number }; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { success: false, count: { vehicles: 0, expenses: 0, reminders: 0 }, error: 'Invalid backup format. Missing data payload.' };
    }

    const { vehicles = [], expenses = [], reminders = [], odometerLogs = [] } = parsed.data;

    if (!Array.isArray(vehicles) || !Array.isArray(expenses)) {
      return { success: false, count: { vehicles: 0, expenses: 0, reminders: 0 }, error: 'Corrupted backup file: vehicles or expenses list is invalid.' };
    }

    // Atomic wipe and restore
    const db = getDb();
    await db.transaction('rw', db.vehicles, db.expenses, db.reminders, db.odometerLogs, async () => {
      await db.vehicles.clear();
      await db.expenses.clear();
      await db.reminders.clear();
      await db.odometerLogs.clear();

      if (vehicles.length > 0) await db.vehicles.bulkPut(vehicles);
      if (expenses.length > 0) await db.expenses.bulkPut(expenses);
      if (reminders.length > 0) await db.reminders.bulkPut(reminders);
      if (odometerLogs.length > 0) await db.odometerLogs.bulkPut(odometerLogs);
    });

    return {
      success: true,
      count: {
        vehicles: vehicles.length,
        expenses: expenses.length,
        reminders: reminders.length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      count: { vehicles: 0, expenses: 0, reminders: 0 },
      error: err.message || 'Failed to parse JSON backup file.'
    };
  }
}

/**
 * Export filtered expenses to a clean, well-formatted CSV
 */
export function exportExpensesToCSV(expenses: Expense[], vehiclesMap: Record<string, string>): string {
  const headers = [
    'Date & Time',
    'Vehicle Name',
    'Category',
    'Amount (INR)',
    'Payment Method',
    'Odometer (km)',
    'Merchant / Fuel Station',
    'Fuel Litres',
    'Fuel Price/Litre',
    'Full Tank Refill',
    'EV kWh',
    'Notes',
    'Tags'
  ];

  const rows = expenses.map(e => [
    `"${e.date}"`,
    `"${vehiclesMap[e.vehicleId] || e.vehicleId}"`,
    `"${e.category}"`,
    e.amount,
    `"${e.paymentMethod}"`,
    e.odometer ?? '',
    `"${(e.merchant || e.stationLocation || '').replace(/"/g, '""')}"`,
    e.fuelQuantityLitres ?? '',
    e.fuelPricePerLitre ?? '',
    e.isFullTank ? 'Yes' : e.isPartialFill ? 'Partial' : '',
    e.unitsConsumedKwh ?? '',
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    `"${(e.tags || []).join(', ')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
