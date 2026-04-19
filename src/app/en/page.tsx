import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import { heroImages, homeGalleryImages } from "@/lib/imageSelection";

const highlights = [
  "50 m to the sea and a small beach",
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
              Villa with sea view, pool & studio – just 50 m to the beach.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Exclusive ground‑floor apartment with a large terrace, 30 m² pool,
              outdoor kitchen and optional studio. Perfect for families, friends
              or a relaxed island stay.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/en/verfuegbarkeit" className="btn">
                Check availability
              </Link>
              <Link href="/en/haus" className="btn-outline">
                Explore the house
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
              <div className="card p-4">50 m to the sea</div>
              <div className="card p-4">30 m² pool</div>
              <div className="card p-4">Outdoor kitchen + grill</div>
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
