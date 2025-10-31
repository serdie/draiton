
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, type User as FirebaseUser } from 'firebase/auth';
import type { Employee } from '@/app/dashboard/finanzas/empleados/types';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, FileText, Clock, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FichajeEmpleadoTab } from '@/app/dashboard/finanzas/empleados/fichaje-empleado-tab';
import { EmployeePayslipList } from '@/app/dashboard/finanzas/empleados/employee-payslip-list';

function EmployeePortalContent({ employee }: { employee: Employee }) {
    return (
         <div className="space-y-8">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Bienvenido, {employee.name}</CardTitle>
                            <CardDescription>Este es tu espacio personal para consultar tu información laboral y gestionar tu jornada.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FichajeEmpleadoTab />
                <EmployeePayslipList employee={employee} />
            </div>
        </div>
    );
}


function LoginForm({ onLoginSuccess, employeeEmail }: { onLoginSuccess: (user: FirebaseUser) => void, employeeEmail: string }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, employeeEmail, password);
            onLoginSuccess(userCredential.user);
        } catch (error: any) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setError('El correo o la contraseña son incorrectos.');
            } else {
                setError('Ocurrió un error al iniciar sesión.');
            }
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="w-full max-w-md mx-auto mt-16">
            <CardHeader className="text-center">
                <CardTitle>Portal del Empleado</CardTitle>
                <CardDescription>Inicia sesión para acceder a tu información.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error de Acceso</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                 <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Correo Electrónico</Label>
                        <Input value={employeeEmail} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isLoading ? 'Accediendo...' : 'Acceder'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}


export default function EmployeePortalPage() {
  const params = useParams();
  const portalId = params?.portalId as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    if (!portalId) {
      setError('ID de portal no válido.');
      setLoading(false);
      return;
    }

    const employeesQuery = query(collection(db, 'employees'), where('employeePortalId', '==', portalId));

    const unsubscribe = onSnapshot(employeesQuery, (querySnapshot) => {
      if (querySnapshot.empty) {
        setError('No se encontró ningún portal con este identificador.');
        setLoading(false);
        return;
      }
      
      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data();

      if (!employeeData.employeePortalActive) {
          setError('El portal para este empleado no está activo.');
          setLoading(false);
          return;
      }

      setEmployee({
          id: employeeDoc.id,
          ...employeeData,
          hireDate: employeeData.hireDate ? (employeeData.hireDate as any).toDate() : undefined,
      } as Employee);

       // Check if a user is already authenticated in the session
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user && employeeDoc.id === user.uid) {
                setAuthenticatedUser(user);
            }
             setLoading(false);
        });
        return () => unsubscribeAuth();

    }, (err) => {
      console.error(err);
      setError('Error al cargar los datos del portal.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [portalId]);
  
  const handleLoginSuccess = (user: FirebaseUser) => {
    if (user.uid === employee?.id) {
        setAuthenticatedUser(user);
    } else {
        setError('Las credenciales no corresponden a este portal de empleado.');
        auth.signOut(); // Log out the user if they don't belong here
    }
  }

  const handleLogout = () => {
    auth.signOut();
    setAuthenticatedUser(null);
  }

  const renderContent = () => {
    if (loading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Cargando portal del empleado...</p>
          </div>
        );
    }

    if (error) {
        return (
          <div className="flex h-screen items-center justify-center text-center">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive">Acceso Restringido</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
             </Card>
          </div>
        );
    }
    
    if (!employee) return null;
    
    if (!authenticatedUser) {
        return <LoginForm onLoginSuccess={handleLoginSuccess} employeeEmail={employee.email} />;
    }
    
    return <EmployeePortalContent employee={employee} />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6"/>
                    <span className="font-bold">Portal del Empleado</span>
                </div>
                 {authenticatedUser && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Sesión iniciada como <span className="font-semibold text-foreground">{authenticatedUser.displayName}</span></span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
                    </div>
                )}
            </div>
        </header>
        <main className="container mx-auto py-8">
            {renderContent()}
        </main>
    </div>
  );
}
