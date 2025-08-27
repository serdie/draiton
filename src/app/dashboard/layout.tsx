
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Settings,
  LogOut,
  UserCog,
  Home,
  Wallet,
  Blocks,
  FlaskConical,
  Network,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNav } from '@/components/ui/mobile-nav';
import { MobileHeader } from '@/components/ui/mobile-header';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isPro } = useContext(AuthContext);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return null;
  }
  
  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  const getPageTitle = () => {
    if (isActive('/dashboard/finanzas')) return 'Finanzas';
    if (isActive('/dashboard/proyectos')) return 'Operaciones';
    if (isActive('/dashboard/gestor-ia')) return 'Herramientas IA';
    if (isActive('/dashboard/conexiones')) return 'Conexiones';
    if (isActive('/dashboard/configuracion') || isActive('/dashboard/mi-perfil')) return 'Configuración';
    if (isActive('/admin/dashboard')) return 'Administración';
    return 'Dashboard';
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
          <MobileHeader title={getPageTitle()} />
          <main className="flex-1 overflow-y-auto bg-background p-4">
              {children}
          </main>
          <MobileNav />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-lg">Emprende Total</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/finanzas">
                <SidebarMenuButton isActive={isActive('/dashboard/finanzas')} tooltip="Finanzas">
                  <Wallet />
                  <span>Finanzas</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/proyectos">
                <SidebarMenuButton isActive={isActive('/dashboard/proyectos')} tooltip="Operaciones">
                  <Blocks />
                  <span>Operaciones</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/dashboard/gestor-ia">
                  <SidebarMenuButton isActive={isActive('/dashboard/gestor-ia')} tooltip="Herramientas IA">
                  <FlaskConical />
                  <span>Herramientas IA</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/dashboard/configuracion">
                <SidebarMenuButton isActive={isActive('/dashboard/configuracion')} tooltip="Configuración">
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

             {isAdmin && (
                <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                    <SidebarMenuButton isActive={isActive('/admin/dashboard')} tooltip="Admin Panel">
                        <UserCog />
                        <span>Administración</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='p-4 space-y-4'>
          {!isPro && (
            <div className='p-4 bg-secondary rounded-lg text-center'>
              <p className='font-bold'>Upgrade a Pro</p>
              <p className='text-sm text-muted-foreground mt-1 mb-3'>Desbloquea todo el potencial de la IA para tu negocio.</p>
              <Button asChild size="sm" className="w-full">
                 <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 lg:px-8">
            <div className="text-xl font-semibold">
              {getPageTitle()}
            </div>
            <div className="flex-1 flex justify-end items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar proyectos, facturas..." className="pl-10 bg-muted border-muted focus:bg-background" />
                </div>
                {isPro && <Badge variant="outline" className='border-yellow-400 bg-yellow-400/10 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400'>PRO</Badge>}
                 <Button asChild variant="ghost" size="icon">
                  <Link href="/dashboard/configuracion">
                    <Settings className="h-5 w-5"/>
                  </Link>
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className='flex items-center gap-3 cursor-pointer'>
                        <UserAvatar user={user} />
                        <div className="hidden md:flex flex-col items-start">
                          <span className="font-semibold text-sm">{user?.displayName || 'Usuario'}</span>
                          <span className="text-xs text-muted-foreground">Autónomo</span>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/configuracion">
                            <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configuración</span>
                            </DropdownMenuItem>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin/dashboard">
                            <DropdownMenuItem>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                            </DropdownMenuItem>
                          </Link>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/50 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
