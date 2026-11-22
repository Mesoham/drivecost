import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Vehicle name/nickname is required'),
  type: z.enum(['Car', 'Bike', 'Scooter', 'EV', 'Auto-rickshaw', 'Commercial vehicle', 'Other']),
  manufacturer: z.string().min(1, 'Manufacturer is required (e.g. Honda, Maruti, Tata)'),
  model: z.string().min(1, 'Model is required (e.g. Activa 6G, Swift, Nexon EV)'),
  variant: z.string().optional(),
  registrationNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative').optional(),
  currentOdometer: z.number().min(0, 'Odometer reading cannot be negative'),
  fuelType: z.enum(['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Other']),
  expectedMileage: z.number().min(0).optional(),
  tankCapacity: z.number().min(0).optional(),
  insuranceExpiryDate: z.string().optional(),
  pucExpiryDate: z.string().optional(),
  serviceDueDate: z.string().optional(),
  serviceDueOdometer: z.number().min(0).optional(),
  roadTaxDueDate: z.string().optional(),
  emiAmount: z.number().min(0).optional(),
  emiDueDate: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  defaultFuelPrice: z.number().min(0).optional(),
});

export const expenseSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  date: z.string().min(1, 'Date and time are required'),
  category: z.enum([
    'Fuel refill',
    'EV charging',
    'Service',
    'Repair',
    'Insurance',
    'PUC',
    'EMI',
    'Toll',
    'Parking',
    'Washing/detailing',
    'Tyres',
    'Battery',
    'Accessories',
    'Fine/challan',
    'Road tax',
    'Loan interest',
    'Other'
  ]),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Bank transfer', 'Other']),
  merchant: z.string().optional(),
  odometer: z.number().min(0, 'Odometer cannot be negative').optional(),
  notes: z.string().optional(),
  receiptAttachment: z.string().optional(),
  receiptName: z.string().optional(),
  tags: z.array(z.enum(['personal', 'business', 'emergency', 'recurring', 'tax-related'])).optional(),
  isRecurring: z.boolean().optional(),

  // Fuel specific
  fuelPricePerLitre: z.number().min(0).optional(),
  fuelQuantityLitres: z.number().min(0).optional(),
  isFullTank: z.boolean().optional(),
  isPartialFill: z.boolean().optional(),
  stationLocation: z.string().optional(),

  // EV charging specific
  unitsConsumedKwh: z.number().min(0).optional(),
  chargingType: z.enum(['Home', 'Public charger', 'Fast charger', 'Other']).optional(),
  electricityPricePerKwh: z.number().min(0).optional(),
  batteryPercentageBefore: z.number().min(0).max(100).optional(),
  batteryPercentageAfter: z.number().min(0).max(100).optional(),
  chargingLocation: z.string().optional()
});

export const reminderSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  title: z.string().min(1, 'Reminder title is required'),
  type: z.enum([
    'Insurance expiry',
    'PUC expiry',
    'Service due by date',
    'Service due by odometer',
    'EMI due',
    'Road tax due',
    'Tyre replacement estimate',
    'Battery replacement estimate',
    'Custom reminder'
  ]),
  dueDate: z.string().optional(),
  dueOdometer: z.number().min(0).optional(),
  notes: z.string().optional(),
  advanceDaysThreshold: z.number().min(1).max(90).optional()
});
