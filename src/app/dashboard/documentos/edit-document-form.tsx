
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Trash2, Pencil, Loader2 } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { type DocumentType, type DocumentStatus, type Document, type LineItem as DocLineItem } from './page';
import { useToast } from '@/hooks/use-toast';
import { updateDocument } from '@/lib/firebase/document-actions';
import { AuthContext } from '@/context/auth-context';
import Link from 'next/link';

type LineItem = DocLineItem & { id: number };

interface EditDocumentFormProps {
  document: Document;
  onClose: () => void;
}

const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
        case 'factura': return 'Factura';
        case 'presupuesto': return 'Presupuesto';
        case 'nota-credito': return 'Nota de Crédito';
        case 'recurrente': return 'Factura Recurrente';
    }
}

export function EditDocumentForm({ document, onClose }: EditDocumentFormProps) {
  const { user } = useContext(AuthContext);
  const [docType, setDocType] = useState(document.tipo);
  const [docNumber, setDocNumber] = useState(document.numero);
  const [emissionDate, setEmissionDate] = useState<Date | undefined>(document.fechaEmision);
  const [dueDate, setDueDate] = useState<Date | undefined>(document.fechaVto || undefined);
  const [lineItems, setLineItems] = useState<LineItem[]>(document.lineas.map((line, index) => ({ id: index, ...line })));
  const [taxRate, setTaxRate] = useState(document.impuestos && document.subtotal ? (document.impuestos / document.subtotal) * 100 : 21);
  const [status, setStatus] = useState<DocumentStatus>(document.estado);
  const [clientName, setClientName] = useState(document.cliente);
  const [clientCif, setClientCif] = useState(document.clienteCif || '');
  const [clientAddress, setClientAddress] = useState(document.clienteDireccion || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const companyData = user?.company;

  const handleAddLine = () => {
    const newLine: LineItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newLine]);
  };

  const handleRemoveLine = (id: number) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };
  
  const handleLineItemChange = (id: number, field: keyof Omit<LineItem, 'id' | 'total'>, value: string | number) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : newItem.quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : newItem.unitPrice;
            newItem.total = quantity * unitPrice;
        }
        return newItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };
  
  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [lineItems, taxRate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'No estás autenticado',
        description: 'Por favor, inicia sesión para actualizar un documento.',
      });
      setIsSaving(false);
      return;
    }

    const documentData = {
      numero: docNumber,
      tipo: docType,
      cliente: clientName,
      clienteCif: clientCif,
      clienteDireccion: clientAddress,
      fechaEmision: emissionDate!,
      fechaVto: dueDate || null,
      lineas: lineItems.map(({id, ...rest}) => rest),
      subtotal,
      impuestos: taxAmount,
      importe: total,
      estado: status,
      moneda: 'EUR',
    };

    try {
      await updateDocument(document.id, documentData);
      toast({
        title: 'Documento Actualizado',
        description: `El documento ${docNumber} se ha actualizado correctamente.`,
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar documento: ", error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudo guardar el documento. Revisa la consola y los permisos.',
      });
    } finally {
        setIsSaving(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Select value={docType} onValueChange={(value) => setDocType(value as DocumentType)}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="factura">Factura</SelectItem>
                    <SelectItem value="presupuesto">Presupuesto</SelectItem>
                    <SelectItem value="nota-credito">Nota de Crédito</SelectItem>
                    <SelectItem value="recurrente">Factura Recurrente</SelectItem>
                </SelectContent>
            </Select>
            <div />
             <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="font-mono text-right" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Detalles del Emisor</CardTitle>
                    <Button asChild variant="ghost" size="icon" className="h-6 w-6">
                        <Link href="/dashboard/configuracion?tab=empresa">
                        <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                     <div>
                        <Label>Nombre Emisor</Label>
                        <Input value={companyData?.name || 'Tu Empresa S.L.'} readOnly />
                    </div>
                     <div>
                        <Label>CIF/NIF Emisor</Label>
                        <Input value={companyData?.cif || 'Y12345672'} readOnly/>
                    </div>
                    <div>
                        <Label>Dirección Emisor</Label>
                        <Textarea value={companyData?.address || 'Tu Dirección, Ciudad, País'} readOnly/>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Detalles del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                     <div>
                        <Label>Nombre Cliente</Label>
                        <Input placeholder="Nombre del Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
                    </div>
                     <div>
                        <Label>CIF/NIF Cliente</Label>
                        <Input placeholder="CIF/NIF del Cliente" value={clientCif} onChange={e => setClientCif(e.target.value)}/>
                    </div>
                    <div>
                        <Label>Dirección Cliente</Label>
                        <Textarea placeholder="Dirección Completa del Cliente" value={clientAddress} onChange={e => setClientAddress(e.target.value)}/>
                    </div>
                </CardContent>
            </Card>
        </div>
        
         <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Fecha Emisión</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !emissionDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {emissionDate ? format(emissionDate, "PPP", {locale: es}) : <span>Elige una fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <Calendar mode="single" selected={emissionDate} onSelect={setEmissionDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
             <div>
                <Label>Fecha Vencimiento</Label>
                <Popover>
                    <PopoverTrigger asChild>
                       <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP", {locale: es}) : <span>Elige una fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="text-base">Conceptos / Artículos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="hidden md:grid md:grid-cols-[1fr_80px_100px_100px_40px] gap-2 font-medium text-muted-foreground text-xs px-2">
                        <span>Descripción</span>
                        <span className="text-right">Cant.</span>
                        <span className="text-right">P. Unit.</span>
                        <span className="text-right">Total</span>
                        <span></span>
                    </div>
                    {lineItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-start border-b pb-2">
                            <Textarea placeholder="Descripción del servicio/producto" value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} rows={1} className="md:h-10" />
                            <Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))} className="text-right" min="0"/>
                            <Input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(item.id, 'unitPrice', Number(e.target.value))} className="text-right" min="0" step="0.01"/>
                            <Input value={item.total.toFixed(2)} readOnly className="text-right bg-muted" />
                            <Button type="button" variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => handleRemoveLine(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Línea
                </Button>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <Label>Moneda</Label>
                         <Input value="EUR" readOnly />
                    </div>
                    <div>
                         <Label>Tasa Impuesto (%)</Label>
                         <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
                    </div>
                </div>
                 <div>
                    <Label>Notas Adicionales / Términos</Label>
                    <Textarea defaultValue="Condiciones de pago: 30 días." />
                </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <div className="w-[180px] space-y-2">
                    <Label>Estado del Documento</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Borrador">Borrador</SelectItem>
                            <SelectItem value="Emitido">Emitido</SelectItem>
                            <SelectItem value="Enviado">Enviado</SelectItem>
                            <SelectItem value="Pagado">Pagado</SelectItem>
                            <SelectItem value="Vencido">Vencido</SelectItem>
                            <SelectItem value="Impagada">Impagada</SelectItem>
                            <SelectItem value="Aceptado">Aceptado</SelectItem>
                            <SelectItem value="Rechazado">Rechazado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[240px] space-y-1 text-right p-4 bg-muted rounded-md">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{subtotal.toFixed(2)} EUR</span></div>
                    <div className="flex justify-between"><span>Impuestos ({taxRate}%):</span><span>{taxAmount.toFixed(2)} EUR</span></div>
                    <div className="font-bold text-lg flex justify-between"><span>Total:</span><span>{total.toFixed(2)} EUR</span></div>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
    </form>
  );
}
