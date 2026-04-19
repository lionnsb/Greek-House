export default function DatenschutzPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Datenschutz</h1>
        <p className="mt-4 text-sm text-ink/70">
          Diese Datenschutzerklärung ist ein Platzhalter und muss rechtlich
          geprüft und ergänzt werden.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-ink/70">
          <div className="card p-4">
            <p className="font-semibold text-ink">Verantwortliche Stelle</p>
            <p>Dagmar Goller</p>
            <p>Straße + Hausnummer</p>
            <p>PLZ Ort</p>
            <p>Land</p>
            <p>E-Mail: gollerdagmar@gmail.com</p>
            <p>Telefon: +41 76 329 92 88</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Welche Daten wir verarbeiten</p>
            <p>
              Bei der Anfrage verarbeiten wir die von dir angegebenen Daten
              (Name, E-Mail, Telefon optional, Zeitraum, Gästeanzahl,
              Studio-Wunsch).
            </p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Zweck der Verarbeitung</p>
            <p>
              Bearbeitung von Anfragen, Kommunikation und Verwaltung der
              Verfügbarkeit.
            </p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Speicherdauer</p>
            <p>
              Anfragen werden so lange gespeichert, wie es für die Abwicklung
              notwendig ist.
            </p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Hosting & Dienste</p>
            <p>
              Die Website wird gehostet, Anfragen werden in einer Datenbank
              gespeichert. E-Mails werden über SMTP versendet.
            </p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Deine Rechte</p>
            <p>
              Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung
              sowie Widerruf erteilter Einwilligungen.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink/60">
          Hinweis: Bitte rechtlich prüfen und ggf. durch einen Datenschutztext
          ersetzen.
        </p>
      </div>
    </div>
  );
}
