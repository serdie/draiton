
'use client';

import { NominasTab } from '../nominas-tab';
import { FichajesTab } from './fichajes-tab';

// Este componente ahora podría considerarse obsoleto o refactorizarse, 
// ya que las pestañas se han movido al nivel superior de `finanzas/page.tsx`.
// Por ahora, lo mantenemos simple.

export function EmpleadosPageContent() {
    return (
        <div className="space-y-6">
            <NominasTab />
            <FichajesTab />
        </div>
    )
}
