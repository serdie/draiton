import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { OportunidadesFeatures } from '@/components/landing/oportunidades-features';

export default function OportunidadesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <OportunidadesFeatures />
      </main>
      <Footer />
    </div>
  );
}
