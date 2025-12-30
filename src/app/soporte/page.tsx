import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { SupportTicketSystem } from '@/components/landing/support-ticket-system';

export default function SoportePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <SupportTicketSystem />
      </main>
      <Footer />
    </div>
  );
}