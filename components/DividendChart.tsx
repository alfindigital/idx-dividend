"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface ChartPoint {
  tahun: number;
  total: number;
}

export default function DividendChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-faint">Belum ada data untuk grafik.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-bar-to)" />
              <stop offset="100%" stopColor="var(--chart-bar)" />
            </linearGradient>
          </defs>
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
            tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
            width={42}
          />
          <Tooltip
            cursor={{ fill: "rgb(var(--brand) / 0.08)" }}
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border))",
              borderRadius: 12,
              color: "rgb(var(--fg))",
              fontSize: 12,
            }}
            labelStyle={{ color: "rgb(var(--muted))" }}
            itemStyle={{ color: "rgb(var(--fg))" }}
            formatter={(val: number) => [
              "Rp " + val.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
              "Total dividen/lembar",
            ]}
            labelFormatter={(l) => `Tahun ${l}`}
          />
          <Bar dataKey="total" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
