import { create } from 'zustand';
import type { Vehicle, Expense, Reminder, UserSettings, VehicleDocument } from '@/types';
import { getDb, getSettings, updateSettings, switchActiveUserDb, getActiveUserKey, DEFAULT_SETTINGS } from '@/lib/db';
import { loadDemoDataIntoDB } from '@/lib/demo-data';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  syncDocToCloud,
  deleteDocFromCloud,
  syncSettingsToCloud,
  pullUserCloudData,
  wipeUserCloudData
} from '@/lib/cloud-sync';

interface DynamicAlertPayload {
  title: string;
  subtitle: string;
  icon?: 'car' | 'pro' | 'check';
  color?: string;
}

interface AppState {
  vehicles: Vehicle[];
  expenses: Expense[];
  reminders: Reminder[];
  documents: VehicleDocument[];
  selectedVehicleId: string | 'all';
  settings: UserSettings | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Monetization & Visual Modals
  isProModalOpen: boolean;
  setProModalOpen: (open: boolean) => void;
  dynamicAlert: DynamicAlertPayload | null;
  setDynamicAlert: (alert: DynamicAlertPayload | null) => void;

  // Actions
  initialize: () => Promise<void>;
  switchUserAccount: (userId: string, userAuth: NonNullable<UserSettings['userAuth']>) => Promise<{ vehicles: Vehicle[] }>;
  logoutUser: () => Promise<void>;
  setSelectedVehicleId: (id: string | 'all') => void;
  loadDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Vehicle Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  archiveVehicle: (id: string, archive: boolean) => Promise<void>;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Reminder Actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  toggleReminderComplete: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (doc: Omit<VehicleDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  importFromDigiLocker: (vehicleId: string) => Promise<void>;

  // Settings Actions
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  vehicles: [],
  expenses: [],
  reminders: [],
  documents: [],
  selectedVehicleId: 'all',
  settings: null,
  isLoading: true,
  isInitialized: false,
  isProModalOpen: false,
  dynamicAlert: null,

  setProModalOpen: (open) => set({ isProModalOpen: open }),
  setDynamicAlert: (alert) => {
    set({ dynamicAlert: alert });
    if (alert) {
      setTimeout(() => {
        set({ dynamicAlert: null });
      }, 4000);
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      const activeKey = getActiveUserKey();
      if (activeKey === 'guest') {
        set({
          vehicles: [],
          expenses: [],
          reminders: [],
          documents: [],
          selectedVehicleId: 'all',
          settings: DEFAULT_SETTINGS,
          isLoading: false,
          isInitialized: true
        });
        return;
      }

      const db = getDb();
      const [vehicles, expenses, reminders, documents, settings] = await Promise.all([
        db.vehicles.toArray(),
        db.expenses.toArray(),
        db.reminders.toArray(),
        db.documents.toArray(),
        getSettings()
      ]);

      const activeVehicles = vehicles.filter(v => !v.archived);

      set({
        vehicles: activeVehicles,
        expenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        reminders: reminders.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }),
        documents: documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        settings: {
          ...settings,
          activeVehicleColor: '#0071e3'
        },
        isLoading: false,
        isInitialized: true
      });
    } catch (err) {
      console.error('Failed to initialize local database:', err);
      set({ isLoading: false, isInitialized: true });
    }
  },

  switchUserAccount: async (userId, userAuth) => {
    set({ isLoading: true });
    const db = switchActiveUserDb(userId);
    const uid = userAuth.uid || auth.currentUser?.uid || '';

    let [vehicles, expenses, reminders, documents] = await Promise.all([
      db.vehicles.toArray(),
      db.expenses.toArray(),
      db.reminders.toArray(),
      db.documents.toArray()
    ]);

    let cloudSettings: Partial<UserSettings> | null = null;
    if (uid) {
      const cloud = await pullUserCloudData(uid);
      if (cloud) {
        cloudSettings = cloud.settings;

        if (cloud.vehicles.length > 0) await db.vehicles.bulkPut(cloud.vehicles);
        if (cloud.expenses.length > 0) await db.expenses.bulkPut(cloud.expenses);
        if (cloud.reminders.length > 0) await db.reminders.bulkPut(cloud.reminders);
        if (cloud.documents.length > 0) await db.documents.bulkPut(cloud.documents);

        // Push any local-only records that didn't exist in cloud yet
        const cloudVehIds = new Set(cloud.vehicles.map(v => v.id));
        for (const v of vehicles) {
          if (!cloudVehIds.has(v.id)) syncDocToCloud(uid, 'vehicles', v.id, v);
        }
        const cloudExpIds = new Set(cloud.expenses.map(e => e.id));
        for (const e of expenses) {
          if (!cloudExpIds.has(e.id)) syncDocToCloud(uid, 'expenses', e.id, e);
        }
        const cloudRemIds = new Set(cloud.reminders.map(r => r.id));
        for (const r of reminders) {
          if (!cloudRemIds.has(r.id)) syncDocToCloud(uid, 'reminders', r.id, r);
        }
        const cloudDocIds = new Set(cloud.documents.map(d => d.id));
        for (const d of documents) {
          if (!cloudDocIds.has(d.id)) syncDocToCloud(uid, 'documents', d.id, d);
        }

        [vehicles, expenses, reminders, documents] = await Promise.all([
          db.vehicles.toArray(),
          db.expenses.toArray(),
          db.reminders.toArray(),
          db.documents.toArray()
        ]);
      }
    }

    const settings = await updateSettings({
      ...(cloudSettings || {}),
      userAuth,
      isDemoMode: false
    });
    if (uid) {
      syncSettingsToCloud(uid, settings);
    }

    const activeVehicles = vehicles.filter(v => !v.archived);

    set({
      vehicles: activeVehicles,
      expenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      reminders: reminders.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
      documents: documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      selectedVehicleId: 'all',
      settings: {
        ...settings,
        activeVehicleColor: '#0071e3'
      },
      isLoading: false,
      isInitialized: true
    });

    return { vehicles: activeVehicles };
  },

  logoutUser: async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    switchActiveUserDb(null);
    set({
      vehicles: [],
      expenses: [],
      reminders: [],
      documents: [],
      selectedVehicleId: 'all',
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      isInitialized: true
    });
  },

  setSelectedVehicleId: (id) => {
    set({ selectedVehicleId: id });
    if (id === 'all') {
      get().updateUserSettings({ activeVehicleColor: '#0071e3' });
      return;
    }
    const veh = get().vehicles.find(v => v.id === id);
    if (veh?.color) {
      get().updateUserSettings({ activeVehicleColor: veh.color });
      get().setDynamicAlert({
        title: `${veh.name} Connected`,
        subtitle: `Ambient atmosphere adapted to vehicle color`,
        icon: 'car',
        color: veh.color
      });
    } else {
      get().updateUserSettings({ activeVehicleColor: '#0071e3' });
    }
  },

  loadDemoData: async () => {
    set({ isLoading: true });
    const db = getDb();
    await loadDemoDataIntoDB(db);
    const updatedSettings = await updateSettings({
      hasCompletedOnboarding: true,
      isDemoMode: true,
      isProUser: false
    });
    await get().initialize();
    set({ settings: updatedSettings });
  },

  clearAllData: async () => {
    set({ isLoading: true });
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid) {
      await wipeUserCloudData(uid);
    }
    const db = getDb();
    await db.vehicles.clear();
    await db.expenses.clear();
    await db.reminders.clear();
    await db.odometerLogs.clear();
    await db.documents.clear();
    const settings = await updateSettings({
      hasCompletedOnboarding: false,
      isProUser: false,
      hasSubscribedBefore: false,
      isDemoMode: false
    });
    set({
      vehicles: [],
      expenses: [],
      reminders: [],
      documents: [],
      selectedVehicleId: 'all',
      settings,
      isLoading: false
    });
  },

  addVehicle: async (vehicleData) => {
    const id = `veh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      ...vehicleData,
      id,
      archived: false,
      createdAt: now,
      updatedAt: now
    };
    const db = getDb();
    await db.vehicles.add(vehicle);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      syncDocToCloud(uid, 'vehicles', vehicle.id, vehicle);
    }

    if (vehicle.color) {
      await get().updateUserSettings({ activeVehicleColor: vehicle.color });
      get().setDynamicAlert({
        title: `Surprise! Atmosphere Matched 🎨`,
        subtitle: `Theme tuned to ${vehicle.name}'s custom color`,
        icon: 'car',
        color: vehicle.color
      });
    }

    set(state => ({
      vehicles: [...state.vehicles, vehicle],
      selectedVehicleId: vehicle.id
    }));
    return id;
  },

  updateVehicle: async (id, updates) => {
    const now = new Date().toISOString();
    const db = getDb();
    await db.vehicles.update(id, { ...updates, updatedAt: now });
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      const updated = await db.vehicles.get(id);
      if (updated) syncDocToCloud(uid, 'vehicles', id, updated);
    }
    if (updates.color) {
      await get().updateUserSettings({ activeVehicleColor: updates.color });
    }
    set(state => ({
      vehicles: state.vehicles.map(v => (v.id === id ? { ...v, ...updates, updatedAt: now } : v))
    }));
  },

  deleteVehicle: async (id) => {
    const db = getDb();
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      deleteDocFromCloud(uid, 'vehicles', id);
      const exps = await db.expenses.where('vehicleId').equals(id).toArray();
      const rems = await db.reminders.where('vehicleId').equals(id).toArray();
      exps.forEach(e => deleteDocFromCloud(uid, 'expenses', e.id));
      rems.forEach(r => deleteDocFromCloud(uid, 'reminders', r.id));
    }
    await db.vehicles.delete(id);
    await db.expenses.where('vehicleId').equals(id).delete();
    await db.reminders.where('vehicleId').equals(id).delete();
    await db.odometerLogs.where('vehicleId').equals(id).delete();
    set(state => ({
      vehicles: state.vehicles.filter(v => v.id !== id),
      expenses: state.expenses.filter(e => e.vehicleId !== id),
      reminders: state.reminders.filter(r => r.vehicleId !== id),
      selectedVehicleId: state.selectedVehicleId === id ? 'all' : state.selectedVehicleId
    }));
  },

  archiveVehicle: async (id, archive) => {
    const db = getDb();
    await db.vehicles.update(id, { archived: archive, updatedAt: new Date().toISOString() });
    set(state => ({
      vehicles: archive ? state.vehicles.filter(v => v.id !== id) : state.vehicles,
      selectedVehicleId: state.selectedVehicleId === id ? 'all' : state.selectedVehicleId
    }));
  },

  addExpense: async (expenseData) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const expense: Expense = {
      ...expenseData,
      id,
      createdAt: now,
      updatedAt: now
    };
    const db = getDb();
    await db.expenses.add(expense);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      syncDocToCloud(uid, 'expenses', expense.id, expense);
    }

    if (typeof expense.odometer === 'number' && expense.odometer > 0) {
      const vehicle = get().vehicles.find(v => v.id === expense.vehicleId);
      if (vehicle && (!vehicle.currentOdometer || expense.odometer > vehicle.currentOdometer)) {
        await get().updateVehicle(vehicle.id, { currentOdometer: expense.odometer });
      }
    }

    set(state => ({
      expenses: [expense, ...state.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
    return id;
  },

  updateExpense: async (id, updates) => {
    const now = new Date().toISOString();
    const db = getDb();
    await db.expenses.update(id, { ...updates, updatedAt: now });
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      const updated = await db.expenses.get(id);
      if (updated) syncDocToCloud(uid, 'expenses', id, updated);
    }
    set(state => ({
      expenses: state.expenses.map(e => (e.id === id ? { ...e, ...updates, updatedAt: now } : e))
    }));
  },

  deleteExpense: async (id) => {
    const db = getDb();
    await db.expenses.delete(id);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      deleteDocFromCloud(uid, 'expenses', id);
    }
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
  },

  addReminder: async (reminderData) => {
    const id = `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const reminder: Reminder = {
      ...reminderData,
      id,
      status: 'upcoming',
      createdAt: now,
      updatedAt: now
    };
    const db = getDb();
    await db.reminders.add(reminder);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      syncDocToCloud(uid, 'reminders', reminder.id, reminder);
    }
    set(state => ({
      reminders: [...state.reminders, reminder]
    }));
    return id;
  },

  updateReminder: async (id, updates) => {
    const now = new Date().toISOString();
    const db = getDb();
    await db.reminders.update(id, { ...updates, updatedAt: now });
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      const updated = await db.reminders.get(id);
      if (updated) syncDocToCloud(uid, 'reminders', id, updated);
    }
    set(state => ({
      reminders: state.reminders.map(r => (r.id === id ? { ...r, ...updates, updatedAt: now } : r))
    }));
  },

  toggleReminderComplete: async (id) => {
    const target = get().reminders.find(r => r.id === id);
    if (!target) return;
    const isCompleted = target.status === 'completed';
    const nextStatus = isCompleted ? 'upcoming' : 'completed';
    const completedAt = isCompleted ? undefined : new Date().toISOString();
    await get().updateReminder(id, { status: nextStatus, completedAt });
  },

  deleteReminder: async (id) => {
    const db = getDb();
    await db.reminders.delete(id);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      deleteDocFromCloud(uid, 'reminders', id);
    }
    set(state => ({
      reminders: state.reminders.filter(r => r.id !== id)
    }));
  },

  addDocument: async (docData) => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const document: VehicleDocument = {
      ...docData,
      id,
      createdAt: now,
      updatedAt: now
    };
    const db = getDb();
    await db.documents.add(document);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      syncDocToCloud(uid, 'documents', document.id, document);
    }
    set(state => ({
      documents: [document, ...state.documents]
    }));
    return id;
  },

  deleteDocument: async (id) => {
    const db = getDb();
    await db.documents.delete(id);
    const uid = get().settings?.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !get().settings?.isDemoMode) {
      deleteDocFromCloud(uid, 'documents', id);
    }
    set(state => ({
      documents: state.documents.filter(d => d.id !== id)
    }));
  },

  importFromDigiLocker: async (vehicleId) => {
    const veh = get().vehicles.find(v => v.id === vehicleId);
    if (!veh) return;

    const now = new Date().toISOString();
    const demoDocs: Omit<VehicleDocument, 'id'>[] = [
      {
        vehicleId,
        title: `${veh.name} - Official RC`,
        type: 'Registration Certificate (RC)',
        fileName: `${veh.registrationNumber || 'VEHICLE'}_RC_DigiLocker.pdf`,
        fileType: 'pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hJTU7NyweKGBkaGpsYmptYGAIAJdMJnQplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKMzIKZW5kb2JqCg==',
        fileSize: 425600,
        documentNumber: veh.registrationNumber || 'DL01AB1234',
        isDigiLockerVerified: true,
        notes: 'Digitally verified & pulled from Ministry of Road Transport and Highways (MoRTH) via DigiLocker API.',
        createdAt: now,
        updatedAt: now
      },
      {
        vehicleId,
        title: `${veh.name} - Comprehensive Insurance`,
        type: 'Insurance Policy',
        fileName: `${veh.name.replace(/\s+/g, '_')}_Insurance_DigiLocker.pdf`,
        fileType: 'pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hJTU7NyweKGBkaGpsYmptYGAIAJdMJnQplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKMzIKZW5kb2JqCg==',
        fileSize: 312400,
        documentNumber: 'POL-984321-IN',
        expiryDate: veh.insuranceExpiryDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        isDigiLockerVerified: true,
        notes: 'Digitally verified with General Insurance Council via DigiLocker.',
        createdAt: now,
        updatedAt: now
      },
      {
        vehicleId,
        title: `${veh.name} - PUC Certificate`,
        type: 'PUC Certificate',
        fileName: `${veh.name.replace(/\s+/g, '_')}_PUC_DigiLocker.pdf`,
        fileType: 'pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hJTU7NyweKGBkaGpsYmptYGAIAJdMJnQplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKMzIKZW5kb2JqCg==',
        fileSize: 185000,
        documentNumber: 'PUC-2026-90412',
        expiryDate: veh.pucExpiryDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        isDigiLockerVerified: true,
        notes: 'Valid emission test compliance certificate issued by MoRTH authorised station.',
        createdAt: now,
        updatedAt: now
      }
    ];

    const db = getDb();
    for (const d of demoDocs) {
      const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await db.documents.add({ ...d, id });
    }

    const allDocs = await db.documents.toArray();
    set({
      documents: allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

    get().setDynamicAlert({
      title: 'DigiLocker Synced! 🇮🇳',
      subtitle: `Successfully imported 3 verified documents for ${veh.name}`,
      icon: 'check',
      color: '#34c759'
    });
  },

  updateUserSettings: async (updates) => {
    const nextSettings = await updateSettings(updates);
    set({ settings: nextSettings });
    const uid = nextSettings.userAuth?.uid || auth.currentUser?.uid;
    if (uid && !nextSettings.isDemoMode) {
      syncSettingsToCloud(uid, nextSettings);
    }
  }
}));
