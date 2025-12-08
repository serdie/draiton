import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Draiton',
  description: 'Tu centro de operaciones para autónomos y pequeñas empresas.',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
