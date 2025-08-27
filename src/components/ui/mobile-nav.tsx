
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Blocks, FlaskConical, UserCog, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/finanzas', label: 'Finanzas', icon: Wallet },
    { href: '/dashboard/proyectos', label: 'Operaciones', icon: Blocks },
    { href: '/dashboard/gestor-ia', label: 'Herram. IA', icon: FlaskConical },
    { href: '/dashboard/configuracion', label: 'Ajustes', icon: Settings, adminOnly: false },
    { href: '/admin/dashboard', label: 'Admin', icon: UserCog, adminOnly: true },
]

export function MobileNav() {
    const pathname = usePathname();
    const { isAdmin } = useContext(AuthContext);

    const visibleNavItems = navItems.filter(item => {
        if (item.adminOnly === true && !isAdmin) return false;
        // This logic is a bit tricky. If the user is an admin, we don't want to show the regular profile link.
        // Let's adjust it to hide the admin link if the user is not an admin.
        // The current logic is fine for hiding admin link.
        // But what about hiding the profile link for admins?
        // Let's show both if they are admin, but the user said "que no sean el administrador".
        // This means the new icon is only for non-admins.
        // The current logic handles this with `adminOnly: false`. Let's verify.
        // Wait, the filter logic is flawed.
        if (item.adminOnly === false && isAdmin) return false;
        return true;
    });


    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden">
            <div className={cn("grid h-full max-w-lg mx-auto", `grid-cols-${visibleNavItems.length}`)}>
                {visibleNavItems.map(item => {
                    const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                    return (
                        <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                             <item.icon className={cn("h-6 w-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary", isActive && "text-primary")} />
                             <span className={cn("text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary", isActive && "text-primary")}>
                                {item.label}
                             </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
