
'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AuthVideo } from '@/components/auth-video';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-3.41 0-6.18-2.8-6.18-6.18s2.77-6.18 6.18-6.18c1.93 0 3.25.78 4.23 1.7l2.06-2.06C18.12 2.66 15.61 1.53 12.48 1.53c-5.18 0-9.42 4.13-9.42 9.19s4.24 9.19 9.42 9.19c5.18 0 9.42-4.13 9.42-9.19 0-.82-.07-1.62-.2-2.38z" fill="currentColor"/></svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    const provider = new GoogleAuthProvider();

    if (!auth) {
        setError('El servicio de autenticación no está disponible. Por favor, contacta al soporte.');
        setGoogleLoading(false);
        return;
    }

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

  // While auth is loading, we show nothing to prevent flicker, AuthProvider shows a global loader.
  // If user is logged in, the useEffect above will trigger a redirect.
  if (authLoading || user) {
    return null;
  }

  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
            <AuthVideo />
        </div>
        <div className="flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">¡Hola de nuevo!</h1>
                    <p className="text-muted-foreground">Introduce tus datos para acceder a tu cuenta.</p>
                </div>
                
                {error && (
                    <Alert variant="destructive">
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
                    <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        O continuar con
                    </span>
                    </div>
                </div>

                <Button variant="outline" className="w-full text-current" onClick={handleGoogleSignIn} disabled={googleLoading}>
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Google
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Regístrate
                    </Link>
                </p>
            </div>
        </div>
    </main>
  );
}