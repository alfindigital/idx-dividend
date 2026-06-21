#!/usr/bin/env node
/*
 * Pemeriksa integritas data dividen (dependency-free, Node ESM).
 * Jalankan: `npm run check-data`.
 *
 * ERROR (exit 1) = data rusak yang harus diperbaiki sebelum rilis.
 * WARN  (exit 0) = data tidak lengkap / perlu dilengkapi, bukan blocker.
 *
 * Tujuan: menjaga kualitas saat menambah cakupan emiten ("data nyusul")
 * dan menangkap masalah pada data yang sudah ada.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const emiten = JSON.parse(readFileSync(join(root, "data/emiten.json"), "utf8"));
const dividends = JSON.parse(readFileSync(join(root, "data/dividends.json"), "utf8"));

const errors = [];
const warns = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warns.push(msg);

const TIPE = new Set(["final", "interim", "special"]);
const CONF = new Set(["tinggi", "sedang", "rendah"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(s) {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
}
const toTime = (s) => new Date(s + "T00:00:00Z").getTime();

// slug sektor (cermin lib/slug.ts) untuk cek bentrok
const sektorSlug = (s) =>
  s.toLowerCase().replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- emiten ----------
const tickers = new Set();
const slugMap = new Map();
for (const e of emiten) {
  const id = e.ticker ?? "(tanpa ticker)";
  if (!e.ticker || typeof e.ticker !== "string") err(`emiten: ada entri tanpa ticker valid (${e.nama ?? "?"})`);
  if (tickers.has(e.ticker)) err(`emiten ${id}: ticker duplikat`);
  tickers.add(e.ticker);
  if (!e.nama) err(`emiten ${id}: 'nama' kosong`);
  if (!e.sektor) err(`emiten ${id}: 'sektor' kosong`);
  if (!e.flags || typeof e.flags.dormant !== "boolean" || typeof e.flags.special_history !== "boolean")
    err(`emiten ${id}: 'flags.dormant' / 'flags.special_history' harus boolean`);
  if (!Array.isArray(e.sumber) || e.sumber.length === 0)
    warn(`emiten ${id}: belum ada 'sumber' tingkat emiten`);

  if (e.sektor) {
    const slug = sektorSlug(e.sektor);
    const prev = slugMap.get(slug);
    if (prev && prev !== e.sektor) err(`sektor: "${prev}" dan "${e.sektor}" bentrok slug "${slug}"`);
    slugMap.set(slug, e.sektor);
  }
}

// ---------- dividends ----------
const seenKey = new Map();
const eventsByTicker = new Map();
for (let i = 0; i < dividends.length; i++) {
  const d = dividends[i];
  const id = `${d.ticker ?? "?"} ${d.tahun ?? "?"}/${d.tipe ?? "?"}`;

  if (!d.ticker || !tickers.has(d.ticker)) err(`dividen[${i}] ${id}: ticker tidak ada di emiten.json`);
  else eventsByTicker.set(d.ticker, (eventsByTicker.get(d.ticker) ?? 0) + 1);

  if (!Number.isInteger(d.tahun) || d.tahun < 2000 || d.tahun > 2100)
    err(`dividen[${i}] ${id}: 'tahun' tidak valid (${d.tahun})`);
  if (!TIPE.has(d.tipe)) err(`dividen[${i}] ${id}: 'tipe' tidak valid (${d.tipe})`);
  if (d.confidence != null && !CONF.has(d.confidence))
    err(`dividen[${i}] ${id}: 'confidence' tidak valid (${d.confidence})`);

  const dateFields = ["cum_date", "ex_date", "record_date", "payment_date"];
  for (const f of dateFields) {
    if (d[f] != null && !validDate(d[f])) err(`dividen[${i}] ${id}: '${f}' bukan tanggal ISO valid (${d[f]})`);
  }

  // kronologi (hanya jika dua tanggal valid)
  const ok = (f) => d[f] != null && validDate(d[f]);
  if (ok("cum_date") && ok("ex_date")) {
    if (toTime(d.ex_date) < toTime(d.cum_date)) err(`dividen[${i}] ${id}: ex_date < cum_date`);
    else if (toTime(d.ex_date) === toTime(d.cum_date)) warn(`dividen[${i}] ${id}: ex_date == cum_date (biasanya ex = cum + 1 hari bursa)`);
  }
  if (ok("ex_date") && ok("payment_date") && toTime(d.payment_date) < toTime(d.ex_date))
    err(`dividen[${i}] ${id}: payment_date < ex_date`);
  if (ok("ex_date") && ok("record_date") && toTime(d.record_date) < toTime(d.ex_date))
    warn(`dividen[${i}] ${id}: record_date < ex_date (tidak lazim)`);

  // duplikat event (ticker + tahun + tipe + ex_date)
  if (d.ex_date) {
    const key = `${d.ticker}|${d.tahun}|${d.tipe}|${d.ex_date}`;
    if (seenKey.has(key)) err(`dividen[${i}] ${id}: duplikat event (${key})`);
    seenKey.set(key, i);
  }

  // sanity yield = dps/harga*100 (warning, toleransi 15%)
  if (typeof d.dps_idr === "number" && typeof d.harga_ref === "number" && d.harga_ref > 0 && typeof d.yield_pct === "number") {
    const calc = (d.dps_idr / d.harga_ref) * 100;
    if (calc > 0 && Math.abs(calc - d.yield_pct) / calc > 0.15)
      warn(`dividen[${i}] ${id}: yield_pct ${d.yield_pct} != dps/harga*100 ${calc.toFixed(2)} (selisih >15%)`);
  }

  // kelengkapan (warning)
  if (!Array.isArray(d.sumber_url) || d.sumber_url.length === 0)
    warn(`dividen[${i}] ${id}: belum ada 'sumber_url'`);
  if (d.dps_idr == null) warn(`dividen[${i}] ${id}: 'dps_idr' masih null (belum lengkap)`);
}

// emiten tanpa event sama sekali (info ringan)
for (const e of emiten) {
  if (!eventsByTicker.get(e.ticker) && !e.flags?.dormant)
    warn(`emiten ${e.ticker}: belum punya event dividen di dividends.json`);
}

// ---------- ringkasan ----------
console.log(`Emiten: ${emiten.length} | Event dividen: ${dividends.length} | Sektor: ${slugMap.size}`);
console.log(`Error: ${errors.length} | Warning: ${warns.length}`);
if (warns.length) {
  console.log("\n--- WARNING ---");
  for (const w of warns) console.log("  ! " + w);
}
if (errors.length) {
  console.log("\n--- ERROR ---");
  for (const e of errors) console.log("  x " + e);
  console.log(`\nGAGAL: ${errors.length} error integritas data.`);
  process.exit(1);
}
console.log("\nOK: tidak ada error integritas data.");
