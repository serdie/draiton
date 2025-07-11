
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
  Newspaper,
  FileEdit,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Panel de Control' },
  { href: '/dashboard/documentos', icon: <FileText />, label: 'Documentos' },
  { href: '/dashboard/gastos', icon: <Landmark />, label: 'Gastos' },
  { href: '/dashboard/contactos', icon: <Users />, label: 'Contactos' },
  { href: '/dashboard/proyectos', icon: <Briefcase />, label: 'Proyectos' },
  { href: '/dashboard/perspectivas-ia', icon: <BrainCircuit />, label: 'Perspectivas IA', role: 'pro' },
  { href: '/dashboard/marketing', icon: <Megaphone />, label: 'Marketing', role: 'pro' },
  { href: '/dashboard/web-ia', icon: <Palette />, label: 'Web IA', role: 'pro' },
  { href: '/dashboard/automatizaciones', icon: <Zap />, label: 'Automatizaciones', role: 'pro' },
  { href: '/dashboard/gestor-ia', icon: <Bot />, label: 'Gestor IA', role: 'pro'},
  { href: '/dashboard/conexiones', icon: <Link2 />, label: 'Conexiones' },
  { href: '/dashboard/configuracion', icon: <Settings />, label: 'Configuración' },
];

function UserAvatar({ user }: { user: User }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Usuario'} />
        <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
      </Avatar>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
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

  const userIsPro = user?.role === 'pro' || user?.role === 'admin';

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
            {navItems.map((item) => {
              if (item.role === 'pro' && !userIsPro) return null;
              return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              )
            })}
             {user?.role === 'admin' && (
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
