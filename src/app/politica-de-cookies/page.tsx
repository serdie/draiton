
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PoliticaDeCookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Política de Cookies</h1>
          <p>
            <strong>Última actualización:</strong> 10 de diciembre de 2025
          </p>
          <p>
            En la web y la aplicación de Draiton (titularidad de Search and Make S.L.), utilizamos cookies para garantizar el funcionamiento de nuestra plataforma, analizar el tráfico y mejorar tu experiencia de usuario.
          </p>
          <h2>1. ¿Qué son las Cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web y aplicaciones guardan en tu navegador o dispositivo (móvil, tablet, PC) cuando los visitas. No son virus ni programas maliciosos. Sirven para "recordar" información sobre tu visita, como tu idioma preferido, tus datos de inicio de sesión (para que no tengas que poner la contraseña cada vez) o para mostrarnos estadísticas de uso anónimas.
          </p>
          <h2>2. ¿Qué tipos de Cookies utilizamos?</h2>
          <h3>Según quien las gestiona:</h3>
          <ul>
            <li><strong>Cookies propias:</strong> Son aquellas que enviamos a tu equipo desde nuestros propios servidores (Draiton) para prestarte el servicio.</li>
            <li><strong>Cookies de terceros:</strong> Son aquellas que se envían desde un equipo gestionado por otra entidad (como Google) que trata los datos obtenidos.</li>
          </ul>
          <h3>Según su finalidad:</h3>
          <h4>A. Cookies Técnicas (Necesarias)</h4>
          <p>Son imprescindibles para que la web y la app funcionen. Permiten, por ejemplo, identificar tu sesión de usuario, acceder a partes de acceso restringido (tu panel de gestión) o recordar los elementos de un pedido/contratación. Estas cookies no necesitan tu consentimiento, ya que sin ellas la app no funciona.</p>
          <h4>B. Cookies de Análisis o Medición</h4>
          <p>Nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado. Para ello se analiza tu navegación en nuestra página web con el fin de mejorar la oferta de productos o servicios que te ofrecemos.</p>

          <h2>3. Relación de Cookies utilizadas</h2>
          <p>A continuación, detallamos las cookies que utiliza esta plataforma:</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre de la Cookie</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Finalidad</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>session_id / auth_token</TableCell>
                        <TableCell>Técnica</TableCell>
                        <TableCell>Draiton</TableCell>
                        <TableCell>Sesión</TableCell>
                        <TableCell>Mantener al usuario identificado dentro de la app.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>cookie_consent</TableCell>
                        <TableCell>Técnica</TableCell>
                        <TableCell>Draiton</TableCell>
                        <TableCell>1 año</TableCell>
                        <TableCell>Recordar si has aceptado o rechazado la política de cookies.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>_ga / ga*</TableCell>
                        <TableCell>Analítica</TableCell>
                        <TableCell>Google Analytics</TableCell>
                        <TableCell>2 años</TableCell>
                        <TableCell>Distinguir a usuarios únicos para estadísticas de uso.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>_gid</TableCell>
                        <TableCell>Analítica</TableCell>
                        <TableCell>Google Analytics</TableCell>
                        <TableCell>24 horas</TableCell>
                        <TableCell>Distinguir a los usuarios.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
           <p className="text-sm italic">Nota: Esta lista es enunciativa. Si en el futuro utilizamos otras herramientas, actualizaremos este cuadro.</p>
          
          <h2>4. Transferencias Internacionales</h2>
          <p>Nuestras cookies propias no transfieren datos fuera del Espacio Económico Europeo.</p>
          <p>Sin embargo, las cookies de terceros (Google Analytics / Google Cloud) pueden transferir datos a Estados Unidos. Te informamos que Google está adherido al Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework), lo que garantiza que tus datos están protegidos con un nivel de seguridad equivalente al europeo.</p>

          <h2>5. ¿Cómo puedes configurar o deshabilitar las cookies?</h2>
          <p>Tienes el control. Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante:</p>
          <ul>
              <li><strong>El panel de configuración de cookies:</strong> Accesible en el pie de página de nuestra web o en los ajustes de la app.</li>
              <li>
                  <strong>La configuración de tu navegador:</strong>
                  <ul>
                      <li>Google Chrome: Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
                      <li>Safari (Apple): Preferencias &gt; Privacidad.</li>
                      <li>Mozilla Firefox: Opciones &gt; Privacidad y Seguridad.</li>
                  </ul>
              </li>
          </ul>
          <p>Ten en cuenta que, si desactivas las cookies técnicas, es posible que no puedas iniciar sesión o utilizar correctamente los servicios de Draiton.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
