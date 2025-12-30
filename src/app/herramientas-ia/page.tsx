
// This is a placeholder file that can be removed.
// The real content is now managed by the sub-pages.
// Or it can be a directory index for all AI tools.
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function HerramientasIAPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto text-center">
          <h1>Herramientas de Inteligencia Artificial</h1>
          <p>
            Explora nuestro conjunto de herramientas diseñadas para potenciar tu negocio.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
