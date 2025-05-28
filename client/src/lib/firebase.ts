import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

declare const __FIREBASE_CONFIG__: FirebaseOptions;

let app;
let auth;
let db;

try {
  app = initializeApp(__FIREBASE_CONFIG__);
  auth = getAuth(app);
  db = getFirestore(app);

  // Enable offline persistence for Firestore in production
  if (import.meta.env.PROD) {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      }
    });
  }

  // Use emulators in development
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

export { app, auth, db }; 