import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import { homeGalleryImages, homeHeroImage } from "@/lib/imageSelection";

const highlights = [
  "Only 50 metres to the sea and a small beach",
  "Large outdoor area with lounge seating and sea view",
  "30 m² pool with outdoor shower",
  "Outdoor kitchen with gas grill (plancha)",
  "Two bedrooms and two bathrooms across 80 m²",
  "Separate studio with private bathroom available in addition"
];

export default function HomePageEn() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="badge">Mati tis Thalassas · Kastraki, Naxos</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Exclusive ground-floor apartment with large terrace, 30 m² pool and separate studio.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Villa Mati tis Thalassas in Kastraki consists of two apartments
              and an atelier, set in a large garden. The apartment for rent is
              only 50 metres from the sea; the upper floor and the atelier are
              privately used.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/en/verfuegbarkeit" className="btn">
                Check availability
              </Link>
              <Link href="/en/haus" className="btn-outline">
                Explore the apartment
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone bg-stone/40">
            <img
              src={`/img/${homeHeroImage}`}
              alt="Pool and sea view of the apartment area"
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
            <h2 className="text-2xl font-semibold">Gallery</h2>
            <Link href="/en/haus" className="link text-sm">
              More photos
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
