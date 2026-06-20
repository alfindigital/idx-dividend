import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "./icons";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Jejak navigasi ringkas & aksesibel. Item terakhir menandai halaman aktif
 * (aria-current). Server component agar tetap ramah static export.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs">
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${it.label}-${i}`}>
              <li className="inline-flex items-center">
                {it.href && !last ? (
                  <Link href={it.href} className="text-brand transition hover:underline">
                    {it.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="text-muted">
                    {it.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="inline-flex items-center text-faint">
                  <ChevronRight size={13} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
