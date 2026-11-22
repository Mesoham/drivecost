import type { Vehicle, Expense, Reminder } from '@/types';

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'demo-vehicle-1',
    name: 'My Honda Activa',
    type: 'Scooter',
    manufacturer: 'Honda',
    model: 'Activa 6G',
    variant: 'DLX',
    registrationNumber: 'MH 12 DE 1433',
    purchaseDate: '2023-04-10',
    purchasePrice: 86000,
    currentOdometer: 8420,
    fuelType: 'Petrol',
    expectedMileage: 48,
    tankCapacity: 5.3,
    insuranceExpiryDate: '2026-12-15',
    pucExpiryDate: '2026-11-28', // due soon
    serviceDueDate: '2027-01-10',
    serviceDueOdometer: 9000,
    notes: 'Used daily for city commute and local grocery runs.',
    color: 'Pearl Siren Blue',
    defaultFuelPrice: 104.5,
    archived: false,
    createdAt: '2023-04-10T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z'
  },
  {
    id: 'demo-vehicle-2',
    name: 'Family Swift',
    type: 'Car',
    manufacturer: 'Maruti Suzuki',
    model: 'Swift ZXi',
    variant: 'Manual',
    registrationNumber: 'MH 14 AB 9821',
    purchaseDate: '2022-08-15',
    purchasePrice: 820000,
    currentOdometer: 24350,
    fuelType: 'Petrol',
    expectedMileage: 18.5,
    tankCapacity: 37,
    insuranceExpiryDate: '2026-11-25', // due in 5 days!
    pucExpiryDate: '2027-02-10',
    serviceDueDate: '2026-11-18', // overdue!
    serviceDueOdometer: 25000,
    emiAmount: 11500,
    emiDueDate: '2026-12-05',
    notes: 'Weekend road trips and family transit.',
    color: 'Solid Fire Red',
    defaultFuelPrice: 104.5,
    archived: false,
    createdAt: '2022-08-15T12:00:00.000Z',
    updatedAt: '2026-11-20T12:00:00.000Z'
  }
];

export const DEMO_EXPENSES: Expense[] = [
  // Scooter Refills (Activa)
  {
    id: 'demo-exp-1',
    vehicleId: 'demo-vehicle-1',
    date: '2026-06-05T09:30:00.000Z',
    category: 'Fuel refill',
    amount: 470,
    paymentMethod: 'UPI',
    merchant: 'Indian Oil - Baner',
    odometer: 7200,
    fuelPricePerLitre: 104.44,
    fuelQuantityLitres: 4.5,
    isFullTank: true,
    isPartialFill: false,
    stationLocation: 'Baner Rd, Pune',
    tags: ['personal'],
    createdAt: '2026-06-05T09:30:00.000Z',
    updatedAt: '2026-06-05T09:30:00.000Z'
  },
  {
    id: 'demo-exp-2',
    vehicleId: 'demo-vehicle-1',
    date: '2026-06-25T18:15:00.000Z',
    category: 'Fuel refill',
    amount: 480,
    paymentMethod: 'UPI',
    merchant: 'Bharat Petroleum',
    odometer: 7416, // 216 km / 4.6 L = ~46.95 km/l
    fuelPricePerLitre: 104.34,
    fuelQuantityLitres: 4.6,
    isFullTank: true,
    isPartialFill: false,
    stationLocation: 'Aundh, Pune',
    tags: ['personal'],
    createdAt: '2026-06-25T18:15:00.000Z',
    updatedAt: '2026-06-25T18:15:00.000Z'
  },
  {
    id: 'demo-exp-3',
    vehicleId: 'demo-vehicle-1',
    date: '2026-07-15T11:00:00.000Z',
    category: 'Fuel refill',
    amount: 200, // partial fill
    paymentMethod: 'UPI',
    merchant: 'HP Petrol Pump',
    odometer: 7510,
    fuelPricePerLitre: 105.26,
    fuelQuantityLitres: 1.9,
    isFullTank: false,
    isPartialFill: true,
    tags: ['personal'],
    createdAt: '2026-07-15T11:00:00.000Z',
    updatedAt: '2026-07-15T11:00:00.000Z'
  },
  {
    id: 'demo-exp-4',
    vehicleId: 'demo-vehicle-1',
    date: '2026-08-01T14:20:00.000Z',
    category: 'Service',
    amount: 1450,
    paymentMethod: 'UPI',
    merchant: 'Pashankar Honda Service Centre',
    odometer: 7600,
    notes: 'Engine oil replacement, brake check & air filter clean.',
    tags: ['personal'],
    createdAt: '2026-08-01T14:20:00.000Z',
    updatedAt: '2026-08-01T14:20:00.000Z'
  },
  {
    id: 'demo-exp-5',
    vehicleId: 'demo-vehicle-1',
    date: '2026-08-20T17:45:00.000Z',
    category: 'Fuel refill',
    amount: 495,
    paymentMethod: 'UPI',
    merchant: 'Bharat Petroleum',
    odometer: 7830,
    fuelPricePerLitre: 104.21,
    fuelQuantityLitres: 4.75,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-08-20T17:45:00.000Z',
    updatedAt: '2026-08-20T17:45:00.000Z'
  },
  {
    id: 'demo-exp-6',
    vehicleId: 'demo-vehicle-1',
    date: '2026-09-22T08:30:00.000Z',
    category: 'Fuel refill',
    amount: 470,
    paymentMethod: 'UPI',
    merchant: 'Indian Oil - Baner',
    odometer: 8055, // 225 km / 4.5 L = 50.0 km/l
    fuelPricePerLitre: 104.44,
    fuelQuantityLitres: 4.5,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-09-22T08:30:00.000Z',
    updatedAt: '2026-09-22T08:30:00.000Z'
  },
  {
    id: 'demo-exp-7',
    vehicleId: 'demo-vehicle-1',
    date: '2026-10-18T19:00:00.000Z',
    category: 'Parking',
    amount: 40,
    paymentMethod: 'Cash',
    merchant: 'Phoenix Mall Parking',
    notes: '2 hours scooter parking',
    tags: ['personal'],
    createdAt: '2026-10-18T19:00:00.000Z',
    updatedAt: '2026-10-18T19:00:00.000Z'
  },
  {
    id: 'demo-exp-8',
    vehicleId: 'demo-vehicle-1',
    date: '2026-11-10T12:30:00.000Z',
    category: 'Fuel refill',
    amount: 480,
    paymentMethod: 'UPI',
    merchant: 'Indian Oil - Baner',
    odometer: 8420, // 365 km / 4.6 L (after prev full tank)
    fuelPricePerLitre: 104.35,
    fuelQuantityLitres: 4.6,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-11-10T12:30:00.000Z',
    updatedAt: '2026-11-10T12:30:00.000Z'
  },

  // Swift Car Expenses
  {
    id: 'demo-exp-9',
    vehicleId: 'demo-vehicle-2',
    date: '2026-06-12T07:15:00.000Z',
    category: 'Fuel refill',
    amount: 3200,
    paymentMethod: 'Card',
    merchant: 'Shell Petrol Pump',
    odometer: 22100,
    fuelPricePerLitre: 106.66,
    fuelQuantityLitres: 30,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-06-12T07:15:00.000Z',
    updatedAt: '2026-06-12T07:15:00.000Z'
  },
  {
    id: 'demo-exp-10',
    vehicleId: 'demo-vehicle-2',
    date: '2026-06-14T11:45:00.000Z',
    category: 'Toll',
    amount: 320,
    paymentMethod: 'UPI',
    merchant: 'Mumbai-Pune Expressway FASTag',
    notes: 'Urse Toll Plaza',
    tags: ['personal'],
    createdAt: '2026-06-14T11:45:00.000Z',
    updatedAt: '2026-06-14T11:45:00.000Z'
  },
  {
    id: 'demo-exp-11',
    vehicleId: 'demo-vehicle-2',
    date: '2026-07-03T16:20:00.000Z',
    category: 'Fuel refill',
    amount: 3450,
    paymentMethod: 'Card',
    merchant: 'Indian Oil Highway',
    odometer: 22625, // 525 km / 33 L = 15.9 km/l
    fuelPricePerLitre: 104.54,
    fuelQuantityLitres: 33,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-07-03T16:20:00.000Z',
    updatedAt: '2026-07-03T16:20:00.000Z'
  },
  {
    id: 'demo-exp-12',
    vehicleId: 'demo-vehicle-2',
    date: '2026-07-28T14:00:00.000Z',
    category: 'Washing/detailing',
    amount: 600,
    paymentMethod: 'UPI',
    merchant: 'Speed Car Spa',
    notes: 'Foam wash & interior vacuum',
    tags: ['personal'],
    createdAt: '2026-07-28T14:00:00.000Z',
    updatedAt: '2026-07-28T14:00:00.000Z'
  },
  {
    id: 'demo-exp-13',
    vehicleId: 'demo-vehicle-2',
    date: '2026-08-10T10:00:00.000Z',
    category: 'EMI',
    amount: 11500,
    paymentMethod: 'Bank transfer',
    merchant: 'HDFC Auto Loan',
    notes: 'Monthly auto loan instalment',
    isRecurring: true,
    tags: ['recurring'],
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'demo-exp-14',
    vehicleId: 'demo-vehicle-2',
    date: '2026-08-25T18:00:00.000Z',
    category: 'Fuel refill',
    amount: 3300,
    paymentMethod: 'Card',
    merchant: 'Bharat Petroleum',
    odometer: 23150, // 525 km / 31.5 L = 16.66 km/l
    fuelPricePerLitre: 104.76,
    fuelQuantityLitres: 31.5,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-08-25T18:00:00.000Z',
    updatedAt: '2026-08-25T18:00:00.000Z'
  },
  {
    id: 'demo-exp-15',
    vehicleId: 'demo-vehicle-2',
    date: '2026-09-10T10:00:00.000Z',
    category: 'EMI',
    amount: 11500,
    paymentMethod: 'Bank transfer',
    merchant: 'HDFC Auto Loan',
    isRecurring: true,
    tags: ['recurring'],
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'demo-exp-16',
    vehicleId: 'demo-vehicle-2',
    date: '2026-09-18T13:30:00.000Z',
    category: 'Repair',
    amount: 1200,
    paymentMethod: 'UPI',
    merchant: 'Tyre Plaza',
    odometer: 23400,
    notes: 'Puncture repair and front wheel balancing',
    tags: ['personal'],
    createdAt: '2026-09-18T13:30:00.000Z',
    updatedAt: '2026-09-18T13:30:00.000Z'
  },
  {
    id: 'demo-exp-17',
    vehicleId: 'demo-vehicle-2',
    date: '2026-10-05T09:15:00.000Z',
    category: 'Fuel refill',
    amount: 3400,
    paymentMethod: 'Card',
    merchant: 'Shell Station',
    odometer: 23720, // 570 km / 32.5 L = 17.5 km/l
    fuelPricePerLitre: 104.61,
    fuelQuantityLitres: 32.5,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-10-05T09:15:00.000Z',
    updatedAt: '2026-10-05T09:15:00.000Z'
  },
  {
    id: 'demo-exp-18',
    vehicleId: 'demo-vehicle-2',
    date: '2026-10-10T10:00:00.000Z',
    category: 'EMI',
    amount: 11500,
    paymentMethod: 'Bank transfer',
    merchant: 'HDFC Auto Loan',
    isRecurring: true,
    tags: ['recurring'],
    createdAt: '2026-10-10T10:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'demo-exp-19',
    vehicleId: 'demo-vehicle-2',
    date: '2026-11-08T15:30:00.000Z',
    category: 'Fuel refill',
    amount: 3500,
    paymentMethod: 'UPI',
    merchant: 'Indian Oil',
    odometer: 24350, // 630 km / 33.5 L = 18.8 km/l
    fuelPricePerLitre: 104.47,
    fuelQuantityLitres: 33.5,
    isFullTank: true,
    isPartialFill: false,
    tags: ['personal'],
    createdAt: '2026-11-08T15:30:00.000Z',
    updatedAt: '2026-11-08T15:30:00.000Z'
  },
  {
    id: 'demo-exp-20',
    vehicleId: 'demo-vehicle-2',
    date: '2026-11-10T10:00:00.000Z',
    category: 'EMI',
    amount: 11500,
    paymentMethod: 'Bank transfer',
    merchant: 'HDFC Auto Loan',
    isRecurring: true,
    tags: ['recurring'],
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  }
];

export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'demo-rem-1',
    vehicleId: 'demo-vehicle-2',
    title: 'Comprehensive Car Insurance Renewal',
    type: 'Insurance expiry',
    dueDate: '2026-11-25',
    notes: 'ICICI Lombard policy expiring soon. Compare quotes before renewal.',
    status: 'due_soon',
    advanceDaysThreshold: 15,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  },
  {
    id: 'demo-rem-2',
    vehicleId: 'demo-vehicle-1',
    title: 'PUC Certificate Check',
    type: 'PUC expiry',
    dueDate: '2026-11-28',
    notes: 'Get PUC tested at local fuel station booth (₹50).',
    status: 'due_soon',
    advanceDaysThreshold: 10,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  },
  {
    id: 'demo-rem-3',
    vehicleId: 'demo-vehicle-2',
    title: 'Periodic 25,000 km Service',
    type: 'Service due by odometer',
    dueOdometer: 25000,
    dueDate: '2026-11-18', // overdue date
    notes: 'Brake fluid top-up, engine oil and coolant check at Maruti Arena.',
    status: 'overdue',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  },
  {
    id: 'demo-rem-4',
    vehicleId: 'demo-vehicle-2',
    title: 'Monthly Car Loan EMI',
    type: 'EMI due',
    dueDate: '2026-12-05',
    notes: 'Auto-debit scheduled from primary savings account (₹11,500).',
    status: 'upcoming',
    advanceDaysThreshold: 7,
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  }
];

export async function loadDemoDataIntoDB(dbInstance: any) {
  await dbInstance.vehicles.clear();
  await dbInstance.expenses.clear();
  await dbInstance.reminders.clear();
  await dbInstance.odometerLogs.clear();

  await dbInstance.vehicles.bulkPut(DEMO_VEHICLES);
  await dbInstance.expenses.bulkPut(DEMO_EXPENSES);
  await dbInstance.reminders.bulkPut(DEMO_REMINDERS);

  // Add initial odometer logs
  await dbInstance.odometerLogs.bulkPut([
    {
      id: 'demo-odo-1',
      vehicleId: 'demo-vehicle-1',
      date: '2026-11-10',
      odometer: 8420,
      tripDistance: 365,
      notes: 'Fuel fill odometer sync',
      createdAt: '2026-11-10T12:30:00.000Z'
    },
    {
      id: 'demo-odo-2',
      vehicleId: 'demo-vehicle-2',
      date: '2026-11-08',
      odometer: 24350,
      tripDistance: 630,
      notes: 'Highway trip completion',
      createdAt: '2026-11-08T15:30:00.000Z'
    }
  ]);
}
