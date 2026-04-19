import "../globals.css";
import Link from "next/link";
import { Container } from "@/components/Container";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <Link href="/admin" className="font-semibold tracking-tight">
                Admin Dashboard
              </Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Zur Website
              </Link>
            </div>
          </Container>
        </header>
        <main>
          <Container>{children}</Container>
        </main>
      </body>
    </html>
  );
}
