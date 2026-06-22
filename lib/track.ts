"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Wrapper analytics tipis & privacy-friendly (Vercel Analytics).
 * Dipakai untuk mengukur pemakaian fitur kunci tanpa PII.
 */
export type TrackEvent =
  | "export_csv"
  | "download_ics"
  | "add_watchlist"
  | "remove_watchlist"
  | "open_emiten"
  | "use_preset"
  | "toggle_after_tax"
  | "share_emiten"
  | "compare_open"
  | "install_pwa";

export function track(event: TrackEvent, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(event, props);
  } catch {
    /* analytics tak boleh memecahkan UI */
  }
}
