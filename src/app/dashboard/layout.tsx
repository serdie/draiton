
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
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
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
  Bot,
  Palette,
  Zap,
  Link2,
  Settings,
  LogOut,
  Shield,
  Home,
  Banknote,
  AreaChart,
  HardHat,
  CheckSquare,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useContext(AuthContext);
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return null;
  }
  
  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
            <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Panel de Control">
                        <Home />
                        <span>Panel de Control</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>

            <SidebarGroup>
                <SidebarGroupLabel>💰 Finanzas</SidebarGroupLabel>
                <SidebarMenuItem>
                    <Link href="/dashboard/finanzas/vision-general">
                        <SidebarMenuButton isActive={isActive('/dashboard/finanzas/vision-general')} tooltip="Visión General">
                            <AreaChart />
                            <span>Visión General</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/facturas">
                        <SidebarMenuButton isActive={isActive('/dashboard/facturas')} tooltip="Facturas">
                            <FileText />
                            <span>Facturas</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/gastos">
                        <SidebarMenuButton isActive={isActive('/dashboard/gastos')} tooltip="Gastos">
                            <Banknote />
                            <span>Gastos</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>⚙️ Operaciones</SidebarGroupLabel>
                 <SidebarMenuItem>
                    <Link href="/dashboard/proyectos">
                        <SidebarMenuButton isActive={isActive('/dashboard/proyectos')} tooltip="Proyectos">
                            <Briefcase />
                            <span>Proyectos</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/contactos">
                        <SidebarMenuButton isActive={isActive('/dashboard/contactos')} tooltip="Contactos">
                            <Users />
                            <span>Contactos</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/tareas">
                        <SidebarMenuButton isActive={isActive('/dashboard/tareas')} tooltip="Tareas">
                            <CheckSquare />
                            <span>Tareas</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel>✨ Herramientas IA</SidebarGroupLabel>
                 <SidebarMenuItem>
                    <Link href="/dashboard/perspectivas-ia">
                        <SidebarMenuButton isActive={isActive('/dashboard/perspectivas-ia')} tooltip="Perspectivas IA">
                            <BrainCircuit />
                            <span>Perspectivas IA</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/gestor-ia">
                        <SidebarMenuButton isActive={isActive('/dashboard/gestor-ia')} tooltip="Gestor IA">
                            <Bot />
                            <span>Gestor IA</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/marketing-ia">
                        <SidebarMenuButton isActive={isActive('/dashboard/marketing-ia')} tooltip="Marketing IA">
                            <Sparkles />
                            <span>Marketing IA</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/web-ia">
                        <SidebarMenuButton isActive={isActive('/dashboard/web-ia')} tooltip="Web IA">
                            <Palette />
                            <span>Web IA</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>🔧 Ajustes</SidebarGroupLabel>
                 <SidebarMenuItem>
                    <Link href="/dashboard/configuracion">
                        <SidebarMenuButton isActive={isActive('/dashboard/configuracion')} tooltip="Generales">
                            <Settings />
                            <span>Generales</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/conexiones">
                        <SidebarMenuButton isActive={isActive('/dashboard/conexiones')} tooltip="Conexiones">
                            <Link2 />
                            <span>Conexiones</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/mi-perfil">
                        <SidebarMenuButton isActive={isActive('/dashboard/mi-perfil')} tooltip="Mi Perfil">
                            <UserCog />
                            <span>Mi Perfil</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>
            
             {isAdmin && (
                <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                    <SidebarMenuButton isActive={pathname.startsWith('/admin')} tooltip="Panel de Admin">
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
