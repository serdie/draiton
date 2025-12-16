
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { FiscalAssistantFeatures } from '@/components/landing/fiscal-assistant-features';

export default function AsistenteFiscalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <FiscalAssistantFeatures />
      </main>
      <Footer />
    </div>
  );
}
