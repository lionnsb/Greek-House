export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const MAX_IMAGE_SOURCE_SIZE = 30 * 1024 * 1024;
export const TARGET_IMAGE_UPLOAD_SIZE = 3 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_SIZE = Math.floor(3.5 * 1024 * 1024);

export function isAcceptedImageType(
  value: unknown
): value is AcceptedImageType {
  return (
    typeof value === "string" &&
    ACCEPTED_IMAGE_TYPES.includes(value as AcceptedImageType)
  );
}
