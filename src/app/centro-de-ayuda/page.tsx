import { HelpCenter } from '@/components/landing/help-center';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function CentroDeAyudaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <HelpCenter />
      </main>
      <Footer />
    </div>
  );
}