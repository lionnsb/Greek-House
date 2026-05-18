import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import { homeGalleryImages } from "@/lib/imageSelection";

const highlights = [
  "About 50 m to the sea and a small beach",
  "Large terrace with 30 m² pool",
  "Outdoor kitchen with gas grill (plancha)",
  "Two bedrooms + two bathrooms",
  "Optional studio with own bathroom",
  "Air conditioning & underfloor heating"
];

export default function HomePageEn() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="badge">Mati tis Thalassas · Kastraki, Naxos</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Apartment area with pool, sea view and optional studio.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Exclusive ground-floor apartment with a large terrace, 30 m² pool
              and outdoor kitchen. The apartment is part of a house that also
              contains another privately used apartment area.
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
              src="/img/IMG_2806.JPG"
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
