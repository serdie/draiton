
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type User } from "@/context/auth-context";
import { getRoleBadgeClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Mail, Calendar, Building, Phone, MapPin, FileText, Banknote } from "lucide-react";
import { format } from 'date-fns';
import { es } from "date-fns/locale";
import { InfoRow } from "./info-row";
import { Separator } from "@/components/ui/separator";

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export function UserDetailCard({ user }: { user: User }) {
    
    const company = user?.company;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user.photoURL ?? ''} />
                            <AvatarFallback className="text-3xl">{getInitials(user.displayName || 'S N')}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{user.displayName}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className={cn("mt-2", getRoleBadgeClass(user.role || 'free'))}>
                            {user.role}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow icon={Mail} label="Email" value={user.email} />
                        <InfoRow 
                            icon={Calendar} 
                            label="Miembro desde" 
                            value={user.createdAt ? format((user.createdAt as any).toDate(), "dd 'de' MMMM, yyyy", { locale: es }) : 'N/D'} 
                        />
                    </CardContent>
                </Card>
            </div>

             {/* Columna Derecha */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información de la Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {company ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow icon={Building} label="Nombre de la Empresa" value={company.name} />
                                <InfoRow icon={FileText} label="CIF" value={company.cif} />
                                <InfoRow icon={Phone} label="Teléfono" value={company.phone} />
                                <InfoRow icon={Banknote} label="IBAN" value={company.iban} />
                                <InfoRow 
                                    icon={MapPin} 
                                    label="Dirección" 
                                    value={`${company.address?.addressLine1 || ''}, ${company.address?.city || ''}, ${company.address?.country || ''}`}
                                    className="md:col-span-2"
                                />
                                <InfoRow icon={FileText} label="Convenio Colectivo" value={company.convenio} />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Este usuario no tiene información de empresa configurada.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Empleados</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground">Esta empresa no tiene empleados registrados.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
