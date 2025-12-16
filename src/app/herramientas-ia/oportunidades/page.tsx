import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function OportunidadesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Buscador de Oportunidades</h1>
          <p>
            Encuentra ayudas, subvenciones y clientes potenciales que se ajusten a tu perfil de negocio. La IA busca por ti.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
