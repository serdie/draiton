

'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Trash2, Pencil, Loader2, ChevronDown, FileText, Landmark } from 'lucide-react';
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { type DocumentType, type DocumentStatus } from './page';
import { useToast } from '@/hooks/use-toast';
import { type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { AuthContext } from '@/context/auth-context';
import Link from 'next/link';
import type { Document, LineItem as DocLineItem } from './page';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type LineItem = DocLineItem & {
  id: number;
};

interface CreateDocumentFormProps {
  onClose: () => void;
  documentType: DocumentType;
  initialData?: ExtractInvoiceDataOutput;
  documents: Document[];
}

const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
        case 'factura': return 'Factura';
        case 'presupuesto': return 'Presupuesto';
        case 'nota-credito': return 'Nota de Crédito';
        case 'recurrente': return 'Factura Recurrente';
    }
}

const units = ['cantidad', 'horas', 'día', 'mes', 'kg', 'minuto', 'palabra', 'paquete', 'tonelada', 'metro', 'm2', 'm3', 'noche', 'km', 'semana', 'litro'];


export function CreateDocumentForm({ onClose, documentType, initialData, documents }: CreateDocumentFormProps) {
  const { user } = useContext(AuthContext);
  const [docType, setDocType] = useState(documentType);
  const [docNumber, setDocNumber] = useState('');
  const [emissionDate, setEmissionDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(21);
  const [applyIrpf, setApplyIrpf] = useState(false);
  const [status, setStatus] = useState<DocumentStatus>('Borrador');
  const [clientName, setClientName] = useState('');
  const [clientCif, setClientCif] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [terminos, setTerminos] = useState('Condiciones de pago: 30 días.');
  const [saveTerminos, setSaveTerminos] = useState(false);
  const [iban, setIban] = useState('');
  const [saveIban, setSaveIban] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const companyData = user?.company;

  useEffect(() => {
    if (companyData?.iban) {
      setIban(companyData.iban);
    }
  }, [companyData]);

  useEffect(() => {
    setDocType(documentType);
  }, [documentType]);
  
  useEffect(() => {
    if (initialData) return; // Do not generate number if we are filling from OCR

    const prefixMap = {
      factura: "FACT",
      presupuesto: "PRES",
      "nota-credito": "NC",
      recurrente: "RECU",
    };
    const prefix = prefixMap[docType];
    const currentYear = new Date().getFullYear();

    const relevantDocs = documents
      .filter(
        (doc) =>
          doc.tipo === docType &&
          new Date(doc.fechaEmision).getFullYear() === currentYear &&
          doc.numero.startsWith(`${prefix}-${currentYear}-`)
      )
      .map((doc) => {
        const parts = doc.numero.split("-");
        return parseInt(parts[parts.length - 1], 10);
      });

    const lastNumber = relevantDocs.length > 0 ? Math.max(...relevantDocs) : 0;
    const newNumber = (lastNumber + 1).toString().padStart(3, "0");
    setDocNumber(`${prefix}-${currentYear}-${newNumber}`);
  }, [docType, documents, initialData]);


  useEffect(() => {
    if (initialData) {
      setDocNumber(initialData.invoiceNumber || docNumber);
      
      const parsedEmissionDate = initialData.invoiceDate ? parseISO(initialData.invoiceDate) : new Date();
      setEmissionDate(isValid(parsedEmissionDate) ? parsedEmissionDate : new Date());

      const parsedDueDate = initialData.dueDate ? parseISO(initialData.dueDate) : undefined;
      setDueDate(isValid(parsedDueDate) ? parsedDueDate : undefined);

      setClientName(initialData.clientName || '');
      setClientCif(initialData.clientCif || '');
      setClientAddress(initialData.clientAddress || '');
      setTaxRate(initialData.taxRate || 21);

      if (initialData.lineItems && initialData.lineItems.length > 0) {
        setLineItems(initialData.lineItems.map((item, index) => ({
          id: index,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.amount,
          unit: 'cantidad',
        })));
      } else {
        setLineItems([{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0, unit: 'cantidad' }]);
      }
      setStatus('Borrador');

    } else {
        setLineItems([{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0, unit: 'cantidad' }])
        setClientName('');
        setClientCif('');
        setClientAddress('');
        setEmissionDate(new Date());
        setDueDate(undefined);
        setTaxRate(21);
    }
  }, [initialData, docNumber]);

  const handleAddLine = () => {
    const newLine: LineItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      unit: 'cantidad',
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
  
  const { subtotal, taxAmount, irpfAmount, total } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const irpfAmount = applyIrpf ? subtotal * 0.15 : 0;
    const total = subtotal + taxAmount - irpfAmount;
    return { subtotal, taxAmount, irpfAmount, total };
  }, [lineItems, taxRate, applyIrpf]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'No estás autenticado',
            description: 'Por favor, inicia sesión para crear un documento.',
        });
        setIsSaving(false);
        return;
    }

    if (!clientName) {
        toast({
            variant: 'destructive',
            title: 'Campo requerido',
            description: 'El nombre del cliente es obligatorio.',
        });
        setIsSaving(false);
        return;
    }

    const documentData: Omit<Document, 'id' | 'fechaCreacion'> = {
        ownerId: user.uid,
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
        terminos: terminos,
        iban: iban,
    };

    try {
        await addDoc(collection(db, "invoices"), {
            ...documentData,
            fechaCreacion: serverTimestamp(),
        });
        
        if (saveIban) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { 'company.iban': iban });
        }

        const contactsRef = collection(db, 'contacts');
        const q = query(contactsRef, where('name', '==', clientName), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(contactsRef, {
                ownerId: user.uid,
                name: clientName,
                company: '',
                cif: clientCif,
                address: clientAddress,
                email: '',
                phone: '',
                type: 'Cliente',
                notes: `Contacto creado automáticamente desde el documento ${docNumber}`,
                createdAt: serverTimestamp(),
            });
            toast({
                title: 'Documento y Contacto Creados',
                description: `El documento ${docNumber} se ha guardado y se ha añadido a ${clientName} a tus contactos.`,
            });
        } else {
             toast({
                title: 'Documento Creado',
                description: `El documento ${docNumber} se ha guardado correctamente.`,
            });
        }
        
        onClose();
    } catch (error) {
        console.error("Error al crear documento/contacto: ", error);
        toast({
            variant: 'destructive',
            title: 'Error al crear el documento',
            description: 'No se pudo guardar el documento. Revisa los permisos de Firestore.',
        });
    } finally {
        setIsSaving(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogHeader>
          <DialogTitle>Crear {getDocumentTypeLabel(docType)}</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear un nuevo documento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4 text-sm py-4">
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
                        <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_120px_120px_40px] gap-2 font-medium text-muted-foreground text-xs px-2">
                            <span>Descripción</span>
                            <span className="text-right">Cantidad</span>
                            <span className="text-center">Unidad</span>
                            <span className="text-right">Precio/Unidad</span>
                            <span className="text-right">Total</span>
                            <span></span>
                        </div>
                        {lineItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_120px_120px_40px] gap-2 items-start border-b pb-2">
                                <Textarea placeholder="Descripción del servicio/producto" value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} rows={1} className="md:h-10" />
                                <Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))} className="text-right" min="0"/>
                                <Select value={item.unit} onValueChange={(value) => handleLineItemChange(item.id, 'unit', value)}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map(u => <SelectItem key={u} value={u} className="capitalize text-xs">{u}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
                <div className="space-y-4">
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
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="irpf-switch" checked={applyIrpf} onCheckedChange={setApplyIrpf} />
                        <Label htmlFor="irpf-switch">Aplicar retención IRPF (15%)</Label>
                    </div>
                     <Collapsible>
                        <CollapsibleTrigger className="flex w-full justify-between items-center text-sm font-medium p-3 rounded-lg bg-muted/50 border hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Términos y condiciones
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-4 border-t pt-4">
                           <div className="space-y-2">
                                <Label htmlFor="terms" className="text-muted-foreground">Términos y condiciones (Opcional)</Label>
                                <Textarea id="terms" placeholder="Añade información sobre el acuerdo legal con tu cliente." value={terminos} onChange={e => setTerminos(e.target.value)} />
                           </div>
                           <div className="flex items-center space-x-2">
                                <Switch id="save-terms" checked={saveTerminos} onCheckedChange={setSaveTerminos} />
                                <Label htmlFor="save-terms" className="text-xs text-muted-foreground">Establecer como términos y condiciones predeterminados</Label>
                           </div>
                        </CollapsibleContent>
                    </Collapsible>
                     <Collapsible>
                        <CollapsibleTrigger className="flex w-full justify-between items-center text-sm font-medium p-3 rounded-lg bg-muted/50 border hover:bg-muted">
                             <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4" />
                                Formas de pago
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="iban" className="text-muted-foreground">Número de cuenta (IBAN)</Label>
                                <Input id="iban" placeholder="ES00 0000 0000 0000 0000 0000" value={iban} onChange={e => setIban(e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="save-iban" checked={saveIban} onCheckedChange={setSaveIban} />
                                <Label htmlFor="save-iban" className="text-xs text-muted-foreground">Establecer como forma de pago predeterminada</Label>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
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
                        {applyIrpf && <div className="flex justify-between text-destructive"><span>IRPF (15%):</span><span>-{irpfAmount.toFixed(2)} EUR</span></div>}
                        <div className="font-bold text-lg flex justify-between"><span>Total:</span><span>{total.toFixed(2)} EUR</span></div>
                    </div>
                </div>
            </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Crear Documento"}
          </Button>
        </DialogFooter>
      </form>
  );
}
