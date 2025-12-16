import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function ControlHorarioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Control Horario</h1>
          <p>
            Gestiona la jornada laboral de tus empleados de forma fácil y cumpliendo con la normativa vigente.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
