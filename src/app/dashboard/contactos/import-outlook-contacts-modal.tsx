
'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { importOutlookContacts, getOutlookContacts } from '@/lib/firebase/contact-actions';

interface ImportOutlookContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OutlookContact = {
  id: string;
  displayName: string;
  emailAddresses: { address: string }[];
  businessPhones: string[];
};

const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function ImportOutlookContactsModal({ isOpen, onClose }: ImportOutlookContactsModalProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<OutlookContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    async function fetchContacts() {
        if (!isOpen) return;
        
        setIsLoading(true);
        const result = await getOutlookContacts();

        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Error al Cargar Contactos',
                description: result.error,
            });
            setContacts([]);
        } else {
            setContacts(result.contacts || []);
        }
        setIsLoading(false);
    }

    fetchContacts();
  }, [isOpen, toast]);
  
  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };
  
  const handleImport = async () => {
    if (selectedContacts.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No hay contactos seleccionados',
            description: 'Por favor, selecciona al menos un contacto para importar.',
        });
        return;
    }
    setIsImporting(true);

    const contactsToImport = contacts.filter(c => selectedContacts.includes(c.id))
        .map(c => ({
            name: c.displayName || 'Sin Nombre',
            email: c.emailAddresses?.[0]?.address || '',
            phone: c.businessPhones?.[0] || '',
        }));
    
    const result = await importOutlookContacts(contactsToImport);

    if (result.success) {
        toast({
            title: 'Importación Exitosa',
            description: `${result.count} contactos han sido importados.`
        });
        onClose();
    } else {
        toast({
            variant: 'destructive',
            title: 'Error en la Importación',
            description: result.error,
        });
    }
    
    setIsImporting(false);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.emailAddresses?.[0]?.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Contactos de Outlook</DialogTitle>
          <DialogDescription>
            Selecciona los contactos que quieres importar a tu CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <div className="flex-1 overflow-hidden">
            {isLoading ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                 <ScrollArea className="h-full pr-4 -mr-4">
                    {filteredContacts.length > 0 ? filteredContacts.map(contact => (
                        <div
                            key={contact.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"
                        >
                            <Checkbox
                                id={contact.id}
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={() => handleSelectContact(contact.id)}
                            />
                            <label
                                htmlFor={contact.id}
                                className="flex-1 flex items-center gap-3 cursor-pointer"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{getInitials(contact.displayName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{contact.displayName || 'Sin Nombre'}</p>
                                    <p className="text-xs text-muted-foreground">{contact.emailAddresses?.[0]?.address}</p>
                                </div>
                            </label>
                        </div>
                    )) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No se encontraron contactos.</p>
                        </div>
                    )}
                 </ScrollArea>
            )}
        </div>
        <DialogFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground mr-auto">{selectedContacts.length} contactos seleccionados</p>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>Cancelar</Button>
          <Button onClick={handleImport} disabled={isImporting || selectedContacts.length === 0}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
