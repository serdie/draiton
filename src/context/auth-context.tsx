

'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { auth as clientAuth, db, analytics } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setSessionCookie, clearSessionCookie } from '@/lib/firebase/auth-actions';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export type UserRole = 'free' | 'pro' | 'admin' | 'empresa' | 'employee';

export interface User extends FirebaseUser {
    plan?: 'free' | 'pro' | 'empresa';
    role?: UserRole;
    company?: CompanySettings;
    providerData?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  isFree: boolean;
  isEmpresa: boolean;
  isEmployee: boolean;
  effectiveRole: UserRole | undefined;
  setSimulatedRole: (role: UserRole | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPro: false,
  isAdmin: false,
  isFree: true,
  isEmpresa: false,
  isEmployee: false,
  effectiveRole: 'free',
  setSimulatedRole: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Analytics
    if (analytics) {
      console.log('Firebase Analytics initialized');
    }
  }, []);

  useEffect(() => {
    if (!clientAuth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(clientAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await setSessionCookie(idToken);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const freshProviderData = firebaseUser.providerData.map(p => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          photoURL: p.photoURL,
        }));

        try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    role: 'free',
                    createdAt: serverTimestamp(),
                    providerData: freshProviderData,
                });
            } else {
                await updateDoc(userDocRef, { providerData: freshProviderData });
            }
        } catch (error) {
             console.error("Error syncing user profile:", error);
             // Continue loading user even if sync fails, but log the error
        }


        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const fullUser: User = { ...firebaseUser, ...docSnap.data() };
            setUser(fullUser);
          } else {
            setUser(firebaseUser);
          }
          setLoading(false);
        }, (error) => {
           console.error("Error fetching user data from Firestore:", error);
           setUser(firebaseUser);
           setLoading(false);
        });
        
        return () => unsubscribeDoc();
      } else {
        await clearSessionCookie();
        setUser(null);
        setSimulatedRole(null);
        setLoading(false);
      }
    }, (error) => {
        console.error("Error with onIdTokenChanged:", error);
        setUser(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    if (!user && isProtected) {
        router.push('/login');
    }

    if (user && isAuthPage) {
      router.push('/dashboard');
    }
    
  }, [user, loading, pathname, router]);

  const effectiveRole = simulatedRole ?? user?.role;

  const roles = useMemo(() => {
    const isAdmin = effectiveRole === 'admin';
    const isEmpresa = effectiveRole === 'empresa';
    const isPro = effectiveRole === 'pro' || isAdmin || isEmpresa;
    const isEmployee = effectiveRole === 'employee';
    const isFree = !isPro && !isAdmin && !isEmpresa && !isEmployee;
    return { isPro, isAdmin, isFree, isEmpresa, isEmployee };
  }, [effectiveRole]);

  if (loading) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading, ...roles, effectiveRole, setSimulatedRole }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
};
