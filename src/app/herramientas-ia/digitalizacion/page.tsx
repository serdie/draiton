
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { DigitalizationFeatures } from '@/components/landing/digitalization-features';

export default function DigitalizacionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <DigitalizationFeatures />
      </main>
      <Footer />
    </div>
  );
}
