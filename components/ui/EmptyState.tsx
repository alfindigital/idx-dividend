import type { ReactNode } from "react";

/**
 * Blok keadaan kosong yang konsisten: ikon dalam lingkaran samar, judul,
 * deskripsi opsional, dan slot aksi (CTA). Server component.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-10 text-center shadow-card ${className}`}
    >
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        {icon}
      </div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
