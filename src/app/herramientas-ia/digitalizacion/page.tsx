import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function DigitalizacionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Digitalización Inteligente</h1>
          <p>
            Transforma tus documentos en datos. Extrae la información de facturas y tickets con solo tomar una foto.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
