import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export interface SavedChartDoc {
  id?: string;
  userId: string;
  name: string;
  birthDate: string;
  birthTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  houseSystem: string;
  notes?: string;
  createdAt?: Timestamp | Date | string;
}

// Auth helpers
export const ensureAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const anonCred = await signInAnonymously(auth);
          unsubscribe();
          resolve(anonCred.user);
        } catch {
          unsubscribe();
          resolve(null);
        }
      }
    });
  });
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error in Google Login:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Firestore CRUD operations
export const saveNatalChartToCloud = async (chart: Omit<SavedChartDoc, 'id' | 'userId' | 'createdAt'>) => {
  const user = auth.currentUser || (await ensureAuth());
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }
  const docRef = await addDoc(collection(db, 'savedCharts'), {
    ...chart,
    userId: user.uid,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUserSavedCharts = async (): Promise<SavedChartDoc[]> => {
  const user = auth.currentUser || (await ensureAuth());
  if (!user) {
    return [];
  }
  const q = query(
    collection(db, 'savedCharts'),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  const results: SavedChartDoc[] = [];
  snapshot.forEach((docSnap) => {
    results.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<SavedChartDoc, 'id'>)
    });
  });
  return results;
};

export const deleteSavedChartFromCloud = async (chartId: string) => {
  if (chartId.startsWith('local_')) {
    deleteLocalChart(chartId);
    return;
  }
  await deleteDoc(doc(db, 'savedCharts', chartId));
};

// LocalStorage fallback key
const LOCAL_CHARTS_KEY = 'astrologia_saved_charts_local';

export const getLocalSavedCharts = (): SavedChartDoc[] => {
  try {
    const raw = localStorage.getItem(LOCAL_CHARTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalChart = (chart: Omit<SavedChartDoc, 'id' | 'userId' | 'createdAt'>): SavedChartDoc => {
  const existing = getLocalSavedCharts();
  const newDoc: SavedChartDoc = {
    ...chart,
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: 'local_user',
    createdAt: new Date().toISOString()
  };
  const updated = [newDoc, ...existing];
  try {
    localStorage.setItem(LOCAL_CHARTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
  return newDoc;
};

export const deleteLocalChart = (id: string) => {
  const existing = getLocalSavedCharts();
  const filtered = existing.filter((c) => c.id !== id);
  try {
    localStorage.setItem(LOCAL_CHARTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting from localStorage:', err);
  }
};
