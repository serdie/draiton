import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2025 GestorIA. Todos los derechos reservados. Aplicación creada por Search and Make S.L.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground">Política de Privacidad</Link>
          <Link href="/politica-de-cookies" className="text-sm text-muted-foreground hover:text-foreground">Política de Cookies</Link>
          <Link href="/aviso-legal" className="text-sm text-muted-foreground hover:text-foreground">Aviso Legal</Link>
          <Link href="/condiciones-de-uso" className="text-sm text-muted-foreground hover:text-foreground">Condiciones de Uso</Link>
        </nav>
      </div>
    </footer>
  );
}
