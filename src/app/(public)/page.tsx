import Link from "next/link";
import { Container } from "@/components/Container";

export default function HomePage() {
  return (
    <div>
      <section className="border-b">
        <Container>
          <div className="grid gap-10 py-14 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Dein Ferienhaus in Griechenland – stilvoll, ruhig, nah am Meer.
              </h1>
              <p className="text-gray-600">
                Keine Online-Zahlung: Du stellst eine Anfrage, wir bestätigen per E-Mail und senden dir die Infos zur
                Überweisung.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/verfuegbarkeit" className="rounded-full bg-black px-5 py-2.5 text-white hover:opacity-90">
                  Verfügbarkeit prüfen
                </Link>
                <Link href="/haus" className="rounded-full border px-5 py-2.5 hover:bg-gray-50">
                  Haus ansehen
                </Link>
              </div>

              <div className="grid gap-3 pt-4 md:grid-cols-3">
                <div className="rounded-2xl border p-4 text-sm">
                  <div className="font-medium">Studio optional</div>
                  <div className="text-gray-600">Nur zusammen mit dem Haus buchbar</div>
                </div>
                <div className="rounded-2xl border p-4 text-sm">
                  <div className="font-medium">Perfekt zum Abschalten</div>
                  <div className="text-gray-600">Ruhige Lage, viel Privatsphäre</div>
                </div>
                <div className="rounded-2xl border p-4 text-sm">
                  <div className="font-medium">Einfach anreisen</div>
                  <div className="text-gray-600">Alle Infos auf der Anreise-Seite</div>
                </div>
              </div>
            </div>

            {/* Bild Platzhalter (später Foto) */}
            <div className="aspect-[4/3] w-full rounded-3xl bg-gray-100" />
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="py-14">
            <h2 className="text-2xl font-semibold">Kurz & klar</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border p-6">
                <div className="font-medium">Ausstattung</div>
                <p className="mt-2 text-sm text-gray-600">
                  Küche, Klima, WLAN, Außenbereich – Details findest du auf der Haus-Seite.
                </p>
              </div>
              <div className="rounded-3xl border p-6">
                <div className="font-medium">Regeln</div>
                <p className="mt-2 text-sm text-gray-600">
                  Check-in/out Zeiten, Hausregeln, Hinweise – transparent und einfach.
                </p>
              </div>
              <div className="rounded-3xl border p-6">
                <div className="font-medium">Anfrage</div>
                <p className="mt-2 text-sm text-gray-600">
                  Zeitraum auswählen, Anfrage senden. Wir halten den Termin kurz für dich frei.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
