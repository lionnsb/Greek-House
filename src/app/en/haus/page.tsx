import Link from "next/link";
import { ImageGrid } from "@/components/ImageGrid";
import { SiteImageSlot } from "@/components/SiteImageSlot";
import { getSiteImagesForSection } from "@/lib/siteImages";
import { getPublicSiteImages } from "@/lib/siteImagesStore";

export const dynamic = "force-dynamic";

const houseHighlights = [
  "Exclusive ground-floor apartment with approx. 80 m² of living space",
  "Spacious living room with open kitchen and dining area",
  "Large terrace with 30 m² pool for private use",
  "Outdoor kitchen with gas grill / plancha",
  "Two bedrooms and two bathrooms",
  "Air conditioning and fans in every room",
  "Separate studio with private bathroom",
  "Two private parking spaces directly next to the entrance",
  "Barrier-reduced access via a ramp to the entrance"
];

const studioHighlights = [
  "Approx. 10 m² studio with private bathroom",
  "Separate access via the terrace",
  "Double bed 140 x 200",
  "Air conditioning and standing fan",
  "Sunbeds"
];

const rooms = [
  {
    title: "Cooking, Dining, Living",
    description:
      "Fully equipped kitchen with Nespresso machine, kettle, toaster, crockery and cooking utensils. It also includes a fridge-freezer, oven, dishwasher, washing machine and an outdoor kitchen with gas grill."
  },
  {
    title: "Master Bedroom",
    description:
      "Terrace-facing bedroom with double bed 160 x 200, built-in open wardrobe, additional shelves and a programmable safe. The matching shower bathroom is accessible across the hallway."
  },
  {
    title: "Second Bedroom",
    description:
      "Double bed 160 x 200 and bunk bed 90 x 200, open Cycladic-style wardrobe and additional storage space. Also includes an ensuite bathroom and a private terrace with sea view. The bunk bed is especially popular with children and teenagers."
  },
  {
    title: "Bathrooms",
    description:
      "All bathrooms have a toilet with bidet hand shower, a rain shower with hand shower and a washbasin with hand soap. A basket for personal toiletries is provided for each guest."
  },
  {
    title: "Terrace & Outdoor Area",
    description:
      "The generously covered terrace offers a sheltered dining area with sea view and invites you to relax outdoors. Sunbeds, parasols and poufs provide additional comfort in the outdoor area."
  },
  {
    title: "Pool",
    description: "30 m² pool directly on the terrace. An outdoor shower is located directly on the terrace."
  }
];

const amenities = [
  "Air conditioning and fans in the living room, bedrooms and studio",
  "Underfloor heating in the main house for colder days",
  "Drinking water via a separate filtered tap",
  "Towels and beach towels are provided for our guests",
  "Laundry cupboard with washing machine, detergents, baskets, drying rack and pegs",
  "Programmable safe in the master bedroom"
];

const locationImageLabels = [
  "Kastraki Beach",
  "Sahara Beach",
  "Glyfada Beach",
  "Naxos"
];

export default async function HousePageEn() {
  const siteImages = await getPublicSiteImages();
  const houseTopImages = getSiteImagesForSection(siteImages, "house-top");
  const roomFeatureImages = getSiteImagesForSection(
    siteImages,
    "room-features"
  );
  const houseGalleryImages = getSiteImagesForSection(
    siteImages,
    "house-gallery"
  );
  const studioGalleryImages = getSiteImagesForSection(
    siteImages,
    "studio-gallery"
  );
  const locationGalleryImages = getSiteImagesForSection(
    siteImages,
    "location-gallery"
  );

  return (
    <div>
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge">Mati tis Thalassas</p>
            <h1 className="mt-4 text-3xl font-semibold">The Apartment</h1>
            <p className="mt-4 text-base text-ink/70">
              Villa Mati tis Thalassas in Kastraki consists of two apartments
              and an atelier, set in a large garden. The apartment for rent on
              the ground floor offers plenty of privacy; the upper floor and
              the atelier are privately used.
            </p>
            <p className="mt-3 text-base text-ink/70">
              The apartment is located on the ground floor of Villa &quot;Mati
              tis Thalassas&quot; in Kastraki. Spacious living areas, peaceful
              bedrooms, a high-quality kitchen and inviting outdoor areas
              accommodate up to 7 guests.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/70">
              {houseHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <Link href="/en/verfuegbarkeit" className="btn btn-accent">
                Check availability
              </Link>
              <Link href="/en/kontakt" className="btn-outline">
                Send enquiry
              </Link>
            </div>
          </div>
          <ImageGrid images={houseTopImages} className="sm:grid-cols-2" aspect="aspect-square" />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-semibold">Rooms & Amenities</h2>
          <p className="mt-3 text-sm text-ink/70">
            Spacious interiors, plenty of storage and an outdoor area that
            extends the living space all the way towards the sea.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, index) => (
              <div key={room.title} className="card p-6">
                <SiteImageSlot
                  image={roomFeatureImages[index]}
                  fallbackLabel={room.title}
                />
                <h3 className="mt-4 text-lg font-semibold">{room.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{room.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold">Apartment Area Gallery</h3>
            <div className="mt-4">
              <ImageGrid images={houseGalleryImages} className="md:grid-cols-3" aspect="aspect-[4/3]" />
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
            <h2 id="studio" className="text-2xl font-semibold scroll-mt-24">Studio (optional, separate)</h2>
            <p className="mt-4 text-sm text-ink/70">
              The approx. 10 m² studio can be rented in addition to the
              apartment. It is set apart, reached via the terrace through a
              large lockable sliding glass door and comes with its own
              bathroom.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/70">
              {studioHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/70">
              The studio creates additional space for larger families, blended
              family setups, grandparents or a travelling caregiver.
            </p>
          </div>
          {studioGalleryImages.length > 0 ? (
            <ImageGrid
              images={studioGalleryImages}
              className="sm:grid-cols-2"
              aspect="aspect-square"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SiteImageSlot fallbackLabel="Studio Exterior" />
              <SiteImageSlot fallbackLabel="Studio Interior" />
              <SiteImageSlot fallbackLabel="Studio Bathroom" />
              <SiteImageSlot fallbackLabel="Studio Terrace" />
            </div>
          )}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Location & Surroundings</h2>
            <p className="mt-4 text-sm text-ink/70">
              Villa Mati tis Thalassas is located in Kastraki only 50 metres
              from the sea and a small beach. To the right you reach the
              2 km-long Sahara Beach after about 250 m, to the left the
              3 km-long Glyfada Beach after about 350 m. Both beaches are not
              overcrowded even in high season.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Both beaches offer a range of sports activities; the kite beach
              in Mikri Viglia is only about 2 km away. From May to mid-October,
              several beach restaurants and a bar are within walking distance.
              For daily supplies there are four supermarkets and two bakeries
              nearby.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Naxos offers a beautiful old town, a lovely harbour with many
              restaurants and bars, historical sights and scenic hiking trails.
              The island is also popular with windsurfers and kitesurfers.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {locationImageLabels.map((label, index) => (
              <SiteImageSlot
                key={label}
                image={locationGalleryImages[index]}
                fallbackLabel={label}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container">
          <h2 id="apartment-rules" className="text-2xl font-semibold scroll-mt-24">
            House rules for the apartment
          </h2>
          <ul className="mt-4 grid gap-3 text-sm text-ink/70">
            <li>Check-in from 16:00, check-out by 10:00</li>
            <li>Non-smoking apartment</li>
            <li><strong>NO PETS.</strong></li>
            <li>Children under 2 years are warmly welcome on request. A baby cot can be provided if needed.</li>
            <li>Please be considerate of the neighbours.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
