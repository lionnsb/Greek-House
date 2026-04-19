import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ImageGrid } from "@/components/ImageGrid";
import { studioGalleryImages } from "@/lib/imageSelection";

const studioFeatures = [
  "Separate studio (approx. 10 m²)",
  "Private bathroom with shower, WC, washbasin",
  "Double bed 140 x 200",
  "Open wardrobe in cycladic style",
  "Air conditioning & standing fan",
  "Access via the terrace",
  "Only bookable together with the house"
];

export default function StudioPageEn() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge">Mati tis Thalassas</p>
            <h1 className="mt-4 text-3xl font-semibold">The Studio</h1>
            <p className="mt-4 text-base text-ink/70">
              The studio is a separate area and can only be booked together with
              the apartment. Ideal for additional guests and more privacy.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/70">
              {studioFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href="/en/verfuegbarkeit" className="btn">
                Check availability
              </Link>
              <Link href="/en/haus" className="btn-outline">
                Back to house
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlaceholderImage label="Studio Exterior" />
            <PlaceholderImage label="Studio Interior" />
            <PlaceholderImage label="Studio Bathroom" />
            <PlaceholderImage label="Studio Terrace" />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-semibold">Why the studio?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card p-6 text-sm text-ink/70">
              Extra space for larger families or groups.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Great for grandparents, au-pair or friends.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Separate access and private bathroom.
            </div>
            <div className="card p-6 text-sm text-ink/70">
              Quiet location right by the terrace.
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-2xl font-semibold">Studio gallery</h2>
          <div className="mt-4">
            <ImageGrid files={studioGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>
    </div>
  );
}
