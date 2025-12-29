import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { TimeTrackingFeatures } from '@/components/landing/time-tracking-features';

export default function ControlHorarioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <TimeTrackingFeatures />
      </main>
      <Footer />
    </div>
  );
}
