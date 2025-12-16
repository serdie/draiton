import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Features } from '@/components/landing/features';

export default function CaracteristicasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Features />
      </main>
      <Footer />
    </div>
  );
}
