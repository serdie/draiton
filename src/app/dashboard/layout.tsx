
'use client';

import { useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Settings,
  LogOut,
  Shield,
  Home,
  Wallet,
  Blocks,
  FlaskConical,
  UserCog,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return null;
  }
  
  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/finanzas')) return 'Finanzas';
    if (pathname.startsWith('/dashboard/operaciones')) return 'Operaciones';
    if (pathname.startsWith('/dashboard/herramientas-ia')) return 'Herramientas IA';
    if (pathname.startsWith('/dashboard/admin')) return 'Administración';
    return 'Dashboard';
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton isActive={isActive('/dashboard') && pathname === '/dashboard'} tooltip="Panel de Control">
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
                <Link href="/dashboard/operaciones">
                    <SidebarMenuButton isActive={isActive('/dashboard/operaciones')} tooltip="Operaciones">
                        <Blocks />
                        <span>Operaciones</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/dashboard/herramientas-ia">
                    <SidebarMenuButton isActive={isActive('/dashboard/herramientas-ia')} tooltip="Herramientas IA">
                        <FlaskConical />
                        <span>Herramientas IA</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            
             {isAdmin && (
                <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                    <SidebarMenuButton isActive={pathname.startsWith('/admin')} tooltip="Panel de Admin">
                        <UserCog />
                        <span>Administración</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='p-4 space-y-4'>
          <div className='p-4 bg-secondary rounded-lg text-center'>
            <p className='font-bold'>Upgrade a Pro</p>
            <p className='text-sm text-muted-foreground mt-1 mb-3'>Desbloquea todo el potencial de la IA para tu negocio.</p>
            <Button size="sm" className="w-full">Ver Planes</Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 lg:px-8">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <h2 className="text-2xl font-bold hidden md:block">{getPageTitle()}</h2>
            <div className="flex-1 flex justify-end items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar proyectos, facturas..." className="pl-10" />
                </div>
                <Badge variant="outline" className='border-yellow-400 text-yellow-400'>PRO</Badge>
                <Button variant="ghost" size="icon">
                    <Bell />
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <UserAvatar user={user} />
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="font-medium text-sm">{user.displayName || 'Usuario'}</span>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
