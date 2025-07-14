import dotenv from 'dotenv';

dotenv.config();

function formatPrivateKey(key: string): string {
  if (!key) {
    // Devuelve una cadena vacía o lanza un error si la clave es undefined o null
    return '';
  }
  return key.replace(/\\n/g, '\n');
}

const serverConfig = {
  firebase: {
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  },
};

if (!serverConfig.firebase.privateKey || !serverConfig.firebase.clientEmail || !serverConfig.firebase.projectId) {
  throw new Error('Las credenciales del servidor de Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) no están configuradas en las variables de entorno.');
}


export default serverConfig;
