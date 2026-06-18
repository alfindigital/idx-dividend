import type { ReactNode } from "react";

/**
 * Permukaan kartu standar — sadar tema (light/dark) lewat token warna.
 * Pakai ini alih-alih menulis ulang `rounded-… border bg-white …`.
 */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  );
}

/** Label kecil huruf kapital untuk judul statistik / caption. */
export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wide text-faint">{children}</div>
  );
}
