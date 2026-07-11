import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  DEFAULT_SITE_IMAGES,
  isSiteImageSection,
  type SiteImage
} from "@/lib/siteImages";

export const SITE_IMAGES_COLLECTION = "site_images";
export const SITE_IMAGES_CACHE_TAG = "site-images";

type SiteImageDocument = {
  section?: unknown;
  src?: unknown;
  file_id?: unknown;
  storage_path?: unknown;
  alt?: unknown;
  sort_order?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export function serializeSiteImage(
  id: string,
  data: SiteImageDocument
): SiteImage | null {
  if (!isSiteImageSection(data.section) || typeof data.src !== "string") {
    return null;
  }

  return {
    id,
    section: data.section,
    src: data.src,
    fileId: typeof data.file_id === "string" ? data.file_id : null,
    storagePath:
      typeof data.storage_path === "string" ? data.storage_path : null,
    alt: typeof data.alt === "string" ? data.alt : "",
    order:
      typeof data.sort_order === "number" && Number.isFinite(data.sort_order)
        ? data.sort_order
        : 0,
    createdAt:
      typeof data.created_at === "string" ? data.created_at : "",
    updatedAt:
      typeof data.updated_at === "string" ? data.updated_at : ""
  };
}

export async function readStoredSiteImages() {
  const snapshot = await adminDb.collection(SITE_IMAGES_COLLECTION).get();
  return snapshot.docs
    .map((doc) => serializeSiteImage(doc.id, doc.data()))
    .filter((image): image is SiteImage => image !== null)
    .sort(
      (left, right) =>
        left.section.localeCompare(right.section) ||
        left.order - right.order ||
        left.id.localeCompare(right.id)
    );
}

export async function ensureDefaultSiteImages() {
  const images = await readStoredSiteImages();
  if (images.length > 0) {
    return images;
  }

  const now = new Date().toISOString();
  const batch = adminDb.batch();

  for (const image of DEFAULT_SITE_IMAGES) {
    const ref = adminDb.collection(SITE_IMAGES_COLLECTION).doc(image.id);
    batch.set(ref, {
      section: image.section,
      src: image.src,
      file_id: null,
      storage_path: null,
      alt: image.alt,
      sort_order: image.order,
      created_at: now,
      updated_at: now
    });
  }

  await batch.commit();
  return readStoredSiteImages();
}

async function readPublicSiteImages() {
  try {
    const images = await readStoredSiteImages();
    return images.length > 0 ? images : DEFAULT_SITE_IMAGES;
  } catch {
    return DEFAULT_SITE_IMAGES;
  }
}

export const getPublicSiteImages = unstable_cache(
  readPublicSiteImages,
  ["public-site-images"],
  { tags: [SITE_IMAGES_CACHE_TAG], revalidate: 3600 }
);
