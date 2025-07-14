
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth as clientAuth, db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

  useEffect(() => {
    if (!clientAuth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, see if we have their details in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Combine Firebase user with Firestore data
            const fullUser: User = { ...firebaseUser, ...docSnap.data() };
            setUser(fullUser);
          } else {
            // User exists in Auth, but not in Firestore (e.g., during registration)
            setUser(firebaseUser);
          }
          setLoading(false);
        }, (error) => {
           console.error("Error fetching user data from Firestore:", error);
           // Fallback to just the Firebase user
           setUser(firebaseUser);
           setLoading(false);
        });

        // Return cleanup function for the document listener
        return () => unsubscribeDoc();
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    // If there's no user and we're on a protected page, redirect to login
    if (!user && !isAuthPage && !pathname.startsWith('/_next/') && pathname !== '/' && !pathname.startsWith('/#')) {
        const publicPaths = ['/politica-de-privacidad', '/politica-de-cookies', '/aviso-legal', '/condiciones-de-uso'];
        if (!publicPaths.includes(pathname)) {
             router.push('/login');
        }
    }

    // If there is a user and we're on an auth page, redirect to dashboard
    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);


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
