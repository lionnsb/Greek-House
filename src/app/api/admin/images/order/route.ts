import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { isSiteImageSection } from "@/lib/siteImages";
import {
  ensureDefaultSiteImages,
  SITE_IMAGES_CACHE_TAG,
  SITE_IMAGES_COLLECTION
} from "@/lib/siteImagesStore";

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      section?: unknown;
      ids?: unknown;
    };

    if (
      !isSiteImageSection(payload.section) ||
      !Array.isArray(payload.ids) ||
      payload.ids.some(
        (id) => typeof id !== "string" || !id || id.includes("/")
      )
    ) {
      return NextResponse.json(
        { message: "Ungültige Sortierung." },
        { status: 400 }
      );
    }

    const images = await ensureDefaultSiteImages();
    const currentIds = images
      .filter((image) => image.section === payload.section)
      .map((image) => image.id)
      .sort();
    const requestedIds = [...payload.ids].sort();

    if (
      currentIds.length !== requestedIds.length ||
      currentIds.some((id, index) => id !== requestedIds[index])
    ) {
      return NextResponse.json(
        { message: "Die Bildliste hat sich geändert. Bitte neu laden." },
        { status: 409 }
      );
    }

    const batch = adminDb.batch();
    const updatedAt = new Date().toISOString();
    payload.ids.forEach((id, order) => {
      const ref = adminDb.collection(SITE_IMAGES_COLLECTION).doc(id);
      batch.update(ref, { sort_order: order, updated_at: updatedAt });
    });
    await batch.commit();
    revalidateTag(SITE_IMAGES_CACHE_TAG);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Sortierung konnte nicht gespeichert werden.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
