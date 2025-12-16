
'use client';

import { cn } from "@/lib/utils";

interface InfoRowProps {
    icon: React.ElementType;
    label: string;
    value?: React.ReactNode;
    className?: string;
}

export function InfoRow({ icon: Icon, label, value, className }: InfoRowProps) {
    return (
        <div className={cn("flex items-start gap-3 text-sm", className)}>
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-col">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value || 'No especificado'}</span>
            </div>
        </div>
    )
}
