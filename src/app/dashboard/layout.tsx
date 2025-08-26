
'use client';

import { useContext, useState } from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  FileText,
  CreditCard,
  Receipt,
  ArrowRightLeft,
  Briefcase,
  Users,
  Calendar,
  Zap,
  Mail,
  BrainCircuit,
  Newspaper,
  BookUser,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


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
    return pathname === href;
  };
  
  const financePaths = ['/dashboard/finanzas/vision-general', '/dashboard/facturas', '/dashboard/gastos', '/dashboard/impuestos', '/dashboard/bancos'];
  const operationsPaths = ['/dashboard/proyectos', '/dashboard/contactos', '/dashboard/tareas'];
  const iaToolsPaths = ['/dashboard/gestor-ia/ayudas', '/dashboard/gestor-ia/asistente-fiscal'];

  const isGroupActive = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
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
                <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Dashboard">
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <Collapsible defaultOpen={isGroupActive(financePaths)}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton variant="ghost" className="w-full justify-start">
                  <Wallet />
                  <span>Finanzas</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <Link href="/dashboard/finanzas">
                      <SidebarMenuSubButton isActive={isActive('/dashboard/finanzas')}>
                        <LayoutGrid/>
                        <span>Visión General</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link href="/dashboard/facturacion">
                      <SidebarMenuSubButton isActive={isActive('/dashboard/facturacion')}>
                        <FileText/>
                        <span>Facturas</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link href="/dashboard/gastos">
                       <SidebarMenuSubButton isActive={isActive('/dashboard/gastos')}>
                        <Receipt/>
                        <span>Gastos</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible defaultOpen={isGroupActive(operationsPaths)}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton variant="ghost" className="w-full justify-start">
                        <Blocks />
                        <span>Operaciones</span>
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
                                    <BookUser/>
                                    <span>Contactos</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                             <Link href="/dashboard/tareas">
                                <SidebarMenuSubButton isActive={isActive('/dashboard/tareas')}>
                                    <Calendar/>
                                    <span>Tareas</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen={isGroupActive(iaToolsPaths)}>
                <CollapsibleTrigger asChild>
                     <SidebarMenuButton variant="ghost" className="w-full justify-start">
                        <FlaskConical />
                        <span>Herramientas IA</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                     <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <Link href="/dashboard/gestor-ia">
                                <SidebarMenuSubButton isActive={isActive('/dashboard/gestor-ia')}>
                                    <BrainCircuit/>
                                    <span>Gestor IA</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <Link href="/dashboard/marketing-ia">
                                <SidebarMenuSubButton isActive={isActive('/dashboard/marketing-ia')}>
                                    <Mail/>
                                    <span>Marketing IA</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                             <Link href="/dashboard/web-ia">
                                <SidebarMenuSubButton isActive={isActive('/dashboard/web-ia')}>
                                    <Newspaper/>
                                    <span>Web IA</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>

             {isAdmin && (
                <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                    <SidebarMenuButton isActive={pathname.startsWith('/admin')} tooltip="Admin Panel">
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
            <div className="flex-1 flex justify-end items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar proyectos, facturas..." className="pl-10" />
                </div>
                <Badge variant="outline" className='border-yellow-400 text-yellow-400'>PRO</Badge>
                 <Button asChild variant="ghost" size="icon">
                  <Link href="/dashboard/configuracion">
                    <Settings className="h-5 w-5"/>
                  </Link>
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <UserAvatar user={user} />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/50">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
