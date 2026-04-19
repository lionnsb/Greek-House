import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ImageGrid } from "@/components/ImageGrid";
import { studioGalleryImages } from "@/lib/imageSelection";

const studioFeatures = [
  "Separates Studio (ca. 10 m²)",
  "Eigenes Bad mit Dusche, WC, Waschtisch",
  "Doppelbett 140 x 200",
  "Offener Kleiderschrank im kykladischen Stil",
  "Klimaanlage & Standventilator",
  "Zugang über die Terrasse",
  "Nur zusammen mit dem Haus buchbar"
];

export default function StudioPage() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge">Mati tis Thalassas</p>
            <h1 className="mt-4 text-3xl font-semibold">Das Studio</h1>
            <p className="mt-4 text-base text-ink/70">
              Das Studio ist ein separater Bereich und kann nur zusammen mit dem
              Apartment gebucht werden. Ideal für zusätzliche Gäste und mehr
              Privatsphäre.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/70">
              {studioFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href="/verfuegbarkeit" className="btn">
                Verfügbarkeit prüfen
              </Link>
              <Link href="/haus" className="btn-outline">
                Zum Haus
              </Link>
            </div>
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
        <div className="container">
          <h2 className="text-2xl font-semibold">Warum das Studio?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card p-6 text-sm text-ink/70">
              Mehr Platz für größere Familien oder Gruppen.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Ideal für Großeltern, Au‑pair oder Freunde mit eigenem Rückzugsort.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Separater Zugang und eigenes Badezimmer.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Ruhige Lage direkt an der Terrasse.
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-2xl font-semibold">Studio Galerie</h2>
          <div className="mt-4">
            <ImageGrid files={studioGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>
    </div>
  );
}
