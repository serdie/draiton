
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
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
  AreaChart,
  FileText,
  Banknote,
  Blocks,
  Briefcase,
  Users,
  CheckSquare,
  FlaskConical,
  BrainCircuit,
  Bot,
  Sparkles,
  Palette,
  Wrench,
  Link2,
  UserCog,
  ChevronRight,
  Wallet,
  Repeat,
  Landmark,
  PieChart,
  Scale,
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

  const financePaths = ['/dashboard/finanzas', '/dashboard/facturas', '/dashboard/gastos', '/dashboard/bancos'];
  const operationsPaths = ['/dashboard/proyectos', '/dashboard/contactos', '/dashboard/tareas', '/dashboard/informes'];
  const aiToolsPaths = ['/dashboard/perspectivas-ia', '/dashboard/gestor-ia', '/dashboard/marketing-ia', '/dashboard/web-ia'];
  const settingsPaths = ['/dashboard/configuracion', '/dashboard/conexiones', '/dashboard/mi-perfil'];

  const isGroupActive = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
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

            <Collapsible defaultOpen={isGroupActive(financePaths)}>
              <CollapsibleTrigger asChild>
                 <SidebarMenuButton isActive={isGroupActive(financePaths)} className="group w-full justify-start">
                  <Wallet />
                  <span>Finanzas</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                 <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/finanzas/vision-general">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/finanzas/vision-general')}>
                                <AreaChart/>
                                <span>Visión General</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/facturas">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/facturas')}>
                                <FileText/>
                                <span>Facturas</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <Link href="/dashboard/gastos">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/gastos')}>
                                <Banknote/>
                                <span>Gastos</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/finanzas/prevision-impuestos">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/finanzas/prevision-impuestos')}>
                                <Scale/>
                                <span>Previsión Impuestos</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <Link href="/dashboard/bancos">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/bancos')}>
                                <Landmark/>
                                <span>Conexión Bancaria</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                 </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen={isGroupActive(operationsPaths)}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive(operationsPaths)} className="group w-full justify-start">
                  <Blocks />
                  <span>Operaciones</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                 <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/proyectos">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/proyectos')}>
                                <Briefcase/>
                                <span>Proyectos</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/contactos">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/contactos')}>
                                <Users/>
                                <span>Contactos</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <Link href="/dashboard/tareas">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/tareas')}>
                                <CheckSquare/>
                                <span>Tareas</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <Link href="/dashboard/informes">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/informes')}>
                                <PieChart/>
                                <span>Informes</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                 </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible defaultOpen={isGroupActive(aiToolsPaths)}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive(aiToolsPaths)} className="group w-full justify-start">
                  <FlaskConical />
                  <span>Herramientas IA</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                 <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/perspectivas-ia">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/perspectivas-ia')}>
                                <BrainCircuit/>
                                <span>Perspectivas IA</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <Collapsible defaultOpen={isGroupActive(['/dashboard/gestor-ia'])}>
                        <CollapsibleTrigger asChild>
                             <SidebarMenuButton isActive={isGroupActive(['/dashboard/gestor-ia'])} className="group w-full justify-start">
                                <Bot />
                                <span>Gestor IA</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                             <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <Link href="/dashboard/gestor-ia/ayudas">
                                        <SidebarMenuSubButton isActive={isActive('/dashboard/gestor-ia/ayudas')}>
                                            <span>Buscador de Ayudas</span>
                                        </SidebarMenuSubButton>
                                    </Link>
                                </SidebarMenuSubItem>
                                 <SidebarMenuSubItem>
                                    <Link href="/dashboard/gestor-ia/asistente-fiscal">
                                        <SidebarMenuSubButton isActive={isActive('/dashboard/gestor-ia/asistente-fiscal')}>
                                            <span>Asistente Fiscal</span>
                                        </SidebarMenuSubButton>
                                    </Link>
                                </SidebarMenuSubItem>
                             </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/marketing-ia">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/marketing-ia')}>
                                <Sparkles/>
                                <span>Marketing IA</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/web-ia">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/web-ia')}>
                                <Palette/>
                                <span>Web IA</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                 </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>

             <Collapsible defaultOpen={isGroupActive(settingsPaths)}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive(settingsPaths)} className="group w-full justify-start">
                  <Wrench />
                  <span>Ajustes</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                 <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/configuracion">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/configuracion')}>
                                <Settings/>
                                <span>Generales</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <Link href="/dashboard/conexiones">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/conexiones')}>
                                <Link2/>
                                <span>Conexiones</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <Link href="/dashboard/mi-perfil">
                            <SidebarMenuSubButton isActive={isActive('/dashboard/mi-perfil')}>
                                <UserCog/>
                                <span>Mi Perfil</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                 </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
            
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
              <Link href="/dashboard/configuracion" passHref>
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
            <Link href="/dashboard/configuracion" passHref>
             <Button variant="ghost" size="icon" asChild>
                <a><Settings className="h-5 w-5"/></a>
             </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
