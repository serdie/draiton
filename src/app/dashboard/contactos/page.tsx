
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserPlus, MoreHorizontal, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AddContactModal } from './add-contact-modal';

type ContactType = 'Cliente' | 'Proveedor' | 'Lead' | 'Colaborador';

type Contact = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  company: string;
  cif: string;
  phone: string;
  type: ContactType;
  lastInteraction: string;
};

const contacts: Contact[] = [
  { id: '1', avatar: '', name: 'Alicia Maravillas', email: 'alice@example.com', company: 'Creaciones Maravillas', cif: 'B12345678', phone: '555-1234', type: 'Cliente', lastInteraction: '2023-11-10' },
  { id: '2', avatar: '', name: 'Roberto Manitas', email: 'bob@example.com', company: 'Constrúyelo Bien S.A.', cif: 'A87654321', phone: '555-5678', type: 'Cliente', lastInteraction: '2023-11-15' },
  { id: '3', avatar: '', name: 'Carlos Proveedor', email: 'carlos@supply.com', company: 'Suministros Globales', cif: 'C98765432', phone: '555-8765', type: 'Proveedor', lastInteraction: '2023-11-20' },
  { id: '4', avatar: '', name: 'Laura Prospecto', email: 'laura@leads.com', company: 'Innovate Corp', cif: '', phone: '555-4321', type: 'Lead', lastInteraction: '2023-11-18' },
  { id: '5', avatar: '', name: 'David Eléctrico', email: 'david@chispas.com', company: 'Instalaciones Rápidas', cif: 'D23456789', phone: '555-1122', type: 'Proveedor', lastInteraction: '2023-11-22' },
  { id: '6', avatar: '', name: 'Eva Diseño', email: 'eva@design.art', company: 'Estudio Creativo', cif: 'E34567890', phone: '555-3344', type: 'Colaborador', lastInteraction: '2023-11-12' },
  { id: '7', avatar: '', name: 'Pedro Cliente', email: 'pedro@client.com', company: 'Servicios de Calidad', cif: 'B98765432', phone: '555-9876', type: 'Cliente', lastInteraction: '2023-12-01' },
  { id: '8', avatar: '', name: 'Sara Logística', email: 'sara@logistics.net', company: 'Transportes Veloz', cif: 'A12312312', phone: '555-1111', type: 'Proveedor', lastInteraction: '2023-11-28' },
  { id: '9', avatar: '', name: 'Miguel Potencial', email: 'miguel@potential.io', company: 'Tech Startups', cif: '', phone: '555-2222', type: 'Lead', lastInteraction: '2023-12-02' },
];

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
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const contactTypes: ContactType[] = ['Cliente', 'Proveedor', 'Lead', 'Colaborador'];

export default function ContactosPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Filter states
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('all');

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const porTexto = !filtroTexto || 
                contact.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                contact.email.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                contact.company.toLowerCase().includes(filtroTexto.toLowerCase());

            const porTipo = filtroTipo === 'all' || contact.type === filtroTipo;
            
            return porTexto && porTipo;
        });
    }, [filtroTexto, filtroTipo]);

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

  return (
    <>
    <AddContactModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Gestionar Contactos</h1>
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
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
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
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>CIF/NIF</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Última Interacción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedContacts.length > 0 ? (
                    paginatedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                        <TableCell>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={contact.avatar} alt={contact.name} />
                                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                        <TableCell className="text-muted-foreground">{contact.company}</TableCell>
                        <TableCell className="text-muted-foreground">{contact.cif || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn('font-semibold', getBadgeClassForType(contact.type))}>
                                {contact.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(contact.lastInteraction).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                            No se encontraron contactos con los filtros aplicados.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
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
    </div>
    </>
  );
}
