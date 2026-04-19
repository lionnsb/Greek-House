export default function KontaktPage() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Kontakt</h1>
          <p className="mt-4 text-sm text-ink/70">
            Du erreichst uns direkt oder über das Anfrageformular. Wir melden
            uns schnellstmöglich zurück.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Ansprechpartnerin</p>
              <p className="mt-2">Dagmar Goller</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">E-Mail</p>
              <p className="mt-2">gollerdagmar@gmail.com</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Telefon / WhatsApp</p>
              <p className="mt-2">+41 76 329 92 88</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Direkte Anfrage</h2>
          <p className="mt-2 text-sm text-ink/70">
            Für Verfügbarkeiten und Buchungen nutzen wir das Anfrageformular
            über den Kalender.
          </p>
          <div className="mt-4">
            <a href="/verfuegbarkeit" className="btn">
              Zur Anfrage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
