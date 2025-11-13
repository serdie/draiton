
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { CheckCircle, Eye, Shield, Clock, BookOpen, Signature, Loader2 } from 'lucide-react';
import type { Employee } from '../finanzas/empleados/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrainingModuleProps {
    employee: Employee;
}

const trainingSteps = [
    {
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        title: "Introducción a la Formación Obligatoria",
        content: "Este módulo es un requisito legal. Cubre la normativa de Protección de Datos (RGPD y LOPD-GDD) y el sistema de Registro de Jornada. Al finalizar y firmar, acreditas haber recibido y comprendido esta información crucial para tu relación laboral.",
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Protección de Datos Personales (RGPD)",
        content: "La empresa, como Responsable del Tratamiento, recopila tus datos (identificativos, bancarios, de Seguridad Social, etc.) con la única finalidad de gestionar la relación laboral, elaborar nóminas y cumplir con las obligaciones legales en materia laboral, fiscal y de Seguridad Social. La base legal para este tratamiento es tu contrato de trabajo.",
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Cesión y Conservación de Datos",
        content: "Tus datos personales solo se cederán a terceros cuando exista una obligación legal para ello (ej. a la Agencia Tributaria, Tesorería General de la Seguridad Social, Mutuas Colaboradoras, etc.). Tus datos se conservarán mientras dure la relación laboral y, una vez finalizada, durante los plazos legalmente exigidos para la prescripción de posibles responsabilidades.",
    },
    {
        icon: <Eye className="h-8 w-8 text-primary" />,
        title: "Tus Derechos (ARSOPOL-i)",
        content: "Puedes ejercer tus derechos de Acceso, Rectificación, Supresión, Oposición, Portabilidad de los datos, Limitación del tratamiento y a no ser objeto de decisiones individualizadas automatizadas. Para ello, contacta con la empresa. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (aepd.es) si consideras que tus derechos han sido vulnerados.",
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: "Registro de Jornada Obligatorio (RDL 8/2019)",
        content: "De acuerdo con el Real Decreto-ley 8/2019, es obligatorio el registro diario de la jornada de trabajo. Debes registrar la hora exacta de inicio y fin de tu jornada laboral, así como todas las pausas que realices durante la misma. Este registro sirve para garantizar el cumplimiento de los límites de tiempo de trabajo y la correcta remuneración de las horas extraordinarias si las hubiera.",
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: "Funcionamiento del Sistema de Fichaje",
        content: "Debes utilizar el sistema de fichaje proporcionado en tu portal de empleado para registrar cada entrada, salida y pausa. Es tu responsabilidad asegurar que todos los registros son correctos y reflejan tu jornada real. La empresa está obligada a conservar estos registros durante un periodo de 4 años, estando a disposición de los trabajadores, sus representantes legales y la Inspección de Trabajo y Seguridad Social.",
    },
    {
        icon: <CheckCircle className="h-8 w-8 text-primary" />,
        title: "Finalización y Firma",
        content: "Has completado la formación teórica. Para finalizar y acreditar que has recibido y comprendido toda la información anterior, debes firmar digitalmente el documento en la siguiente, y última, sección.",
    }
];

export function TrainingModule({ employee }: TrainingModuleProps) {
    const { toast } = useToast();
    const [api, setApi] = useState<CarouselApi>();
    const [progress, setProgress] = useState(employee.rgpdTrainingProgress || 0);
    const [isSigned, setIsSigned] = useState(!!employee.rgpdTrainingCompletedAt);
    
    // Signature form state
    const [signatureName, setSignatureName] = useState('');
    const [signatureNif, setSignatureNif] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!api) return;

        const updateProgress = () => {
            const current = api.selectedScrollSnap() + 1;
            const count = api.scrollSnapList().length;
            const newProgress = Math.round((current / count) * 100);
            setProgress(newProgress);
        };
        
        updateProgress();
        api.on("select", updateProgress);

        return () => {
            api.off("select", updateProgress);
        };
    }, [api]);
    
    const handleSign = async () => {
        if (signatureName.toLowerCase() !== employee.name.toLowerCase() || signatureNif.toLowerCase() !== employee.nif.toLowerCase()) {
            toast({
                variant: 'destructive',
                title: 'Datos no coinciden',
                description: 'El nombre completo y/o el NIF introducidos no coinciden con tu perfil.',
            });
            return;
        }

        setIsSaving(true);
        const employeeRef = doc(db, 'employees', employee.id);
        try {
            await updateDoc(employeeRef, {
                rgpdTrainingProgress: 100,
                rgpdTrainingCompletedAt: serverTimestamp(),
                rgpdTrainingSignature: {
                    name: signatureName,
                    nif: signatureNif,
                }
            });
            toast({
                title: 'Formación Firmada Correctamente',
                description: 'Has acreditado la finalización del curso.',
            });
            setIsSigned(true);
        } catch (error) {
            console.error("Error al firmar la formación: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar la firma. Inténtalo de nuevo.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isSigned && employee.rgpdTrainingCompletedAt) {
         return (
             <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-6 w-6" />
                        Formación Obligatoria Completada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-green-800 dark:text-green-400">
                        Has completado y firmado correctamente la formación sobre RGPD y Control Horario el día {format(employee.rgpdTrainingCompletedAt.toDate(), "dd 'de' MMMM, yyyy", { locale: es })}. No se requiere ninguna acción adicional.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Formación Obligatoria: RGPD y Control Horario</CardTitle>
                <CardDescription>Completa este curso para cumplir con la normativa.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <Progress value={progress} className="w-full" />
                    {progress < 100 ? (
                        <Carousel setApi={setApi} className="w-full max-w-full overflow-hidden">
                            <CarouselContent>
                                {trainingSteps.map((step, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <div className="p-6 rounded-lg bg-muted flex flex-col items-center text-center min-h-[16rem] justify-start">
                                                {step.icon}
                                                <h3 className="text-lg font-semibold mt-4">{step.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-2">{step.content}</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </Carousel>
                    ) : (
                         <div className="p-6 rounded-lg bg-green-500/10 text-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                            <h3 className="text-lg font-semibold">¡Curso completado!</h3>
                            <p className="text-sm text-muted-foreground">Ahora solo falta tu firma digital para acreditarlo.</p>
                        </div>
                    )}
                </div>
            </CardContent>
            {progress >= (100 / trainingSteps.length) * (trainingSteps.length -1) && !isSigned && (
                <CardFooter className="flex-col items-start space-y-4 border-t pt-6">
                    <div className="space-y-2 w-full">
                         <h3 className="font-semibold flex items-center gap-2">
                            <Signature className="h-5 w-5" />
                            Firma de Acreditación
                        </h3>
                         <p className="text-sm text-muted-foreground">
                            Introduce tu nombre completo y NIF/DNI tal como aparecen en tu perfil para firmar.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="signature-name">Nombre Completo</Label>
                                <Input id="signature-name" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="signature-nif">NIF / DNI</Label>
                                <Input id="signature-nif" value={signatureNif} onChange={(e) => setSignatureNif(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleSign} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Firmar y Finalizar
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
