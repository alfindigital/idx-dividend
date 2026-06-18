/** Blok shimmer untuk placeholder saat data masih dimuat. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-pulse rounded bg-surface-2 ${className}`}
    />
  );
}
