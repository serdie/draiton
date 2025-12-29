import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { FeaturesDetailed } from '@/components/landing/features-detailed';

export default function CaracteristicasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <FeaturesDetailed />
      </main>
      <Footer />
    </div>
  );
}
