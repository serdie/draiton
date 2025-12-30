
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth as clientAuth, db, analytics } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export type UserRole = 'free' | 'pro' | 'admin' | 'empresa' | 'employee';

export interface User extends FirebaseUser {
    plan?: 'free' | 'pro' | 'empresa';
    role?: UserRole;
    company?: CompanySettings;
    companyOwnerId?: string;
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
  logout: () => Promise<void>;
}

import { signOut } from 'firebase/auth';

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
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    try {
      // Cerrar sesión en Firebase
      await signOut(clientAuth);
      // Limpiar estado local
      setUser(null);
      setSimulatedRole(null);
      // Forzar redirección a la página principal
      router.push('/');
      // Recargar la página para asegurar limpieza completa de estado
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
      // Asegurar limpieza incluso si hay error
      setUser(null);
      setSimulatedRole(null);
      router.push('/');
    }
  };

  useEffect(() => {
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

    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      // Si no hay usuario (es decir, se ha cerrado sesión), limpiar inmediatamente
      if (!firebaseUser) {
        setUser(null);
        setSimulatedRole(null);
        setLoading(false);
        return;
      }

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
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/portal-empleado');

    // Si el usuario no está autenticado y está en una ruta protegida, redirigir a login
    if (!user && isProtected && !pathname.startsWith('/portal-empleado')) {
        // Para rutas específicas de dashboard/admin, redirigir a la raíz
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            router.push('/');
        } else {
            // Para otras rutas protegidas, redirigir a login
            router.push('/login');
        }
    }
    // Si el usuario está autenticado y está en una página de autenticación, redirigir al dashboard
    else if (user && isAuthPage) {
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

  // Si está cargando y no hay usuario en rutas protegidas, mostrar loader
  if (loading && !user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  // Si no hay usuario y estamos en rutas protegidas, no renderizar children
  if (!loading && !user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
      // Mostrar loader mientras se redirige (la redirección se maneja en el efecto)
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  // Si el usuario está autenticado pero no tiene datos completos aún, mostrar loader
  if (!loading && user && !user.role) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading, ...roles, effectiveRole, setSimulatedRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
