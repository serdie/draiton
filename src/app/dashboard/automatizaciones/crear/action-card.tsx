'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Trash2 } from 'lucide-react';

export type Action = {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

interface ActionCardProps {
  action: Action;
  onRemove: () => void;
}

export function ActionCard({ action, onRemove }: ActionCardProps) {
  return (
    <Card className="w-full relative group">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground">{action.icon}</div>
          <div>
            <CardTitle className="text-base">{action.title}</CardTitle>
            <CardDescription>{action.description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" aria-label="Configurar acción">
                <Settings className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onRemove} aria-label="Eliminar acción">
                <Trash2 className="h-4 w-4"/>
            </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
