
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Instagram, Linkedin, FilePlus, UserPlus, FolderPlus, MessageSquare } from 'lucide-react';
import { type Action } from './action-card';

const availableActions: Omit<Action, 'id'>[] = [
  { type: 'gmail', title: 'Enviar un Email', description: 'Mandar un correo a través de Gmail.', icon: <Mail /> },
  { type: 'instagram', title: 'Publicar en Instagram', description: 'Crear una nueva publicación en Instagram.', icon: <Instagram /> },
  { type: 'linkedin', title: 'Publicar en LinkedIn', description: 'Crear una nueva publicación en LinkedIn.', icon: <Linkedin /> },
  { type: 'create_invoice', title: 'Generar Factura', description: 'Crear una nueva factura en el sistema.', icon: <FilePlus /> },
  { type: 'create_contact', title: 'Crear Contacto', description: 'Añadir un nuevo contacto al CRM.', icon: <UserPlus /> },
  { type: 'save_drive', title: 'Guardar en Google Drive', description: 'Guardar un archivo en una carpeta de Drive.', icon: <FolderPlus /> },
  { type: 'send_whatsapp', title: 'Enviar WhatsApp', description: 'Mandar un mensaje a través de WhatsApp.', icon: <MessageSquare /> },
];

interface ActionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: Omit<Action, 'id'>) => void;
}

export function ActionSelector({ isOpen, onClose, onSelectAction }: ActionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActions = availableActions.filter((action) =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (action: Omit<Action, 'id'>) => {
    onSelectAction(action);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Elige una Acción</DialogTitle>
          <DialogDescription>
            Selecciona el paso que se ejecutará en tu automatización.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <Input
            placeholder="Buscar acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
            {filteredActions.map((action) => (
              <Card
                key={action.type}
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleSelect(action)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="text-primary">{action.icon}</div>
                  <div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
