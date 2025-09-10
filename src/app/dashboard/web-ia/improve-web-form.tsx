
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, Sparkles, CheckCircle, TrendingUp, ShieldCheck, UserCheck } from 'lucide-react';
import type { AnalyzeWebsiteOutput } from '@/ai/flows/analyze-website';

type FormState = {
  output: AnalyzeWebsiteOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando...</> : <><Search className="mr-2 h-4 w-4" /> Analizar Web</>}
    </Button>
  );
}

const CategoryCard = ({ title, points, icon }: { title: string; points: {title: string; suggestion: string}[]; icon: React.ReactNode }) => {
    return (
        <Card className="bg-background/50">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">{icon}</div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                </div>
                <div className="space-y-4">
                    {points.map((point, index) => (
                        <div key={index}>
                            <p className="font-medium">{point.title}</p>
                            <p className="text-sm text-muted-foreground">{point.suggestion}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function ImproveWebForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="space-y-6">
        <form action={formAction} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full space-y-2">
                <Label htmlFor="url">URL del Sitio Web</Label>
                <Input id="url" name="url" type="url" required placeholder="https://www.ejemplo.com" />
            </div>
            <SubmitButton />
        </form>

        {state.error && (
            <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        {state.output && (
            <div className="mt-6 space-y-6">
                 <CategoryCard 
                    title={state.output.seo.title} 
                    points={state.output.seo.points} 
                    icon={<CheckCircle className="h-5 w-5"/>}
                />
                 <CategoryCard 
                    title={state.output.performance.title} 
                    points={state.output.performance.points} 
                    icon={<TrendingUp className="h-5 w-5"/>}
                />
                <CategoryCard 
                    title={state.output.ux.title} 
                    points={state.output.ux.points} 
                    icon={<UserCheck className="h-5 w-5"/>}
                />
                 <CategoryCard 
                    title={state.output.security.title} 
                    points={state.output.security.points} 
                    icon={<ShieldCheck className="h-5 w-5"/>}
                />
            </div>
        )}
    </div>
  );
}
