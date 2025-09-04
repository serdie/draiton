
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth as clientAuth, db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setSessionCookie, clearSessionCookie } from '@/lib/firebase/auth-actions';

export interface User extends FirebaseUser {
    plan?: 'free' | 'pro' | 'empresa';
    role?: 'free' | 'pro' | 'admin' | 'empresa';
    company?: CompanySettings;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  isFree: boolean;
  isEmpresa: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPro: false,
  isAdmin: false,
  isFree: true,
  isEmpresa: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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


  const roles = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    const isEmpresa = user?.role === 'empresa';
    const isPro = user?.role === 'pro' || isAdmin || isEmpresa;
    const isFree = !isPro && !isAdmin && !isEmpresa;
    return { isPro, isAdmin, isFree, isEmpresa };
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
