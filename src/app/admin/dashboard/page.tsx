
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

const users = [
  { id: '1', name: 'Usuario Ejemplo', email: 'usuario@email.com', role: 'pro' as const, registered: '2023-11-10' },
  { id: '2', name: 'Admin User', email: 'admin@email.com', role: 'admin' as const, registered: '2023-10-01' },
  { id: '3', name: 'Free User', email: 'free@email.com', role: 'free' as const, registered: '2023-12-01' },
];

const getRoleBadgeClass = (role: 'free' | 'pro' | 'admin') => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <p className="text-muted-foreground">
                        Gestiona usuarios, suscripciones y configuración de la aplicación.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard">Volver a la App</Link>
                 </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Ver y administrar todos los usuarios registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Fecha de Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.registered).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>Editar Usuario</DropdownMenuItem>
                                                <DropdownMenuItem>Cambiar Rol</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Eliminar Usuario</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
