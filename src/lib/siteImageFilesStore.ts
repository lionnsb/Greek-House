import { adminDb } from "@/lib/firebaseAdmin";

export const SITE_IMAGE_FILES_COLLECTION = "site_image_files";

// Firestore documents are limited to 1 MiB including field and index overhead.
// Keeping chunks well below that limit makes image storage predictable.
const CHUNK_SIZE = 700 * 1024;
const CHUNKS_PER_BATCH = 8;
const MAX_STORED_IMAGE_SIZE = 10 * 1024 * 1024;

type StoredImageFileDocument = {
  content_type?: unknown;
  size?: unknown;
  chunk_count?: unknown;
};

function isSupportedContentType(value: unknown): value is string {
  return (
    value === "image/jpeg" || value === "image/png" || value === "image/webp"
  );
}

export async function saveSiteImageFile(
  bytes: Uint8Array,
  contentType: string
) {
  if (!isSupportedContentType(contentType)) {
    throw new Error("Nicht unterstütztes Bildformat.");
  }
  if (bytes.byteLength <= 0 || bytes.byteLength > MAX_STORED_IMAGE_SIZE) {
    throw new Error("Das Bild darf höchstens 10 MB groß sein.");
  }

  const fileRef = adminDb.collection(SITE_IMAGE_FILES_COLLECTION).doc();
  const chunks = Math.ceil(bytes.byteLength / CHUNK_SIZE);
  try {
    // Stay below Firestore's 10 MiB request limit even at the maximum upload size.
    for (
      let batchStart = 0;
      batchStart < chunks;
      batchStart += CHUNKS_PER_BATCH
    ) {
      const batch = adminDb.batch();
      const batchEnd = Math.min(batchStart + CHUNKS_PER_BATCH, chunks);
      for (let index = batchStart; index < batchEnd; index += 1) {
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, bytes.byteLength);
        const chunkRef = fileRef
          .collection("chunks")
          .doc(index.toString().padStart(4, "0"));
        batch.set(chunkRef, {
          index,
          data: Buffer.from(bytes.subarray(start, end))
        });
      }
      await batch.commit();
    }

    // The metadata document is written last, so partially uploaded files cannot
    // be served by the public endpoint.
    await fileRef.set({
      content_type: contentType,
      size: bytes.byteLength,
      chunk_count: chunks,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    try {
      await deleteSiteImageFile(fileRef.id);
    } catch {
      // Preserve the original upload error; orphan cleanup can happen later.
    }
    throw error;
  }
  return fileRef.id;
}

function toUint8Array(value: unknown) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toUint8Array" in value &&
    typeof value.toUint8Array === "function"
  ) {
    return value.toUint8Array();
  }

  return null;
}

export async function readSiteImageFile(fileId: string) {
  const fileRef = adminDb.collection(SITE_IMAGE_FILES_COLLECTION).doc(fileId);
  const [fileSnapshot, chunkSnapshot] = await Promise.all([
    fileRef.get(),
    fileRef.collection("chunks").orderBy("index").get()
  ]);

  if (!fileSnapshot.exists) {
    return null;
  }

  const metadata = fileSnapshot.data() as StoredImageFileDocument | undefined;
  if (
    !metadata ||
    !isSupportedContentType(metadata.content_type) ||
    typeof metadata.size !== "number" ||
    typeof metadata.chunk_count !== "number" ||
    metadata.size <= 0 ||
    metadata.size > MAX_STORED_IMAGE_SIZE ||
    metadata.chunk_count <= 0 ||
    chunkSnapshot.size !== metadata.chunk_count
  ) {
    throw new Error("Gespeicherte Bilddatei ist unvollständig.");
  }

  const chunks = chunkSnapshot.docs.map((document) =>
    toUint8Array(document.data().data)
  );
  if (chunks.some((chunk) => chunk === null)) {
    throw new Error("Gespeicherte Bilddatei enthält ungültige Daten.");
  }

  const bytes = new Uint8Array(metadata.size);
  let offset = 0;
  for (const chunk of chunks as Uint8Array[]) {
    if (offset + chunk.byteLength > bytes.byteLength) {
      throw new Error("Gespeicherte Bilddatei hat eine ungültige Größe.");
    }
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  if (offset !== metadata.size) {
    throw new Error("Gespeicherte Bilddatei ist unvollständig.");
  }

  return { bytes, contentType: metadata.content_type };
}

export async function deleteSiteImageFile(fileId: string | null) {
  if (!fileId) return;

  const fileRef = adminDb.collection(SITE_IMAGE_FILES_COLLECTION).doc(fileId);
  const chunks = await fileRef.collection("chunks").get();
  const batch = adminDb.batch();
  chunks.docs.forEach((document) => batch.delete(document.ref));
  batch.delete(fileRef);
  await batch.commit();
}
