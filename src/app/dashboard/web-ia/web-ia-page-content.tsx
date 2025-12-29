
'use client';

import { useState, useEffect } from 'react';
import { GestorWebForm } from './gestor-web-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitorCog, PlusCircle, ExternalLink, Settings, Sparkles, Wand2, Trash2, Upload } from 'lucide-react';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';
import { ConnectSiteModal } from './connect-site-modal';
import Image from 'next/image';
import Link from 'next/link';
import { ImproveWebForm } from './improve-web-form';
import type { AnalyzeWebsiteOutput } from '@/ai/flows/analyze-website';

type GetWebsiteConceptAction = (
    currentState: { output: AIPoweredWebManagementOutput | null; error: string | null },
    formData: FormData
) => Promise<{ output: AIPoweredWebManagementOutput | null; error: string | null }>;

type AnalyzeWebsiteAction = (
    currentState: { output: AnalyzeWebsiteOutput | null; error: string | null },
    formData: FormData
) => Promise<{ output: AnalyzeWebsiteOutput | null; error: string | null }>;


export type Site = {
    id: string;
    name: string;
    url: string;
    description: string;
}

type SavedTemplate = AIPoweredWebManagementOutput & {
    id: string;
    name: string;
};


const SiteCard = ({ site }: { site: Site }) => {
    const screenshotUrl = `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(site.url)}?w=400&h=300`;

    return (
        <Card>
            <CardHeader className="p-0">
                <Image 
                    src={screenshotUrl} 
                    alt={`Captura de pantalla de ${site.name}`} 
                    width={400} 
                    height={300} 
                    className="rounded-t-lg w-full h-auto object-cover border-b"
                    data-ai-hint="website screenshot"
                />
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-lg">{site.name}</CardTitle>
                <CardDescription className="mt-1">{site.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                    <Link href={site.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visitar
                    </Link>
                </Button>
                <Button variant="secondary">
                     <Settings className="mr-2 h-4 w-4" />
                    Gestionar
                </Button>
            </CardFooter>
        </Card>
    )
}


export function WebIAPageContent({ getWebsiteConceptAction, analyzeWebsiteAction }: { 
    getWebsiteConceptAction: GetWebsiteConceptAction,
    analyzeWebsiteAction: AnalyzeWebsiteAction 
}) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectedSites, setConnectedSites] = useState<Site[]>([]);
  const [generatedSite, setGeneratedSite] = useState<AIPoweredWebManagementOutput | null>(null);
  
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  // Load templates from localStorage on initial render
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem('savedWebTemplates');
      if (storedTemplates) {
        setSavedTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load templates from localStorage", error);
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedWebTemplates', JSON.stringify(savedTemplates));
    } catch (error) {
      console.error("Failed to save templates to localStorage", error);
    }
  }, [savedTemplates]);


  const handleConnectSite = (newSite: Omit<Site, 'id'>) => {
    setConnectedSites(prevSites => [
        ...prevSites,
        {
            id: `site-${Date.now()}`,
            ...newSite
        }
    ]);
  }

  const handleSaveTemplate = (templateContent: AIPoweredWebManagementOutput | null) => {
    if (!templateContent) return;
    const newTemplate: SavedTemplate = {
        ...templateContent,
        id: `template-${Date.now()}`,
        name: `Plantilla - ${new Date().toLocaleString('es-ES')}`,
    };
    setSavedTemplates(prev => [newTemplate, ...prev]);
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
      setGeneratedSite(template);
  }

  const handleDeleteTemplate = (templateId: string) => {
      setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
  }


  return (
    <>
    <ConnectSiteModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)}
        onConnectSite={handleConnectSite}
    />
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Gestor Web con IA</h1>
        <p className="text-muted-foreground">
          Crea y gestiona tu página web, tienda online o landing page con IA. Describe tu negocio y preferencias, y deja que la IA haga el resto.
        </p>
      </div>
      
      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="crear">Crear Nuevo Sitio</TabsTrigger>
            <TabsTrigger value="mejorar">Mejorar Web</TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar Sitios</TabsTrigger>
        </TabsList>
        <TabsContent value="crear" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary" />
                Crear un nuevo sitio web
              </CardTitle>
              <CardDescription>Proporciona los detalles para que la IA pueda generar un concepto a tu medida.</CardDescription>
            </CardHeader>
            <CardContent>
              <GestorWebForm 
                action={getWebsiteConceptAction}
                generatedSite={generatedSite} 
                setGeneratedSite={setGeneratedSite} 
                onSaveTemplate={handleSaveTemplate} 
              />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="mejorar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Analizar y Mejorar mi Web
              </CardTitle>
              <CardDescription>Introduce la URL de tu sitio web y la IA te dará un informe con puntos de mejora.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImproveWebForm action={analyzeWebsiteAction} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gestionar" className="mt-6">
            <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Plantillas Guardadas</CardTitle>
                            <CardDescription>Carga una plantilla para seguir editándola o descargarla.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {savedTemplates.length > 0 ? (
                                <div className="space-y-3">
                                    {savedTemplates.map(template => (
                                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div>
                                                <p className="font-semibold">{template.name}</p>
                                                <p className="text-sm text-muted-foreground">{template.hero.title}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleLoadTemplate(template)}>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Cargar
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => handleDeleteTemplate(template.id)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No tienes plantillas guardadas.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                        <CardTitle>Mis Sitios Web Conectados</CardTitle>
                        <CardDescription>Gestiona tus sitios externos.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => setIsConnectModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Conectar Sitio Externo
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {connectedSites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connectedSites.map(site => (
                                    <SiteCard key={site.id} site={site} />
                                ))}
                        </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[200px]">
                                <MonitorCog className="h-12 w-12 mb-4" />
                                <p>Aún no has conectado ningún sitio web externo.</p>
                            </div>
                        )}
                    </CardContent>
                    </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
