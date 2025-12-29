
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Firebase Permission Error Captured:", error.context);
      
      // En un entorno de desarrollo, podrías lanzar el error para que Next.js lo capture.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // En producción, muestra una notificación amigable.
        toast({
          variant: 'destructive',
          title: 'Error de Permisos',
          description: 'No tienes permiso para realizar esta acción.',
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
