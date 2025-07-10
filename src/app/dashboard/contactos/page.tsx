
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserPlus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function ContactosPage() {
    const [activeTab, setActiveTab] = useState('clientes');

    const filteredContacts = contacts.filter(contact => {
        if (activeTab === 'clientes') return contact.type === 'Cliente' || contact.type === 'Colaborador';
        if (activeTab === 'proveedores') return contact.type === 'Proveedor';
        if (activeTab === 'leads') return contact.type === 'Lead';
        return true;
    });

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Gestionar Contactos</h1>
                <p className="text-muted-foreground">
                    Mantén un registro de tus clientes, proveedores, leads y colaboradores.
                </p>
            </div>
            <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Añadir Nuevo Contacto
            </Button>
        </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="px-6 pt-6 pb-0">
             <TabsList>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
                <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
             </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value={activeTab}>
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
                    {filteredContacts.map((contact) => (
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
                    ))}
                </TableBody>
                </Table>
                <p className="text-sm text-center text-muted-foreground pt-4">Una lista de tus {activeTab}.</p>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
