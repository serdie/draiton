
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import Image from 'next/image';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw, Expand } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileHeader({ title }: { title: string }) {
    const { user, isPro } = useContext(AuthContext);
    const pathname = usePathname();

    if (!user) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b">
            <div className="container flex items-center justify-between h-14">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" alt="Draiton Logo" width={24} height={24} className="h-6 w-auto rounded-sm"/>
                    <span className="font-bold">Draiton</span>
                </Link>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-3">
                        {isPro && <Badge variant="outline" className='border-yellow-400 text-yellow-400'>PRO</Badge>}
                        <Bell className="h-5 w-5 text-muted-foreground"/>
                        <Link href="/dashboard/configuracion">
                            <UserAvatar user={user} />
                        </Link>
                     </div>
                </div>
            </div>
        </header>
    )
}
