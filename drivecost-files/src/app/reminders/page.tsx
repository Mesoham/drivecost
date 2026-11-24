'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { formatDateIndian } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { ReminderType } from '@/types';

export default function RemindersPage() {
  const { reminders, vehicles, addReminder, toggleReminderComplete, deleteReminder, setDynamicAlert } = useAppStore();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDoneWithAnimation = async (id: string, title: string) => {
    setCompletingId(id);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 }
    });
    setDynamicAlert({
      title: 'Reminder Completed! 🎉',
      subtitle: `${title} marked done`,
      icon: 'check',
      color: '#34c759'
    });
    setTimeout(async () => {
      await toggleReminderComplete(id);
      setCompletingId(null);
    }, 400);
  };

  const handleDeleteWithAnimation = async (id: string) => {
    setDeletingId(id);
    setTimeout(async () => {
      await deleteReminder(id);
      setDeletingId(null);
    }, 350);
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleId, setVehicleId] = useState('');

  // Update vehicleId once vehicles are loaded
  React.useEffect(() => {
    if (!vehicleId && vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles, vehicleId]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('Insurance expiry');
  const [dueDate, setDueDate] = useState('');
  const [dueOdometer, setDueOdometer] = useState('');
  const [notes, setNotes] = useState('');

  const vehiclesMap = vehicles.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {} as Record<string, string>);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vehicleId) return;

    await addReminder({
      vehicleId,
      title: title.trim(),
      type,
      dueDate: dueDate || undefined,
      dueOdometer: dueOdometer ? Number(dueOdometer) : undefined,
      notes: notes.trim() || undefined,
      advanceDaysThreshold: 15
    });

    setTitle('');
    setDueDate('');
    setDueOdometer('');
    setNotes('');
    setShowAddForm(false);
  };

  const active = reminders.filter(r => r.status !== 'completed');
  const completed = reminders.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reminders & Document Expiries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay on top of PUC, Insurance, EMI deadlines, and maintenance intervals.
          </p>
        </div>

        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Reminder</span>
          </Button>
        )}
      </div>

      {/* Offline / Local Notification Privacy Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 dark:bg-blue-950/40 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-900 dark:text-blue-200">
            Local-first notifications active
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Reminders are evaluated directly in your browser without sending personal dates or vehicle numbers to any external cloud server. Due alerts are surfaced immediately on your dashboard.
          </p>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <Card className="border-blue-200 dark:border-blue-900 shadow-md">
          <form onSubmit={handleAdd} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Create New Reminder
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle *
                </label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="Insurance expiry">Insurance expiry</option>
                  <option value="PUC expiry">PUC expiry</option>
                  <option value="Service due by date">Service due by date</option>
                  <option value="Service due by odometer">Service due by odometer</option>
                  <option value="EMI due">EMI payment due</option>
                  <option value="Road tax due">Road tax due</option>
                  <option value="Tyre replacement estimate">Tyre replacement</option>
                  <option value="Battery replacement estimate">Battery replacement</option>
                  <option value="Custom reminder">Custom reminder</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reminder Title *
              </label>
              <input
                type="text"
                required
                data-testid="reminder-title-input"
                placeholder="e.g. Renew Zero-Dep Insurance Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Odometer (km)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10000"
                  value={dueOdometer}
                  onChange={(e) => setDueOdometer(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" data-testid="save-reminder-btn">
                Save Reminder
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts ({active.length})</CardTitle>
          <CardDescription>Upcoming dates and mileage targets</CardDescription>
        </CardHeader>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence mode="popLayout">
            {active.map((r) => {
              const isOverdue = r.status === 'overdue';
              const isDueSoon = r.status === 'due_soon';
              const isCompleting = completingId === r.id;
              const isDeleting = deletingId === r.id;

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isDeleting ? 0 : 1, 
                    x: isDeleting ? -40 : (isCompleting ? 30 : 0),
                    scale: isDeleting ? 0.9 : (isCompleting ? 1.02 : 1),
                    backgroundColor: isCompleting ? 'rgba(52, 199, 89, 0.12)' : (isDeleting ? 'rgba(255, 59, 48, 0.12)' : 'transparent')
                  }}
                  exit={{ opacity: 0, x: isDeleting ? -80 : 80, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm daylight-text-main transition-all ${isCompleting ? 'line-through text-emerald-600 dark:text-emerald-400' : ''}`}>
                        {r.title}
                      </span>
                      <span className="text-xs text-slate-400">• {vehiclesMap[r.vehicleId]}</span>
                      {isOverdue && <Badge variant="danger">Overdue</Badge>}
                      {isDueSoon && <Badge variant="warning">Due Soon</Badge>}
                      {!isOverdue && !isDueSoon && <Badge variant="default">Upcoming</Badge>}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      {r.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Due: {formatDateIndian(r.dueDate)}
                        </span>
                      )}
                      {r.dueOdometer && <span>At: {r.dueOdometer.toLocaleString('en-IN')} km</span>}
                    </div>

                    {r.notes && (
                      <p className="text-xs text-slate-400 italic mt-0.5">
                        &quot;{r.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isCompleting || isDeleting}
                      onClick={() => handleDoneWithAnimation(r.id, r.title)}
                      className="apple-done-btn h-8 px-3 rounded-xl border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 transition-transform ${isCompleting ? 'scale-125 text-emerald-500' : ''}`} />
                      <span>{isCompleting ? 'Done!' : 'Done'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isCompleting || isDeleting}
                      onClick={() => handleDeleteWithAnimation(r.id)}
                      className="apple-delete-btn h-8 w-8 rounded-xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 flex items-center justify-center cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {active.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              You&apos;re completely up to date! No pending reminders.
            </div>
          )}
        </div>
      </Card>

      {/* Completed Reminders History */}
      {completed.length > 0 && (
        <Card className="opacity-80">
          <CardHeader>
            <CardTitle className="text-base text-slate-500">
              Completed Reminders ({completed.length})
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence mode="popLayout">
              {completed.map((r) => {
                const isDeleting = deletingId === r.id;
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: isDeleting ? 0 : 1,
                      x: isDeleting ? -30 : 0
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="py-2.5 px-4 flex items-center justify-between text-xs text-slate-400"
                  >
                    <div className="line-through">{r.title}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReminderComplete(r.id)}
                        className="hover:underline text-[11px] text-blue-500 cursor-pointer"
                      >
                        Reopen
                      </button>
                      <button
                        onClick={() => handleDeleteWithAnimation(r.id)}
                        className="apple-delete-btn p-1 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </div>
  );
}
