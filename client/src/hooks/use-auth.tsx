import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from 'firebase/app';
import { firebaseService } from '../lib/firebase-service';
import type { FirestoreUser } from '../../../shared/firestore-types';

type User = {
  uid: string;
  email: string | null;
  fullName: string;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = LoginData & {
  fullName: string;
};

type AuthContextType = {
  user: FirestoreUser | null;
  loading: boolean;
  error: Error | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Firebase error messages mapping
const getErrorMessage = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
      return 'Invalid password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() as Omit<User, 'uid'> | undefined;
          
          if (!userData) {
            // If user exists in Auth but not in Firestore, create the document
            const newUserData = {
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || 'User',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            
            await setDoc(userDocRef, newUserData);
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: newUserData.fullName,
            });
          } else {
            // Update last login time
            await setDoc(userDocRef, {
              lastLoginAt: new Date().toISOString()
            }, { merge: true });
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: userData.fullName,
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: "Authentication Error",
          description: error instanceof FirebaseError ? getErrorMessage(error) : error.message,
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [toast]);

  const login = async ({ email, password }: LoginData) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userData = await firebaseService.getCurrentUser();
      setUser(userData);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Login failed",
        description: error instanceof FirebaseError ? getErrorMessage(error) : error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async ({ email, password, fullName }: RegisterData) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        fullName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      
      const userData = await firebaseService.getCurrentUser();
      setUser(userData);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${fullName}!`,
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Registration failed",
        description: error instanceof FirebaseError ? getErrorMessage(error) : error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Logout failed",
        description: error instanceof FirebaseError ? getErrorMessage(error) : error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
