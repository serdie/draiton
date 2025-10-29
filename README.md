# Firebase Studio

This is a NextJS starter in Firebase Studio.

## ¡IMPORTANTE! Configurar CORS en Firebase Storage

Para que la subida de archivos (avatares, logos, etc.) funcione correctamente, es **imprescindible** configurar las reglas de CORS en tu bucket de Firebase Storage. De lo contrario, el navegador bloqueará las peticiones por seguridad.

Ejecuta el siguiente comando en tu terminal para aplicar la configuración necesaria. Asegúrate de reemplazar `<YOUR_FIREBASE_PROJECT_ID>` con el ID de tu proyecto de Firebase.

```bash
gcloud storage buckets update gs://<YOUR_FIREBASE_PROJECT_ID>.appspot.com --cors-file=./storage.cors.json
```

---

To get started, take a look at src/app/page.tsx.
