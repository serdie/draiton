import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Política de Privacidad</h1>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
          </p>
          <p>
            Bienvenido a Emprende Total. Su privacidad es de suma importancia para nosotros. Esta Política de Privacidad describe cómo recopilamos, usamos, procesamos y divulgamos su información, incluida la información personal, en conjunto con su acceso y uso de nuestra plataforma.
          </p>
          <h2>1. Información que recopilamos</h2>
          <p>
            Recopilamos tres categorías generales de información.
          </p>
          <h3>1.1 Información que usted nos proporciona.</h3>
          <p>
            Recopilamos información que usted comparte con nosotros cuando utiliza la plataforma Emprende Total.
          </p>
          <ul>
            <li>
              <strong>Información de la cuenta:</strong> Cuando se registra para una cuenta de Emprende Total, requerimos cierta información como su nombre, apellido, dirección de correo electrónico y fecha de nacimiento.
            </li>
            <li>
              <strong>Información de perfil y listado:</strong> Para usar ciertas funciones dentro de la plataforma, también podemos pedirle que complete un perfil, que puede incluir su dirección, número de teléfono y foto.
            </li>
          </ul>
          <h2>2. Cómo utilizamos la información que recopilamos</h2>
          <p>
            Utilizamos, almacenamos y procesamos información, incluida la información personal, sobre usted para proporcionar, comprender, mejorar y desarrollar la plataforma Emprende Total, crear y mantener un entorno confiable y más seguro y cumplir con nuestras obligaciones legales.
          </p>
          <h2>3. Intercambio y Divulgación</h2>
          <p>
            No compartiremos su información con terceros excepto como se describe en esta política.
          </p>
          <h2>4. Sus Derechos</h2>
          <p>
            Usted puede ejercer cualquiera de los derechos descritos en esta sección ante su Controlador de Datos de Emprende Total enviando un correo electrónico. Tenga en cuenta que podemos pedirle que verifique su identidad antes de tomar medidas adicionales sobre su solicitud.
          </p>
          <h2>5. Contacto</h2>
          <p>
            Si tiene alguna pregunta o queja sobre esta Política de Privacidad o las prácticas de información de Emprende Total, puede enviarnos un correo electrónico a legal@emprendetotal.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
