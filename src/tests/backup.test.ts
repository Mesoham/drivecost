import { describe, it, expect } from 'vitest';
import { exportExpensesToCSV, restoreDataFromJSON } from '@/lib/backup';
import type { Expense } from '@/types';

describe('Data Backup & CSV Export', () => {
  it('generates well-formatted CSV with headers and rows', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        vehicleId: 'v1',
        date: '2026-05-10T10:00:00.000Z',
        category: 'Fuel refill',
        amount: 500,
        paymentMethod: 'UPI',
        odometer: 8500,
        fuelPricePerLitre: 104.5,
        fuelQuantityLitres: 4.78,
        isFullTank: true,
        merchant: 'Indian Oil Baner',
        notes: 'Regular fill',
        tags: ['personal'],
        createdAt: '',
        updatedAt: ''
      }
    ];

    const map = { v1: 'My Honda Activa' };
    const csv = exportExpensesToCSV(expenses, map);

    expect(csv).toContain('Date & Time');
    expect(csv).toContain('My Honda Activa');
    expect(csv).toContain('Fuel refill');
    expect(csv).toContain('500');
    expect(csv).toContain('Indian Oil Baner');
  });

  it('validates corrupted backup JSON correctly', async () => {
    const corruptedJSON = '{"invalid": true}';
    const result = await restoreDataFromJSON(corruptedJSON);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid backup format');
  });
});
