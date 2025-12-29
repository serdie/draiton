

'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Employee } from '../finanzas/empleados/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Phone, Calendar, Briefcase, FileText, Hash, BadgeInfo, Coins, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrainingModule } from './training-module';

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'No especificado'}</p>
        </div>
    </div>
);

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function EmployeeDashboard() {
    const { user } = useContext(AuthContext);
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const employeeDocRef = doc(db, 'employees', user.uid);
        const unsubscribe = onSnapshot(employeeDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEmployeeData({
                    id: docSnap.id,
                    ...data,
                    hireDate: data.hireDate ? (data.hireDate as Timestamp).toDate() : undefined,
                } as Employee);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching employee data: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!employeeData) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">No se pudo cargar tu perfil de empleado. Por favor, contacta con tu administrador.</p>
                </CardContent>
            </Card>
        )
    }
    
    const modalityValue = employeeData.workModality === 'Mixto' 
        ? `${employeeData.workModality} (${employeeData.presencialPercentage || 50}% Presencial / ${employeeData.remotePercentage || 50}% Teletrabajo)`
        : employeeData.workModality;

    const salaryLabel = employeeData.salaryType ? `Salario ${employeeData.salaryType}` : 'Salario Bruto Anual';
    const salaryValue = employeeData.salaryType === 'Según Convenio' 
        ? 'Según Convenio' 
        : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(employeeData.grossAnnualSalary);
    
    const extraPaysValue = employeeData.proratedExtraPays
        ? `Prorrateadas mensualmente (${employeeData.extraPaysConfig || '2 Pagas'})`
        : (employeeData.extraPaysConfig || "2 Pagas (Julio y Diciembre)");


    return (
        <div className="space-y-6">
             <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Bienvenido, {employeeData.name.split(' ')[0]}
                </h1>
                <p className="text-muted-foreground">
                Aquí tienes un resumen de tu información laboral y formación pendiente.
                </p>
            </div>

            <TrainingModule employee={employeeData} />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.photoURL ?? ''} alt={employeeData.name} />
                            <AvatarFallback className="text-xl">{getInitials(employeeData.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <CardTitle className="text-2xl">{employeeData.name}</CardTitle>
                             <CardDescription>{employeeData.position}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoRow icon={Mail} label="Correo Electrónico" value={employeeData.email} />
                        <InfoRow icon={Phone} label="Teléfono" value={employeeData.phone} />
                        <InfoRow icon={Calendar} label="Fecha de Contratación" value={employeeData.hireDate ? format(employeeData.hireDate, "dd 'de' MMMM, yyyy", { locale: es }) : 'No especificada'} />
                        <InfoRow icon={Briefcase} label="Tipo de Contrato" value={employeeData.contractType} />
                        <InfoRow icon={BadgeInfo} label="NIF" value={employeeData.nif} />
                        <InfoRow icon={Hash} label="Nº Seguridad Social" value={employeeData.socialSecurityNumber} />
                        <InfoRow icon={FileText} label={salaryLabel} value={salaryValue} />
                        <InfoRow icon={Briefcase} label="Convenio" value={employeeData.convenio || 'Personalizado'} />
                        <InfoRow icon={FileText} label="Modalidad" value={modalityValue} />
                        <InfoRow icon={FileText} label="Frecuencia de Pago" value={employeeData.paymentFrequency} />
                        <InfoRow icon={Clock} label="Horas Semanales" value={employeeData.weeklyHours ? `${employeeData.weeklyHours} horas` : 'No especificado'} />
                        <InfoRow icon={Clock} label="Jornada Anual" value={employeeData.annualHours ? `${employeeData.annualHours} horas` : 'No especificada'} />
                        <InfoRow icon={Calendar} label="Días de Vacaciones Anuales" value={employeeData.vacationDays || 23} />
                        <InfoRow icon={Coins} label="Pagas Extra" value={extraPaysValue} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

    
