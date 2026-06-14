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
    return <p className="text-sm text-slate-400">Belum ada data untuk grafik.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
            width={42}
          />
          <Tooltip
            formatter={(v: number) => [
              "Rp " + v.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
              "Total dividen/lembar",
            ]}
            labelFormatter={(l) => `Tahun ${l}`}
          />
          <Bar dataKey="total" fill="#0f766e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
