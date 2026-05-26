export default function AnreisePage() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Anreise</h1>
          <p className="mt-4 text-sm text-ink/70">
            Hier findest du die wichtigsten Informationen zur Lage des
            Apartments und zu den Stränden in der direkten Umgebung.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Lage</p>
              <p className="mt-2">
                Die Villa Mati tis Thalassas liegt in Kastraki nur etwa 50 m
                vom Meer und einem kleinen Strand entfernt. Das zu vermietende
                Apartment befindet sich im Erdgeschoss.
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
                Sahara Beach ca. 250 m, Glyfada Beach ca. 350 m. Beide Strände
                sind auch in der Hauptsaison nicht überfüllt.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Versorgung</p>
              <p className="mt-2">
                Von Mai bis Mitte Oktober sind mehrere (Strand-)Restaurants und
                eine Bar fußläufig erreichbar. Für die Versorgung gibt es vier
                Supermärkte und zwei Bäckereien in der Umgebung.
              </p>
            </div>
          </div>
        </div>
        <div className="card h-96 bg-stone/50" />
      </div>
    </div>
  );
}
