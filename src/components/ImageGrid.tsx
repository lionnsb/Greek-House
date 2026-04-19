export function ImageGrid({
  files,
  className = "",
  aspect = "aspect-[4/3]"
}: {
  files: string[];
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {files.map((file) => (
        <div key={file} className={`overflow-hidden rounded-2xl border border-stone bg-stone/40 ${aspect}`}>
          <img
            src={`/img/${file}`}
            alt={file}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
