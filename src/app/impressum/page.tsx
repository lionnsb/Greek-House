export default function ImpressumPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Impressum</h1>
        <p className="mt-4 text-sm text-ink/70">
          Angaben gemäß § 5 TMG / Anbieterkennzeichnung. Bitte ergänze die
          folgenden Pflichtangaben.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-ink/70">
          <div className="card p-4">
            <p className="font-semibold text-ink">Anbieterin</p>
            <p>Dagmar Goller</p>
            <p>Straße + Hausnummer</p>
            <p>PLZ Ort</p>
            <p>Land</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Kontakt</p>
            <p>E-Mail: gollerdagmar@gmail.com</p>
            <p>Telefon: +41 76 329 92 88</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Weitere Angaben</p>
            <p>USt-IdNr. (falls vorhanden)</p>
            <p>Vertretungsberechtigte Person (falls zutreffend)</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink/60">
          Hinweis: Die Inhalte sind Platzhalter und müssen rechtlich korrekt
          ergänzt werden.
        </p>
      </div>
    </div>
  );
}
