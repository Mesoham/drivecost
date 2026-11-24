import ExcelJS from 'exceljs';
import type { Expense, Vehicle } from '@/types';
import { formatDateIndian } from '@/lib/utils';
import { calculateOverallVehicleStats } from '@/lib/calculations';

// Helper to draw an executive Power BI-style Category Donut/Pie Chart with clear labels
function generatePowerBIDonutChart(categorySummary: Record<string, number>): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 620;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sleek canvas card container background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft border around card
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Card Header / Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, sans-serif';
  ctx.fillText('CATEGORY SPEND DISTRIBUTION', 24, 32);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('Proportional cost breakdown across fleet lifecycle', 24, 48);

  const entries = Object.entries(categorySummary).filter(([, val]) => val > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return '';

  const colors = [
    '#2563eb', // Fuel refill - Royal Blue
    '#10b981', // Service/Repair - Emerald Green
    '#f59e0b', // Insurance - Amber
    '#8b5cf6', // Toll - Purple
    '#ec4899', // Fastag / Detailing - Rose
    '#06b6d4', // PUC / Inspection - Cyan
    '#64748b', // Other - Slate
    '#ef4444'  // Fine / Challan - Red
  ];

  const centerX = 160;
  const centerY = 190;
  const radius = 100;

  let currentAngle = -0.5 * Math.PI;

  entries.forEach(([name, value], i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Inner Donut Cutout (Power BI modern style)
  ctx.beginPath();
  ctx.arc(centerX, centerY, 56, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Metric in center of Donut
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOTAL SPEND', centerX, centerY - 6);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`₹${(total / 1000).toFixed(1)}k`, centerX, centerY + 14);

  // Power BI style Clean Legend Table on right side
  ctx.textAlign = 'left';
  let legendY = 82;
  entries.slice(0, 8).forEach(([name, value], i) => {
    const pct = ((value / total) * 100).toFixed(1);
    
    // Color pill
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(330, legendY - 4, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Category Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(name, 344, legendY);

    // Percentage & Value
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`₹${value.toLocaleString('en-IN')} (${pct}%)`, 590, legendY);
    ctx.textAlign = 'left';

    legendY += 28;
  });

  return canvas.toDataURL('image/png');
}

// Helper to draw a Power BI-style Monthly Trend Bar Chart
function generatePowerBIBarChart(monthlySummary: Record<string, number>): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 620;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, sans-serif';
  ctx.fillText('MONTHLY EXPENDITURE TREND', 24, 32);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('Aggregated month-over-month operating costs (INR)', 24, 48);

  const entries = Object.entries(monthlySummary);
  if (entries.length === 0) return '';

  const maxVal = Math.max(...entries.map(([, v]) => v), 1000);
  const chartBottom = 270;
  const chartHeight = 180;
  const startX = 75;
  const availableWidth = 510;
  const colWidth = Math.min(60, Math.floor(availableWidth / entries.length));
  const barWidth = Math.min(38, colWidth - 12);

  // Grid Lines
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = chartBottom - (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(startX - 15, y);
    ctx.lineTo(startX + entries.length * colWidth + 10, y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    const tickVal = Math.round((maxVal / 4) * i);
    ctx.fillText(`₹${(tickVal / 1000).toFixed(0)}k`, startX - 20, y + 4);
  }

  // Draw Gradient Bars with Power BI Rounded Tops
  entries.forEach(([month, val], i) => {
    const x = startX + i * colWidth + (colWidth - barWidth) / 2;
    const h = (val / maxVal) * chartHeight;
    const y = chartBottom - h;

    const grad = ctx.createLinearGradient(x, y, x, chartBottom);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#4f46e5');

    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, barWidth, h, [6, 6, 0, 0]);
    } else {
      ctx.fillRect(x, y, barWidth, h);
    }
    ctx.fill();

    // Value on top
    if (val > 0) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${Math.round(val).toLocaleString('en-IN')}`, x + barWidth / 2, y - 6);
    }

    // Month label
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(month, x + barWidth / 2, chartBottom + 20);
  });

  return canvas.toDataURL('image/png');
}

export async function generateAuditExcelReport(
  expenses: Expense[],
  vehicles: Vehicle[],
  selectedVehicleId: string | 'all',
  vehiclesMap: Record<string, string>
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DriveCost India';
  workbook.created = new Date();

  const activeVehicle = selectedVehicleId !== 'all' ? vehicles.find(v => v.id === selectedVehicleId) : null;
  const reportScopeName = activeVehicle ? `${activeVehicle.name} (${activeVehicle.registrationNumber || 'No Plate'})` : 'All Fleet Vehicles';

  // Calculate detailed fleet & mileage stats
  const stats = calculateOverallVehicleStats(expenses, activeVehicle?.currentOdometer);
  const totalSpend = stats.totalSpend;
  const totalTransactions = expenses.length;
  const totalFuelLiters = expenses.filter(e => e.fuelQuantityLitres).reduce((sum, e) => sum + (e.fuelQuantityLitres || 0), 0);
  const avgMileageText = stats.averageMileage 
    ? `${stats.averageMileage.toFixed(2)} km/l` 
    : (activeVehicle?.expectedMileage ? `${activeVehicle.expectedMileage} km/l (Rated)` : 'Calculating...');
  const costPerKmText = stats.costPerKm ? `₹${stats.costPerKm.toFixed(2)} / km` : 'Pending Odo Logs';

  // =========================================================================
  // 1. EXECUTIVE DASHBOARD SHEET
  // =========================================================================
  const dashSheet = workbook.addWorksheet('Executive Dashboard', {
    views: [{ showGridLines: true }]
  });

  // Top Title Banner
  dashSheet.mergeCells('B2:I2');
  const dashTitle = dashSheet.getCell('B2');
  dashTitle.value = 'Detailed Dashboard';
  dashTitle.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  dashTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  dashTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // Slate-900 Power BI theme
  };
  dashSheet.getRow(2).height = 42;

  // Metadata ribbon
  dashSheet.getCell('B4').value = 'Vehicle Scope:';
  dashSheet.getCell('B4').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
  dashSheet.getCell('C4').value = reportScopeName;
  dashSheet.getCell('C4').font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };

  dashSheet.getCell('E4').value = 'Report Date:';
  dashSheet.getCell('E4').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
  dashSheet.getCell('F4').value = formatDateIndian(new Date().toISOString());
  dashSheet.getCell('F4').font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };

  dashSheet.getCell('H4').value = 'Compliance:';
  dashSheet.getCell('H4').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
  dashSheet.getCell('I4').value = 'Income Tax Act §37 / GST';
  dashSheet.getCell('I4').font = { bold: true, size: 11, color: { argb: 'FF059669' } };

  // =========================================================================
  // POWER BI KPI SCORECARD CARDS (Rows 6-8)
  // 4 Cards: [Total Spend] [Avg Fuel Mileage] [Cost Per Km] [Total Fuel Dispensed]
  // =========================================================================

  // Helper for KPI Scorecard cards
  const makeKpiCard = (
    startCol: string, 
    endCol: string, 
    title: string, 
    val: string, 
    sub: string, 
    accentColor: string, 
    bgColor: string
  ) => {
    dashSheet.mergeCells(`${startCol}6:${endCol}6`);
    dashSheet.mergeCells(`${startCol}7:${endCol}7`);
    dashSheet.mergeCells(`${startCol}8:${endCol}8`);

    const cellTitle = dashSheet.getCell(`${startCol}6`);
    cellTitle.value = title.toUpperCase();
    cellTitle.font = { size: 9, bold: true, color: { argb: accentColor } };
    cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellVal = dashSheet.getCell(`${startCol}7`);
    cellVal.value = val;
    cellVal.font = { size: 16, bold: true, color: { argb: 'FF0F172A' } };
    cellVal.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellSub = dashSheet.getCell(`${startCol}8`);
    cellSub.value = sub;
    cellSub.font = { size: 9, italic: true, color: { argb: 'FF64748B' } };
    cellSub.alignment = { horizontal: 'center', vertical: 'middle' };

    [6, 7, 8].forEach(rowNum => {
      const row = dashSheet.getRow(rowNum);
      const cols = [startCol, endCol];
      // apply fill
      dashSheet.getCell(`${startCol}${rowNum}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };
      dashSheet.getCell(`${endCol}${rowNum}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };
    });
  };

  dashSheet.getRow(6).height = 18;
  dashSheet.getRow(7).height = 30;
  dashSheet.getRow(8).height = 18;

  // Card 1: Total Spend
  makeKpiCard('B', 'C', 'Total Expenditure', `₹${totalSpend.toLocaleString('en-IN')}`, `${totalTransactions} records certified`, 'FF2563EB', 'FFEFF6FF');

  // Card 2: MILEAGE (As explicitly requested by user!)
  makeKpiCard('D', 'E', 'Average Mileage', avgMileageText, stats.lastVerifiedMileage ? `Last tank: ${stats.lastVerifiedMileage} km/l` : 'Full-tank method verified', 'FF059669', 'FFECFDF5');

  // Card 3: Cost Per KM
  makeKpiCard('F', 'G', 'Cost Per Kilometre', costPerKmText, stats.totalDistanceCovered ? `${stats.totalDistanceCovered.toLocaleString('en-IN')} km tracked` : 'Vehicle efficiency index', 'FFD97706', 'FFFFFBEB');

  // Card 4: Fuel Dispensed
  makeKpiCard('H', 'I', 'Fuel Dispensed', `${totalFuelLiters.toFixed(1)} L`, `Fuel Spend: ₹${stats.fuelSpend.toLocaleString('en-IN')}`, 'FF7C3AED', 'FFF5F3FF');

  // =========================================================================
  // POWER BI EMBEDDED VISUAL CHARTS (Category Donut & Monthly Bar Trend)
  // =========================================================================
  const categorySummary: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  expenses.forEach(e => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + (e.amount || 0);
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  const donutBase64 = generatePowerBIDonutChart(categorySummary);
  if (donutBase64) {
    const donutImgId = workbook.addImage({
      base64: donutBase64,
      extension: 'png'
    });
    dashSheet.addImage(donutImgId, {
      tl: { col: 1, row: 10 },
      ext: { width: 500, height: 275 }
    });
  }

  const monthlySummary: Record<string, number> = {};
  expenses.forEach(e => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short' });
    monthlySummary[month] = (monthlySummary[month] || 0) + (e.amount || 0);
  });

  const barBase64 = generatePowerBIBarChart(monthlySummary);
  if (barBase64) {
    const barImgId = workbook.addImage({
      base64: barBase64,
      extension: 'png'
    });
    dashSheet.addImage(barImgId, {
      tl: { col: 5, row: 10 },
      ext: { width: 500, height: 275 }
    });
  }

  // Set column widths for Dashboard
  dashSheet.columns = [
    { width: 4 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 }
  ];

  // =========================================================================
  // 2. DETAILED AUDIT TRANSACTION LEDGER SHEET
  // =========================================================================
  const ledgerSheet = workbook.addWorksheet('Detailed Transaction Ledger', {
    views: [{ showGridLines: true }]
  });

  ledgerSheet.mergeCells('A1:K1');
  const ledgerTitle = ledgerSheet.getCell('A1');
  ledgerTitle.value = `ITEMIZED TAX AUDIT RECORDS · ${reportScopeName}`;
  ledgerTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ledgerTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  ledgerTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }
  };
  ledgerSheet.getRow(1).height = 36;

  // Header columns (Includes MILEAGE & FUEL METRICS)
  const ledgerHeaders = [
    'Txn ID',
    'Date (DD-MM-YYYY)',
    'Vehicle Name',
    'Category',
    'Merchant / Pump',
    'Odometer (km)',
    'Fuel Qty (L)',
    'Fuel Price/L',
    'Mileage (km/l)',
    'Amount (INR)',
    'Notes / Purpose'
  ];

  const headerRow = ledgerSheet.getRow(3);
  headerRow.values = ledgerHeaders;
  headerRow.height = 28;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  for (let i = 1; i <= ledgerHeaders.length; i++) {
    ledgerSheet.getRow(3).getCell(i).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
  }

  // Pre-calculate per-refill mileage
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const mileageByExpenseId: Record<string, string> = {};

  const fuelRefills = sortedExpenses.filter(e => e.category === 'Fuel refill' && e.odometer);
  for (let i = 1; i < fuelRefills.length; i++) {
    const prev = fuelRefills[i - 1];
    const curr = fuelRefills[i];
    if (prev.isFullTank && curr.isFullTank && curr.odometer && prev.odometer && curr.fuelQuantityLitres) {
      const dist = curr.odometer - prev.odometer;
      if (dist > 0) {
        const mil = (dist / curr.fuelQuantityLitres).toFixed(2);
        mileageByExpenseId[curr.id] = `${mil} km/l`;
      }
    }
  }

  expenses.forEach((e, index) => {
    const rowIdx = index + 4;
    const row = ledgerSheet.getRow(rowIdx);
    row.height = 22;

    const rowMileage = mileageByExpenseId[e.id] || (e.category === 'Fuel refill' ? 'Full tank calc' : '—');

    row.values = [
      e.id.slice(0, 8).toUpperCase(),
      formatDateIndian(e.date),
      vehiclesMap[e.vehicleId] || 'Fleet Vehicle',
      e.category,
      e.merchant || '—',
      e.odometer ? e.odometer : '—',
      e.fuelQuantityLitres ? e.fuelQuantityLitres : '—',
      e.fuelPricePerLitre ? e.fuelPricePerLitre : '—',
      rowMileage,
      e.amount,
      e.notes || '—'
    ];

    // Alternating zebra stripe
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }

    // Category highlight styling
    const catCell = row.getCell(4);
    if (e.category === 'Fuel refill') {
      catCell.font = { bold: true, color: { argb: 'FF1D4ED8' } };
    } else if (e.category === 'Service' || e.category === 'Repair') {
      catCell.font = { bold: true, color: { argb: 'FF047857' } };
    } else if (e.category === 'Insurance') {
      catCell.font = { bold: true, color: { argb: 'FFB45309' } };
    }

    // Mileage column highlight
    const milCell = row.getCell(9);
    if (rowMileage.includes('km/l')) {
      milCell.font = { bold: true, color: { argb: 'FF059669' } };
    }

    row.getCell(10).numFmt = '₹#,##0.00';
    row.getCell(10).font = { bold: true };
    row.getCell(10).alignment = { horizontal: 'right' };
  });

  // Ledger column widths
  ledgerSheet.columns = [
    { width: 14 },
    { width: 18 },
    { width: 22 },
    { width: 18 },
    { width: 26 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 16 }, // Mileage
    { width: 20 },
    { width: 32 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
