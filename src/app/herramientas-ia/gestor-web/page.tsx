
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { WebManagerFeatures } from '@/components/landing/web-manager-features';

export default function GestorWebPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <WebManagerFeatures />
      </main>
      <Footer />
    </div>
  );
}
