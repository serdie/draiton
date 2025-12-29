'use client';

import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { MarketingFeatures } from '@/components/landing/marketing-features';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <MarketingFeatures />
      </main>
      <Footer />
    </div>
  );
}
