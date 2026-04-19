import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ImageGrid } from "@/components/ImageGrid";
import { houseTopImages, houseGalleryImages } from "@/lib/imageSelection";

const houseHighlights = [
  "Exclusive ground-floor apartment (80 m²)",
  "Large terrace with 30 m² pool",
  "Outdoor kitchen with gas grill (plancha)",
  "Two bedrooms & two bathrooms",
  "Additional studio with private bathroom"
];

const studioHighlights = [
  "Separate studio (approx. 10 m²) with private bathroom",
  "Access via the terrace",
  "Double bed 140 x 200",
  "Air conditioning & standing fan",
  "Only bookable together with the house"
];

const rooms = [
  { title: "Cooking, Dining, Living", description: "Fully equipped kitchen with induction hob, oven, dishwasher and washing machine. Indoor and outdoor kitchen with gas grill." },
  { title: "Master Bedroom", description: "Double bed 160 x 200, open wardrobe, safe. Shower bathroom via hallway." },
  { title: "Second Bedroom", description: "Double bed 160 x 200 + bunk bed 90 x 200, ensuite bathroom and private sea-view terrace." },
  { title: "Bathrooms", description: "All bathrooms with rain shower, hand shower, washbasin and bidet spray." },
  { title: "Terrace & Outdoor Area", description: "Large outdoor area with lounge seating, outdoor shower and sea view." },
  { title: "Pool", description: "30 m² pool directly on the terrace." }
];

const amenities = [
  "Air conditioning and fans in living and sleeping areas",
  "Underfloor heating in the main house for cooler days",
  "Drinking water filter (separate faucet in the sink)",
  "Laundry area with washing machine, detergent, laundry baskets",
  "Towels: per guest 1 hand towel, 1 bath towel, 1 beach towel",
  "Safe in the master bedroom"
];

export default function HousePageEn() {
  return (
    <div>
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge">Mati tis Thalassas</p>
            <h1 className="mt-4 text-3xl font-semibold">The House</h1>
            <p className="mt-4 text-base text-ink/70">
              Our holiday home in Kastraki on Naxos offers space for families and
              groups. Spacious living areas, quiet bedrooms, a high-quality
              kitchen and inviting outdoor areas.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/70">
              {houseHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href="/en/verfuegbarkeit" className="btn">
                Check availability
              </Link>
              <Link href="/en/kontakt" className="btn-outline">
                Send enquiry
              </Link>
            </div>
          </div>
          <ImageGrid files={houseTopImages} className="sm:grid-cols-2" aspect="aspect-square" />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-semibold">Rooms & Amenities</h2>
          <p className="mt-3 text-sm text-ink/70">
            The apartment offers spacious interiors and a large outdoor area.
            Replace placeholders with images later.
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
            <h3 className="text-lg font-semibold">House Gallery</h3>
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
            <h2 className="text-2xl font-semibold">Studio (optional)</h2>
            <p className="mt-4 text-sm text-ink/70">
              The studio is a separate area and can only be booked together with
              the house. Ideal for additional privacy.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/70">
              {studioHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Location & Surroundings</h2>
            <p className="mt-4 text-sm text-ink/70">
              The villa is located in Kastraki – only about 50 m from the sea
              and a small beach. To the right you reach Sahara Beach after about
              250 m, to the left Glyfada Beach after about 350 m.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              From May to mid-October restaurants and a bar are within walking
              distance. Supermarkets and bakeries are nearby. Kitesurfing is
              possible in Mikri Viglia (approx. 2 km).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlaceholderImage label="Kastraki Beach" />
            <PlaceholderImage label="Sahara Beach" />
            <PlaceholderImage label="Glyfada Beach" />
            <PlaceholderImage label="Naxos" />
          </div>
        </div>
      </section>
    </div>
  );
}
