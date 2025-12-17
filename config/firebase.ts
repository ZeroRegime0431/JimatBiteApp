import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Initialize Firebase Auth
// Firebase automatically handles session persistence in web environments
const auth = getAuth(app);

export { app, auth };

