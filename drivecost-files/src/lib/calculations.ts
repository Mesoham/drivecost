import type { Expense, Reminder, Vehicle } from '@/types';

/**
 * Format currency in Indian Rupees using Indian numbering format (e.g. ₹1,25,000)
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Mask registration number by default in overview screens
 * Example: "MH 01 AB 1234" -> "MH 01 •••• 1234"
 * Example: "DL 3C AW 5678" -> "DL 3C •••• 5678"
 */
export function maskRegistrationNumber(reg?: string): string {
  if (!reg) return '';
  const cleaned = reg.trim().toUpperCase();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} •••• ${parts[parts.length - 1]}`;
  }
  if (cleaned.length > 6) {
    return `${cleaned.slice(0, 4)} •••• ${cleaned.slice(-4)}`;
  }
  return cleaned;
}

/**
 * Indian vehicle registration gentle validation
 * E.g., DL01AB1234, MH 12 DE 1433, KA-05-MJ-9999, BH series 22BH1234AA
 */
export function validateIndianRegistration(reg?: string): { valid: boolean; formatted: string; error?: string } {
  if (!reg || !reg.trim()) {
    return { valid: true, formatted: '' };
  }
  const clean = reg.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Standard format check: 2 letters state + 2 digits RTO + 1-3 letters series + 4 digits
  // or BH series: 2 digits year + BH + 4 digits + 1-2 letters
  const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;
  const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;

  if (standardRegex.test(clean) || bhRegex.test(clean) || clean.length >= 4) {
    return { valid: true, formatted: clean };
  }
  return { valid: false, formatted: clean, error: 'Registration number looks unusual. Please double-check.' };
}

/**
 * Calculate Fuel Fill Metrics
 * Detect previous full tank refill for that vehicle.
 * Only calculate verified mileage when there are two consecutive full-tank refills.
 */
export interface MileageCalculationResult {
  hasVerifiedMileage: boolean;
  isPartial: boolean;
  distanceKm: number;
  fuelConsumedLitres: number;
  mileageKmPerLitre: number | null;
  mileageLitrePer100Km: number | null;
  costPerKm: number | null;
  notes?: string;
}

export function calculateFuelRefillMetrics(
  currentFill: Partial<Expense>,
  previousFill?: Partial<Expense> | null
): MileageCalculationResult {
  const result: MileageCalculationResult = {
    hasVerifiedMileage: false,
    isPartial: Boolean(currentFill.isPartialFill || !currentFill.isFullTank),
    distanceKm: 0,
    fuelConsumedLitres: currentFill.fuelQuantityLitres || 0,
    mileageKmPerLitre: null,
    mileageLitrePer100Km: null,
    costPerKm: null
  };

  if (
    !previousFill ||
    typeof currentFill.odometer !== 'number' ||
    typeof previousFill.odometer !== 'number' ||
    currentFill.odometer <= previousFill.odometer
  ) {
    return result;
  }

  const distance = currentFill.odometer - previousFill.odometer;
  result.distanceKm = distance;

  // Strict rule: Mileage is verified only between two full tanks
  if (currentFill.isFullTank && previousFill.isFullTank && result.fuelConsumedLitres > 0) {
    result.hasVerifiedMileage = true;
    const kmPerL = distance / result.fuelConsumedLitres;
    result.mileageKmPerLitre = Math.round(kmPerL * 100) / 100;
    result.mileageLitrePer100Km = Math.round((100 / kmPerL) * 100) / 100;

    if (currentFill.amount && currentFill.amount > 0 && distance > 0) {
      result.costPerKm = Math.round((currentFill.amount / distance) * 100) / 100;
    }
  } else if (currentFill.isPartialFill || !currentFill.isFullTank) {
    result.notes = 'Partial fill recorded. Mileage will calculate on the next full tank.';
  }

  return result;
}

/**
 * Calculate overall vehicle efficiency and Cost Per Km
 */
export function calculateOverallVehicleStats(expenses: Expense[], currentOdometer?: number) {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const fuelRefills = sortedExpenses.filter(e => e.category === 'Fuel refill' && e.odometer);
  let totalVerifiedDistance = 0;
  let totalVerifiedFuel = 0;
  let lastVerifiedMileage: number | null = null;

  for (let i = 1; i < fuelRefills.length; i++) {
    const prev = fuelRefills[i - 1];
    const curr = fuelRefills[i];
    if (prev.isFullTank && curr.isFullTank && curr.odometer && prev.odometer && curr.fuelQuantityLitres) {
      const dist = curr.odometer - prev.odometer;
      if (dist > 0) {
        totalVerifiedDistance += dist;
        totalVerifiedFuel += curr.fuelQuantityLitres;
        lastVerifiedMileage = Math.round((dist / curr.fuelQuantityLitres) * 100) / 100;
      }
    }
  }

  const averageMileage = totalVerifiedFuel > 0 ? Math.round((totalVerifiedDistance / totalVerifiedFuel) * 100) / 100 : null;

  // Total expenditure
  const totalSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const fuelSpend = expenses.filter(e => e.category === 'Fuel refill' || e.category === 'EV charging').reduce((sum, e) => sum + (e.amount || 0), 0);
  const maintenanceSpend = expenses.filter(e => e.category === 'Service' || e.category === 'Repair' || e.category === 'Tyres' || e.category === 'Battery').reduce((sum, e) => sum + (e.amount || 0), 0);

  // Distance range
  const odometers = expenses.map(e => e.odometer).filter((o): o is number => typeof o === 'number');
  if (currentOdometer) odometers.push(currentOdometer);

  let totalDistanceCovered = 0;
  if (odometers.length >= 2) {
    const minOdo = Math.min(...odometers);
    const maxOdo = Math.max(...odometers);
    totalDistanceCovered = maxOdo - minOdo;
  }

  const costPerKm = totalDistanceCovered > 0 ? Math.round((totalSpend / totalDistanceCovered) * 100) / 100 : null;
  const fuelCostPerKm = totalDistanceCovered > 0 ? Math.round((fuelSpend / totalDistanceCovered) * 100) / 100 : null;
  const maintenanceCostPerKm = totalDistanceCovered > 0 ? Math.round((maintenanceSpend / totalDistanceCovered) * 100) / 100 : null;

  return {
    totalSpend,
    fuelSpend,
    maintenanceSpend,
    totalDistanceCovered,
    lastVerifiedMileage,
    averageMileage,
    costPerKm,
    fuelCostPerKm,
    maintenanceCostPerKm
  };
}

/**
 * Determine Reminder Status given current date and vehicle odometer
 */
export function getReminderStatus(
  reminder: Reminder, 
  vehicle?: Vehicle | null,
  advanceThresholdDays = 15,
  referenceDate?: Date
): 'upcoming' | 'due_soon' | 'overdue' | 'completed' {
  if (reminder.status === 'completed' || reminder.completedAt) {
    return 'completed';
  }

  const now = referenceDate ? new Date(referenceDate.getTime()) : new Date('2026-11-20T00:00:00Z');
  now.setHours(0, 0, 0, 0);

  // Check date based
  if (reminder.dueDate) {
    const due = new Date(reminder.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= (reminder.advanceDaysThreshold || advanceThresholdDays)) return 'due_soon';
  }

  // Check odometer based
  if (reminder.dueOdometer && vehicle && vehicle.currentOdometer) {
    const remainingKm = reminder.dueOdometer - vehicle.currentOdometer;
    if (remainingKm <= 0) return 'overdue';
    if (remainingKm <= 500) return 'due_soon'; // Within 500 km
  }

  return 'upcoming';
}

/**
 * Compare this month vs previous month expenditure
 */
export function getMonthOverMonthComparison(expenses: Expense[], referenceDate?: Date) {
  if (!referenceDate) {
    return {
      thisMonthTotal: 0,
      prevMonthTotal: 0,
      diffAmount: 0,
      percentage: 0,
      isIncrease: false
    };
  }
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  let thisMonthTotal = 0;
  let prevMonthTotal = 0;

  for (const exp of expenses) {
    const d = new Date(exp.date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      thisMonthTotal += exp.amount || 0;
    } else if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
      prevMonthTotal += exp.amount || 0;
    }
  }

  const diffAmount = thisMonthTotal - prevMonthTotal;
  const percentage = prevMonthTotal > 0 
    ? Math.round(((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100) 
    : 0;

  return {
    thisMonthTotal,
    prevMonthTotal,
    diffAmount,
    percentage,
    isIncrease: diffAmount > 0
  };
}
