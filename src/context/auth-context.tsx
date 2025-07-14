
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth as clientAuth, db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { sessionLogin, sessionLogout } from '@/lib/firebase/auth-actions';
import { useRouter } from 'next/navigation';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!clientAuth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onIdTokenChanged(clientAuth, async (firebaseUser) => {
      const wasUser = !!user; // check if user was previously logged in
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await sessionLogin(idToken);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const fullUser = { ...firebaseUser, ...userData } as User;
                setUser(fullUser);
            } else {
                // Handle case where user exists in Auth but not in Firestore
                setUser(firebaseUser);
            }
            setLoading(false);

            // Redirect only if it's a new login, not on every token refresh
            if (!wasUser) {
                router.push('/dashboard');
            }
        }, (error) => {
            console.error("Error listening to user document:", error);
            setUser(firebaseUser); // Still set the user from auth
            setLoading(false);
            if (!wasUser) {
                router.push('/dashboard');
            }
        });
        
        return () => unsubscribeDoc();
      } else {
        await sessionLogout();
        setUser(null);
        setLoading(false);
        // Redirect only if user was logged in and now is not
        if (wasUser) {
            router.push('/login');
        }
      }
    });

    return () => unsubscribeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
