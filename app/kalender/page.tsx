import type { Metadata } from "next";
import Link from "next/link";
import CalendarView, { CalEvent } from "@/components/CalendarView";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { emitenList, dividendList, getDividends } from "@/lib/data";
import { predictNext, eventDate } from "@/lib/derive";
import { Download } from "@/components/ui/icons";
import { BULAN_ID } from "@/lib/format";

export const revalidate = 43200;

export const metadata: Metadata = {
  title: "Kalender Dividen",
  description:
    "Kalender ex-dividend saham IDX: tanggal historis dan perkiraan jadwal dividen berikutnya. Unduh ke kalendermu (.ics).",
  alternates: { canonical: "/kalender" },
  openGraph: {
    type: "website",
    url: "/kalender",
    title: "Kalender Dividen · Dividen IDX",
    description: "Tanggal ex-dividend historis & perkiraan jadwal dividen berikutnya untuk emiten IDX.",
  },
};

export default function Page() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const events: CalEvent[] = [];

  // event historis — pakai ex_date (kapan harus sudah punya saham)
  for (const d of dividendList) {
    const iso = eventDate(d);
    if (!iso) continue;
    events.push({ date: iso, ticker: d.ticker, tipe: d.tipe, kind: "historis" });
  }

  // prediksi ex-date berikutnya per emiten
  for (const e of emitenList) {
    const preds = predictNext(getDividends(e.ticker), e, today);
    for (const p of preds) {
      events.push({ date: p.perkiraan, ticker: e.ticker, tipe: p.tipe, kind: "prediksi" });
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Kalender" }]} />
        <a
          href="/api/ics"
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:border-brand/40 hover:bg-brand/5"
        >
          <Download size={15} /> Unduh jadwal (.ics)
        </a>
      </div>

      <CalendarView
        events={events}
        initialYear={today.getFullYear()}
        initialMonth={today.getMonth()}
        todayIso={todayIso}
      />

      <p className="text-sm text-muted">
        Halaman bulan:{" "}
        <Link
          href={`/kalender/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}`}
          className="font-medium text-brand hover:underline"
        >
          Kalender dividen {BULAN_ID[today.getMonth()]} {today.getFullYear()} →
        </Link>
      </p>
    </div>
  );
}
