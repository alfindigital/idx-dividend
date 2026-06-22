import { ImageResponse } from "next/og";
import { BULAN_ID } from "@/lib/format";
import { dividendList } from "@/lib/data";
import { eventDate } from "@/lib/derive";

export const alt = "Kalender Dividen Saham IDX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Image({ params }: { params: { year: string; month: string } }) {
  const year = Number(params.year);
  const month = Number(params.month);
  const label = month >= 1 && month <= 12 ? `${BULAN_ID[month - 1]} ${year}` : `${year}`;
  const prefix = `${year}-${pad(month)}`;
  const n = dividendList.filter((d) => {
    const iso = eventDate(d);
    return iso != null && iso.startsWith(prefix);
  }).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, opacity: 0.95 }}>Dividen IDX · Kalender</div>
        <div style={{ display: "flex", fontSize: 78, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>
          Kalender dividen {label}
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 28, opacity: 0.92 }}>
          {n > 0 ? `${n} event ex-dividend · cum-date & jumlah` : "Jadwal ex-dividend saham IDX"}
        </div>
      </div>
    ),
    size,
  );
}
