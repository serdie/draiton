'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisterExpenseModal } from './register-expense-modal';
import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';


const gastos = [
  {
    fecha: '01 nov 2023',
    categoria: 'Software',
    proveedor: 'Suscripción GenialApp',
    descripcion: 'Suscripción mensual a herramienta de diseño.',
    metodoPago: 'Credit Card',
    importe: 49.99,
  },
  {
    fecha: '05 nov 2023',
    categoria: 'Oficina',
    proveedor: 'Materiales Escritorio S.L.',
    descripcion: 'Compra de bolígrafos y libretas.',
    metodoPago: 'Cash',
    importe: 25.5,
  },
  {
    fecha: '10 nov 2023',
    categoria: 'Marketing',
    proveedor: 'Publicidad Online',
    descripcion: 'Campaña de anuncios en Facebook.',
    metodoPago: 'Credit Card',
    importe: 150.0,
  },
  {
    fecha: '15 nov 2023',
    categoria: 'Viajes',
    proveedor: 'Renfe',
    descripcion: 'Billete de tren para reunión con cliente.',
    metodoPago: 'Debit Card',
    importe: 75.2,
  },
  {
    fecha: '20 nov 2023',
    categoria: 'Otros',
    proveedor: 'Cafetería La Esquina',
    descripcion: 'Café reunión equipo.',
    metodoPago: 'Cash',
    importe: 12.8,
  },
];

const getCategoryBadgeClass = (category: string) => {
  switch (category.toLowerCase()) {
    case 'software':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
    case 'oficina':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
    case 'marketing':
      return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800';
    case 'viajes':
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800';
    case 'otros':
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    default:
      return 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80';
  }
};

export default function GastosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<ExtractReceiptDataOutput | undefined>();

  const handleOpenModal = (data?: ExtractReceiptDataOutput) => {
    setInitialData(data);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear initial data when closing, so the form is empty next time it opens manually
    setInitialData(undefined);
  }

  return (
    <>
      <RegisterExpenseModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onOpenModal={handleOpenModal} 
        initialData={initialData}
      />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
            <p className="text-muted-foreground">
              Lleva un control detallado de todos los gastos de tu negocio.
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Nuevo Gasto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Gastos</CardTitle>
            <CardDescription>
              Listado de tus gastos recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((gasto, index) => (
                  <TableRow key={index}>
                    <TableCell>{gasto.fecha}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('font-normal', getCategoryBadgeClass(gasto.categoria))}>
                        {gasto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{gasto.proveedor}</TableCell>
                    <TableCell>{gasto.descripcion}</TableCell>
                    <TableCell>{gasto.metodoPago}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(gasto.importe)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Eliminar
                          </DropdownMenuItem>
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
    </>
  );
}
