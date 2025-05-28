import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebase-config';
import type { FirestoreUser } from '../../../shared/firestore-types';

class FirebaseService {
  async signUp(email: string, password: string, fullName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await this.createUserProfile(user.uid, { email, fullName });
    return user;
  }

  async signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }

  async signOut() {
    await signOut(auth);
  }

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async createUserProfile(uid: string, data: Partial<FirestoreUser>) {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getCurrentUser(): Promise<FirestoreUser | null> {
    if (!auth.currentUser) return null;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as FirestoreUser) : null;
  }

  async updateUserProfile(data: Partial<FirestoreUser>) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async getUserInterviews() {
    if (!auth.currentUser) return [];
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const firebaseService = new FirebaseService();