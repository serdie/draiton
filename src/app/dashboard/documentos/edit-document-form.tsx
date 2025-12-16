

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
import { CalendarIcon, PlusCircle, Trash2, Pencil, Loader2, ChevronDown, FileText, Landmark, ShieldCheck, AlertTriangle } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { type DocumentType, type DocumentStatus, type Document, type LineItem as DocLineItem } from './page';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentAction } from '@/lib/firebase/document-actions';
import { AuthContext } from '@/context/auth-context';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Checkbox } from '@/components/ui/checkbox';
import { provincias } from '@/lib/provincias';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

const units = ['cantidad', 'horas', 'día', 'mes', 'kg', 'minuto', 'palabra', 'paquete', 'tonelada', 'metro', 'm2', 'm3', 'noche', 'km', 'semana', 'litro'];

export function EditDocumentForm({ document, onClose }: EditDocumentFormProps) {
  const { user } = useContext(AuthContext);
  const [docType, setDocType] = useState(document.tipo);
  const [docNumber, setDocNumber] = useState(document.numero);
  const [emissionDate, setEmissionDate] = useState<Date | undefined>(document.fechaEmision);
  const [dueDate, setDueDate] = useState<Date | undefined>(document.fechaVto || undefined);
  const [lineItems, setLineItems] = useState<LineItem[]>(document.lineas.map((line, index) => ({ id: index, unit: line.unit || 'cantidad', ...line })));
  const [taxRate, setTaxRate] = useState(document.subtotal > 0 ? (document.impuestos / document.subtotal) * 100 : 21);
  const [applyIrpf, setApplyIrpf] = useState(false); // Asumimos que no está aplicado por defecto al editar
  const [status, setStatus] = useState<DocumentStatus>(document.estado);
  const [clientName, setClientName] = useState(document.cliente);
  const [clientCif, setClientCif] = useState(document.clienteCif || '');
  const [clientAddress, setClientAddress] = useState(document.clienteDireccion || {});
  const [clientEmail, setClientEmail] = useState(document.clienteEmail || '');
  const [showClientEmail, setShowClientEmail] = useState(document.showClientEmail || false);
  const [clientPhone, setClientPhone] = useState(document.clienteTelefono || '');
  const [showClientPhone, setShowClientPhone] = useState(document.showClientPhone || false);
  const [emisorEmail, setEmisorEmail] = useState(document.emisorEmail || user?.email || '');
  const [showEmisorEmail, setShowEmisorEmail] = useState(document.showEmisorEmail ?? true);
  const [emisorPhone, setEmisorPhone] = useState(document.emisorTelefono || user?.company?.phone || '');
  const [showEmisorPhone, setShowEmisorPhone] = useState(document.showEmisorPhone ?? true);
  const [terminos, setTerminos] = useState(document.terminos ?? '');
  const [saveTerminos, setSaveTerminos] = useState(false);
  const [iban, setIban] = useState(document.iban || '');
  const [saveIban, setSaveIban] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [isVerifactu, setIsVerifactu] = useState(false);
  const [showVerifactuAlert, setShowVerifactuAlert] = useState(false);


  const companyData = user?.company;
  
  useEffect(() => {
    if (!iban && companyData?.iban) {
      setIban(companyData.iban);
    }
    if (terminos === '' && companyData?.terminos) {
      setTerminos(companyData.terminos);
    }
  }, [iban, terminos, companyData]);


  const handleAddLine = () => {
    const newLine: LineItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      unit: 'cantidad'
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
    const taxAmountValue = taxRate === 0 ? 0 : (subtotal * taxRate) / 100;
    const irpfAmount = applyIrpf ? subtotal * 0.15 : 0;
    const total = subtotal + taxAmountValue - irpfAmount;
    return { subtotal, taxAmount: taxAmountValue, irpfAmount, total };
  }, [lineItems, taxRate, applyIrpf]);
  
  const handleVerifactuToggle = (checked: boolean) => {
    if (checked) {
        setShowVerifactuAlert(true);
    } else {
        setIsVerifactu(false);
    }
  };
  
  const confirmVerifactu = () => {
    setIsVerifactu(true);
    setShowVerifactuAlert(false);
  };

  const cancelVerifactu = () => {
    setIsVerifactu(false);
    setShowVerifactuAlert(false);
  };


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

    const documentData: Partial<Document> = {
      numero: docNumber,
      tipo: docType,
      cliente: clientName,
      clienteCif: clientCif,
      clienteDireccion: clientAddress,
      clienteEmail: clientEmail,
      showClientEmail: showClientEmail,
      clienteTelefono: clientPhone,
      showClientPhone: showClientPhone,
      emisorEmail: emisorEmail,
      showEmisorEmail: showEmisorEmail,
      emisorTelefono: emisorPhone,
      showEmisorPhone: showEmisorPhone,
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
    
    if (saveIban) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { 'company.iban': iban });
    }
    if (saveTerminos) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { 'company.terminos': terminos });
    }

    const result = await updateDocumentAction(document.id, documentData);

    if (result.success) {
      toast({
        title: 'Documento Actualizado',
        description: `El documento ${docNumber} se ha actualizado correctamente.`,
      });
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: result.error,
      });
    }

    setIsSaving(false);
  }


  return (
    <>
    <AlertDialog open={showVerifactuAlert} onOpenChange={setShowVerifactuAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Atención: Vas a activar Veri*factu
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
                <p>
                Al activar la opción Veri*factu, esta factura se registrará fiscalmente y será enviada a la Agencia Tributaria. Este proceso es <strong>irreversible</strong> y la factura <strong>no podrá ser modificada ni eliminada</strong> una vez emitida.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Te recomendamos crear un <strong>borrador</strong> o una factura normal para verificar los datos antes de la emisión definitiva.</li>
                    <li>Recuerda que la obligatoriedad de Veri*factu para todas las empresas comienza el <strong>1 de enero de 2027</strong>.</li>
                </ul>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelVerifactu}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVerifactu}>
                Entendido, activar Veri*factu
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
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
            <div className="flex items-center justify-center gap-2">
                 <Switch id="verifactu-switch" checked={isVerifactu} onCheckedChange={handleVerifactuToggle} />
                <Label htmlFor="verifactu-switch" className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Veri*factu
                </Label>
            </div>
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
                        <Textarea value={companyData?.address ? `${companyData.address.addressLine1}, ${companyData.address.city}, ${companyData.address.country}`: 'Tu Dirección, Ciudad, País'} readOnly/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={emisorEmail} onChange={e => setEmisorEmail(e.target.value)} />
                             <div className="flex items-center space-x-2">
                                <Checkbox id="show-emisor-email" checked={showEmisorEmail} onCheckedChange={(checked) => setShowEmisorEmail(checked as boolean)} />
                                <Label htmlFor="show-emisor-email" className="text-xs text-muted-foreground font-normal">Mostrar en PDF</Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input value={emisorPhone} onChange={e => setEmisorPhone(e.target.value)} />
                            <div className="flex items-center space-x-2">
                                <Checkbox id="show-emisor-phone" checked={showEmisorPhone} onCheckedChange={(checked) => setShowEmisorPhone(checked as boolean)} />
                                <Label htmlFor="show-emisor-phone" className="text-xs text-muted-foreground font-normal">Mostrar en PDF</Label>
                            </div>
                        </div>
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
                    <div className="space-y-2">
                        <Label>Dirección Cliente</Label>
                        <div className="space-y-2 rounded-md border p-4">
                            <Input placeholder="Línea 1 de la dirección" value={clientAddress.addressLine1 || ''} onChange={e => setClientAddress(prev => ({...prev, addressLine1: e.target.value}))} />
                            <Input placeholder="Línea 2 (Opcional)" value={clientAddress.addressLine2 || ''} onChange={e => setClientAddress(prev => ({...prev, addressLine2: e.target.value}))} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Ciudad" value={clientAddress.city || ''} onChange={e => setClientAddress(prev => ({...prev, city: e.target.value}))} />
                                <Input placeholder="Código Postal" value={clientAddress.postalCode || ''} onChange={e => setClientAddress(prev => ({...prev, postalCode: e.target.value}))} />
                            </div>
                             <Select value={clientAddress.province || ''} onValueChange={value => setClientAddress(prev => ({...prev, province: value}))}>
                                <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
                                <SelectContent>
                                    {provincias.provincias.map(p => <SelectItem key={p.codigo} value={p.nombre}>{p.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input placeholder="País" value={clientAddress.country || 'España'} onChange={e => setClientAddress(prev => ({...prev, country: e.target.value}))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input placeholder="Email del cliente" value={clientEmail} onChange={e => setClientEmail(e.target.value)}/>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="show-email" checked={showClientEmail} onCheckedChange={(checked) => setShowClientEmail(checked as boolean)} />
                                <Label htmlFor="show-email" className="text-xs text-muted-foreground font-normal">Mostrar en PDF</Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input placeholder="Teléfono del cliente" value={clientPhone} onChange={e => setClientPhone(e.target.value)}/>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="show-phone" checked={showClientPhone} onCheckedChange={(checked) => setShowClientPhone(checked as boolean)} />
                                <Label htmlFor="show-phone" className="text-xs text-muted-foreground font-normal">Mostrar en PDF</Label>
                            </div>
                        </div>
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
                            <Switch id="save-terms" checked={saveTerminos} onCheckedChange={setSaveTerminos}/>
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
                            <Switch id="save-iban" checked={saveIban} onCheckedChange={setSaveIban}/>
                            <Label htmlFor="save-iban" className="text-xs text-muted-foreground">Establecer como forma de pago predeterminada</Label>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <div className="w-full space-y-2 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
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
                <div className="w-full space-y-1 text-right p-4 bg-muted rounded-md mt-4">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{subtotal.toFixed(2)} EUR</span></div>
                    <div className="flex justify-between"><span>IVA ({taxRate}%):</span><span>{taxAmount.toFixed(2)} EUR</span></div>
                    {applyIrpf && <div className="flex justify-between text-destructive"><span>IRPF (15%):</span><span>-{irpfAmount.toFixed(2)} EUR</span></div>}
                    <div className="font-bold text-lg flex justify-between"><span>Total:</span><span>{total.toFixed(2)} EUR</span></div>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
    </form>
    </>
  );
}
