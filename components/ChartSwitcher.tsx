"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ChartPoint } from "./DividendChart";
import type { YieldPoint } from "./DividendYieldChart";
import ChartSkeleton from "./ui/ChartSkeleton";

// Lazy-load recharts agar tidak masuk bundel awal halaman detail.
const DividendChart = dynamic(() => import("./DividendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DividendYieldChart = dynamic(() => import("./DividendYieldChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function ChartSwitcher({
  dps,
  yieldData,
}: {
  dps: ChartPoint[];
  yieldData: YieldPoint[];
}) {
  const hasYield = yieldData.length > 0;
  const [tab, setTab] = useState<"dps" | "yield">("dps");
  const dpsRef = useRef<HTMLButtonElement>(null);
  const yieldRef = useRef<HTMLButtonElement>(null);

  const tabBtn = (selected: boolean) =>
    `rounded-md px-3 py-1 transition ${
      selected ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"
    }`;

  // navigasi panah kiri/kanan antar tab (pola WAI-ARIA tabs)
  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    if (!hasYield) return;
    const next = tab === "dps" ? "yield" : "dps";
    setTab(next);
    (next === "dps" ? dpsRef : yieldRef).current?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Jenis grafik"
        onKeyDown={onKey}
        className="mb-3 inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-xs font-medium"
      >
        <button
          ref={dpsRef}
          type="button"
          role="tab"
          id="tab-dps"
          aria-selected={tab === "dps"}
          aria-controls="panel-chart"
          tabIndex={tab === "dps" ? 0 : -1}
          onClick={() => setTab("dps")}
          className={tabBtn(tab === "dps")}
        >
          DPS (Rp)
        </button>
        <button
          ref={yieldRef}
          type="button"
          role="tab"
          id="tab-yield"
          aria-selected={tab === "yield"}
          aria-controls="panel-chart"
          tabIndex={tab === "yield" ? 0 : -1}
          onClick={() => setTab("yield")}
          disabled={!hasYield}
          className={`${tabBtn(tab === "yield")} ${!hasYield ? "cursor-not-allowed opacity-40" : ""}`}
          title={hasYield ? undefined : "Data yield historis belum tersedia"}
        >
          Yield (%)
        </button>
      </div>
      <div role="tabpanel" id="panel-chart" aria-labelledby={tab === "dps" ? "tab-dps" : "tab-yield"}>
        <figure className="m-0">
          <figcaption className="sr-only">
            {tab === "dps"
              ? "Grafik total dividen per lembar (Rupiah) per tahun."
              : "Grafik yield dividen (persen) per tahun."}
          </figcaption>
          {tab === "dps" ? <DividendChart data={dps} /> : <DividendYieldChart data={yieldData} />}
          {/* tabel data untuk screen reader & crawler */}
          <table className="sr-only">
            <caption>Data {tab === "dps" ? "dividen per lembar (Rp)" : "yield (%)"} per tahun</caption>
            <thead>
              <tr>
                <th scope="col">Tahun</th>
                <th scope="col">{tab === "dps" ? "DPS (Rp)" : "Yield (%)"}</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "dps"
                ? dps.map((d) => ({ tahun: d.tahun, val: d.total }))
                : yieldData.map((d) => ({ tahun: d.tahun, val: d.yield }))
              ).map((row) => (
                <tr key={row.tahun}>
                  <td>{row.tahun}</td>
                  <td>{row.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>
    </div>
  );
}
