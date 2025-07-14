
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth as clientAuth, db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { sessionLogin, sessionLogout } from '@/lib/firebase/auth-actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
        const wasUser = !!user;
        let unsubscribeDoc: (() => void) | undefined;

        if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken();
            await sessionLogin(idToken); // Create server session cookie first

            unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), 
                (userDocSnap) => {
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const fullUser = { ...firebaseUser, ...userData } as User;
                        setUser(fullUser);
                    } else {
                        // User exists in Auth but not Firestore, use basic info.
                        setUser(firebaseUser);
                    }
                    
                    if (!wasUser) { // Only redirect on a *new* login event
                        router.push('/dashboard');
                    }
                    setLoading(false);
                }, 
                (error) => {
                    console.error("Error listening to user document:", error);
                    setUser(firebaseUser);
                    setLoading(false);
                }
            );

        } else {
            // User is signed out.
            await sessionLogout();
            setUser(null);
            setLoading(false);
            if(wasUser) {
                router.push('/login');
            }
        }
        
        // Cleanup the Firestore listener on unmount or when the user changes
        return () => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
            }
        };
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

  if (loading) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading, ...roles }}>
      {children}
    </AuthContext.Provider>
  );
};
