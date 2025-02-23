import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBAr8SOSYyMKtPBQtigcVdjUEH5N4XgIC8",
  authDomain: "raccoonraider-b3296.firebaseapp.com",
  projectId: "raccoonraider-b3296",
  storageBucket: "raccoonraider-b3296.appspot.com",
  messagingSenderId: "584395625723",
  appId: "1:584395625723:web:615f35a0ead2ea1041cc5e",
  measurementId: "G-T9W818RMJY",
  databaseURL: "https://raccoonraider-b3296-default-rtdb.firebaseio.com/", // For Realtime Database
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error.code !== 'auth/already-initialized') {
    console.error('Firebase initialization error:', error);
  }
  auth = getAuth(app);
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

export { auth, firestore, database };