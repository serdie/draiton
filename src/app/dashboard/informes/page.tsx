
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, FileText, Copy, Download, Mail } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '../proyectos/page';

export default function InformesPage() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatedReport, setGeneratedReport] = useState<string | null>(null);

    useEffect(() => {
        if (!db || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(docsList);
            setLoading(false);
        }, (error) => {
            toast({ variant: 'destructive', title: 'Error de Permisos', description: 'No se pudieron cargar los proyectos. Revisa tus reglas de seguridad de Firestore.' });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, toast]);

    const handleGenerateReport = () => {
        setGeneratedReport(`**Informe de Progreso - Resumen Interno (Q3 2024)**

**1. Resumen Ejecutivo:**
El proyecto "Desarrollo Web Corporativa" para Tech Solutions avanza según lo planeado, con un 75% de las tareas completadas. El equipo ha mostrado un rendimiento excelente, superando los hitos clave de diseño y desarrollo inicial. El presupuesto se mantiene dentro de los límites establecidos, con un gasto actual del 60%.

**2. Hitos Clave Completados:**
-   **Diseño UI/UX Aprobado:** 15 de Julio, 2024
-   **Desarrollo del Frontend (Componentes Principales):** 1 de Agosto, 2024
-   **Configuración del Backend y Base de Datos:** 10 de Agosto, 2024

**3. Próximos Pasos:**
-   Integración del CMS y funcionalidades del blog.
-   Fase de Pruebas y QA.
-   Lanzamiento y despliegue final.

**4. Riesgos y Mitigaciones:**
-   **Riesgo:** Posible retraso en la entrega de contenido por parte del cliente.
-   **Mitigación:** Se ha establecido un calendario de contenido compartido y recordatorios automáticos.
`);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card className="bg-secondary/50 border-border/30">
                    <CardHeader>
                        <CardTitle>Generador de Informes IA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="report-project">Seleccionar Proyecto (Opcional)</Label>
                             <Select>
                                <SelectTrigger id="report-project">
                                    <SelectValue placeholder="Todos los proyectos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los proyectos</SelectItem>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="report-type">Tipo de Informe</Label>
                            <Select>
                                <SelectTrigger id="report-type">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="progreso">Informe de Progreso</SelectItem>
                                    <SelectItem value="financiero">Resumen Financiero</SelectItem>
                                    <SelectItem value="tareas">Detalle de Tareas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="report-audience">Destinatario del Informe</Label>
                            <Select>
                                <SelectTrigger id="report-audience">
                                    <SelectValue placeholder="Seleccionar destinatario" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="interno">Resumen Interno (Jefe de Proyecto)</SelectItem>
                                    <SelectItem value="cliente">Reporte para el Cliente</SelectItem>
                                    <SelectItem value="equipo">Feedback para el Equipo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="report-period">Periodo</Label>
                            <Select>
                                <SelectTrigger id="report-period">
                                    <SelectValue placeholder="Seleccionar periodo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semana">Última Semana</SelectItem>
                                    <SelectItem value="mes">Último Mes</SelectItem>
                                    <SelectItem value="trimestre">Último Trimestre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" onClick={handleGenerateReport}>
                            <Sparkles className="mr-2 h-4 w-4"/>
                            Generar con IA
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card className="bg-secondary/50 border-border/30 min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Informe Generado</CardTitle>
                         {generatedReport && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1">
                        {generatedReport ? (
                            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                                {generatedReport}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <FileText className="h-12 w-12 mb-4"/>
                                <p>El informe generado por la IA aparecerá aquí.</p>
                            </div>
                        )}
                       
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
