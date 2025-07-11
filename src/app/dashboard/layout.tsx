
'use client';

import { useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext, User } from '@/context/auth-context';
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
import { UserAvatar } from '@/components/ui/user-avatar';
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
  Newspaper,
  FileEdit,
  Loader2,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Panel de Control' },
  { href: '/dashboard/documentos', icon: <FileText />, label: 'Documentos' },
  { href: '/dashboard/gastos', icon: <Landmark />, label: 'Gastos' },
  { href: '/dashboard/contactos', icon: <Users />, label: 'Contactos' },
  { href: '/dashboard/proyectos', icon: <Briefcase />, label: 'Proyectos' },
  { href: '/dashboard/perspectivas-ia', icon: <BrainCircuit />, label: 'Perspectivas IA', pro: true },
  { href: '/dashboard/marketing', icon: <Megaphone />, label: 'Marketing', pro: true },
  { href: '/dashboard/web-ia', icon: <Palette />, label: 'Web IA', pro: true },
  { href: '/dashboard/automatizaciones', icon: <Zap />, label: 'Automatizaciones', pro: true },
  { href: '/dashboard/gestor-ia', icon: <Bot />, label: 'Gestor IA', pro: true },
  { href: '/dashboard/conexiones', icon: <Link2 />, label: 'Conexiones' },
  { href: '/dashboard/configuracion', icon: <Settings />, label: 'Configuración' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // or a login form, but we redirect so this is fine
  }

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
                <Link href={item.href} className="flex w-full items-center justify-between">
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={item.label}
                    className="flex-grow"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             {isAdmin && (
                <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/admin')}
                        tooltip="Panel de Admin"
                    >
                        <Shield />
                        <span>Panel de Admin</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer w-full text-left">
                    <UserAvatar user={user} />
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate">{user.displayName || 'Usuario'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
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
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
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
