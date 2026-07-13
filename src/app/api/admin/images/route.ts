import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  isAcceptedImageType,
  MAX_IMAGE_UPLOAD_SIZE
} from "@/lib/imageUploadLimits";
import {
  deleteSiteImageFile,
  saveSiteImageFile
} from "@/lib/siteImageFilesStore";
import {
  getSectionConfig,
  isSiteImageSection,
  type SiteImageSection
} from "@/lib/siteImages";
import {
  ensureDefaultSiteImages,
  serializeSiteImage,
  SITE_IMAGES_CACHE_TAG,
  SITE_IMAGES_COLLECTION
} from "@/lib/siteImagesStore";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ message }, { status: 500 });
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
  );
}

function normalizeAlt(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().slice(0, 180) : "";
}

function detectImageType(bytes: Uint8Array) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  try {
    const items = await ensureDefaultSiteImages();
    return NextResponse.json({ items });
  } catch (error) {
    return errorResponse(error, "Bilder konnten nicht geladen werden.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  let uploadedFileId: string | null = null;
  let documentSaved = false;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const sectionValue = formData.get("section");
    const replaceIdValue = formData.get("replaceId");
    const replaceId =
      typeof replaceIdValue === "string" && replaceIdValue.trim()
        ? replaceIdValue.trim()
        : null;

    if (!isUploadedFile(file)) {
      return NextResponse.json(
        { message: "Bitte eine Bilddatei auswählen." },
        { status: 400 }
      );
    }

    if (!isSiteImageSection(sectionValue)) {
      return NextResponse.json(
        { message: "Unbekannter Bildbereich." },
        { status: 400 }
      );
    }

    if (!isAcceptedImageType(file.type)) {
      return NextResponse.json(
        { message: "Erlaubt sind JPEG-, PNG- und WebP-Bilder." },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_UPLOAD_SIZE) {
      return NextResponse.json(
        { message: "Das optimierte Bild darf höchstens 3,5 MB groß sein." },
        { status: 413 }
      );
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    if (detectImageType(fileBytes) !== file.type) {
      return NextResponse.json(
        { message: "Die Datei enthält kein gültiges Bild im angegebenen Format." },
        { status: 400 }
      );
    }

    const images = await ensureDefaultSiteImages();
    const sectionImages = images.filter(
      (image) => image.section === sectionValue
    );
    const config = getSectionConfig(sectionValue);
    if (!config) {
      return NextResponse.json(
        { message: "Unbekannter Bildbereich." },
        { status: 400 }
      );
    }

    const replacement = replaceId
      ? images.find((image) => image.id === replaceId)
      : null;

    if (replaceId && (!replacement || replacement.section !== sectionValue)) {
      return NextResponse.json(
        { message: "Das zu ersetzende Bild wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (!replacement && sectionImages.length >= config.maxItems) {
      return NextResponse.json(
        { message: `In diesem Bereich sind höchstens ${config.maxItems} Bilder möglich.` },
        { status: 400 }
      );
    }

    const collection = adminDb.collection(SITE_IMAGES_COLLECTION);
    const documentRef = replacement
      ? collection.doc(replacement.id)
      : collection.doc();
    uploadedFileId = await saveSiteImageFile(fileBytes, file.type);

    const now = new Date().toISOString();
    const alt = normalizeAlt(formData.get("alt"));
    const payload = {
      section: sectionValue as SiteImageSection,
      src: `/api/images/${uploadedFileId}`,
      file_id: uploadedFileId,
      storage_path: null,
      alt: alt || replacement?.alt || config.label,
      sort_order:
        replacement?.order ??
        Math.max(-1, ...sectionImages.map((image) => image.order)) + 1,
      created_at: replacement?.createdAt || now,
      updated_at: now
    };

    await documentRef.set(payload);
    documentSaved = true;
    try {
      await deleteSiteImageFile(replacement?.fileId ?? null);
    } catch {
      // The new record is already active; stale chunks can be cleaned up later.
    }
    revalidateTag(SITE_IMAGES_CACHE_TAG);

    const item = serializeSiteImage(documentRef.id, payload);
    return NextResponse.json({ item }, { status: replacement ? 200 : 201 });
  } catch (error) {
    if (!documentSaved) {
      try {
        await deleteSiteImageFile(uploadedFileId);
      } catch {
        // Return the original upload error even if cleanup also fails.
      }
    }
    return errorResponse(error, "Bild konnte nicht gespeichert werden.");
  }
}
