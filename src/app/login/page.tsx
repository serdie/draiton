
'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2, Facebook } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { GoogleIcon } from '../dashboard/conexiones/google-icon';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();


  // Effect to redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!auth) {
        setError('El servicio de autenticación no está disponible. Por favor, contacta al soporte.');
        setLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection is now handled by the AuthContext, which will also sync the provider data
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado. Por favor, añade el dominio de esta página de vista previa a la lista de 'Dominios autorizados' en la configuración de Authentication de tu consola de Firebase.");
      } else if (err.code === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      } else {
        setError('Ocurrió un error al iniciar sesión.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    if (!auth) {
        setError('El servicio de autenticación no está disponible.');
        setGoogleLoading(false);
        return;
    }

    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        // Redirection and data sync is handled by AuthContext
    } catch (err: any) {
       if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado. Por favor, añade el dominio de esta página de vista previa a la lista de 'Dominios autorizados' en la configuración de Authentication de tu consola de Firebase.");
      } else {
        setError('No se pudo iniciar sesión con Google. Inténtalo más tarde.');
      }
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };
  
    const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    setError(null);

    if (!auth) {
        setError('El servicio de autenticación no está disponible.');
        setFacebookLoading(false);
        return;
    }

    const provider = new FacebookAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        // Redirection and data sync is handled by AuthContext
    } catch (err: any) {
       if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado. Por favor, añade el dominio de esta página de vista previa a la lista de 'Dominios autorizados' en la configuración de Authentication de tu consola de Firebase.");
      } else {
        setError('No se pudo iniciar sesión con Facebook. Inténtalo más tarde.');
      }
      console.error(err);
    } finally {
      setFacebookLoading(false);
    }
  };


  // While auth is loading, we show nothing to prevent flicker, AuthProvider shows a global loader.
  // If user is logged in, the useEffect above will trigger a redirect.
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
                    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" alt="Draiton Logo" width={110} height={40} className="h-9 w-auto mx-auto"/>
                </Link>
            </div>
            <CardTitle>¡Bienvenido de nuevo!</CardTitle>
            <CardDescription>Inicia sesión para acceder a tu dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
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
                />
            </div>
            <div className="flex items-center justify-end text-sm">
                <Link href="#" className="font-medium text-primary hover:underline">
                ¿Olvidaste tu contraseña?
                </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
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
            <div className="space-y-2">
                <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-gray-700 font-medium" disabled={googleLoading} onClick={handleGoogleSignIn}>
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                    Google
                 </Button>
                  <Button variant="outline" className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-medium" disabled={facebookLoading} onClick={handleFacebookSignIn}>
                    {facebookLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Facebook className="mr-2 h-5 w-5" />}
                    Facebook
                 </Button>
            </div>
             <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                    Regístrate
                </Link>
            </p>
        </CardContent>
      </Card>
    </main>
  );
}
