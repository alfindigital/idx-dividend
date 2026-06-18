import Link from "next/link";
import CalendarView, { CalEvent } from "@/components/CalendarView";
import { emitenList, dividendList, getDividends } from "@/lib/data";
import { predictNext, eventDate } from "@/lib/derive";

export const revalidate = 43200;

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
    <div className="space-y-4">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Kembali ke daftar
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-fg">Kalender Dividen</h1>
        <p className="max-w-3xl text-sm text-muted">
          Tanggal <strong>ex-dividend</strong> historis (warna solid) dan{" "}
          <strong>perkiraan</strong> tanggal berikutnya berbasis pola musiman (garis putus,
          bertanda <code>?</code>). Bulan ramai dividen biasanya Maret–Juli (final) dan
          Oktober–Desember (interim). Klik kode untuk detail. Jumlah dividen tidak diprediksi.
        </p>
        <a
          href="/api/ics"
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-line/40"
        >
          ⬇️ Unduh semua jadwal mendatang (.ics)
        </a>
      </header>

      <CalendarView
        events={events}
        initialYear={today.getFullYear()}
        initialMonth={today.getMonth()}
        todayIso={todayIso}
      />
    </div>
  );
}
