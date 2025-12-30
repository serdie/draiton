import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { FaqAccordion } from '@/components/landing/faq-accordion';

export default function PreguntasFrecuentesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}