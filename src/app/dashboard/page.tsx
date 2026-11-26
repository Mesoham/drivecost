'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { 
  formatINR, 
  calculateOverallVehicleStats, 
  getMonthOverMonthComparison, 
  maskRegistrationNumber 
} from '@/lib/calculations';
import { formatDateIndian } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fuel, 
  Zap, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CarFront, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Gauge, 
  Sparkles,
  Calendar
} from 'lucide-react';
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

export default function DashboardPage() {
  const { 
    vehicles, 
    expenses, 
    reminders, 
    selectedVehicleId, 
    settings,
    loadDemoData, 
    exitDemoMode,
    toggleReminderComplete 
  } = useAppStore();

  const [clientDate, setClientDate] = useState<Date | null>(null);

  useEffect(() => {
    setClientDate(new Date());
  }, []);

  const filteredExpenses = selectedVehicleId === 'all' 
    ? expenses 
    : expenses.filter(e => e.vehicleId === selectedVehicleId);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const stats = calculateOverallVehicleStats(
    filteredExpenses, 
    selectedVehicle?.currentOdometer
  );

  const mom = getMonthOverMonthComparison(filteredExpenses, clientDate || undefined);

  const activeReminders = reminders.filter(r => {
    if (selectedVehicleId !== 'all' && r.vehicleId !== selectedVehicleId) return false;
    return r.status !== 'completed';
  });

  const dueSoonOrOverdueReminders = activeReminders.filter(
    r => r.status === 'due_soon' || r.status === 'overdue'
  );

  // Group expenses by category for pie chart
  const categoryMap: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + (e.amount || 0);
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#06b6d4', '#e11d48'];

  // Monthly trend for last 6 months
  const monthlyData: { month: string; amount: number }[] = [];
  if (clientDate) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(clientDate.getFullYear(), clientDate.getMonth() - i, 1);
      const monthKey = d.toLocaleString('en-IN', { month: 'short' });
      const total = filteredExpenses
        .filter(e => {
          const expDate = new Date(e.date);
          return expDate.getFullYear() === d.getFullYear() && expDate.getMonth() === d.getMonth();
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      monthlyData.push({ month: monthKey, amount: total });
    }
  }

  // Empty state handling
  if (vehicles.length === 0) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl mx-auto flex items-center justify-center">
          <CarFront className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No vehicles added yet</h2>
          <p className="text-slate-500 text-sm">
            Add your car, bike, scooter, or commercial vehicle to start recording fuel refills, services, and calculating your real cost per kilometre.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/vehicles/new">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-1.5" />
              <span>Add Your First Vehicle</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight daylight-text-main">
            {selectedVehicle ? selectedVehicle.name : 'All Vehicles Overview'}
          </h1>
          <p className="text-xs daylight-text-muted mt-1">
            {selectedVehicle 
              ? `${selectedVehicle.manufacturer} ${selectedVehicle.model} • ${maskRegistrationNumber(selectedVehicle.registrationNumber)}` 
              : `Tracking ${vehicles.length} registered vehicles on this device`}
          </p>
        </div>
      </div>

      {/* Overdue/Due Soon Alert Banner */}
      {dueSoonOrOverdueReminders.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {dueSoonOrOverdueReminders.length} upcoming or overdue reminder{dueSoonOrOverdueReminders.length > 1 ? 's' : ''}
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {dueSoonOrOverdueReminders.slice(0, 3).map((r) => (
                <span key={r.id} className="text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 font-medium text-amber-900 dark:text-amber-300">
                  {r.title} {r.dueDate ? `(${formatDateIndian(r.dueDate)})` : ''}
                </span>
              ))}
            </div>
          </div>
          <Link href="/reminders">
            <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200">
              View All
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: This Month Spend */}
        <Card>
          <div className="text-xs font-medium text-slate-500 mb-1">This Month&apos;s Spend</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(mom.thisMonthTotal)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {mom.prevMonthTotal > 0 ? (
              mom.isIncrease ? (
                <span className="text-rose-600 flex items-center font-medium">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +{mom.percentage}%
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center font-medium">
                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" /> {mom.percentage}%
                </span>
              )
            ) : (
              <span className="text-slate-400">First month tracked</span>
            )}
            <span className="text-slate-400">vs last month</span>
          </div>
        </Card>

        {/* Card 2: Fuel/Charging Spend */}
        <Card>
          <div className="text-xs font-medium text-slate-500 mb-1">Fuel & Charging</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(stats.fuelSpend)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {filteredExpenses.filter(e => e.category === 'Fuel refill').length} refills recorded
          </div>
        </Card>

        {/* Card 3: Fuel Efficiency */}
        <Card>
          <div className="text-xs font-medium text-slate-500 mb-1">Verified Mileage</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.lastVerifiedMileage ? `${stats.lastVerifiedMileage} km/l` : '—'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.averageMileage ? `Avg: ${stats.averageMileage} km/l` : 'Needs 2 full tank refills'}
          </div>
        </Card>

        {/* Card 4: Cost per km */}
        <Card>
          <div className="text-xs font-medium text-slate-500 mb-1">Cost Per Kilometre</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.costPerKm ? `₹${stats.costPerKm}/km` : '—'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.totalDistanceCovered > 0 ? `${stats.totalDistanceCovered} km distance` : 'Track odometer logs'}
          </div>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Spending Trend Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Spend Trend</CardTitle>
              <CardDescription>Expenditure over the last 6 months</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `₹${v}`} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatINR(Number(value)), 'Total Expense']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Top spending categories</CardDescription>
            </div>
          </CardHeader>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.slice(0, 5)}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatINR(Number(val)), 'Total']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded yet.
            </div>
          )}
        </Card>
      </div>

      {/* Lower Row: Recent Transactions & Active Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest entries recorded</CardDescription>
            </div>
            <Link href="/expenses">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.slice(0, 5).map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    {exp.category === 'Fuel refill' && <Fuel className="h-4 w-4 text-blue-500" />}
                    {exp.category === 'Service' && <Wrench className="h-4 w-4 text-emerald-500" />}
                    {exp.category !== 'Fuel refill' && exp.category !== 'Service' && <Sparkles className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {exp.category}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDateIndian(exp.date)} {exp.merchant ? `• ${exp.merchant}` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatINR(exp.amount)}
                  </div>
                  <span className="text-[11px] text-slate-400">{exp.paymentMethod}</span>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No transactions found for this selection.
              </div>
            )}
          </div>
        </Card>

        {/* Reminders / Document Alerts Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Document & Service Alerts</CardTitle>
              <CardDescription>PUC, Insurance, EMI and Scheduled Maintenance</CardDescription>
            </div>
            <Link href="/reminders">
              <Button variant="ghost" size="sm" className="text-xs">
                Manage <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <div className="space-y-3">
            {activeReminders.slice(0, 4).map((rem) => {
              const isOverdue = rem.status === 'overdue';
              const isDueSoon = rem.status === 'due_soon';
              const badgeVariant = isOverdue ? 'danger' : isDueSoon ? 'warning' : 'default';

              return (
                <div 
                  key={rem.id} 
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{rem.title}</span>
                      <Badge variant={badgeVariant}>
                        {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Upcoming'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      {rem.dueDate && <span>Due: {formatDateIndian(rem.dueDate)}</span>}
                      {rem.dueOdometer && <span>At: {rem.dueOdometer} km</span>}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReminderComplete(rem.id)}
                    className="h-8 text-xs shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Done
                  </Button>
                </div>
              );
            })}

            {activeReminders.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                You&apos;re all caught up! No active alerts.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
