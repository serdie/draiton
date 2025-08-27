
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Blocks, FlaskConical, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/finanzas', label: 'Finanzas', icon: Wallet },
    { href: '/dashboard/proyectos', label: 'Operar', icon: Blocks },
    { href: '/dashboard/gestor-ia', label: 'IA', icon: FlaskConical },
    { href: '/admin/dashboard', label: 'Admin', icon: UserCog, adminOnly: true },
]

export function MobileNav() {
    const pathname = usePathname();
    const { isAdmin } = useContext(AuthContext);

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
                {navItems.map(item => {
                    if (item.adminOnly && !isAdmin) return null;

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

