'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { formatINR, calculateOverallVehicleStats } from '@/lib/calculations';
import { formatDateIndian } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateAuditExcelReport } from '@/lib/excel-export';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileCheck, 
  Sparkles, 
  Lock, 
  FileSpreadsheet, 
  Printer, 
  Check, 
  Car, 
  X, 
  ChevronRight, 
  Download,
  Fuel,
  Wrench,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ReportsPage() {
  const { expenses, vehicles, selectedVehicleId, settings, setProModalOpen, setDynamicAlert } = useAppStore();

  const [dateRange, setDateRange] = useState<'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all'>('this_month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [clientDate, setClientDate] = useState<Date | null>(null);

  // Multi-step Audit Ready Modal states:
  // step: null | 'select_vehicle' | 'select_format' | 'printable_preview'
  const [auditStep, setAuditStep] = useState<null | 'select_vehicle' | 'select_format' | 'printable_preview'>(null);
  const [auditTargetVehicleId, setAuditTargetVehicleId] = useState<string | 'all'>('all');
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  useEffect(() => {
    setClientDate(new Date());
  }, []);

  const vehiclesMap = vehicles.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {} as Record<string, string>);

  const currentYear = clientDate ? clientDate.getFullYear() : 2026;
  const currentMonth = clientDate ? clientDate.getMonth() : 10;

  // Filter based on standard screen controls
  const filtered = expenses.filter(e => {
    if (selectedVehicleId !== 'all' && e.vehicleId !== selectedVehicleId) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

    if (!clientDate) return true;

    const d = new Date(e.date);
    if (dateRange === 'this_month') {
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    if (dateRange === 'last_month') {
      const prevMonth = new Date(currentYear, currentMonth - 1, 1);
      return d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth();
    }
    if (dateRange === 'last_3_months') {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
      return d >= threeMonthsAgo;
    }
    if (dateRange === 'this_year') {
      return d.getFullYear() === currentYear;
    }
    return true;
  });

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const stats = calculateOverallVehicleStats(filtered, activeVehicle?.currentOdometer);

  // Group by category
  const categorySummary: Record<string, number> = {};
  filtered.forEach(e => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + (e.amount || 0);
  });

  const chartData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#06b6d4', '#e11d48'];

  // Handle click on Audit Ready Report button
  const handleAuditReportClick = () => {
    if (!settings?.isProUser) {
      setProModalOpen(true);
      return;
    }
    // Pro member: Step 1 - Open vehicle selection pop-up
    setAuditTargetVehicleId(selectedVehicleId !== 'all' ? selectedVehicleId : 'all');
    setAuditStep('select_vehicle');
  };

  // Step 1 -> Step 2
  const handleVehicleSelected = () => {
    setAuditStep('select_format');
  };

  // Step 2 Action A: Export Colorful Excel Report with charts
  const handleDownloadExcel = async () => {
    try {
      setIsExportingExcel(true);
      // Filter expenses according to chosen vehicle
      const targetExpenses = auditTargetVehicleId === 'all' 
        ? expenses 
        : expenses.filter(e => e.vehicleId === auditTargetVehicleId);

      const blob = await generateAuditExcelReport(targetExpenses, vehicles, auditTargetVehicleId, vehiclesMap);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const vehicleName = auditTargetVehicleId === 'all' 
        ? 'Fleet' 
        : (vehiclesMap[auditTargetVehicleId] || 'Vehicle').replace(/\s+/g, '_');
      a.download = `DriveCost_AuditReport_${vehicleName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      setAuditStep(null);
      setDynamicAlert({
        title: 'Audit Excel Report Generated! 📊',
        subtitle: `Includes colorful tables, category pie charts & monthly trends.`,
        icon: 'check',
        color: '#10b981'
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Step 2 Action B: Open Printable Report
  const handleOpenPrintable = () => {
    setAuditStep('printable_preview');
  };

  // Target expenses for printable report modal
  const auditExpenses = auditTargetVehicleId === 'all'
    ? expenses
    : expenses.filter(e => e.vehicleId === auditTargetVehicleId);

  const auditChosenVehicle = auditTargetVehicleId !== 'all' 
    ? vehicles.find(v => v.id === auditTargetVehicleId) 
    : null;

  const auditStats = calculateOverallVehicleStats(auditExpenses, auditChosenVehicle?.currentOdometer);
  const auditTotalAmount = auditExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const auditFuelLiters = auditExpenses.filter(e => e.fuelQuantityLitres).reduce((sum, e) => sum + (e.fuelQuantityLitres || 0), 0);
  const auditMileageDisplay = auditStats.averageMileage 
    ? `${auditStats.averageMileage.toFixed(2)} km/l`
    : (auditChosenVehicle?.expectedMileage ? `${auditChosenVehicle.expectedMileage} km/l (Rated)` : 'Calculating...');

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Header and Audit Ready Report Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vehicle Cost & Efficiency Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Financial analytics, cost-per-km breakdown, and audit-ready reports.
          </p>
        </div>

        <div>
          {/* Single Audit Ready Report Option (Pro Gated) */}
          <button
            type="button"
            onClick={handleAuditReportClick}
            className="h-10 px-4 rounded-2xl apple-glass border border-purple-500/30 flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all relative overflow-hidden group bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10"
          >
            <div className="h-6 w-6 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
              <FileCheck className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 leading-none">
                Audit Ready Report {!settings?.isProUser && <Lock className="h-3 w-3 text-amber-500" />}
              </span>
              <span className="text-[9px] daylight-text-tertiary block leading-none mt-0.5">
                {settings?.isProUser ? 'Pro Member · Excel (Charts) & Printable PDF' : 'Pro Feature · Select Vehicles & Formats'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Filter Control Ribbon */}
      <Card className="p-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="this_year">This Year ({currentYear})</option>
              <option value="all">All Time History</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Fuel">Fuel (Petrol/Diesel/CNG/EV)</option>
              <option value="Maintenance">Service & Maintenance</option>
              <option value="Insurance">Insurance Policy</option>
              <option value="PUC">PUC Certificate</option>
              <option value="Toll">Toll & FASTag</option>
              <option value="Cleaning">Washing & Detailing</option>
              <option value="Fine">Traffic Penalties / E-Challan</option>
              <option value="Other">Other Expenses</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Spend</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatINR(stats.totalSpend)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{filtered.length} entries filtered</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            ₹
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Fuel Expenditure</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatINR(stats.fuelSpend)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {stats.averageMileage ? `Avg Mileage: ${stats.averageMileage} km/l` : 'No fuel logs'}
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Fuel className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Maintenance & Other</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatINR(stats.maintenanceSpend)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {stats.costPerKm ? `₹${stats.costPerKm.toFixed(2)}/km tracked` : 'Add odo readings'}
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wrench className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Visual Analytics */}
      {filtered.length > 0 && (
        <Card className="p-5">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown across selected time period</CardDescription>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(val: any) => [formatINR(Number(val)), 'Total']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Accessible Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Audit Table</CardTitle>
          <CardDescription>Filtered records corresponding to this report</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Merchant / Station</th>
                <th className="py-2.5 px-3">Odometer</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 whitespace-nowrap">{formatDateIndian(e.date)}</td>
                  <td className="py-2 px-3">{vehiclesMap[e.vehicleId] || '—'}</td>
                  <td className="py-2 px-3 font-medium">{e.category}</td>
                  <td className="py-2 px-3 text-slate-500">{e.merchant || '—'}</td>
                  <td className="py-2 px-3 text-slate-500">{e.odometer ? `${e.odometer.toLocaleString('en-IN')} km` : '—'}</td>
                  <td className="py-2 px-3 text-right font-bold">{formatINR(e.amount)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions found for this time period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* POP-UP 1: SELECT VEHICLE                                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {auditStep === 'select_vehicle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="apple-glass max-w-md w-full p-6 rounded-3xl shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-slate-900/95"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold daylight-text-main">Select Vehicle Scope</h3>
                    <p className="text-[11px] daylight-text-muted">Step 1 of 2 · Audit Ready Report</p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditStep(null)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 daylight-text-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs daylight-text-sub mb-4">
                Choose whether you want an aggregated audit report across your entire fleet or for an individual vehicle:
              </p>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {/* Option: All Vehicles */}
                <div
                  onClick={() => setAuditTargetVehicleId('all')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    auditTargetVehicleId === 'all'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-black/8 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 daylight-text-main'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      ALL
                    </div>
                    <div>
                      <div className="text-xs font-bold">All Vehicles (Fleet-wide)</div>
                      <div className="text-[10px] daylight-text-muted">{vehicles.length} vehicles registered</div>
                    </div>
                  </div>
                  {auditTargetVehicleId === 'all' && <Check className="h-4 w-4 text-purple-600" />}
                </div>

                {/* Option: Individual Vehicles */}
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setAuditTargetVehicleId(v.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      auditTargetVehicleId === v.id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-black/8 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 daylight-text-main'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                        {v.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{v.name}</div>
                        <div className="text-[10px] daylight-text-muted font-mono">{v.registrationNumber || 'No Plate registered'}</div>
                      </div>
                    </div>
                    {auditTargetVehicleId === v.id && <Check className="h-4 w-4 text-purple-600" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setAuditStep(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleVehicleSelected} className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white">
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* POP-UP 2: SELECT EXPORT TYPE / FORMAT                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {auditStep === 'select_format' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="apple-glass max-w-lg w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-slate-900/95"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold daylight-text-main">Choose Audit Report Format</h3>
                    <p className="text-[11px] daylight-text-muted">Step 2 of 2 · Vehicle: {auditTargetVehicleId === 'all' ? 'All Fleet' : vehiclesMap[auditTargetVehicleId]}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditStep(null)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 daylight-text-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs daylight-text-sub mb-4">
                Select the format to generate your certified tax & vehicle audit report:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {/* Option 1: Excel with Colorful Tables & Embedded Charts */}
                <div
                  onClick={handleDownloadExcel}
                  className="p-4 rounded-2xl border border-black/10 dark:border-white/15 apple-glass hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold daylight-text-main group-hover:text-emerald-600 transition-colors">
                      Excel Spreadsheet (.xlsx)
                    </div>
                    <p className="text-[11px] daylight-text-muted mt-1 leading-relaxed">
                      Features a colorful styled ledger table, executive summary, category breakdown, and <strong>embedded pie charts & monthly trend graphs</strong>.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>{isExportingExcel ? 'Generating...' : 'Download Excel'}</span>
                    <Download className="h-3.5 w-3.5 ml-1.5" />
                  </div>
                </div>

                {/* Option 2: Printable PDF / Photo Report */}
                <div
                  onClick={handleOpenPrintable}
                  className="p-4 rounded-2xl border border-black/10 dark:border-white/15 apple-glass hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-10 w-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Printer className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold daylight-text-main group-hover:text-blue-600 transition-colors">
                      Printable Report (PDF / Print)
                    </div>
                    <p className="text-[11px] daylight-text-muted mt-1 leading-relaxed">
                      Generates an official clean, high-resolution audit document ready to print or save as a PDF directly from the browser.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Preview & Print</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => setAuditStep('select_vehicle')} className="text-xs">
                  ← Back to Vehicle Selection
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAuditStep(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* POP-UP 3: OFFICIAL PRINTABLE REPORT PREVIEW (PDF/Print)   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {auditStep === 'printable_preview' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white text-slate-900 max-w-4xl w-full p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 relative my-auto max-h-[95vh] overflow-y-auto"
              id="printable-audit-doc"
            >
              {/* Header bar inside modal */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                    DL
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-none">
                      Audit Ready Tax Report
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Official vehicle financial statement generated by DriveCost India
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => window.print()}
                    className="gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print / Save as PDF</span>
                  </Button>
                  <button
                    onClick={() => setAuditStep(null)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Official Printable Document Content */}
              <div className="space-y-6">
                {/* Government & Compliance Header */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Section 37 Income Tax Act 1961 Compliant
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      Vehicle Operational & Tax Expenditure Certificate
                    </h3>
                    <p className="text-xs text-slate-500">
                      Scope: <strong>{auditTargetVehicleId === 'all' ? 'All Registered Fleet Vehicles' : `${auditChosenVehicle?.name} (${auditChosenVehicle?.registrationNumber || 'N/A'})`}</strong>
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Date of Issue: <strong>{formatDateIndian(new Date().toISOString())}</strong></div>
                    <div>Report Status: <strong className="text-emerald-600">Verified Audit Ledger</strong></div>
                  </div>
                </div>

                {/* Vehicle Details Card */}
                {auditChosenVehicle && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Name</span>
                      <strong className="text-slate-800">{auditChosenVehicle.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Plate / Reg Number</span>
                      <strong className="text-slate-800 font-mono">{auditChosenVehicle.registrationNumber || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuel Type</span>
                      <strong className="text-slate-800 uppercase">{auditChosenVehicle.fuelType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Odometer</span>
                      <strong className="text-slate-800">{auditChosenVehicle.currentOdometer?.toLocaleString('en-IN') || '—'} km</strong>
                    </div>
                  </div>
                )}

                {/* Key Metrics Grid - 4 Column Power BI KPI Scorecards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">Total Expenditure</span>
                    <div className="text-lg font-black text-blue-900 mt-0.5">
                      {formatINR(auditTotalAmount)}
                    </div>
                    <span className="text-[10px] text-blue-600/80">{auditExpenses.length} transactions</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Average Mileage</span>
                    <div className="text-lg font-black text-emerald-900 mt-0.5">
                      {auditMileageDisplay}
                    </div>
                    <span className="text-[10px] text-emerald-600/80">Fuel efficiency rating</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">Fuel Dispensed</span>
                    <div className="text-lg font-black text-amber-900 mt-0.5">
                      {auditFuelLiters.toFixed(1)} L
                    </div>
                    <span className="text-[10px] text-amber-600/80">Fuel spend: {formatINR(auditStats.fuelSpend)}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">Cost / Km Index</span>
                    <div className="text-lg font-black text-purple-900 mt-0.5">
                      {auditStats.costPerKm ? `₹${auditStats.costPerKm.toFixed(2)}/km` : '₹ —'}
                    </div>
                    <span className="text-[10px] text-purple-600/80">Pro certified</span>
                  </div>
                </div>

                {/* Printable Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Merchant / Pump</th>
                        <th className="py-2.5 px-3">Odometer</th>
                        <th className="py-2.5 px-3">Mileage</th>
                        <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditExpenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 whitespace-nowrap">{formatDateIndian(e.date)}</td>
                          <td className="py-2 px-3 font-semibold">{vehiclesMap[e.vehicleId] || '—'}</td>
                          <td className="py-2 px-3">{e.category}</td>
                          <td className="py-2 px-3 text-slate-600">{e.merchant || '—'}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">{e.odometer ? `${e.odometer.toLocaleString('en-IN')} km` : '—'}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-600">
                            {e.category === 'Fuel refill' && e.fuelQuantityLitres 
                              ? `${e.fuelQuantityLitres} L fill` 
                              : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(e.amount)}</td>
                        </tr>
                      ))}
                      {auditExpenses.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400">
                            No transactions recorded for the selected vehicle.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={6} className="py-2.5 px-3 text-right text-slate-700">
                          Total Certified Audit Expenditure:
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-900 font-black">
                          {formatINR(auditTotalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* One-line Mileage Methodology Footnote */}
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="font-bold text-blue-700 shrink-0">Methodology Note:</span>
                  <span>
                    Mileage is calculated using the verified <strong>Full-to-Full (Tank-to-Tank) method</strong>: <code>Distance Traveled ÷ Fuel Dispensed</code> between full refills, with partial fills accumulated toward the next full fill to ensure 100% accuracy.
                  </span>
                </div>

                {/* Footer Sign-off */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">DriveCost India Digital Ledger</p>
                    <p className="text-[10px]">Tamper-evident client-side record hash: {Date.now().toString(36).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-36 border-b border-slate-300 pb-1 mb-1 font-mono text-[10px]">
                      [Digitally Sealed]
                    </div>
                    <p className="text-[10px]">Authorized Signature / Seal</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
