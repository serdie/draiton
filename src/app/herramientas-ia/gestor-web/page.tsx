import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function GestorWebPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Gestor y Analizador Web IA</h1>
          <p>
            Crea una página web profesional sin código o analiza tu sitio actual para recibir un informe detallado con puntos de mejora en SEO, rendimiento y diseño.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
