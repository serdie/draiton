# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Solucionar error de CORS en Firebase Storage

Si encuentras un error `storage/unknown` al intentar subir archivos, es probable que sea un problema de CORS. Para solucionarlo, ejecuta el siguiente comando en tu terminal para aplicar la configuración CORS correcta a tu bucket de Firebase Storage.

Asegúrate de reemplazar `<YOUR_FIREBASE_PROJECT_ID>` con el ID de tu proyecto de Firebase.

```bash
gcloud storage buckets update gs://<YOUR_FIREBASE_PROJECT_ID>.appspot.com --cors-file=./storage.cors.json
```
