
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Acceso Denegado
                    </CardTitle>
                    <CardDescription>
                        No tienes permisos para acceder a esta sección.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        El panel de administración es exclusivo para usuarios con rol de administrador.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard">Volver al Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return <>{children}</>;
}
