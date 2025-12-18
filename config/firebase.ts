import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPqzzg8wVVQNG88Gqhv7_RaZIBn02y4WM",
  authDomain: "jimatbite.firebaseapp.com",
  projectId: "jimatbite",
  storageBucket: "jimatbite.firebasestorage.app",
  messagingSenderId: "99439612556",
  appId: "1:99439612556:web:8059077a18a52dc3bea1a9",
  measurementId: "G-LGBWT14ET8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

