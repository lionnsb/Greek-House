import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t py-10">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Villa Name
          </div>

          <div className="flex gap-4 text-sm">
            <Link href="/impressum" className="text-gray-700 hover:text-gray-900">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-gray-700 hover:text-gray-900">
              Datenschutz
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
