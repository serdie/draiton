
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const legalLinks = [
    { href: "/politica-de-privacidad", label: "Política de Privacidad" },
    { href: "/politica-de-cookies", label: "Política de Cookies" },
    { href: "/condiciones-de-uso", label: "Condiciones de Uso" },
];

const accessLinks = [
    { href: "/register", label: "Crear Cuenta" },
    { href: "/login", label: "Iniciar Sesión" },
    { href: "/#pricing", label: "Tarifas de Precios" },
];

const featureLinks = [
    { href: "/caracteristicas", label: "Características" },
    { href: "/control-horario", label: "Control Horario" },
    { href: "/herramientas-ia/marketing", label: "Marketing y Redes Sociales" },
    { href: "/herramientas-ia/oportunidades", label: "Buscador de Oportunidades" },
    { href: "/herramientas-ia/asistente-fiscal", label: "Asistente Fiscal" },
    { href: "/herramientas-ia/gestor-web", label: "Gestor y Analizador Web" },
    { href: "/herramientas-ia/digitalizacion", label: "Digitalización Inteligente" },
];

const helpLinks = [
    { href: "/soporte", label: "Soporte" },
    { href: "/contacto", label: "Contacto" },
    { href: "/preguntas-frecuentes", label: "Preguntas Frecuentes" },
];


export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-4">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" alt="Draiton Logo" width={110} height={40} className="h-8 w-auto" />
                </Link>
                <p className="text-sm text-muted-foreground">
                    Tu centro de operaciones para autónomos y pequeñas empresas.
                </p>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Facebook className="h-5 w-5" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Instagram className="h-5 w-5" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Linkedin className="h-5 w-5" />
                    </Link>
                     <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Twitter className="h-5 w-5" />
                    </Link>
                </div>
            </div>
            <div className="md:col-span-1 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Funcionalidades</h3>
                    <ul className="mt-4 space-y-2">
                        {featureLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Acceso Rápido</h3>
                    <ul className="mt-4 space-y-2">
                        {accessLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Ayuda</h3>
                    <ul className="mt-4 space-y-2">
                        {helpLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Legal</h3>
                    <ul className="mt-4 space-y-2">
                        {legalLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="mt-8 border-t pt-8">
             <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Draiton. Todos los derechos reservados. Aplicación creada por Search and Make S.L.
            </p>
        </div>
      </div>
    </footer>
  );
}
