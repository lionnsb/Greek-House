import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Villa Name
          </Link>

          <nav className="hidden gap-6 text-sm md:flex">
            <Link href="/haus" className="text-gray-700 hover:text-gray-900">
              Haus
            </Link>
            <Link href="/anreise" className="text-gray-700 hover:text-gray-900">
              Anreise
            </Link>
            <Link href="/kontakt" className="text-gray-700 hover:text-gray-900">
              Kontakt
            </Link>
          </nav>

          <Link
            href="/verfuegbarkeit"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Verfügbarkeit prüfen
          </Link>
        </div>
      </Container>
    </header>
  );
}
