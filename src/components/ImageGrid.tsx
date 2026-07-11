import type { SiteImage } from "@/lib/siteImages";

export function ImageGrid({
  images,
  className = "",
  aspect = "aspect-[4/3]"
}: {
  images: SiteImage[];
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {images.map((image) => (
        <div key={image.id} className={`overflow-hidden rounded-2xl border border-stone bg-stone/40 ${aspect}`}>
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
