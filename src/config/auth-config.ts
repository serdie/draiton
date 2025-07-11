
import { AuthOptions } from "next-firebase-auth-edge";

export const authConfig: AuthOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: 'auth-token',
    cookieSignatureKeys: [process.env.COOKIE_SECRET_CURRENT!, process.env.COOKIE_SECRET_PREVIOUS!],
    cookieSerializeOptions: {
        path: '/',
        httpOnly: true,
        secure: process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 24, // twelve days
    },
    serviceAccount: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    // Optional: customize the token claims
    // onValidToken: (token) => {
    //   return { ...token, custom: 'claim' }
    // }
};
