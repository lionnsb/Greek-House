import {
  homeGalleryImages,
  homeHeroImage,
  houseGalleryImages,
  houseTopImages,
  studioGalleryImages
} from "./imageSelection";

export const SITE_IMAGE_SECTION_IDS = [
  "home-hero",
  "home-gallery",
  "house-top",
  "room-features",
  "house-gallery",
  "studio-gallery",
  "location-gallery"
] as const;

export type SiteImageSection = (typeof SITE_IMAGE_SECTION_IDS)[number];
export type SiteImagePage = "home" | "house" | "studio";

export type SiteImage = {
  id: string;
  section: SiteImageSection;
  src: string;
  fileId: string | null;
  storagePath: string | null;
  alt: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteImageSectionConfig = {
  id: SiteImageSection;
  page: SiteImagePage;
  label: string;
  description: string;
  maxItems: number;
  required: boolean;
  previewClassName: string;
};

export const SITE_IMAGE_SECTION_CONFIGS: SiteImageSectionConfig[] = [
  {
    id: "home-hero",
    page: "home",
    label: "Titelbild",
    description: "Das große Bild im oberen Bereich der Startseite.",
    maxItems: 1,
    required: true,
    previewClassName: "grid-cols-1"
  },
  {
    id: "home-gallery",
    page: "home",
    label: "Startseiten-Galerie",
    description: "Die Bilder unter dem Abschnitt Eindrücke.",
    maxItems: 12,
    required: false,
    previewClassName: "sm:grid-cols-2 lg:grid-cols-3"
  },
  {
    id: "house-top",
    page: "house",
    label: "Apartment-Kopfbilder",
    description: "Die quadratischen Bilder neben der Apartment-Einleitung.",
    maxItems: 4,
    required: false,
    previewClassName: "sm:grid-cols-2"
  },
  {
    id: "room-features",
    page: "house",
    label: "Räume & Ausstattung",
    description:
      "Je ein Bild für Kochen/Wohnen, Master-Schlafzimmer, zweites Schlafzimmer, Bäder, Terrasse und Pool – in dieser Reihenfolge.",
    maxItems: 6,
    required: false,
    previewClassName: "sm:grid-cols-2 lg:grid-cols-3"
  },
  {
    id: "house-gallery",
    page: "house",
    label: "Apartment-Galerie",
    description: "Die große Galerie im Bereich Räume und Ausstattung.",
    maxItems: 24,
    required: false,
    previewClassName: "sm:grid-cols-2 lg:grid-cols-3"
  },
  {
    id: "studio-gallery",
    page: "studio",
    label: "Studio-Bilder",
    description: "Die Bilder neben der Beschreibung des Studios.",
    maxItems: 8,
    required: false,
    previewClassName: "sm:grid-cols-2"
  },
  {
    id: "location-gallery",
    page: "house",
    label: "Lage & Umgebung",
    description:
      "Die vier Bilder für Kastraki Beach, Sahara Beach, Glyfada Beach und Naxos – in dieser Reihenfolge.",
    maxItems: 4,
    required: false,
    previewClassName: "sm:grid-cols-2"
  }
];

export function isSiteImageSection(value: unknown): value is SiteImageSection {
  return (
    typeof value === "string" &&
    SITE_IMAGE_SECTION_IDS.includes(value as SiteImageSection)
  );
}

function staticImage(
  section: SiteImageSection,
  fileName: string,
  order: number,
  alt: string
): SiteImage {
  return {
    id: `default-${section}-${order}`,
    section,
    src: `/img/${fileName}`,
    fileId: null,
    storagePath: null,
    alt,
    order,
    createdAt: "",
    updatedAt: ""
  };
}

export const DEFAULT_SITE_IMAGES: SiteImage[] = [
  staticImage(
    "home-hero",
    homeHeroImage,
    0,
    "Pool und Meerblick des Apartmentbereichs"
  ),
  ...homeGalleryImages.map((file, order) =>
    staticImage(
      "home-gallery",
      file,
      order,
      `Eindruck vom Apartment ${order + 1}`
    )
  ),
  ...houseTopImages.map((file, order) =>
    staticImage(
      "house-top",
      file,
      order,
      `Apartment und Außenbereich ${order + 1}`
    )
  ),
  ...houseGalleryImages.map((file, order) =>
    staticImage("house-gallery", file, order, `Apartmentbereich ${order + 1}`)
  ),
  ...studioGalleryImages.slice(0, 4).map((file, order) =>
    staticImage("studio-gallery", file, order, `Studio ${order + 1}`)
  )
];

export function getSiteImagesForSection(
  images: SiteImage[],
  section: SiteImageSection
) {
  return images
    .filter((image) => image.section === section)
    .sort(
      (left, right) =>
        left.order - right.order || left.id.localeCompare(right.id)
    );
}

export function getSectionConfig(section: SiteImageSection) {
  return SITE_IMAGE_SECTION_CONFIGS.find((config) => config.id === section);
}
