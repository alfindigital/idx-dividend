"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface YieldPoint {
  tahun: number;
  yield: number;
}

export default function DividendYieldChart({ data }: { data: YieldPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-faint">Belum ada data yield historis.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            width={42}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            cursor={{ stroke: "rgb(var(--brand) / 0.3)" }}
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
              `${val.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`,
              "Yield",
            ]}
            labelFormatter={(l) => `Tahun ${l}`}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="var(--chart-bar)"
            strokeWidth={2.2}
            dot={{ r: 3, fill: "var(--chart-bar)", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
