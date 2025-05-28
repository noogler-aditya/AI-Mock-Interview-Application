import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6GarQGUptkNgPtEF8A61_Iw1dQKkRohc",
    authDomain: "ai-interview-af021.firebaseapp.com",
    projectId: "ai-interview-af021",
    storageBucket: "ai-interview-af021.firebasestorage.app",
    messagingSenderId: "460153456557",
    appId: "1:460153456557:web:36150387ccecd782f78324",
    measurementId: "G-73L1CYJLL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;