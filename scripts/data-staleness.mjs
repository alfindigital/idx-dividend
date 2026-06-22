#!/usr/bin/env node
/*
 * Pemeriksa kesegaran data (untuk watchdog terjadwal).
 * - Membaca DATA_UPDATED dari lib/dataMeta.ts.
 * - Menandai emiten non-dorman yang belum punya event di tahun berjalan
 *   (kandidat data "nyusul" setelah RUPS).
 * Menulis ringkasan + flag `stale` ke $GITHUB_OUTPUT bila tersedia.
 *
 * Selalu exit 0 (informasional, bukan blocker).
 */
import { readFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const emiten = JSON.parse(readFileSync(join(root, "data/emiten.json"), "utf8"));
const dividends = JSON.parse(readFileSync(join(root, "data/dividends.json"), "utf8"));

// Ambil DATA_UPDATED dari lib/dataMeta.ts (parsing sederhana, tanpa TS runtime).
let updated = null;
try {
  const meta = readFileSync(join(root, "lib/dataMeta.ts"), "utf8");
  const m = /DATA_UPDATED\s*=\s*"(\d{4}-\d{2}-\d{2})"/.exec(meta);
  if (m) updated = m[1];
} catch {
  /* abaikan */
}

const STALE_DAYS = 45;
const today = new Date();
const year = today.getFullYear();

const ageDays = updated
  ? Math.floor((today.getTime() - new Date(updated + "T00:00:00Z").getTime()) / 86400000)
  : null;

const paidThisYear = new Set(dividends.filter((d) => d.tahun === year).map((d) => d.ticker));
const missing = emiten
  .filter((e) => !e.flags?.dormant && !paidThisYear.has(e.ticker))
  .map((e) => e.ticker);

const stale = (ageDays != null && ageDays > STALE_DAYS) || missing.length >= Math.ceil(emiten.length * 0.4);

const lines = [];
lines.push(`Data diperbarui: ${updated ?? "?"}${ageDays != null ? ` (${ageDays} hari lalu)` : ""}`);
lines.push(`Tahun berjalan: ${year}`);
lines.push(`Emiten non-dorman tanpa event ${year}: ${missing.length}/${emiten.length}`);
if (missing.length) lines.push(`  → ${missing.join(", ")}`);
lines.push(`STALE: ${stale ? "YA" : "tidak"} (ambang ${STALE_DAYS} hari)`);

const report = lines.join("\n");
console.log(report);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `stale=${stale ? "true" : "false"}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `missing_count=${missing.length}\n`);
  // body multiline untuk issue
  appendFileSync(process.env.GITHUB_OUTPUT, `report<<EOF\n${report}\nEOF\n`);
}
