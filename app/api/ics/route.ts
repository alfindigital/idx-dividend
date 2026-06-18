import { NextRequest } from "next/server";
import { emitenList, getEmiten, getDividends } from "@/lib/data";
import { eventDate, predictNext } from "@/lib/derive";
import { buildCalendar, type IcsEvent } from "@/lib/ics";
import { formatRupiah, formatTanggal, labelTipe } from "@/lib/format";
import type { Emiten } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Susun event .ics untuk satu emiten: event mendatang yg sudah diumumkan (+ prediksi opsional). */
function emitenIcsEvents(
  em: Emiten,
  origin: string,
  todayIso: string,
  today: Date,
  withPrediction: boolean,
): IcsEvent[] {
  const divs = getDividends(em.ticker);
  const url = `${origin}/emiten/${em.ticker}`;
  const out: IcsEvent[] = [];

  // Event yang sudah diumumkan & tanggalnya belum lewat (acuan = ex-date).
  const upcoming = divs.filter((d) => {
    const iso = eventDate(d);
    return iso != null && iso >= todayIso;
  });
  const upcomingTipes = new Set<string>(upcoming.map((d) => d.tipe));

  for (const d of upcoming) {
    const iso = eventDate(d)!;
    const t = labelTipe(d.tipe).toLowerCase();
    const dpsTxt = d.dps_idr != null ? ` ${formatRupiah(d.dps_idr)}/lembar` : "";
    const desc = [
      `${em.nama} · dividen ${t} (tahun pembayaran ${d.tahun}).`,
      d.dps_idr != null
        ? `Jumlah: ${formatRupiah(d.dps_idr)}/lembar.`
        : `Jumlah: belum dipastikan.`,
      d.cum_date
        ? `Cum-date: ${formatTanggal(d.cum_date)}. Beli sebelum/pada tanggal ini agar dapat dividen.`
        : "",
      d.ex_date ? `Ex-date: ${formatTanggal(d.ex_date)}.` : "",
      d.payment_date ? `Pembayaran: ${formatTanggal(d.payment_date)}.` : "",
      `Detail & sumber: ${url}`,
      `Data sekunder, bukan saran investasi.`,
    ]
      .filter(Boolean)
      .join("\n");
    out.push({
      uid: `${em.ticker}-${d.tahun}-${d.tipe}-${iso}@idx-dividend`,
      dateIso: iso,
      summary: `${em.ticker} ex-dividen ${t}${dpsTxt}`,
      description: desc,
      url,
      reminderDays: 1,
    });
  }

  if (withPrediction) {
    // Prediksi hanya untuk tipe yang BELUM punya event terumumkan mendatang (hindari duplikat).
    const preds = predictNext(divs, em, today).filter((p) => !upcomingTipes.has(p.tipe));
    for (const p of preds) {
      const t = labelTipe(p.tipe).toLowerCase();
      out.push({
        uid: `${em.ticker}-pred-${p.tipe}-${p.perkiraan}@idx-dividend`,
        dateIso: p.perkiraan,
        summary: `${em.ticker} ex-dividen ${t} (perkiraan)`,
        description: [
          `Perkiraan ex-date ${t} ${em.nama} berbasis pola musiman (keyakinan ${p.confidence}).`,
          `PERKIRAAN, bukan kepastian; jumlah dividen tidak diprediksi.`,
          `Detail: ${url}`,
        ].join("\n"),
        url,
        reminderDays: 1,
      });
    }
  }

  return out;
}

export async function GET(req: NextRequest) {
  const tickerParam = req.nextUrl.searchParams.get("ticker");
  const origin = req.nextUrl.origin;
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  let events: IcsEvent[] = [];
  let calName = "Dividen IDX · jadwal mendatang";
  let filename = "dividen-idx.ics";

  if (tickerParam) {
    const em = getEmiten(tickerParam);
    if (!em) {
      return new Response("Emiten tidak ditemukan", { status: 404 });
    }
    // Per-emiten: sertakan prediksi (user memilih emiten ini secara spesifik).
    events = emitenIcsEvents(em, origin, todayIso, today, true);
    calName = `Dividen ${em.ticker} · ${em.nama}`;
    filename = `dividen-${em.ticker}.ics`;
  } else {
    // Semua emiten: hanya event terumumkan (konkret), tanpa prediksi agar tidak ramai.
    for (const em of emitenList) {
      events = events.concat(emitenIcsEvents(em, origin, todayIso, today, false));
    }
  }

  events.sort((a, b) => a.dateIso.localeCompare(b.dateIso) || a.uid.localeCompare(b.uid));
  const ics = buildCalendar(events, calName);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
