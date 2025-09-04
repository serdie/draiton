
'use client';

import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, User, Trash2, ShieldCheck, UserCog, FilterX, ChevronLeft, ChevronRight, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole, deleteUser } from "@/lib/firebase/admin-actions";
import { getRoleBadgeClass } from "@/lib/utils";
import { EditUserModal } from "./edit-user-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleIcon } from "@/app/dashboard/conexiones/google-icon";

export type UserRole = 'free' | 'pro' | 'admin' | 'empresa';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registered: Date;
  provider: string;
};

const userRoles: UserRole[] = ['free', 'pro', 'admin', 'empresa'];

const formatProvider = (providerId: string) => {
    if (providerId === 'google.com') return 'Google';
    if (providerId === 'password') return 'Password';
    return providerId;
}

export function UsersTab() {
    const { user: adminUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToChangeRole, setUserToChangeRole] = useState<{ user: User; newRole: UserRole } | null>(null);
    const { toast } = useToast();

    // Filter states
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroRol, setFiltroRol] = useState<UserRole | 'all'>('all');

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!db || !adminUser || adminUser.role !== 'admin') {
            setLoading(false);
            return;
        }

        const usersCollectionRef = collection(db, "users");

        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const userList = snapshot.docs.map(doc => {
                const data = doc.data();
                const registeredDate = data.createdAt instanceof Timestamp 
                    ? data.createdAt.toDate() 
                    : new Date();

                const provider = (data.providerData && data.providerData.length > 0)
                    ? data.providerData[0].providerId
                    : 'password';

                return {
                    id: doc.id,
                    name: data.displayName || 'Sin nombre',
                    email: data.email,
                    role: data.role || 'free',
                    registered: registeredDate,
                    provider: provider
                };
            });
            setUsers(userList);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener usuarios con onSnapshot:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios en tiempo real. Revisa los permisos de Firestore.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [adminUser, toast]);
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const porTexto = !filtroTexto || 
                user.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                user.email.toLowerCase().includes(filtroTexto.toLowerCase());

            const porRol = filtroRol === 'all' || user.role === filtroRol;
            
            return porTexto && porRol;
        });
    }, [users, filtroTexto, filtroRol]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const resetFilters = () => {
        setFiltroTexto('');
        setFiltroRol('all');
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleRoleChange = async () => {
        if (!userToChangeRole) return;
        
        try {
            await updateUserRole(userToChangeRole.user.id, userToChangeRole.newRole);
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

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Ver y administrar todos los usuarios registrados.</CardDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                        <Input 
                            placeholder="Buscar por nombre o email..."
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />
                        <Select value={filtroRol} onValueChange={(value) => setFiltroRol(value as any)}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por rol" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                {userRoles.map(role => <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4" />Limpiar Filtros</Button>
                    </div>
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
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Fecha de Registro</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatProvider(user.provider)}
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => setUserToEdit(user)}>
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
                                                            <DropdownMenuItem onClick={() => setUserToChangeRole({ user, newRole: 'empresa' })}>
                                                                <UserCog className="mr-2 h-4 w-4" /> Empresa
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
                                ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron usuarios con los filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Resultados por página:</span>
                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20 h-8">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span>Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                        <div className="flex items-center gap-2">
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {userToEdit && (
                <EditUserModal
                    isOpen={!!userToEdit}
                    onClose={() => setUserToEdit(null)}
                    user={userToEdit}
                />
            )}

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

    