import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <div className="px-4 sm:px-6 lg:px-8">
          <Features />
          <Pricing />
        </div>
      </main>
      <Footer />
    </div>
  );
}
