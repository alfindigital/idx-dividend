"use client";

import { useWatchlist } from "@/lib/useWatchlist";
import { Star } from "./ui/icons";

export default function WatchlistButton({
  ticker,
  withLabel = false,
}: {
  ticker: string;
  withLabel?: boolean;
}) {
  const { has, toggle } = useWatchlist();
  const fav = has(ticker);
  return (
    <button
      type="button"
      onClick={() => toggle(ticker)}
      aria-pressed={fav}
      aria-label={fav ? "Hapus dari watchlist" : "Tambah ke watchlist"}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium transition ${
        fav
          ? "border-amber-400/50 bg-amber-400/10 text-amber-500"
          : "border-line bg-surface text-muted hover:text-fg"
      }`}
    >
      <Star size={16} filled={fav} className={fav ? "text-amber-400" : ""} />
      {withLabel && <span>{fav ? "Tersimpan" : "Watchlist"}</span>}
    </button>
  );
}
