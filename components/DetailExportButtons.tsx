"use client";

import { toast } from "@/lib/toast";
import { CalendarPlus, Download } from "./ui/icons";

/**
 * Tombol ekspor kalender di halaman emiten. Client component agar bisa
 * memunculkan notifikasi saat .ics diunduh; tautan tetap berupa <a>.
 */
export default function DetailExportButtons({
  ticker,
  gcalHref,
}: {
  ticker: string;
  gcalHref: string | null;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {gcalHref && (
        <a
          href={gcalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-glow transition hover:bg-indigo-500 active:bg-indigo-700"
        >
          <CalendarPlus size={15} /> Tambah ke Google Calendar
        </a>
      )}
      <a
        href={`/api/ics?ticker=${ticker}`}
        onClick={() => toast(`Jadwal ${ticker} (.ics) diunduh.`, { tone: "success" })}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:border-brand/40 hover:bg-surface-2"
      >
        <Download size={15} /> Unduh .ics
      </a>
    </div>
  );
}
