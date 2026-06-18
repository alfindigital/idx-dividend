"use client";

import { useState } from "react";
import DividendChart, { ChartPoint } from "./DividendChart";
import DividendYieldChart, { YieldPoint } from "./DividendYieldChart";

export default function ChartSwitcher({
  dps,
  yieldData,
}: {
  dps: ChartPoint[];
  yieldData: YieldPoint[];
}) {
  const hasYield = yieldData.length > 0;
  const [tab, setTab] = useState<"dps" | "yield">("dps");

  const tabBtn = (selected: boolean) =>
    `rounded-md px-3 py-1 transition ${
      selected ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"
    }`;

  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-xs font-medium">
        <button type="button" onClick={() => setTab("dps")} className={tabBtn(tab === "dps")}>
          DPS (Rp)
        </button>
        <button
          type="button"
          onClick={() => setTab("yield")}
          disabled={!hasYield}
          className={`${tabBtn(tab === "yield")} ${!hasYield ? "cursor-not-allowed opacity-40" : ""}`}
          title={hasYield ? undefined : "Data yield historis belum tersedia"}
        >
          Yield (%)
        </button>
      </div>
      {tab === "dps" ? <DividendChart data={dps} /> : <DividendYieldChart data={yieldData} />}
    </div>
  );
}
