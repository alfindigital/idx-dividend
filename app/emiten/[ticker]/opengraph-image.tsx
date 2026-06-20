import { ImageResponse } from "next/og";
import { getEmiten, getDividends, allTickers } from "@/lib/data";
import { latestAnnual, sortByDateDesc, timingConsistency, payingStreak } from "@/lib/derive";
import { formatPersen, formatRupiah } from "@/lib/format";

export const alt = "Dividen emiten IDX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return allTickers().map((ticker) => ({ ticker }));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "20px 26px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div style={{ display: "flex", fontSize: 22, opacity: 0.8 }}>{label}</div>
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function Image({ params }: { params: { ticker: string } }) {
  const e = getEmiten(params.ticker);
  const divs = e ? getDividends(e.ticker) : [];
  const la = latestAnnual(divs);
  const sorted = sortByDateDesc(divs);
  const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
  const timing = e ? timingConsistency(divs) : "-";
  const streak = e ? payingStreak(divs) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 60%, #a855f7 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, opacity: 0.95 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 5,
              width: 52,
              height: 52,
              borderRadius: 13,
              background: "rgba(255,255,255,0.18)",
              padding: 11,
            }}
          >
            <div style={{ width: 7, height: 13, background: "white", borderRadius: 3 }} />
            <div style={{ width: 7, height: 21, background: "white", borderRadius: 3 }} />
            <div style={{ width: 7, height: 29, background: "white", borderRadius: 3 }} />
          </div>
          Dividen IDX
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
            {e ? e.ticker : "IDX"}
          </div>
          <div style={{ display: "flex", fontSize: 36, opacity: 0.92 }}>
            {e ? e.nama : "Emiten tidak ditemukan"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          <Stat label="Yield tercatat" value={lastYield != null ? formatPersen(lastYield) : "-"} />
          <Stat
            label={`Div. ${la?.tahun ?? ""}`}
            value={la ? formatRupiah(la.total) : "-"}
          />
          <Stat label="Konsistensi" value={timing} />
          <Stat label="Beruntun" value={`${streak} th`} />
        </div>
      </div>
    ),
    size,
  );
}
