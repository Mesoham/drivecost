import { describe, it, expect } from 'vitest';
import { 
  formatINR, 
  maskRegistrationNumber, 
  validateIndianRegistration, 
  calculateFuelRefillMetrics, 
  calculateOverallVehicleStats,
  getReminderStatus
} from '@/lib/calculations';
import type { Expense, Reminder, Vehicle } from '@/types';

describe('DriveCost India Calculations & Utilities', () => {
  it('formats Indian rupees properly with lakh separators', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(500)).toBe('₹500');
    expect(formatINR(125000)).toMatch(/1,25,000/);
    expect(formatINR(null)).toBe('₹0');
  });

  it('masks vehicle registration numbers in overview screens', () => {
    expect(maskRegistrationNumber('MH 12 DE 1433')).toBe('MH 12 •••• 1433');
    expect(maskRegistrationNumber('DL01AB1234')).toBe('DL01 •••• 1234');
    expect(maskRegistrationNumber('')).toBe('');
  });

  it('validates Indian vehicle registration gently', () => {
    expect(validateIndianRegistration('MH 12 DE 1433').valid).toBe(true);
    expect(validateIndianRegistration('22BH1234AA').valid).toBe(true);
    expect(validateIndianRegistration('KA05MJ9999').valid).toBe(true);
    expect(validateIndianRegistration('').valid).toBe(true);
  });

  it('calculates verified mileage only between two full tank fills', () => {
    const prevFill: Partial<Expense> = {
      odometer: 10000,
      isFullTank: true,
      fuelQuantityLitres: 30,
      amount: 3000
    };

    const nextFill: Partial<Expense> = {
      odometer: 10500,
      isFullTank: true,
      fuelQuantityLitres: 25,
      amount: 2600
    };

    const metrics = calculateFuelRefillMetrics(nextFill, prevFill);
    expect(metrics.hasVerifiedMileage).toBe(true);
    expect(metrics.distanceKm).toBe(500);
    // 500 km / 25 L = 20 km/l
    expect(metrics.mileageKmPerLitre).toBe(20);
    // Cost per km = 2600 / 500 = 5.2
    expect(metrics.costPerKm).toBe(5.2);
  });

  it('does NOT calculate verified mileage for partial fills', () => {
    const prevFill: Partial<Expense> = {
      odometer: 10000,
      isFullTank: true,
      fuelQuantityLitres: 30
    };

    const partialFill: Partial<Expense> = {
      odometer: 10200,
      isFullTank: false,
      isPartialFill: true,
      fuelQuantityLitres: 10
    };

    const metrics = calculateFuelRefillMetrics(partialFill, prevFill);
    expect(metrics.hasVerifiedMileage).toBe(false);
    expect(metrics.mileageKmPerLitre).toBe(null);
  });

  it('calculates vehicle cost per km and maintenance totals', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        vehicleId: 'v1',
        date: '2026-01-01',
        category: 'Fuel refill',
        amount: 3000,
        paymentMethod: 'UPI',
        odometer: 10000,
        fuelQuantityLitres: 30,
        isFullTank: true,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: '2',
        vehicleId: 'v1',
        date: '2026-01-15',
        category: 'Fuel refill',
        amount: 3000,
        paymentMethod: 'UPI',
        odometer: 10500,
        fuelQuantityLitres: 25,
        isFullTank: true,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: '3',
        vehicleId: 'v1',
        date: '2026-01-20',
        category: 'Service',
        amount: 2000,
        paymentMethod: 'Card',
        createdAt: '',
        updatedAt: ''
      }
    ];

    const stats = calculateOverallVehicleStats(expenses, 10500);
    expect(stats.totalSpend).toBe(8000);
    expect(stats.fuelSpend).toBe(6000);
    expect(stats.maintenanceSpend).toBe(2000);
    expect(stats.totalDistanceCovered).toBe(500);
    // 8000 / 500 = 16/km
    expect(stats.costPerKm).toBe(16);
  });

  it('determines reminder status (overdue, due_soon, upcoming)', () => {
    const mockVehicle: Vehicle = {
      id: 'v1',
      name: 'Test Activa',
      type: 'Scooter',
      manufacturer: 'Honda',
      model: 'Activa',
      currentOdometer: 5000,
      fuelType: 'Petrol',
      createdAt: '',
      updatedAt: ''
    };

    const overdueReminder: Reminder = {
      id: 'r1',
      vehicleId: 'v1',
      title: 'PUC Renewal',
      type: 'PUC expiry',
      dueDate: '2020-01-01',
      status: 'upcoming',
      createdAt: '',
      updatedAt: ''
    };

    expect(getReminderStatus(overdueReminder, mockVehicle)).toBe('overdue');
  });
});
