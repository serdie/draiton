import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function CondicionesDeUsoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="prose max-w-4xl mx-auto">
          <h1>Condiciones de Uso</h1>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
          </p>
          <p>
            El acceso y uso de este sitio web atribuye la condición de usuario, y acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
          </p>
          <h2>1. Uso del Portal</h2>
          <p>
            El sitio web proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a Search and Make S.L. o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos.
          </p>
          <h2>2. Obligaciones del Usuario</h2>
          <p>
            El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que Search and Make S.L. ofrece a través de su portal y con carácter enunciativo pero no limitativo, a no emplearlos para:
          </p>
          <ul>
            <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
            <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
            <li>Provocar daños en los sistemas físicos y lógicos de Search and Make S.L., de sus proveedores o de terceras personas.</li>
          </ul>
          <h2>3. Modificaciones</h2>
          <p>
            Search and Make S.L. se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
          </p>
          <h2>4. Legislación Aplicable y Jurisdicción</h2>
          <p>
            La relación entre Search and Make S.L. y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
