import { Skeleton } from "./Skeleton";

/**
 * Placeholder grafik dengan tinggi tetap agar tidak ada layout shift saat
 * komponen recharts dimuat secara lazy (next/dynamic). Default setinggi h-64
 * menyamai pembungkus DividendChart / DividendYieldChart.
 */
export default function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return <Skeleton className={`block w-full rounded-lg ${height}`} />;
}
