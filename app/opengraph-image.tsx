import { ImageResponse } from "next/og";

export const alt = "Dividen IDX - History, Yield & Kalender Dividen Saham IDX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.18)",
              padding: 14,
            }}
          >
            <div style={{ width: 8, height: 16, background: "white", borderRadius: 3 }} />
            <div style={{ width: 8, height: 26, background: "white", borderRadius: 3 }} />
            <div style={{ width: 8, height: 36, background: "white", borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.95 }}>Dividen IDX</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 70,
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 980,
          }}
        >
          History, yield &amp; jadwal dividen saham IDX
        </div>

        <div style={{ display: "flex", fontSize: 30, marginTop: 28, opacity: 0.92 }}>
          Riwayat ~5 tahun · yield berjalan · perkiraan jadwal · 50+ emiten
        </div>
      </div>
    ),
    size,
  );
}
