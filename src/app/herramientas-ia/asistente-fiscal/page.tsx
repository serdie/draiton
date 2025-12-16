import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function AsistenteFiscalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Asistente Fiscal IA</h1>
          <p>
            Recibe ayuda y guías claras para cumplimentar los modelos de impuestos más comunes y resolver tus dudas fiscales.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
