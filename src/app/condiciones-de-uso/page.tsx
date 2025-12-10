import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function CondicionesDeUsoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>TÉRMINOS Y CONDICIONES DE USO – DRAITON</h1>
          <p>
            <strong>Última actualización:</strong> 10 de diciembre de 2025
          </p>
          <p>
            Bienvenido a Draiton. Te rogamos que leas detenidamente los presentes Términos y Condiciones, ya que regulan el acceso, navegación y uso de nuestra aplicación móvil y plataforma web. Al acceder a Draiton, aceptas estar vinculado legalmente por estas condiciones.
          </p>
          <h2>1. Información Legal y Titularidad</h2>
          <p>
            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que el titular de esta aplicación es:
          </p>
          <ul>
            <li><strong>Razón Social:</strong> Search and Make S.L. (en adelante, "Draiton" o "el Responsable").</li>
            <li><strong>NIF:</strong> B45786787</li>
            <li><strong>Domicilio Social:</strong> Calle Conquistadores 8, 45500, Torrijos (Toledo), España.</li>
            <li><strong>Email de contacto:</strong> info@draiton.es</li>
          </ul>
          <h2>2. Objeto del Servicio</h2>
          <p>
            Draiton es una plataforma tecnológica diseñada para facilitar la gestión administrativa, documental y/o contable de sus usuarios. Importante: Draiton actúa como una herramienta de software ("SaaS"). Salvo que se contrate explícitamente un servicio de asesoría premium, el uso de la app no constituye asesoramiento fiscal, contable o legal profesional. El usuario es el único responsable de cumplir con sus obligaciones tributarias y de la veracidad de los datos introducidos.
          </p>
          <h2>3. Registro y Seguridad de la Cuenta</h2>
          <p>Para utilizar Draiton, es necesario registrarse. El usuario se compromete a:</p>
          <ul>
            <li>Aportar datos veraces, exactos y completos.</li>
            <li>Custodiar su contraseña de forma segura. El usuario es responsable de cualquier acción realizada desde su cuenta.</li>
            <li>Notificar inmediatamente a info@draiton.es cualquier uso no autorizado de su cuenta.</li>
          </ul>
          <h2>4. Normas de Uso (Obligaciones del Usuario)</h2>
          <p>Queda terminantemente prohibido el uso de la aplicación para fines ilícitos o no autorizados. A título enunciativo y no limitativo, el usuario se compromete a:</p>
          <ul>
            <li>No subir documentos falsos, fraudulentos o que contengan virus/malware.</li>
            <li>No intentar acceder a cuentas de otros usuarios ni vulnerar la seguridad de nuestros sistemas.</li>
            <li>No utilizar la plataforma para blanqueo de capitales o actividades delictivas.</li>
            <li>Ser el legítimo titular (o tener autorización) de la documentación que sube a la plataforma.</li>
          </ul>
          <p>Search and Make S.L. se reserva el derecho a suspender o cancelar la cuenta de cualquier usuario que incumpla estas normas sin previo aviso.</p>
          <h2>5. Propiedad Intelectual e Industrial</h2>
          <p>
            Todos los derechos sobre el software de la aplicación Draiton, así como su diseño, logotipos, código fuente, bases de datos y textos (marca "Draiton" y "Search and Make S.L.") son propiedad exclusiva de Search and Make S.L. o de sus licenciantes. El usuario tiene una licencia de uso limitada, no exclusiva e intransferible únicamente para utilizar la app conforme a estos términos. Queda prohibida la ingeniería inversa, descompilación o copia de la app.
          </p>
          <h2>6. Régimen de Responsabilidad (Cláusula de "Blindaje")</h2>
          <p>Esta es la sección más importante para limitar tu riesgo legal:</p>
          <h3>6.1. Fallos Técnicos</h3>
          <p>Search and Make S.L. trabaja para que la app esté disponible 24/7, pero no garantiza la inexistencia de interrupciones, errores o caídas del servidor (alojado en Google Cloud), ni se hace responsable de los perjuicios que estas puedan causar.</p>
          <h3>6.2. Veracidad de los Datos</h3>
          <p>Draiton no valida ni audita la documentación subida por el usuario. No somos responsables de sanciones, multas o inspecciones derivadas de datos incorrectos, facturas falsas o presentaciones de impuestos erróneas generadas por mal uso de la herramienta por parte del usuario.</p>
          <h3>6.3. Pérdida de Datos</h3>
          <p>Aunque realizamos copias de seguridad regulares, recomendamos al usuario mantener siempre un respaldo propio de sus documentos originales. Search and Make S.L. no será responsable por la pérdida accidental de datos debida a causas de fuerza mayor o ataques informáticos externos.</p>
          <h2>7. Precios y Suscripciones (Si aplica)</h2>
          <p>
            El uso de determinadas funcionalidades de Draiton puede estar sujeto al pago de una suscripción. Las condiciones económicas, precios y periodicidad se mostrarán claramente en la pantalla de contratación antes del pago. Draiton se reserva el derecho a modificar las tarifas, notificando al usuario con antelación suficiente.
          </p>
          <h2>8. Modificaciones</h2>
          <p>
            Nos reservamos el derecho a modificar estos Términos y Condiciones para adaptarlos a novedades legislativas o mejoras de la app. Las modificaciones serán efectivas desde su publicación en la plataforma. El uso continuado de la app implica la aceptación de los nuevos términos.
          </p>
          <h2>9. Legislación Aplicable y Jurisdicción</h2>
          <p>
            La relación entre Search and Make S.L. y el USUARIO se regirá por la normativa española vigente. Para la resolución de cualquier conflicto o discrepancia, ambas partes se someten expresamente a los Juzgados y Tribunales de Torrijos (Toledo), renunciando a cualquier otro fuero que pudiera corresponderles, salvo que la ley de consumidores y usuarios disponga imperativamente lo contrario.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
