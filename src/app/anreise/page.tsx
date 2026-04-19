export default function AnreisePage() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Anreise</h1>
          <p className="mt-4 text-sm text-ink/70">
            Hier findest du die wichtigsten Informationen zur Lage, Anfahrt und
            Check-in/Check-out.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Lage</p>
              <p className="mt-2">
                Kastraki, Naxos – nur ca. 50 m vom Meer entfernt. Adresse und
                Kartenlink ergänzen wir gern.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Check-in</p>
              <p className="mt-2">Ab 16:00 Uhr, Self-Check-in möglich.</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Check-out</p>
              <p className="mt-2">Bis 10:00 Uhr am Abreisetag.</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Strände in der Nähe</p>
              <p className="mt-2">
                Sahara Beach ca. 250 m, Glyfada Beach ca. 350 m. Beide sind auch
                in der Hochsaison angenehm ruhig.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Versorgung</p>
              <p className="mt-2">
                Von Mai bis Mitte Oktober Restaurants und eine Bar fußläufig.
                Supermärkte und Bäckereien in der Umgebung.
              </p>
            </div>
          </div>
        </div>
        <div className="card h-96 bg-stone/50" />
      </div>
    </div>
  );
}
