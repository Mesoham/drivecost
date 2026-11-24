export type VehicleType = 
  | 'Car' 
  | 'Bike' 
  | 'Scooter' 
  | 'EV' 
  | 'Auto-rickshaw' 
  | 'Commercial vehicle' 
  | 'Other';

export type FuelType = 
  | 'Petrol' 
  | 'Diesel' 
  | 'CNG' 
  | 'LPG' 
  | 'Electric' 
  | 'Hybrid' 
  | 'Other';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  manufacturer: string;
  model: string;
  variant?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentOdometer: number;
  fuelType: FuelType;
  expectedMileage?: number;
  tankCapacity?: number;
  insuranceExpiryDate?: string;
  pucExpiryDate?: string;
  serviceDueDate?: string;
  serviceDueOdometer?: number;
  roadTaxDueDate?: string;
  emiAmount?: number;
  emiDueDate?: string;
  notes?: string;
  color?: string; // hex or color code (e.g., #0071e3, #ff3b30, #34c759)
  defaultFuelPrice?: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Fuel refill'
  | 'EV charging'
  | 'Service'
  | 'Repair'
  | 'Insurance'
  | 'PUC'
  | 'EMI'
  | 'Toll'
  | 'Parking'
  | 'Washing/detailing'
  | 'Tyres'
  | 'Battery'
  | 'Accessories'
  | 'Fine/challan'
  | 'Road tax'
  | 'Loan interest'
  | 'Other';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank transfer' | 'Other';
export type ExpenseTag = 'personal' | 'business' | 'emergency' | 'recurring' | 'tax-related';

export interface Expense {
  id: string;
  vehicleId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  amountInPaise?: number;
  paymentMethod: PaymentMethod;
  merchant?: string;
  odometer?: number;
  notes?: string;
  receiptAttachment?: string;
  receiptName?: string;
  tags?: ExpenseTag[];
  isRecurring?: boolean;

  // Fuel refill specific
  fuelPricePerLitre?: number;
  fuelQuantityLitres?: number;
  isFullTank?: boolean;
  isPartialFill?: boolean;
  stationLocation?: string;

  // EV charging specific
  unitsConsumedKwh?: number;
  chargingType?: 'Home' | 'Public charger' | 'Fast charger' | 'Other';
  electricityPricePerKwh?: number;
  batteryPercentageBefore?: number;
  batteryPercentageAfter?: number;
  chargingLocation?: string;

  createdAt: string;
  updatedAt: string;
}

export type ReminderType =
  | 'Insurance expiry'
  | 'PUC expiry'
  | 'Service due by date'
  | 'Service due by odometer'
  | 'EMI due'
  | 'Road tax due'
  | 'Tyre replacement estimate'
  | 'Battery replacement estimate'
  | 'Custom reminder';

export type ReminderStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed';

export interface Reminder {
  id: string;
  vehicleId: string;
  title: string;
  type: ReminderType;
  dueDate?: string;
  dueOdometer?: number;
  notes?: string;
  status: ReminderStatus;
  completedAt?: string;
  advanceDaysThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OdometerLog {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  tripDistance?: number;
  notes?: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  currency: 'INR' | 'USD';
  mileageMetric: 'km/l' | 'km/kWh' | 'l/100km';
  advanceWarningDays: number;
  enableBrowserNotifications: boolean;
  hasCompletedOnboarding: boolean;
  usageGoal: 'personal' | 'business' | 'both';
  cloudSyncEnabled: boolean;
  isProUser: boolean;
  hasSubscribedBefore?: boolean;
  activeVehicleColor?: string;
  userAuth?: {
    isLoggedIn: boolean;
    authMethod?: 'phone' | 'email' | 'google';
    identifier?: string;
    displayName?: string;
  };
  notificationPreferences?: {
    channels: {
      push: boolean;
      email: boolean;
    };
    emailAddress?: string;
    categories: {
      dueReminders: {
        enabled: boolean;
        notify7Days: boolean;
        notify3Days: boolean;
        notify1Day: boolean;
      };
      generalReminders: {
        enabled: boolean;
      };
    };
  };
}

export type DocumentType = 
  | 'Registration Certificate (RC)'
  | 'Insurance Policy'
  | 'PUC Certificate'
  | 'Driving License'
  | 'Commercial Permit'
  | 'Fitness Certificate'
  | 'Service Receipt / Invoice'
  | 'Warranty Card'
  | 'Other Document';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  title: string;
  type: DocumentType;
  fileName: string;
  fileType: 'image' | 'pdf';
  fileData: string; // Base64 data URL
  fileSize: number; // Bytes
  expiryDate?: string;
  documentNumber?: string;
  isDigiLockerVerified?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
