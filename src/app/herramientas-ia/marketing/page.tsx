import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Marketing y Redes Sociales con IA</h1>
          <p>
            Genera contenido atractivo para tus campañas de email, publicaciones en redes sociales y mucho más con el poder de la inteligencia artificial.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
