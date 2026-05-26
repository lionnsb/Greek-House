import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ImageGrid } from "@/components/ImageGrid";
import { houseTopImages, houseGalleryImages } from "@/lib/imageSelection";

const houseHighlights = [
  "Exklusives Erdgeschoss-Apartment mit 80 m² Wohnfläche",
  "Große Terrasse mit 30 m² Pool und Außendusche",
  "Außenküche mit Gasgrill (Plancha)",
  "Zwei Schlafzimmer und zwei Badezimmer",
  "Separates Studio mit eigenem Bad zusätzlich buchbar"
];

const studioHighlights = [
  "Ca. 10 m² großes Studio mit eigenem Bad",
  "Separater Zugang über die Terrasse",
  "Doppelbett 140 x 200",
  "Klimaanlage und Standventilator",
  "Zusätzlicher Stauraum hinter großen Schranktüren"
];

const rooms = [
  {
    title: "Kochen, Essen, Wohnen",
    description:
      "Komplett ausgestattete Küche mit Nespresso-Maschine, Wasserkocher, Toaster, Geschirr und Kochutensilien. Dazu kommen Induktionsherd, Kühl-/Gefrierkombination, Backofen, Spülmaschine, Waschmaschine und eine Außenküche mit Gasgrill."
  },
  {
    title: "Master-Schlafzimmer",
    description:
      "Zur Terrasse ausgerichtetes Schlafzimmer mit Doppelbett 160 x 200, offenem Einbauschrank, zusätzlichen Ablagen und programmierbarem Safe. Das zugehörige Duschbad liegt gegenüber auf der Flurseite."
  },
  {
    title: "Zweites Schlafzimmer",
    description:
      "Doppelbett 160 x 200 und Stockbett 90 x 200, offener Kleiderschrank im kykladischen Stil und zusätzlicher Stauraum. Dazu ein Ensuite-Bad und eine eigene Terrasse mit Meerblick. Das Stockbett ist bei Kindern und Jugendlichen besonders beliebt."
  },
  {
    title: "Bäder",
    description:
      "Alle Badezimmer haben eine Toilette mit Bidet-Dusche, eine Regendusche mit Handbrause und einen Waschtisch mit Handseife. Für persönliche Kosmetika steht pro Gast ein Korb bereit."
  },
  {
    title: "Terrasse & Außenbereich",
    description:
      "Großer Außenbereich mit gemütlicher Sitzecke, Meerblick, Außendusche und direktem Zugang zum Pool sowie zum Studio."
  },
  { title: "Pool", description: "30 m² großer Pool direkt an der Terrasse." }
];

const amenities = [
  "Klimaanlage und Ventilatoren in Wohnzimmer, Schlafzimmern und Studio",
  "Fußbodenheizung im Haupthaus für kalte Tage",
  "Trinkwasser über separaten Hahn mit Filteranlage",
  "Pro Gast liegen ein Handtuch, ein Duschtuch und ein Strandtuch bereit",
  "Wäscheschrank mit Waschmaschine, Waschmitteln, Körben, Wäscheständer und Klammern",
  "Programmierbarer Safe im Hauptschlafzimmer"
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
              Die Villa Mati tis Thalassas in Kastraki besteht aus zwei
              Apartments und einem Atelier, eingebettet in einen großen Garten.
              Das zu vermietende Apartment im Erdgeschoss bietet viel
              Privatsphäre; Obergeschoss und Atelier werden privat genutzt.
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
            Großzügige Innenräume, viel Stauraum und ein Außenbereich, der das
            Wohnen bis ans Meer verlängert.
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
            <h2 id="studio" className="text-2xl font-semibold scroll-mt-24">Studio (optional, separat)</h2>
            <p className="mt-4 text-sm text-ink/70">
              Das ca. 10 m² große Studio kann zusätzlich zum Apartment
              angemietet werden. Es liegt separat, wird über die Terrasse durch
              eine große abschließbare Fenster-Schiebetür erreicht und verfügt
              über ein eigenes Badezimmer.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/70">
              {studioHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/70">
              Das Studio schafft zusätzlichen Platz für größere Familien,
              Patchwork-Konstellationen, Großeltern oder mitreisende
              Betreuungspersonen.
            </p>
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
              Die Villa Mati tis Thalassas liegt in Kastraki nur 50 Meter vom
              Meer und einem kleinen Strand entfernt. Nach rechts gelangst du
              nach ca. 250 m zum 2 km langen Sahara Beach, nach links nach ca.
              350 m zum 3 km langen Glyfada Beach. Beide Strände sind auch in
              der Hauptsaison nicht überfüllt.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              An beiden Stränden gibt es verschiedene Sportangebote; der
              Kite-Strand in Mikri Viglia ist nur etwa 2 km entfernt. Von Mai
              bis Mitte Oktober sind mehrere (Strand-)Restaurants und eine Bar
              fußläufig erreichbar. Für die Versorgung gibt es vier
              Supermärkte und zwei Bäckereien in der Umgebung.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Naxos bietet eine wunderschöne Altstadt, einen schönen Hafen mit
              vielen Restaurants und Bars, historische Sehenswürdigkeiten und
              schöne Wanderwege. Die Insel ist außerdem beliebt bei Wind- und
              Kitesurfern.
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
