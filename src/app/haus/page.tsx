import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ImageGrid } from "@/components/ImageGrid";
import { houseTopImages, houseGalleryImages } from "@/lib/imageSelection";

const houseHighlights = [
  "Exklusives Apartment im Erdgeschoss (80 m²)",
  "Große Terrasse mit 30 m² Pool",
  "Außenküche mit Gasgrill (Plancher)",
  "Zwei Schlafzimmer & zwei Badezimmer",
  "Integriertes Studio mit eigenem Bad (optional)"
];

const studioHighlights = [
  "Separates Studio (ca. 10 m²) mit eigenem Bad",
  "Zugang über die Terrasse",
  "Doppelbett 140 x 200",
  "Klimaanlage & Standventilator",
  "Nur zusammen mit dem Apartmentbereich buchbar"
];

const rooms = [
  { title: "Kochen, Essen, Wohnen", description: "Voll ausgestattete Küche mit Backofen, Spülmaschine und Waschmaschine. Innen- und Außenküche mit Gasgrill (Plancher)." },
  { title: "Master-Schlafzimmer", description: "Doppelbett 160 x 200, offener Kleiderschrank, Safe. Duschbad über den Flur erreichbar." },
  { title: "Zweites Schlafzimmer", description: "Doppelbett 160 x 200 + Stockbett 90 x 200, Ensuite-Bad und eigene Terrasse mit Meerblick." },
  { title: "Bäder", description: "Alle Bäder mit Regendusche, Handbrause, Waschtisch und Popodusche." },
  { title: "Terrasse & Außenbereich", description: "Großer Außenbereich mit Sitzlounge, Außendusche und Meerblick." },
  { title: "Pool", description: "30 m² Pool direkt an der Terrasse." }
];

const amenities = [
  "Klimaanlage und Ventilatoren in Wohn- und Schlafbereichen",
  "Fußbodenheizung im Haupthaus für kühle Tage",
  "Trinkwasserfilter (separater Hahn in der Spüle)",
  "Wäschebereich mit Waschmaschine, Waschmittel, Wäschekörben",
  "Handtücher: pro Gast 1 Hand-, 1 Dusch- und 1 Strandtuch",
  "Safe im Master-Schlafzimmer"
];

export default function HausPage() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge">Mati tis Thalassas</p>
            <h1 className="mt-4 text-3xl font-semibold">Das Apartment</h1>
            <p className="mt-4 text-base text-ink/70">
              Unser Apartmentbereich in Kastraki auf Naxos bietet Platz für
              Familien und Gruppen. Das Apartment befindet sich in einem Haus,
              in dem ein weiterer Bereich privat genutzt wird.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/70">
              {houseHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href="/verfuegbarkeit" className="btn">
                Verfügbarkeit prüfen
              </Link>
              <Link href="/kontakt" className="btn-outline">
                Anfrage stellen
              </Link>
            </div>
          </div>
          <ImageGrid files={houseTopImages} className="sm:grid-cols-2" aspect="aspect-square" />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-semibold">Räume & Ausstattung</h2>
          <p className="mt-3 text-sm text-ink/70">
            Das Apartment bietet großzügige Innenräume und einen großen Außenbereich.
            Bilder kannst du später in die Platzhalter einsetzen.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.title} className="card p-6">
                <PlaceholderImage label={room.title} />
                <h3 className="mt-4 text-lg font-semibold">{room.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{room.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold">Galerie Apartmentbereich</h3>
            <div className="mt-4">
              <ImageGrid files={houseGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
            </div>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-ink/70 md:grid-cols-2">
            {amenities.map((item) => (
              <div key={item} className="card p-4">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 id="studio" className="text-2xl font-semibold scroll-mt-24">Studio (optional, integriert)</h2>
            <p className="mt-4 text-sm text-ink/70">
              Das Studio ist in den Apartmentbereich integriert und kann nur
              zusammen mit dem Apartment gebucht werden. Ideal für zusätzliche
              Privatsphäre.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/70">
              {studioHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlaceholderImage label="Studio Außen" />
            <PlaceholderImage label="Studio Innen" />
            <PlaceholderImage label="Studio Bad" />
            <PlaceholderImage label="Studio Terrasse" />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Lage & Umgebung</h2>
            <p className="mt-4 text-sm text-ink/70">
              Der Apartmentbereich liegt in Kastraki – nur ca. 50 Meter vom Meer und einem
              kleinen Strand entfernt. Nach rechts erreichst du nach ca. 250 m
              den 2 km langen Sahara Beach, nach links nach ca. 350 m den 3 km
              langen Glyfada Beach. Beide Strände sind auch in der Hauptsaison
              angenehm ruhig.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Von Mai bis Mitte Oktober sind Restaurants und eine Bar zu Fuß
              erreichbar. In der Umgebung gibt es Supermärkte und Bäckereien.
              Kitesurfen ist in Mikri Viglia (ca. 2 km) möglich.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlaceholderImage label="Strand Kastraki" />
            <PlaceholderImage label="Sahara Beach" />
            <PlaceholderImage label="Glyfada Beach" />
            <PlaceholderImage label="Insel Naxos" />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 id="apartmentregeln" className="text-2xl font-semibold scroll-mt-24">
            Hausregeln für das Apartment
          </h2>
          <ul className="mt-4 grid gap-3 text-sm text-ink/70">
            <li>Check-in ab 16:00 Uhr, Check-out bis 10:00 Uhr</li>
            <li>Nichtraucher-Apartmentbereich</li>
            <li><strong>KEINE HAUSTIERE.</strong></li>
            <li>Rücksicht auf den privat genutzten Apartmentbereich im selben Haus</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
