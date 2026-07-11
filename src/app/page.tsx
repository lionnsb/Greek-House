import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import {
  DEFAULT_SITE_IMAGES,
  getSiteImagesForSection
} from "@/lib/siteImages";
import { getPublicSiteImages } from "@/lib/siteImagesStore";

export const dynamic = "force-dynamic";

const highlights = [
  "Nur 50 Meter zum Meer und zu einem kleinen Strand",
  "Großer Außenbereich mit Sitzecke und Meerblick",
  "30 m² Pool mit Außendusche",
  "Außenküche mit Gasgrill (Plancha)",
  "Zwei Schlafzimmer und zwei Badezimmer auf 80 m²",
  "Separates Studio mit eigenem Bad zusätzlich buchbar"
];

export default async function HomePage() {
  const siteImages = await getPublicSiteImages();
  const homeHeroImage =
    getSiteImagesForSection(siteImages, "home-hero")[0] ??
    getSiteImagesForSection(DEFAULT_SITE_IMAGES, "home-hero")[0];
  const homeGalleryImages = getSiteImagesForSection(
    siteImages,
    "home-gallery"
  );

  return (
    <div>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="badge">Mati tis Thalassas · Kastraki, Naxos</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Exklusives Apartment im Erdgeschoss mit großer Terrasse, 30 m² Pool und separatem Studio.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Das Apartment im Erdgeschoss mit großer Terrasse, 30 m² Pool,
              Außenküche und separatem Studio ist perfekt für einen
              entspannten Urlaub mit Familie oder Freunden.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/verfuegbarkeit" className="btn">
                Verfügbarkeit prüfen
              </Link>
              <Link href="/haus" className="btn-outline">
                Apartment entdecken
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone bg-stone/40">
            <img
              src={homeHeroImage.src}
              alt={homeHeroImage.alt}
              className="h-full w-full object-cover"
            />
          </div>
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
            <ImageGrid images={homeGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>
    </div>
  );
}
