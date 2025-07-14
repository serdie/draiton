
import 'server-only';

function formatPrivateKey(key?: string) {
    if (!key) {
      return '';
    }
    return key.replace(/\\n/g, '\n');
}

const serverConfig = {
  firebase: {
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
};

if (!serverConfig.firebase.privateKey || !serverConfig.firebase.clientEmail || !serverConfig.firebase.projectId) {
    throw new Error('Las credenciales del servidor de Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) no están configuradas en las variables de entorno.');
}

export default serverConfig;
