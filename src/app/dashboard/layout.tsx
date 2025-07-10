'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  FileText,
  Landmark,
  Users,
  Briefcase,
  BrainCircuit,
  Megaphone,
  Palette,
  Zap,
  Bot,
  Link2,
  Settings,
  LogOut,
  ScanLine,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Panel de Control' },
  { href: '/dashboard/documentos', icon: <FileText />, label: 'Documentos' },
  { href: '/dashboard/gastos', icon: <Landmark />, label: 'Gastos' },
  { href: '/dashboard/contactos', icon: <Users />, label: 'Contactos' },
  { href: '/dashboard/proyectos', icon: <Briefcase />, label: 'Proyectos' },
  { href: '/dashboard/perspectivas-ia', icon: <BrainCircuit />, label: 'Perspectivas IA' },
  { href: '/dashboard/marketing', icon: <Megaphone />, label: 'Marketing' },
  { href: '/dashboard/web-ia', icon: <Palette />, label: 'Web IA' },
  { href: '/dashboard/automatizaciones', icon: <Zap />, label: 'Automatizaciones' },
  { href: '/dashboard/asistente-ia', icon: <Bot />, label: 'Asistente IA' },
  { href: '/dashboard/integraciones', icon: <Link2 />, label: 'Integraciones' },
  { href: '/dashboard/configuracion', icon: <Settings />, label: 'Configuración' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <span className="text-lg font-semibold">Emprende Total</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer w-full text-left">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Usuario" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate">Usuario</span>
                        <span className="text-xs text-muted-foreground truncate">usuario@email.com</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/configuracion">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/">
                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 lg:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 text-right">
            <Link href="/dashboard/configuracion">
             <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5"/>
             </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
