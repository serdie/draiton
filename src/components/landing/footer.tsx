import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Emprende Total. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Términos</Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacidad</Link>
        </nav>
      </div>
    </footer>
  );
}
