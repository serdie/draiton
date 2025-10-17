
'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Google</title>
        <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-3.41 0-6.18-2.8-6.18-6.18s2.77-6.18 6.18-6.18c1.93 0 3.25.78 4.23 1.7l2.06-2.06C18.12 2.66 15.61 1.53 12.48 1.53c-5.18 0-9.42 4.13-9.42 9.19s4.24 9.19 9.42 9.19c5.18 0 9.42-4.13 9.42-9.19 0-.82-.07-1.62-.2-2.38H12.48z"
            fill="#4285F4"
        />
    </svg>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!auth || !db) {
        setError('El servicio de registro no está disponible. Por favor, contacta al soporte.');
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        role: 'free', 
        createdAt: serverTimestamp(),
        providerData: user.providerData.map(p => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          photoURL: p.photoURL,
        })),
      });
      
      // La redirección y la sincronización de datos la manejará el AuthContext
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado. Por favor, añade el dominio de esta página de vista previa a la lista de 'Dominios autorizados' en la configuración de Authentication de tu consola de Firebase.");
      } else {
        setError('Ocurrió un error durante el registro.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    if (!auth || !db) {
        setError('El servicio de registro no está disponible. Por favor, contacta al soporte.');
        setGoogleLoading(false);
        return;
    }

    try {
      await signInWithPopup(auth, provider);
      // La redirección y la sincronización de datos la manejará el AuthContext
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado. Por favor, añade el dominio de esta página de vista previa a la lista de 'Dominios autorizados' en la configuración de Authentication de tu consola de Firebase.");
      } else {
        setError('No se pudo registrar con Google. Inténtalo más tarde.');
      }
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading || user) {
     return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 inline-block">
                <Link href="/" >
                    <Logo className="h-10 w-10 mx-auto"/>
                </Link>
            </div>
            <CardTitle>Crea tu Cuenta Gratis</CardTitle>
            <CardDescription>Empieza a transformar tu negocio hoy mismo.</CardDescription>
        </CardHeader>
        <CardContent>
             {error && (
                <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error de Registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
             <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Cuenta
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    O CONTINUAR CON
                    </span>
                </div>
            </div>

            <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-gray-700 font-medium" onClick={handleGoogleSignIn} disabled={googleLoading}>
                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Registrarse con Google
            </Button>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
                </Link>
            </p>
        </CardContent>
      </Card>
    </main>
  );
}
