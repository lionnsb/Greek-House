export function PlaceholderImage({ label }: { label: string }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-stone bg-stone/40 text-xs uppercase tracking-wide text-ink/50">
      {label}
    </div>
  );
}
