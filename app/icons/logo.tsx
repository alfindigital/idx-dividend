import type { ReactElement } from "react";

/**
 * Mark logo untuk ikon PWA (dirender via next/og ImageResponse): kotak gradient
 * indigo-violet dengan tiga batang putih menanjak dan titik kuning. `scale`
 * mengatur padding (lebih kecil = lebih banyak ruang aman untuk ikon maskable).
 */
export function IconLogo({ size, scale = 0.62 }: { size: number; scale?: number }): ReactElement {
  const barW = Math.round(size * 0.08);
  const gap = Math.round(size * 0.055);
  const r = Math.max(2, Math.round(size * 0.025));
  const h1 = Math.round(size * scale * 0.45);
  const h2 = Math.round(size * scale * 0.72);
  const h3 = Math.round(size * scale * 1.0);
  const dot = Math.round(size * 0.085);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap }}>
        <div style={{ width: barW, height: h1, background: "white", borderRadius: r }} />
        <div style={{ width: barW, height: h2, background: "white", borderRadius: r }} />
        <div style={{ width: barW, height: h3, background: "white", borderRadius: r }} />
        <div
          style={{
            position: "absolute",
            top: -dot - Math.round(gap / 2),
            right: 0,
            width: dot,
            height: dot,
            borderRadius: dot,
            background: "#fde68a",
          }}
        />
      </div>
    </div>
  );
}
