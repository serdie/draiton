
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth as clientAuth, db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';

export interface User extends FirebaseUser {
    plan?: 'free' | 'pro';
    role?: 'free' | 'pro' | 'admin';
    company?: CompanySettings;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  isFree: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPro: false,
  isAdmin: false,
  isFree: true,
});

async function handleTokenChange(idToken: string | null) {
  const endpoint = '/api/auth';
  const method = idToken ? 'POST' : 'GET';
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: idToken ? JSON.stringify({ idToken }) : undefined,
  });

  if (!response.ok) {
    console.error(`Failed to ${method} session: ${response.statusText}`);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientAuth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onIdTokenChanged(clientAuth, async (firebaseUser) => {
      // First, handle the server-side session cookie.
      const idToken = await firebaseUser?.getIdToken() ?? null;
      await handleTokenChange(idToken);
      
      if (firebaseUser) {
        // Now, fetch the user's custom data from Firestore.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Combine FirebaseUser with Firestore data
                const fullUser = { ...firebaseUser, ...userData } as User;
                setUser(fullUser);
            } else {
                // This case might happen briefly during registration
                setUser(firebaseUser);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            // Still set the basic firebaseUser if Firestore fails
            setUser(firebaseUser);
            setLoading(false);
        });
        
        // Return the cleanup function for the document listener
        return () => unsubscribeDoc();
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Return the cleanup function for the auth state listener
    return () => unsubscribeAuth();
  }, []);

  const roles = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    const isPro = user?.role === 'pro' || isAdmin;
    const isFree = !isPro && !isAdmin;
    return { isPro, isAdmin, isFree };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, ...roles }}>
      {children}
    </AuthContext.Provider>
  );
};
