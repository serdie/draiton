import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Política de Privacidad de Draiton</h1>
          <p>
            <strong>Última actualización:</strong> 10 de diciembre de 2025
          </p>
          <p>
            En Draiton, la transparencia es fundamental. Esta Política de Privacidad tiene como objetivo informarte sobre cómo recopilamos, procesamos y protegemos tus datos personales al utilizar nuestra aplicación móvil y servicios, cumpliendo rigurosamente con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
          </p>
          <h2>1. Responsable del Tratamiento</h2>
          <p>¿Quién es el responsable legal de tus datos?</p>
          <ul>
            <li><strong>Identidad:</strong> Search and Make S.L. (en adelante, "Draiton" o "el Responsable").</li>
            <li><strong>NIF:</strong> B45786787</li>
            <li><strong>Dirección Postal:</strong> Calle Conquistadores 8, CP 45500, Torrijos (Toledo), España.</li>
            <li><strong>Correo electrónico:</strong> info@draiton.es</li>
          </ul>
          <h2>2. ¿Qué datos recopilamos?</h2>
          <p>Para el correcto funcionamiento de la app como herramienta de gestión, tratamos las siguientes categorías de datos:</p>
          <h3>2.1. Datos que tú nos facilitas:</h3>
          <ul>
            <li><strong>Datos identificativos y de contacto:</strong> Nombre, apellidos, DNI/NIF, correo electrónico y teléfono.</li>
            <li><strong>Datos fiscales y de gestión:</strong> Información contenida en facturas, recibos o documentos que subas a la plataforma para su gestión.</li>
          </ul>
          <h3>2.2. Permisos del Dispositivo (Uso de Cámara):</h3>
          <p>La aplicación Draiton solicitará acceso a la cámara de tu dispositivo móvil.</p>
          <ul>
            <li><strong>Finalidad:</strong> Este permiso es estrictamente necesario para permitirte digitalizar y subir documentos (facturas, tickets, DNI) directamente a la plataforma.</li>
            <li><strong>Privacidad:</strong> No accederemos a tu carrete de fotos ni utilizaremos la cámara para otro fin que no sea el escaneo de documentos dentro de la app cuando tú lo acciones.</li>
          </ul>
          <h3>2.3. Datos técnicos:</h3>
          <p>Información sobre el dispositivo, sistema operativo y dirección IP para garantizar la seguridad del acceso y el correcto funcionamiento de la app.</p>
          <h2>3. Finalidad y Legitimación</h2>
          <p>Tratamos tus datos con las siguientes bases legales:</p>
          <ul>
            <li><strong>Ejecución del contrato (Art. 6.1.b RGPD):</strong> Para prestarte el servicio de gestión, crear tu cuenta de usuario y procesar la documentación que subes.</li>
            <li><strong>Obligación Legal (Art. 6.1.c RGPD):</strong> Para cumplir con las normativas fiscales y mercantiles españolas que exigen el mantenimiento de registros de facturación.</li>
            <li><strong>Interés Legítimo (Art. 6.1.f RGPD):</strong> Para garantizar la seguridad de la red, prevenir fraudes y mejorar nuestros servicios.</li>
          </ul>
          <h2>4. Conservación de los Datos</h2>
          <p>
            Mantendremos tus datos personales mientras dure tu relación contractual con nosotros. Una vez finalizada, los datos se mantendrán debidamente bloqueados durante el plazo de 5 años (según el art. 1964 del Código Civil y normativa tributaria) o 6 años (según el art. 30 del Código de Comercio) para atender posibles responsabilidades legales. Transcurrido este tiempo, serán eliminados de forma segura.
          </p>
          <h2>5. Destinatarios y Proveedores de Servicios</h2>
          <p>Tus datos no se cederán a terceros salvo obligación legal (ej. Agencia Tributaria, Jueces y Tribunales).</p>
          <p>Sin embargo, para prestar el servicio, utilizamos proveedores tecnológicos de confianza que actúan como Encargados del Tratamiento:</p>
          <ul>
            <li><strong>Infraestructura y Alojamiento:</strong> Utilizamos los servicios de Google Cloud Platform.</li>
          </ul>
          <h2>6. Transferencias Internacionales de Datos</h2>
          <p>
            Nuestros servidores (proveídos por Google Cloud) pueden encontrarse ubicados en Estados Unidos. Queremos informarte que Google LLC está adherido al Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework). Esto garantiza que, aunque los datos se alojen fuera de Europa, cuentan con un nivel de protección adecuado y equivalente al exigido por la normativa europea, asegurando la privacidad y seguridad de tu información.
          </p>
          <h2>7. Tus Derechos</h2>
          <p>Como usuario, tienes control total sobre tus datos. Puedes escribirnos a info@draiton.es (adjuntando copia de tu DNI para verificar tu identidad) para solicitar:</p>
          <ul>
            <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> Modificar datos inexactos.</li>
            <li><strong>Supresión:</strong> Solicitar el borrado de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> Oponerte a un tratamiento específico.</li>
            <li><strong>Limitación:</strong> Solicitar que se paralice el tratamiento de tus datos.</li>
            <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado.</li>
          </ul>
          <p>Si consideras que no hemos atendido tus derechos adecuadamente, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
          <h2>8. Seguridad</h2>
          <p>En Draiton aplicamos medidas de seguridad técnicas (como cifrado de comunicaciones HTTPS) y organizativas para proteger tu información contra accesos no autorizados, pérdida o alteración.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
