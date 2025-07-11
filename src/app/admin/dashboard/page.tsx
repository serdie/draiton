
'use client';

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, User, Trash2, ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole, deleteUser } from "@/lib/firebase/admin-actions";
import { getRoleBadgeClass } from "@/lib/utils";

export type UserRole = 'free' | 'pro' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registered: Date;
};

export default function AdminDashboardPage() {
    const { user: adminUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToChangeRole, setUserToChangeRole] = useState<{ user: User; newRole: UserRole } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!db || !adminUser || adminUser.role !== 'admin') {
            setLoading(false);
            return;
        }

        const usersCollectionRef = collection(db, "users");

        // Escucha cambios en tiempo real
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const userList = snapshot.docs.map(doc => {
                const data = doc.data();
                const registeredDate = data.createdAt instanceof Timestamp 
                    ? data.createdAt.toDate() 
                    : new Date();

                return {
                    id: doc.id,
                    name: data.displayName || 'Sin nombre',
                    email: data.email,
                    role: data.role || 'free',
                    registered: registeredDate,
                };
            });
            setUsers(userList);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener usuarios con onSnapshot:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios en tiempo real.' });
            setLoading(false);
        });

        // Limpia el listener cuando el componente se desmonta
        return () => unsubscribe();
    }, [adminUser, toast]);


    const handleRoleChange = async () => {
        if (!userToChangeRole) return;
        
        try {
            await updateUserRole(userToChangeRole.user.id, userToChange-role.newRole);
            toast({ title: 'Éxito', description: `El rol de ${userToChangeRole.user.name} ha sido cambiado a ${userToChangeRole.newRole}.` });
        } catch (error) {
            console.error("Error al cambiar rol:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cambiar el rol del usuario.' });
        } finally {
            setUserToChangeRole(null);
        }
    };
    
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await deleteUser(userToDelete.id);
            toast({ title: 'Éxito', description: `El usuario ${userToDelete.name} ha sido eliminado.` });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar al usuario.' });
        } finally {
            setUserToDelete(null);
        }
    };

    const handleComingSoon = () => {
        toast({ title: 'Próximamente', description: 'La edición de perfiles de usuario estará disponible pronto.' });
    };

    return (
        <>
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
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
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
                                        <TableCell>{user.registered.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={handleComingSoon}>
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Editar Usuario
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                                            Cambiar Rol
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => setUserToChangeRole({ user, newRole: 'free' })}>
                                                                <User className="mr-2 h-4 w-4" /> Free
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setUserToChangeRole({ user, newRole: 'pro' })}>
                                                                <User className="mr-2 h-4 w-4" /> Pro
                                                            </DropdownMenuItem>
                                                             <DropdownMenuItem onClick={() => setUserToChangeRole({ user, newRole: 'admin' })}>
                                                                <UserCog className="mr-2 h-4 w-4" /> Admin
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setUserToDelete(user)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar Usuario
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Dialog para confirmar eliminación */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible. Se eliminará el usuario <span className="font-bold">{userToDelete?.name}</span> de la base de datos de la aplicación. Esta acción no elimina al usuario del proveedor de autenticación de Firebase.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                        Sí, eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

         {/* Dialog para confirmar cambio de rol */}
        <AlertDialog open={!!userToChangeRole} onOpenChange={(open) => !open && setUserToChangeRole(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Cambio de Rol</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que quieres cambiar el rol de <span className="font-bold">{userToChangeRole?.user.name}</span> a <span className="font-bold">{userToChangeRole?.newRole}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToChangeRole(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRoleChange}>
                        Sí, cambiar rol
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
