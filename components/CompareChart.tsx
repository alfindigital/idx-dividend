"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/**
 * Grafik garis riwayat DPS untuk halaman banding. Dipisah dari CompareView agar
 * recharts dapat dimuat secara lazy (next/dynamic) dan tidak membebani bundel awal.
 */
export default function CompareChart({
  chartData,
  series,
  colors,
}: {
  chartData: Record<string, number | null>[];
  series: { ticker: string }[];
  colors: string[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="tahun"
            tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
            tickLine={{ stroke: "var(--chart-grid)" }}
            axisLine={{ stroke: "var(--chart-grid)" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
            tickLine={{ stroke: "var(--chart-grid)" }}
            axisLine={{ stroke: "var(--chart-grid)" }}
            width={46}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border))",
              borderRadius: 12,
              color: "rgb(var(--fg))",
              fontSize: 12,
            }}
            labelStyle={{ color: "rgb(var(--muted))" }}
            formatter={(val: number) => "Rp " + val.toLocaleString("id-ID")}
            labelFormatter={(l) => `Tahun ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((e, i) => (
            <Line
              key={e.ticker}
              type="monotone"
              dataKey={e.ticker}
              stroke={colors[i]}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
