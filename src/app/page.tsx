import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import { heroImages, homeGalleryImages } from "@/lib/imageSelection";

const highlights = [
  "50 m zum Meer und kleinem Strand",
  "Große Terrasse mit 30 m² Pool",
  "Außenküche mit Gasgrill (Plancher)",
  "Zwei Schlafzimmer + zwei Bäder",
  "Optionales Studio mit eigenem Bad",
  "Klimaanlage & Fußbodenheizung"
];

export default function HomePage() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="badge">Mati tis Thalassas · Kastraki, Naxos</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Villa mit Meerblick, Pool & Studio – nur 50 m zum Strand.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Exklusives Apartment im Erdgeschoss mit großer Terrasse, 30 m² Pool,
              Außenküche und optionalem Studio. Perfekt für Familien, Freunde oder
              einen entspannten Inselaufenthalt.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/verfuegbarkeit" className="btn">
                Verfügbarkeit prüfen
              </Link>
              <Link href="/haus" className="btn-outline">
                Haus entdecken
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
              <div className="card p-4">50 m zum Meer</div>
              <div className="card p-4">30 m² Pool</div>
              <div className="card p-4">Außenküche + Grill</div>
              <div className="card p-4">Studio optional</div>
            </div>
          </div>
          <ImageGrid files={heroImages} className="sm:grid-cols-2" aspect="aspect-square" />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-semibold">Highlights</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {highlights.slice(0, 4).map((item) => (
              <div key={item} className="card p-6 text-sm text-ink/80">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Eindrücke</h2>
            <Link href="/haus" className="link text-sm">
              Mehr Bilder
            </Link>
          </div>
          <div className="mt-6">
            <ImageGrid files={homeGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>
    </div>
  );
}
