
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Blocks, FlaskConical, UserCog, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['free', 'pro', 'empresa', 'admin', 'employee'] },
    { href: '/dashboard/finanzas', label: 'Finanzas', icon: Wallet, roles: ['free', 'pro', 'empresa', 'admin', 'employee'] },
    { href: '/dashboard/proyectos', label: 'Operaciones', icon: Blocks, roles: ['free', 'pro', 'empresa', 'admin', 'employee'] },
    { href: '/dashboard/gestor-ia', label: 'Herram. IA', icon: FlaskConical, roles: ['pro', 'empresa', 'admin'] },
    { href: '/dashboard/configuracion', label: 'Perfil', icon: User, roles: ['free', 'pro', 'empresa', 'admin', 'employee'] },
    { href: '/admin/dashboard', label: 'Admin', icon: UserCog, roles: ['admin'] },
]

export function MobileNav() {
    const pathname = usePathname();
    const { effectiveRole, isEmployee } = useContext(AuthContext);

    const visibleNavItems = navItems.filter(item => {
        if (isEmployee) {
            // Special menu for employees
            return ['/dashboard', '/dashboard/finanzas', '/dashboard/proyectos', '/dashboard/configuracion'].includes(item.href);
        }
        return item.roles.includes(effectiveRole || 'free');
    });

    const gridColsClass = `grid-cols-${visibleNavItems.length}`;


    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden">
            <div className={cn("grid h-full max-w-lg mx-auto", gridColsClass)}>
                {visibleNavItems.map(item => {
                    const isActive = (pathname === item.href) || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    let label = item.label;
                    if (isEmployee && item.href === '/dashboard/finanzas') {
                        label = 'Nóminas';
                    }
                    return (
                        <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                             <item.icon className={cn("h-6 w-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary", isActive && "text-primary")} />
                             <span className={cn("text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary", isActive && "text-primary")}>
                                {label}
                             </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
