import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function AvisoLegalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Aviso Legal</h1>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
          </p>
          <h2>1. Información Legal</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI), a continuación se exponen los datos identificativos de la empresa.
          </p>
          <ul>
            <li><strong>Denominación Social:</strong> Search and Make S.L.</li>
            <li><strong>NIF:</strong> B-12345678</li>
            <li><strong>Domicilio Social:</strong> Calle Falsa 123, 28080, Madrid, España</li>
            <li><strong>Correo electrónico:</strong> legal@emprendetotal.com</li>
            <li><strong>Datos de inscripción en el registro mercantil:</strong> Inscrita en el Registro Mercantil de Madrid, Tomo 1234, Folio 56, Hoja M-7890.</li>
          </ul>
          <h2>2. Propiedad Intelectual</h2>
          <p>
            El código fuente, los diseños gráficos, las imágenes, las fotografías, los sonidos, las animaciones, el software, los textos, así como la información y los contenidos que se recogen en el presente sitio web están protegidos por la legislación española sobre los derechos de propiedad intelectual e industrial a favor de Search and Make S.L. y no se permite la reproducción y/o publicación, total o parcial, del sitio web, ni su tratamiento informático, su distribución, su difusión, ni su modificación, transformación o descompilación, ni demás derechos reconocidos legalmente a su titular, sin el permiso previo y por escrito del mismo.
          </p>
          <h2>3. Limitación de Responsabilidad</h2>
          <p>
            Search and Make S.L. no se hace responsable de los daños y perjuicios que se produzcan por fallos o malas configuraciones del software instalado en el ordenador del internauta. Se excluye toda responsabilidad por alguna incidencia técnica o fallo que se produzca cuando el usuario se conecte a internet. Igualmente no se garantiza la inexistencia de interrupciones o errores en el acceso al sitio web.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
