
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserPlus, MoreHorizontal, FilterX, ChevronLeft, ChevronRight, Loader2, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AddContactModal } from './add-contact-modal';
import { EditContactModal } from './edit-contact-modal';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export type ContactType = 'Cliente' | 'Proveedor' | 'Lead' | 'Colaborador';

export type Contact = {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  company: string;
  cif: string;
  phone: string;
  type: ContactType;
  notes?: string;
  createdAt: Date;
};

const getBadgeClassForType = (type: ContactType) => {
  switch (type) {
    case 'Cliente':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Proveedor':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Lead':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Colaborador':
       return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const contactTypes: ContactType[] = ['Cliente', 'Proveedor', 'Lead', 'Colaborador'];

export default function ContactosPage() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Filter states
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<ContactType | 'all'>('all');

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        if (!db || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const q = query(collection(db, 'contacts'), where('ownerId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docsList = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                } as Contact;
            });
            setContacts(docsList.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching contacts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los contactos.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);


    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const porTexto = !filtroTexto || 
                contact.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                contact.email.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                (contact.company && contact.company.toLowerCase().includes(filtroTexto.toLowerCase()));

            const porTipo = filtroTipo === 'all' || contact.type === filtroTipo;
            
            return porTexto && porTipo;
        });
    }, [contacts, filtroTexto, filtroTipo]);

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredContacts.slice(startIndex, endIndex);
    }, [filteredContacts, currentPage, itemsPerPage]);

    const resetFilters = () => {
        setFiltroTexto('');
        setFiltroTipo('all');
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleDelete = async () => {
        if (!contactToDelete) return;
        
        try {
            await deleteDoc(doc(db, "contacts", contactToDelete.id));
            toast({
                title: 'Contacto Eliminado',
                description: `El contacto ${contactToDelete.name} ha sido eliminado.`,
            });
        } catch (error) {
            console.error("FALLO AL ELIMINAR DE FIREBASE:", error);
            toast({
                variant: 'destructive',
                title: 'Error al eliminar',
                description: 'No se pudo eliminar el contacto. Revisa la consola y los permisos.',
            });
        } finally {
            setContactToDelete(null);
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden sm:table-cell w-12">Avatar</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Correo</TableHead>
                    <TableHead className="hidden lg:table-cell">Empresa</TableHead>
                    <TableHead className="hidden xl:table-cell">CIF/NIF</TableHead>
                    <TableHead className="hidden xl:table-cell">Teléfono</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden lg:table-cell">Alta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedContacts.length > 0 ? (
                        paginatedContacts.map((contact) => (
                        <TableRow key={contact.id}>
                            <TableCell className="hidden sm:table-cell">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={contact.avatar} alt={contact.name} />
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell className="text-muted-foreground hidden md:table-cell">{contact.email}</TableCell>
                            <TableCell className="text-muted-foreground hidden lg:table-cell">{contact.company || '-'}</TableCell>
                            <TableCell className="text-muted-foreground hidden xl:table-cell">{contact.cif || '-'}</TableCell>
                            <TableCell className="text-muted-foreground hidden xl:table-cell">{contact.phone || '-'}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn('font-semibold', getBadgeClassForType(contact.type))}>
                                    {contact.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden lg:table-cell">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('es-ES') : '-'}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setContactToEdit(contact)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setContactToDelete(contact)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">
                                No se encontraron contactos. ¡Añade uno nuevo!
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )
    };

  return (
    <>
    <AddContactModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    {contactToEdit && (
        <EditContactModal
            isOpen={!!contactToEdit}
            onClose={() => setContactToEdit(null)}
            contact={contactToEdit}
        />
    )}

     <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. El contacto <strong>{contactToDelete?.name}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContactToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold">Gestionar Contactos (CRM)</h1>
                <p className="text-muted-foreground">
                    Mantén un registro de tus clientes, proveedores, leads y colaboradores.
                </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Añadir Nuevo Contacto
            </Button>
        </div>

        <Card>
            <CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Input 
                        placeholder="Buscar por nombre, email, empresa..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                    />
                    <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todos los tipos</SelectItem>
                            {contactTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4" />Limpiar Filtros</Button>
                </div>
            </CardHeader>
        </Card>

      <Card>
        <CardContent className="pt-6">
            {renderContent()}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
    </>
  );
}

