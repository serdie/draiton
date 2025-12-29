
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Facebook, Instagram, Linkedin, MessageSquare } from 'lucide-react';
import { CreatePostModal } from './create-post-modal';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ScheduledPost = {
  id: string;
  date: Date;
  content: string;
  platform: 'facebook' | 'instagram' | 'linkedin';
}

const initialPosts: ScheduledPost[] = [
    { id: '1', date: new Date(new Date().setDate(new Date().getDate() + 2)), content: "¡Gran descuento en nuestros cursos de verano!", platform: 'instagram' },
    { id: '2', date: new Date(new Date().setDate(new Date().getDate() + 3)), content: "Artículo del blog: 5 claves para el éxito.", platform: 'linkedin' },
    { id: '3', date: new Date(new Date().setDate(new Date().getDate() + 3)), content: "¡No te pierdas nuestro nuevo producto!", platform: 'facebook' },
];

const PlatformIcon = ({ platform }: { platform: ScheduledPost['platform']}) => {
    switch(platform) {
        case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
        case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
        case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-800" />;
    }
}


export default function RedesSocialesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);

  const postsForDay = (day: Date) => {
    return posts.filter(post => post.date.toDateString() === day.toDateString());
  }

  return (
    <>
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-bold">Gestión de Redes Sociales</h1>
                <p className="text-muted-foreground">
                    Planifica, crea y programa tu contenido para todas tus redes.
                </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Publicación
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario de Publicaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="p-0"
                            components={{
                                DayContent: ({ date }) => {
                                    const dayPosts = postsForDay(date);
                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <span>{date.getDate()}</span>
                                            {dayPosts.length > 0 && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div className="absolute bottom-1 flex gap-1">
                                                            {dayPosts.slice(0,3).map(p => <div key={p.id} className="h-1.5 w-1.5 rounded-full bg-primary" />)}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-60">
                                                        <div className="font-semibold text-sm mb-2">
                                                            Publicaciones para {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}:
                                                        </div>
                                                        <div className="space-y-2">
                                                            {dayPosts.map(p => (
                                                                <div key={p.id} className="flex items-start gap-2 text-xs">
                                                                    <PlatformIcon platform={p.platform} />
                                                                    <p className="truncate">{p.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    )
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-1 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Cuentas Conectadas</CardTitle>
                         <CardDescription>
                            Las cuentas que conectes aparecerán aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Aún no has conectado ninguna cuenta.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/dashboard/conexiones">Gestionar Conexiones</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </>
  );
}
