/** Garis tren mungil (inline SVG). Warna mengikuti `currentColor` dari parent. */
export function Sparkline({
  data,
  width = 60,
  height = 18,
  className = "",
  showEmpty = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  /** Tampilkan garis putus samar saat data < 2 titik (alih-alih kosong). */
  showEmpty?: boolean;
}) {
  const pts = data.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (pts.length < 2) {
    if (!showEmpty) return null;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`text-faint ${className}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const stepX = width / (pts.length - 1);
  const coords = pts.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="1.6" fill="currentColor" />
    </svg>
  );
}
