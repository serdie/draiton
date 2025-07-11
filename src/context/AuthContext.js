import React, { useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase-config'; // Asegúrate de que la ruta a tu config de firebase sea correcta

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        // Usuario ha iniciado sesión, ahora buscamos su perfil en Firestore
        const userDocRef = doc(db, 'users', userAuth.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Combinamos los datos de Auth y Firestore
          setCurrentUser({
            uid: userAuth.uid,
            email: userAuth.email,
            ...userDocSnap.data()
          });
        } else {
          console.error("Error: Usuario autenticado pero sin perfil en Firestore.");
          setCurrentUser(userAuth); // Guardamos al menos la info básica de auth
        }
      } else {
        // Usuario ha cerrado sesión
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Se ejecuta al desmontar para limpiar
  }, []);

  const value = {
    currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
