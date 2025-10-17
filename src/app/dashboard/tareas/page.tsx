

'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function TareasPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Tablero de Tareas</h2>
            </div>
            <p className="text-muted-foreground">Próximamente: Un tablero Kanban dedicado para todas tus tareas, independientemente del proyecto.</p>
        </div>
    );
}
