
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Briefcase, CheckSquare, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/context/auth-context';
import { UserDetailCard } from './user-detail-card';

const StatCard = ({ title, value, icon: Icon, href }: { title: string, value: number, icon: React.ElementType, href: string }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState({ projects: 0, tasks: 0, invoices: 0, employees: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            router.push('/admin/dashboard');
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            // Fetch user data
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                setLoading(false);
                return;
            }
            const userData = { ...userDocSnap.data(), id: userDocSnap.id } as User;
            setUser(userData);
            
            // Fetch stats
            const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', userId));
            const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', userId));
            const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', userId));
            const employeesQuery = query(collection(db, 'employees'), where('ownerId', '==', userId));
            
            const [projectsSnap, tasksSnap, invoicesSnap, employeesSnap] = await Promise.all([
                getDocs(projectsQuery),
                getDocs(tasksQuery),
                getDocs(invoicesQuery),
                getDocs(employeesQuery),
            ]);

            setStats({
                projects: projectsSnap.size,
                tasks: tasksSnap.size,
                invoices: invoicesSnap.size,
                employees: employeesSnap.size,
            });

            setLoading(false);
        };
        
        fetchData();

    }, [userId, router]);
    
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    
    if (!user) {
        return <div className="text-center">Usuario no encontrado.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
                    <p className="text-muted-foreground">Detalles y actividad de {user.displayName}.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Proyectos" value={stats.projects} icon={Briefcase} href="#" />
                <StatCard title="Tareas" value={stats.tasks} icon={CheckSquare} href="#" />
                <StatCard title="Facturas" value={stats.invoices} icon={FileText} href="#" />
                <StatCard title="Empleados" value={stats.employees} icon={Users} href="#" />
            </div>

            <UserDetailCard user={user} />

        </div>
    );
}
