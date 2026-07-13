import {
  isAcceptedImageType,
  MAX_IMAGE_SOURCE_SIZE,
  TARGET_IMAGE_UPLOAD_SIZE
} from "./imageUploadLimits";
import type { SiteImage } from "./siteImages";

const MAX_IMAGE_EDGE = 2400;
const MIN_IMAGE_EDGE = 800;
const RESIZE_FACTOR = 0.8;
const JPEG_QUALITIES = [0.84, 0.74, 0.64] as const;

export type ImageAdminResponse = {
  item?: SiteImage;
  items?: SiteImage[];
  message?: string;
  ok?: boolean;
};

export type CompressionAttempt = {
  width: number;
  height: number;
  quality: number;
};

export function calculateImageDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxEdge = MAX_IMAGE_EDGE
) {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    !Number.isFinite(maxEdge) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    maxEdge <= 0
  ) {
    throw new Error("Das Bild hat ungültige Abmessungen.");
  }

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale))
  };
}

export function buildCompressionAttempts(
  sourceWidth: number,
  sourceHeight: number
): CompressionAttempt[] {
  const attempts: CompressionAttempt[] = [];
  let dimensions = calculateImageDimensions(sourceWidth, sourceHeight);

  while (true) {
    for (const quality of JPEG_QUALITIES) {
      attempts.push({ ...dimensions, quality });
    }

    const currentMaxEdge = Math.max(dimensions.width, dimensions.height);
    if (currentMaxEdge <= MIN_IMAGE_EDGE) break;

    const nextMaxEdge = Math.max(
      MIN_IMAGE_EDGE,
      Math.floor(currentMaxEdge * RESIZE_FACTOR)
    );
    if (nextMaxEdge >= currentMaxEdge) break;
    dimensions = calculateImageDimensions(
      sourceWidth,
      sourceHeight,
      nextMaxEdge
    );
  }

  return attempts;
}

function loadBrowserImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  return new Promise<{ image: HTMLImageElement; objectUrl: string }>(
    (resolve, reject) => {
      image.onload = () => resolve({ image, objectUrl });
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error(
            "Die Bilddatei konnte nicht gelesen werden. Bitte JPEG, PNG oder WebP verwenden."
          )
        );
      };
      image.src = objectUrl;
    }
  );
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== "image/jpeg") {
          reject(
            new Error(
              "Dieser Browser konnte das Bild nicht sicher komprimieren. Bitte den Browser aktualisieren oder eine kleinere JPEG-Datei verwenden."
            )
          );
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

export async function compressImageForUpload(file: File) {
  if (!isAcceptedImageType(file.type)) {
    throw new Error("Erlaubt sind JPEG-, PNG- und WebP-Bilder.");
  }
  if (file.size <= 0) {
    throw new Error("Die ausgewählte Bilddatei ist leer.");
  }
  if (file.size > MAX_IMAGE_SOURCE_SIZE) {
    throw new Error("Die Ausgangsdatei darf höchstens 30 MB groß sein.");
  }

  const { image, objectUrl } = await loadBrowserImage(file);
  const canvas = document.createElement("canvas");

  try {
    const attempts = buildCompressionAttempts(
      image.naturalWidth,
      image.naturalHeight
    );
    let renderedWidth = 0;
    let renderedHeight = 0;

    for (const attempt of attempts) {
      if (
        attempt.width !== renderedWidth ||
        attempt.height !== renderedHeight
      ) {
        canvas.width = attempt.width;
        canvas.height = attempt.height;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error(
            "Dieser Browser kann das Bild nicht verarbeiten. Bitte den Browser aktualisieren."
          );
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        renderedWidth = attempt.width;
        renderedHeight = attempt.height;
      }

      const blob = await canvasToJpeg(canvas, attempt.quality);
      if (blob.size <= TARGET_IMAGE_UPLOAD_SIZE) {
        const baseName = file.name.replace(/\.[^.]+$/, "") || "bild";
        return new File([blob], `${baseName}.jpg`, {
          type: "image/jpeg",
          lastModified: file.lastModified
        });
      }
    }

    throw new Error(
      "Das Bild konnte nicht ausreichend verkleinert werden. Bitte eine kleinere Datei auswählen."
    );
  } finally {
    image.onload = null;
    image.onerror = null;
    image.removeAttribute("src");
    URL.revokeObjectURL(objectUrl);
    canvas.width = 1;
    canvas.height = 1;
  }
}

function fallbackResponseMessage(status: number) {
  if (status === 401 || status === 403) {
    return "Die Admin-Anmeldung ist abgelaufen. Bitte erneut einloggen.";
  }
  if (status === 413) {
    return "Das Bild ist für den Upload noch zu groß. Bitte eine kleinere Datei auswählen.";
  }
  if (status >= 500) {
    return "Der Server konnte den Bild-Upload nicht verarbeiten. Bitte später erneut versuchen.";
  }
  if (status >= 400) {
    return "Die Bildanfrage konnte nicht verarbeitet werden.";
  }
  return "Der Server hat eine ungültige Antwort geliefert.";
}

export async function parseImageAdminResponse(
  response: Response
): Promise<ImageAdminResponse> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    return { message: fallbackResponseMessage(response.status) };
  }

  if (body.trim()) {
    try {
      const parsed = JSON.parse(body) as unknown;
      if (typeof parsed === "object" && parsed !== null) {
        const data = parsed as ImageAdminResponse;
        if (response.ok) return data;
        if (
          response.status !== 401 &&
          response.status !== 403 &&
          response.status < 500 &&
          typeof data.message === "string"
        ) {
          return data;
        }
      }
    } catch {
      // Proxies such as Vercel can return text or HTML for rejected uploads.
    }
  }

  return { message: fallbackResponseMessage(response.status) };
}
