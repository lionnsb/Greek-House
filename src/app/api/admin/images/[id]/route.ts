import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { deleteSiteImageFile } from "@/lib/siteImageFilesStore";
import { getSectionConfig } from "@/lib/siteImages";
import {
  ensureDefaultSiteImages,
  serializeSiteImage,
  SITE_IMAGES_CACHE_TAG,
  SITE_IMAGES_COLLECTION
} from "@/lib/siteImagesStore";

function validDocumentId(id: string) {
  return Boolean(id) && id.length <= 180 && !id.includes("/");
}

async function authorize(request: Request) {
  try {
    await requireAdmin(request);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  if (!validDocumentId(params.id)) {
    return NextResponse.json({ message: "Ungültige Bild-ID." }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as { alt?: unknown };
    if (typeof payload.alt !== "string") {
      return NextResponse.json(
        { message: "Bitte einen gültigen Alternativtext angeben." },
        { status: 400 }
      );
    }

    const alt = payload.alt.trim().slice(0, 180);
    const ref = adminDb.collection(SITE_IMAGES_COLLECTION).doc(params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return NextResponse.json(
        { message: "Bild wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const updatedAt = new Date().toISOString();
    await ref.update({ alt, updated_at: updatedAt });
    revalidateTag(SITE_IMAGES_CACHE_TAG);

    const item = serializeSiteImage(params.id, {
      ...snapshot.data(),
      alt,
      updated_at: updatedAt
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Alternativtext konnte nicht gespeichert werden.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  if (!validDocumentId(params.id)) {
    return NextResponse.json({ message: "Ungültige Bild-ID." }, { status: 400 });
  }

  try {
    const images = await ensureDefaultSiteImages();
    const image = images.find((item) => item.id === params.id);
    if (!image) {
      return NextResponse.json(
        { message: "Bild wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const sectionImages = images.filter(
      (item) => item.section === image.section
    );
    const config = getSectionConfig(image.section);
    if (config?.required && sectionImages.length <= 1) {
      return NextResponse.json(
        { message: "Das Titelbild kann nur ersetzt, aber nicht gelöscht werden." },
        { status: 400 }
      );
    }

    await adminDb.collection(SITE_IMAGES_COLLECTION).doc(params.id).delete();

    try {
      await deleteSiteImageFile(image.fileId);
    } catch {
      // The Firestore record is authoritative; orphan cleanup can happen later.
    }

    revalidateTag(SITE_IMAGES_CACHE_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Bild konnte nicht gelöscht werden.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
