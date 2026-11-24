'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { formatINR } from '@/lib/calculations';
import { formatDateIndian } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fuel, 
  Wrench, 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Edit3,
  Plus, 
  Tag
} from 'lucide-react';

export default function ExpensesListPage() {
  const { expenses, vehicles, selectedVehicleId, deleteExpense } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const vehiclesMap = vehicles.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {} as Record<string, string>);

  // Filter expenses
  let filtered = expenses.filter(e => {
    if (selectedVehicleId !== 'all' && e.vehicleId !== selectedVehicleId) {
      return false;
    }
    if (categoryFilter !== 'all' && e.category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchMerchant = (e.merchant || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q);
      const matchVeh = (vehiclesMap[e.vehicleId] || '').toLowerCase().includes(q);
      if (!matchMerchant && !matchNotes && !matchCat && !matchVeh) {
        return false;
      }
    }
    return true;
  });

  // Sort expenses
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'lowest') return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  const totalFilteredAmount = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expenses History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {filtered.length} entries • Total: <strong className="text-slate-900 dark:text-white">{formatINR(totalFilteredAmount)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/expenses/new">
            <Button size="sm" className="gap-1.5 shadow-md shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Fuel refill">Fuel refill</option>
              <option value="Service">Service</option>
              <option value="Repair">Repair</option>
              <option value="Insurance">Insurance</option>
              <option value="PUC">PUC</option>
              <option value="EMI">EMI</option>
              <option value="Toll">Toll</option>
              <option value="Parking">Parking</option>
              <option value="Washing/detailing">Washing/detailing</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <Card>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((exp) => (
            <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {exp.category === 'Fuel refill' && <Fuel className="h-5 w-5 text-blue-500" />}
                  {exp.category === 'Service' && <Wrench className="h-5 w-5 text-emerald-500" />}
                  {exp.category !== 'Fuel refill' && exp.category !== 'Service' && <FileText className="h-5 w-5 text-amber-500" />}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>{exp.category}</span>
                    <span className="text-xs font-normal text-slate-400">
                      • {vehiclesMap[exp.vehicleId] || 'Vehicle'}
                    </span>
                    {exp.isFullTank && <Badge variant="info">Full Tank</Badge>}
                    {exp.isPartialFill && <Badge variant="outline">Partial</Badge>}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                    <span>{formatDateIndian(exp.date)}</span>
                    {exp.merchant && <span>• {exp.merchant}</span>}
                    {exp.odometer && <span>• {exp.odometer.toLocaleString('en-IN')} km</span>}
                    {exp.fuelQuantityLitres && <span>• {exp.fuelQuantityLitres} L</span>}
                  </div>

                  {exp.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic truncate max-w-sm">
                      &quot;{exp.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatINR(exp.amount)}
                  </div>
                  <div className="text-[11px] text-slate-400">{exp.paymentMethod}</div>
                </div>

                <Link href={`/expenses/${exp.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    title="Edit expense"
                    aria-label="Edit expense"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Delete this expense?')) {
                      deleteExpense(exp.id);
                    }
                  }}
                  className="apple-delete-btn h-8 w-8 text-slate-400 hover:text-rose-600"
                  title="Delete expense"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <p>No matching expenses found.</p>
              <Link href="/expenses/new">
                <Button size="sm" variant="outline" className="text-xs">
                  Record an Expense
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
