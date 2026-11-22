import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAPbjwy0rjqfMRdGX2f4JSssr1wSEbvElU",
  authDomain: "drivecost-prod.firebaseapp.com",
  projectId: "drivecost-prod",
  storageBucket: "drivecost-prod.firebasestorage.app",
  messagingSenderId: "277539322052",
  appId: "1:277539322052:web:1780d3bff0db33e5f07191"
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
