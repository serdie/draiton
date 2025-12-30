
"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AuthContext } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, Home, LineChart, Search, FileSignature, MonitorCog, ScanSearch } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils"
import * as React from "react"

const components: { title: string; href: string; description: string, icon: React.ReactNode }[] = [
  {
    title: "Marketing y Redes Sociales",
    href: "/herramientas-ia/marketing",
    description:
      "Genera contenido para campañas de email y redes sociales.",
    icon: <LineChart className="h-5 w-5" />
  },
  {
    title: "Buscador de Oportunidades",
    href: "/herramientas-ia/oportunidades",
    description: "Encuentra ayudas, subvenciones y clientes potenciales.",
    icon: <Search className="h-5 w-5" />
  },
  {
    title: "Asistente Fiscal",
    href: "/herramientas-ia/asistente-fiscal",
    description: "Recibe ayuda para cumplimentar los modelos de impuestos.",
    icon: <FileSignature className="h-5 w-5" />
  },
  {
    title: "Gestor y Analizador Web",
    href: "/herramientas-ia/gestor-web",
    description:
      "Crea o analiza tu sitio web para recibir un informe detallado.",
    icon: <MonitorCog className="h-5 w-5" />
  },
  {
    title: "Digitalización Inteligente",
    href: "/herramientas-ia/digitalizacion",
    description:
      "Extrae datos de facturas y tickets con solo una foto.",
    icon: <ScanSearch className="h-5 w-5" />
  },
]

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" alt="Draiton Logo" width={110} height={40} className="h-7 w-auto" />
          </Link>
          <nav className="hidden items-center gap-2 text-sm md:flex">
             <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/caracteristicas" className={navigationMenuTriggerStyle()}>
                        Características
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Herramientas IA</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                          icon={component.icon}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                 <NavigationMenuItem>
                    <Link href="/#pricing" className={navigationMenuTriggerStyle()}>
                        Precios
                    </Link>
                </NavigationMenuItem>
                 <NavigationMenuItem>
                    <Link href="/control-horario" className={navigationMenuTriggerStyle()}>
                        Control Horario
                    </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Usuario'} />
                       <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
                     </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <Link href="/dashboard">
                     <DropdownMenuItem>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Escritorio</span>
                     </DropdownMenuItem>
                   </Link>
                  <Link href="/dashboard/configuracion">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/seleccionar-plan">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-md">{icon}</div>
            <div>
                <div className="text-sm font-medium leading-none">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {children}
                </p>
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
