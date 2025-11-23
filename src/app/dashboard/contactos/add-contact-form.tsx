
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Loader2, PlusCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { provincias } from '@/lib/provincias';


const addressSchema = z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

const contactFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  email: z.string().email({ message: 'Introduce un correo electrónico válido.' }),
  phone: z.string().optional(),
  company: z.string().optional(),
  cif: z.string().optional(),
  address: addressSchema.optional(),
  type: z.enum(['Cliente', 'Proveedor', 'Lead', 'Colaborador']),
  notes: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function AddContactForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactTypes, setContactTypes] = useState(['Cliente', 'Proveedor', 'Lead', 'Colaborador']);
  const [newTypeName, setNewTypeName] = useState('');
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);


  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      cif: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'España',
      },
      type: 'Cliente',
      notes: '',
    },
  });

  const handleAddContactType = () => {
    if (newTypeName && !contactTypes.includes(newTypeName)) {
        setContactTypes([...contactTypes, newTypeName]);
    }
    setNewTypeName('');
    setIsAddTypeDialogOpen(false);
  }

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: 'Debes iniciar sesión para añadir un contacto.',
        });
        setIsSubmitting(false);
        return;
    }
    
    const contactData = {
        ...data,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, "contacts"), contactData);
        toast({
            title: 'Contacto Añadido',
            description: `Se ha añadido a ${data.name} a tus contactos.`,
        });
        onClose();
    } catch (error) {
        console.error("Error al añadir contacto: ", error);
        toast({
            variant: 'destructive',
            title: 'Error al añadir contacto',
            description: 'No se pudo añadir el contacto. Revisa las reglas de Firestore.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder="Ej: juan.perez@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej: +34 600 123 456" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Acme Corp" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CIF/NIF</FormLabel>
              <FormControl>
                <Input placeholder="Ej: B12345678" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="space-y-2">
            <FormLabel>Dirección</FormLabel>
            <div className="space-y-2 rounded-md border p-4">
                <FormField control={form.control} name="address.addressLine1" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Línea 1 de la dirección" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="address.addressLine2" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Línea 2 (Opcional)" {...field} /></FormControl></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="address.city" render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Ciudad" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="address.postalCode" render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Código Postal" {...field} /></FormControl></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="address.province" render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {provincias.provincias.map(p => <SelectItem key={p.codigo} value={p.nombre}>{p.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="address.country" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="País" {...field} /></FormControl></FormItem>
                )} />
            </div>
        </div>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
                <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Añadir Nuevo Tipo de Contacto</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="new-type-name" className="text-right">
                                    Nombre
                                    </Label>
                                    <Input
                                    id="new-type-name"
                                    value={newTypeName}
                                    onChange={(e) => setNewTypeName(e.target.value)}
                                    className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddContactType}>Añadir Tipo</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cualquier nota relevante..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Añadir Contacto
          </Button>
        </div>
      </form>
    </Form>
  );
}
