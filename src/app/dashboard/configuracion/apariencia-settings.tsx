
'use client';

import { useContext } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Laptop, User, ShieldCheck, Gem, Building, HardHat } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import type { UserRole } from '@/context/auth-context';

export function AparienciaSettings() {
    const { theme, setTheme } = useTheme();
    const { user, effectiveRole, setSimulatedRole } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>Personaliza la apariencia de la aplicación. Elige entre el tema claro, oscuro o el de tu sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid max-w-md grid-cols-1 sm:grid-cols-3 gap-4"
        >
            <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                    <Sun className="mb-3 h-6 w-6" />
                    Claro
                </Label>
            </div>
             <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                    <Moon className="mb-3 h-6 w-6" />
                    Oscuro
                </Label>
            </div>
             <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                    <Laptop className="mb-3 h-6 w-6" />
                    Sistema
                </Label>
            </div>
        </RadioGroup>
      </CardContent>
    </Card>

    {isAdmin && (
         <Card>
            <CardHeader>
                <CardTitle>Simulación de Rol</CardTitle>
                <CardDescription>Visualiza la aplicación como lo haría un usuario con un rol diferente. Esta vista es solo temporal y para ti.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={effectiveRole}
                    onValueChange={(value) => setSimulatedRole(value as UserRole)}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    <div >
                        <RadioGroupItem value="free" id="sim-free" className="peer sr-only" />
                        <Label htmlFor="sim-free" className="flex items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                           <User className="h-5 w-5" /> Gratis
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="pro" id="sim-pro" className="peer sr-only" />
                        <Label htmlFor="sim-pro" className="flex items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                           <Gem className="h-5 w-5" /> Pro
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="empresa" id="sim-empresa" className="peer sr-only" />
                        <Label htmlFor="sim-empresa" className="flex items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                           <Building className="h-5 w-5" /> Empresa
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="employee" id="sim-employee" className="peer sr-only" />
                        <Label htmlFor="sim-employee" className="flex items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                           <HardHat className="h-5 w-5" /> Empleado
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="admin" id="sim-admin" className="peer sr-only" />
                        <Label htmlFor="sim-admin" className="flex items-center justify-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                           <ShieldCheck className="h-5 w-5" /> Admin
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    )}
    </div>
  );
}
