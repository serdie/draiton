
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerfilSettings } from '@/app/dashboard/configuracion/perfil-settings';

export default function MiPerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal, avatar y seguridad de la cuenta.
        </p>
      </div>
      <PerfilSettings />
    </div>
  );
}
