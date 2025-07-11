
'use client';

import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';

export default function WebIAPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tu Asistente Web Inteligente</h1>
          <p className="text-muted-foreground">
            Crea y administra tu presencia online: sitios web, tiendas online y landing pages con el poder de la IA.
          </p>
        </div>
      </div>
      
      <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />

    </div>
  );
}
