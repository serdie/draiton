
'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Laptop } from 'lucide-react';

export function AparienciaSettings() {
    const { theme, setTheme } = useTheme();

  return (
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
  );
}
