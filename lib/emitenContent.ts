import type { DividendEvent, Emiten } from "./types";
import {
  latestAnnual,
  yearsPaid,
  timingConsistency,
  amountTrend,
  favoriteExMonth,
  payingStreak,
  predictNext,
  sortByDateDesc,
  dpsCagr,
} from "./derive";
import { formatRupiah, formatPersen, BULAN_ID } from "./format";
import { parseISODate } from "./date";

/**
 * Ringkasan naratif unik per emiten (server-side, dari data) — mengatasi "thin
 * content" dan memberi konteks manusiawi sebelum tabel/grafik.
 */
export function emitenNarrative(e: Emiten, divs: DividendEvent[]): string {
  const la = latestAnnual(divs);
  const yp = yearsPaid(divs);
  const timing = timingConsistency(divs);
  const trend = amountTrend(divs);
  const favMonth = favoriteExMonth(divs);
  const streak = payingStreak(divs);
  const cagr = dpsCagr(divs);

  const parts: string[] = [];
  parts.push(`${e.ticker} (${e.nama}) bergerak di sektor ${e.sektor}.`);

  if (yp > 0) {
    let s = `Dalam dataset ini tercatat membagikan dividen pada ${yp} tahun`;
    if (streak >= 2) s += `, dengan ${streak} tahun beruntun terakhir`;
    s += ".";
    parts.push(s);
  }

  if (la) {
    parts.push(`Dividen terakhir total ${formatRupiah(la.total)}/lembar (tahun pembayaran ${la.tahun}).`);
  }

  const trendTxt =
    trend === "Naik"
      ? "tren jumlah cenderung naik"
      : trend === "Turun"
        ? "tren jumlah cenderung turun"
        : trend === "Stabil"
          ? "tren jumlah relatif stabil"
          : null;
  const timingTxt =
    timing === "Sangat teratur" || timing === "Cukup teratur"
      ? `waktu pembagian ${timing.toLowerCase()}`
      : timing === "Tidak teratur"
        ? "waktu pembagian kurang teratur"
        : null;
  const combo = [trendTxt, timingTxt].filter(Boolean).join(", ");
  if (combo) {
    let s = `Secara historis, ${combo}`;
    if (cagr != null && Math.abs(cagr) >= 1) {
      s += ` (pertumbuhan DPS ≈ ${cagr >= 0 ? "+" : ""}${formatPersen(cagr)}/tahun)`;
    }
    s += ".";
    parts.push(s);
  }

  if (e.flags.dormant) {
    parts.push("Saat ini emiten ini tidak membagikan dividen secara teratur (dorman / potensi rapel).");
  } else if (favMonth) {
    parts.push(`Bulan ex-date yang paling sering muncul adalah ${favMonth}.`);
  }

  if (e.flags.special_history) {
    parts.push("Emiten ini pernah membagikan dividen spesial/jumbo di luar pola reguler.");
  }

  parts.push("Angka di atas adalah data sekunder dan bukan saran investasi.");
  return parts.join(" ");
}

export interface QA {
  q: string;
  a: string;
}

/** Q&A per emiten untuk blok FAQ terlihat + schema FAQPage (SEO snippet). */
export function emitenFaq(e: Emiten, divs: DividendEvent[]): QA[] {
  const la = latestAnnual(divs);
  const favMonth = favoriteExMonth(divs);
  const lastYield = sortByDateDesc(divs).find((d) => d.yield_pct != null)?.yield_pct ?? null;
  const preds = predictNext(divs, e);
  const streak = payingStreak(divs);
  const yp = yearsPaid(divs);

  const out: QA[] = [];

  // 1. Kapan
  let kapan: string;
  if (e.flags.dormant) {
    kapan = `${e.ticker} sedang tidak membagikan dividen secara teratur belakangan ini, jadi tidak ada perkiraan tanggal. Pantau pengumuman resmi RUPS.`;
  } else if (preds.length > 0) {
    const p = preds[0];
    const d = parseISODate(p.perkiraan);
    const when = d ? `sekitar ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}` : "";
    kapan = `Berdasarkan pola historis${favMonth ? ` (ex-date paling sering di ${favMonth})` : ""}, perkiraan ex-date ${e.ticker} berikutnya ${when} — perkiraan, bukan kepastian.`;
  } else {
    kapan = `Belum ada cukup pola untuk memperkirakan jadwal dividen ${e.ticker}.`;
  }
  out.push({ q: `Kapan ${e.ticker} membagikan dividen berikutnya?`, a: kapan });

  // 2. Berapa terakhir
  if (la) {
    out.push({
      q: `Berapa dividen terakhir ${e.ticker}?`,
      a: `Dividen terakhir ${e.ticker} total ${formatRupiah(la.total)} per lembar untuk tahun pembayaran ${la.tahun}.`,
    });
  }

  // 3. Yield
  out.push({
    q: `Berapa yield dividen ${e.ticker}?`,
    a:
      (lastYield != null
        ? `Yield tercatat terakhir ${e.ticker} sekitar ${formatPersen(lastYield)}. `
        : "") +
      `Yield berjalan (dividen 12 bulan terakhir dibagi harga terkini) ditampilkan otomatis di halaman ${e.ticker} dan ikut bergerak mengikuti harga saham.`,
  });

  // 4. Rutin?
  out.push({
    q: `Apakah ${e.ticker} rutin membagikan dividen?`,
    a: e.flags.dormant
      ? `Tidak. ${e.ticker} sedang tidak membagikan dividen secara rutin (dorman).`
      : `${e.ticker} tercatat membagikan dividen pada ${yp} tahun${streak >= 2 ? `, termasuk ${streak} tahun beruntun terakhir` : ""} dalam dataset ini.`,
  });

  // 5. Spesial
  if (e.flags.special_history) {
    out.push({
      q: `Apakah ${e.ticker} pernah membagi dividen spesial?`,
      a: `Ya, ${e.ticker} pernah membagikan dividen spesial/jumbo di luar pola reguler. Lihat timeline untuk detail per event.`,
    });
  }

  return out;
}
