import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { SiteImage } from "@/lib/siteImages";

export function SiteImageSlot({
  image,
  fallbackLabel
}: {
  image?: SiteImage;
  fallbackLabel: string;
}) {
  if (!image) {
    return <PlaceholderImage label={fallbackLabel} />;
  }

  return (
    <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-stone bg-stone/40">
      <img
        src={image.src}
        alt={image.alt || fallbackLabel}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
