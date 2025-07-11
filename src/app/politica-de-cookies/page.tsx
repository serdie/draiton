import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function PoliticaDeCookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Política de Cookies</h1>
          <p>
            <strong>Última actualización:</strong> 11 de Julio, 2024
          </p>
          <p>
            Esta política explica qué son las cookies y cómo las usamos. Debe leer esta política para comprender qué son las cookies, cómo las usamos, los tipos de cookies que usamos, es decir, la información que recopilamos usando cookies y cómo se usa esa información y cómo controlar las preferencias de las cookies.
          </p>
          <h2>¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se utilizan para almacenar pequeñas piezas de información. Se almacenan en su dispositivo cuando el sitio web se carga en su navegador. Estas cookies nos ayudan a hacer que el sitio web funcione correctamente, a hacerlo más seguro, a proporcionar una mejor experiencia de usuario y a comprender cómo funciona el sitio web y a analizar qué funciona y dónde necesita mejorar.
          </p>
          <h2>¿Cómo usamos las cookies?</h2>
          <p>
            Como la mayoría de los servicios en línea, nuestro sitio web utiliza cookies de origen y de terceros para varios propósitos. Las cookies de origen son principalmente necesarias para que el sitio web funcione de la manera correcta, y no recopilan ninguno de sus datos de identificación personal.
          </p>
          <h2>Tipos de cookies que usamos</h2>
          <ul>
            <li>
              <strong>Cookies Esenciales:</strong> Algunas cookies son esenciales para que pueda experimentar la funcionalidad completa de nuestro sitio. Nos permiten mantener las sesiones de los usuarios y prevenir cualquier amenaza de seguridad.
            </li>
            <li>
              <strong>Cookies de Rendimiento:</strong> Estas cookies se utilizan para comprender y analizar los índices de rendimiento clave del sitio web, lo que ayuda a ofrecer una mejor experiencia de usuario para los visitantes.
            </li>
            <li>
              <strong>Cookies de Publicidad:</strong> Estas cookies se utilizan para personalizar los anuncios que le mostramos para que sean significativos para usted. Estas cookies también nos ayudan a realizar un seguimiento de la eficiencia de estas campañas publicitarias.
            </li>
          </ul>
          <h2>Cómo puede controlar las preferencias de cookies</h2>
          <p>
            Puede administrar sus preferencias de cookies haciendo clic en el botón "Configuración" y habilitando o deshabilitando las categorías de cookies en la ventana emergente según sus preferencias.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
