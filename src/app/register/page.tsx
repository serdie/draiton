'use client';

import { useState, useContext, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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

// 1. TUS PRECIOS DE STRIPE (Los que me pasaste)
const STRIPE_PRICES: Record<string, string> = {
  'pro_mensual': 'price_1SdamoDaJWPk1oF9vTeHa0g4',      // Plan Pro (Autónomo) mes a mes
  'pro_anual': 'price_1Sdam5DaJWPk1oF9IQyia1Ui',        // Plan Pro (Autónomo) anual
  'empresa_mensual': 'price_1SdanqDaJWPk1oF94oQKfJ4c',  // Plan empresa mes a mes
  'empresa_anual': 'price_1Sdan8DaJWPk1oF9fRGdppbU',    // Plan empresa anual
};

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  
  const [isPaymentRedirecting, setIsPaymentRedirecting] = useState(false);

  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const searchParams = useSearchParams();
  
  // --- LÓGICA DE DETECCIÓN DE PLAN ---
  const urlPlan = searchParams.get('plan'); 
  let planKey = 'free';
  
  // 1. Si el plan viene completo (ej: pro_anual) y existe en nuestro mapa, lo usamos
  if (urlPlan && STRIPE_PRICES[urlPlan]) {
      planKey = urlPlan; 
  } 
  // 2. Si viene incompleto (ej: pro), le añadimos el billing
  else if (urlPlan === 'pro' || urlPlan === 'empresa') {
      const billing = searchParams.get('billing') || 'mensual';
      planKey = `${urlPlan}_${billing}`;
  }
  
  // Es de pago si la clave resultante existe en el mapa de precios
  const isPaidPlan = planKey !== 'free' && !!STRIPE_PRICES[planKey];

  useEffect(() => {
    // Solo redirigimos al dashboard si:
    // 1. Usuario logueado
    // 2. NO es un plan de pago (si es de pago, esperamos a que Stripe haga su magia)
    // 3. NO estamos cargando
    if (!authLoading && user && !isPaymentRedirecting && !loading && !googleLoading && !facebookLoading && !isPaidPlan) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router, isPaymentRedirecting, loading, googleLoading, facebookLoading, isPaidPlan]);


  // --- FUNCIÓN QUE CONECTA CON STRIPE (AQUÍ ESTÁ EL CHIVATO) ---
  const handlePostRegistration = async (user: any) => {
    console.log("Procesando post-registro. Plan:", planKey);

    // Si es gratis o no encontramos el ID, al dashboard
    if (!isPaidPlan) {
      router.push('/dashboard');
      return;
    }

    // Si es de pago, iniciamos Stripe
    setIsPaymentRedirecting(true);
    setError(null);

    try {
      const priceId = STRIPE_PRICES[planKey];
      console.log("Intentando conectar con Stripe. ID Precio:", priceId);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          userEmail: user.email,
          userId: user.uid
        })
      });

      const data = await response.json();

      if (data.url) {
        // ÉXITO: Nos vamos a Stripe
        window.location.href = data.url; 
      } else {
        // ERROR: Mostramos alerta para saber qué pasa
        console.error('Error devuelto por API Checkout:', data);
        setIsPaymentRedirecting(false); 
        // 🛑 AQUÍ SALDRÁ EL ERROR EN PANTALLA 🛑
        alert(`ERROR AL INICIAR PAGO:\n${data.error || JSON.stringify(data)}`);
      }

    } catch (err) {
      console.error('Error de red/fetch:', err);
      setIsPaymentRedirecting(false);
      alert('ERROR DE CONEXIÓN CON EL SERVIDOR. Revisa la consola (F12).');
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!auth || !db) {
        setError('El servicio no está disponible.');
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: name });
      
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        displayName: name,
        email: newUser.email,
        photoURL: newUser.photoURL,
        role: 'free', 
        planPending: planKey, 
        createdAt: serverTimestamp(),
        providerData: newUser.providerData.map(p => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          photoURL: p.photoURL,
        })),
      });
      
      await handlePostRegistration(newUser);
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else {
        setError('Error al registrar.');
      }
      setLoading(false); 
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    if (!auth || !db) return;

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
         await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
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
      }
      await handlePostRegistration(user);
    } catch (err: any) {
       setError('Error con Google.');
       setGoogleLoading(false);
    }
  };
  
  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    setError(null);
    if (!auth || !db) return;

    const provider = new FacebookAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
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
      }
      await handlePostRegistration(user);
    } catch (err: any) {
       setError('Error con Facebook.');
       setFacebookLoading(false);
    }
  };

  // Titulo dinámico
  const planTitle = planKey === 'free' ? 'Gratis' : 
                    planKey.includes('pro') ? 'Pro' : 
                    planKey.includes('empresa') ? 'Empresa' : 'Gratis';

  // Mostrar loading pantalla completa SOLO si estamos cargando auth o redirigiendo al dashboard por ser free
  if (authLoading || (user && !isPaymentRedirecting && !isPaidPlan && !loading && !googleLoading && !facebookLoading)) {
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
            <CardTitle>Crea tu Cuenta - Plan {planTitle}</CardTitle>
            <CardDescription>
                {isPaidPlan
                    ? 'Estás a un paso de activar tu suscripción.' 
                    : 'Empieza a transformar tu negocio hoy mismo.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
             {error && (
                <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
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
                <Button type="submit" className="w-full" disabled={loading || isPaymentRedirecting}>
                    {(loading || isPaymentRedirecting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPaymentRedirecting ? 'Redirigiendo al pago...' : 'Crear Cuenta'}
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
                <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-gray-700 font-medium" disabled={googleLoading || isPaymentRedirecting} onClick={handleGoogleSignIn}>
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                    Registrarse con Google
                 </Button>
                 <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-[#1877F2] font-medium" disabled={facebookLoading || isPaymentRedirecting} onClick={handleFacebookSignIn}>
                    {facebookLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Facebook className="mr-2 h-5 w-5" />}
                    Registrarse con Facebook
                 </Button>
            </div>
            
            <p className="mt-6 px-8 text-center text-xs text-muted-foreground">
              Al continuar confirmas que aceptas nuestros{' '}
              <Link href="/condiciones-de-uso" className="underline underline-offset-4 hover:text-primary">
                Condiciones de uso
              </Link>,{' '}
              <Link href="/politica-de-privacidad" className="underline underline-offset-4 hover:text-primary">
                Política de Privacidad
              </Link>{' '}
              y{' '}
              <Link href="/politica-de-cookies" className="underline underline-offset-4 hover:text-primary">
                Cookies
              </Link>.
            </p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
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

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <RegisterForm />
        </Suspense>
    )
}