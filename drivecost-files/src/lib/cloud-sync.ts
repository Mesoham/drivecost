import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Vehicle, Expense, Reminder, VehicleDocument, UserSettings } from '@/types';

type SyncCollection = 'vehicles' | 'expenses' | 'reminders' | 'documents';

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean as T;
}

export async function syncDocToCloud(
  uid: string,
  colName: SyncCollection,
  id: string,
  data: Record<string, any>
): Promise<void> {
  if (!uid) return;
  try {
    await setDoc(doc(firestore, 'users', uid, colName, id), stripUndefined(data), { merge: true });
  } catch (err) {
    console.warn(`Cloud sync write failed (${colName}/${id}):`, err);
  }
}

export async function deleteDocFromCloud(
  uid: string,
  colName: SyncCollection,
  id: string
): Promise<void> {
  if (!uid) return;
  try {
    await deleteDoc(doc(firestore, 'users', uid, colName, id));
  } catch (err) {
    console.warn(`Cloud sync delete failed (${colName}/${id}):`, err);
  }
}

export async function syncSettingsToCloud(uid: string, settings: UserSettings): Promise<void> {
  if (!uid || settings.isDemoMode) return;
  try {
    const { isDemoMode: _, ...persistable } = settings;
    await setDoc(doc(firestore, 'users', uid), { settings: stripUndefined(persistable) }, { merge: true });
  } catch (err) {
    console.warn('Cloud sync settings failed:', err);
  }
}

export async function pullUserCloudData(uid: string): Promise<{
  vehicles: Vehicle[];
  expenses: Expense[];
  reminders: Reminder[];
  documents: VehicleDocument[];
  settings: Partial<UserSettings> | null;
} | null> {
  if (!uid) return null;
  try {
    const [userSnap, vehSnap, expSnap, remSnap, docSnap] = await Promise.all([
      getDoc(doc(firestore, 'users', uid)),
      getDocs(collection(firestore, 'users', uid, 'vehicles')),
      getDocs(collection(firestore, 'users', uid, 'expenses')),
      getDocs(collection(firestore, 'users', uid, 'reminders')),
      getDocs(collection(firestore, 'users', uid, 'documents')),
    ]);

    const settings = userSnap.exists() ? (userSnap.data()?.settings as Partial<UserSettings>) || null : null;

    return {
      vehicles: vehSnap.docs.map((d) => d.data() as Vehicle),
      expenses: expSnap.docs.map((d) => d.data() as Expense),
      reminders: remSnap.docs.map((d) => d.data() as Reminder),
      documents: docSnap.docs.map((d) => d.data() as VehicleDocument),
      settings,
    };
  } catch (err) {
    console.warn('Cloud pull failed (falling back to local DB):', err);
    return null;
  }
}

export async function wipeUserCloudData(uid: string): Promise<void> {
  if (!uid) return;
  try {
    const collections: SyncCollection[] = ['vehicles', 'expenses', 'reminders', 'documents'];
    const batch = writeBatch(firestore);

    for (const colName of collections) {
      const snap = await getDocs(collection(firestore, 'users', uid, colName));
      snap.docs.forEach((d) => batch.delete(d.ref));
    }
    batch.delete(doc(firestore, 'users', uid));
    await batch.commit();
  } catch (err) {
    console.warn('Cloud wipe failed:', err);
  }
}
