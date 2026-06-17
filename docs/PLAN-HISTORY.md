# Rencana: Webapp History & Kalender Dividen IDX

## Context

Pengguna (non-coder) ingin webapp interaktif untuk: (1) melihat **history dividen 5 tahun**
emiten IDX yang dividennya besar, (2) menilai **konsistensi waktu & jumlah** pembayaran,
dan (3) **kalender prediksi tanggal** dividen berikutnya (tanggal saja — TANPA estimasi
jumlah). Repo `alfindigital/idx-dividend` masih kosong (hanya `README.md`). Tujuan akhir:
live online, dibantu sampai deploy.

Tahap saat ini = brainstorming/planning. Riset data mendalam BELUM dikerjakan; dimulai
setelah plan disetujui.

### Keputusan yang sudah disepakati (via tanya-jawab)
- **Hosting/stack:** Vercel.
- **Cakupan:** target 50+ emiten, tapi **peluncuran bertahap** (rilis ~20–25 inti dulu).
- **Update data:** Hybrid — **history dividen dikurasi manual**; bagian **otomatis hanya
  harga saham terkini → yield berjalan**.
- **Kriteria "dividen besar":** yield ≥ ~6% di salah satu dari 5 tahun terakhir, PLUS emiten
  yang dulu rutin bagi besar tapi kini berhenti (potensi rapel/special).
- **Kalender:** cukup tampilan web (tanpa ekspor .ics / notifikasi email).

### Batasan penting yang sudah dikomunikasikan
- **Login Stockbit pengguna TIDAK bisa dipakai** (environment cloud terpisah). Halaman
  publik Stockbit + sumber publik lain tetap bisa diambil.
- **Akurasi:** data sekunder, di-cross-check antar sumber & dicantumkan sumbernya; tanggal
  corporate action idealnya diverifikasi ke IDX; ketidakpastian akan ditandai.
- **Prediksi tanggal = heuristik pola musiman**, bukan ramalan. Bukan saran investasi.

## Tech Stack
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS** — cocok untuk Vercel, mudah deploy.
- **Recharts** untuk grafik (DPS per tahun, tren yield).
- **Kalender:** komponen month-grid custom (ringan, mobile-friendly, kontrol penuh) — hindari
  dependency berat.
- **Data history:** file JSON ter-commit di repo (versioned di git, robust, tanpa DB).
  Supabase TIDAK dipakai.
- **Harga/yield berjalan:** Next.js API route runtime + cache, dengan fallback anggun.

## Arsitektur Data
File di `/data/`:
- `emiten.json` — array: `{ ticker, nama, sektor, papan?, flags: { dormant, special_history }, sumber: [url] }`
- `dividends.json` — array event: `{ ticker, tahun, tipe: "final"|"interim"|"special",
  cum_date, ex_date, record_date?, payment_date, dps_idr, harga_ref?, yield_pct, sumber_url }`
- Catatan: emiten bisa bagi >1x/tahun (interim + final) — model harus menampung itu.

Derivasi (di build/runtime, bukan disimpan):
- **Yield TTM berjalan** = Σ dividen 12 bulan terakhir ÷ harga terkini × 100.
- **Skor konsistensi waktu** = sebaran bulan ex-date antar tahun (stabil → "Sangat teratur").
- **Tren jumlah** = arah DPS 5 tahun (naik/stabil/turun) + berapa tahun dari 5 yang bayar.
- **Prediksi ex-date berikutnya** = bulan/rentang dari pola historis; emiten dormant
  ditandai "tanpa pola terbaru — potensi rapel", bukan diberi tanggal.

### Sumber harga berjalan
- API route `/app/api/price/route.ts` ambil harga close terkini per ticker (mis. endpoint
  publik Yahoo Finance `…/v8/finance/chart/{TICKER}.JK`), di-cache (`revalidate`/CDN
  `s-maxage`). **Fallback:** jika sumber gagal, tampilkan "yield saat dividen terakhir" dari
  history + catatan. Sumber harga bisa diganti jika diblokir.

## Fitur (per halaman)
1. **Dashboard (beranda)**
   - Tabel emiten: ticker, nama, sektor, **yield TTM (live)**, yield terakhir, frekuensi/thn,
     tanggal dividen terakhir, **perkiraan ex-date berikutnya**, badge konsistensi.
   - Filter: sektor, flag rapel/dormant, rentang yield, cari ticker/nama.
   - Urutkan: yield, tanggal terdekat, konsistensi.
2. **Detail per-emiten**
   - Timeline 5 tahun (tipe, ex-date, tgl bayar, Rp/lembar, yield saat itu).
   - Grafik: DPS/tahun + tren yield.
   - Skor konsistensi + tren jumlah + prediksi ex-date (dengan disclaimer).
   - Link sumber data per event.
3. **Kalender (web)**
   - Month grid; event historis (warna netral) + prediksi (warna beda + label "perkiraan").
   - Klik event → ke detail emiten. Highlight bulan ramai dividen (Apr–Jun, Nov–Des interim).
4. **Disclaimer global:** data sekunder, prediksi heuristik, bukan saran investasi.

## Metodologi Riset Data (fase berikutnya)
- **Seed universe:** konstituen IDXHIDIV20 + big payer terkenal (batu bara: PTBA, ITMG,
  ADRO/ADMR, BYAN, HRUM, INDY; bank: BBRI, BMRI, BBNI, BJBR, BJTM; UNTR, ASII, ANTM, TLKM,
  ISAT, HMSP, GGRM, INDF, ICBP, dll.) + emiten dormant yang dulu rutin besar.
- Per emiten: kumpulkan event dividen 5 tahun dari ≥2 sumber, cross-check, **cantumkan
  sumber**. Verifikasi tanggal corporate action ke IDX bila tersedia.
- Tandai data yang kurang yakin. Mulai dari **~20–25 inti** untuk rilis pertama.

## Milestone / Fase
- **Fase 0 (sekarang):** plan & samakan persepsi — file ini.
- **Fase 1:** Bangun app + data **~20–25 emiten inti** (tervalidasi) → deploy ke Vercel →
  **live URL**. Termasuk dashboard, detail, kalender, yield berjalan.
- **Fase 2:** Perluas data ke **50+** secara batch; perhalus skor konsistensi & prediksi;
  poles UI.
- **Fase 3 (opsional, jika berubah pikiran):** ekspor .ics / notifikasi email.

## Langkah Deploy ke Vercel (panduan untuk non-coder)
1. Aku build app & push ke repo (branch kerja → lalu `main`).
2. Kamu buat akun **Vercel gratis** → "Add New Project" → "Import" repo
   `alfindigital/idx-dividend`. Vercel auto-deteksi Next.js → Deploy. (Aku beri langkah
   klik-demi-klik.)
3. Tiap aku push update (data/fitur), Vercel **auto-redeploy**. URL live mis.
   `idx-dividend.vercel.app`.
4. **Tanpa env var** (sumber harga keyless). Jika nanti perlu key, aku pandu.

## Risiko & Batasan
- Keandalan sumber harga (ditangani dengan fallback).
- Akurasi data 50+ (dimitigasi: bertahap, cross-check, sumber dicantumkan, flag ketidakpastian).
- Prediksi bersifat heuristik.
- Bukan saran investasi (disclaimer jelas di UI).

## Verifikasi (akhir Fase 1)
- `npm run build` sukses; app jalan lokal (`npm run dev`).
- Dashboard menampilkan ~20–25 emiten; sort/filter berfungsi.
- Detail emiten: timeline + grafik + prediksi tampil benar untuk beberapa sampel (mis. PTBA,
  ITMG, BBRI) dan cocok dengan sumber yang dikutip.
- API harga mengembalikan yield berjalan; saat sumber dimatikan, fallback muncul tanpa error.
- Kalender menampilkan event historis + prediksi; klik → detail.
- Deploy Vercel menghasilkan URL live yang bisa dibuka di HP.

---

# STATUS EKSEKUSI FASE 1 (per 2026-06-14)

## ✅ Riset data SELESAI — 17 emiten, tervalidasi & cross-checked (sumber tercatat per event)

Konvensi yang dipakai: **`tahun` = tahun PEMBAYARAN** (payment year). Kalender memakai `ex_date`.
Semua DPS = Rupiah/lembar, basis saham as-paid pada saat itu (catatan stock-split di bawah).
f = final, i = interim, S = special. Data lengkap (cum/ex/record/payment + sumber per event)
ada di transcript hasil agen — tinggal ditranskripsi ke `data/dividends.json`.

DPS per tahun pembayaran (ringkas, untuk recovery bila konteks terpangkas):
- **PTBA** (Batu Bara, final): 2020 f326,46 · 2021 f74,69 · 2022 f688,52 · 2023 f1094,05 · 2024 f397,71 · 2025 f332,44
- **ITMG** (Batu Bara, f+i; deklarasi USD): 2020 f570+i307 · 2021 f167+i1218 · 2022 f3040+i4128 · 2023 f6416+i2660 · 2024 f1747+i1228 · 2025 f2245+i738
- **UNTR** (Alat Berat, f+i): 2020 f805+i171 · 2021 f473+i335 · 2022 f905+i818 · 2023 f6185+i701 · 2024 f1569+i667 · 2025 f1484+i567
- **ANTM** (Tambang Logam, final): 2020 2,82 · 2021 16,74 · 2022 38,74 · 2023 79,50 · 2024 128,07 · 2025 151,77
- **ADRO** (Batu Bara, f+i+**S**; deklarasi USD; rename→Alamtri): 2020 i65,48+f44,13 · 2021 f66,28 · 2022 i160,16+f141,39 · 2023 i251,28+f240,78 · 2024 i199,98+f209,31+**S1358,18 (jumbo, terkait listing AADI, bayar 6 Des 2024)** · 2025 i106,84+f**166,69** (catatan: 166,69 = angka final Investing.com; 158,9/163,89 hanya estimasi pra-kurs)
- **HRUM** (Batu Bara/Nikel, **DORMAN**): 2021 f39,58 · 2022 f15,02 · 2023 i75,10 (interim, bayar 3 Jan 2023) — lalu ABSEN 2024 & 2025 (pivot nikel). Split 1:5 (Jun 2022).
- **INDY** (Batu Bara/Energi, irregular, deklarasi USD): 2020 f89,63 · (SKIP 2021) · 2022 i114,46 · 2023 f208 · 2024 f92,13 · 2025 f15,93
- **BBRI** (Bank): 2020 f168,20 · 2021 f98,91 · 2022 f174,23 · 2023 i57+f231,22 · 2024 i84+f235 · 2025 i135+f208,40 (interim mulai TB2022)
- **BMRI** (Bank, **split 1:2 efektif 4 Apr 2023**): 2020 353,34 · 2021 220,27 · 2022 360,64 · 2023 529,34 · 2024 353,95 · 2025 466,18
- **BBNI** (Bank, **split 1:2 efektif 6 Okt 2023**): 2020 206,24 · 2021 44,02 (potong COVID) · 2022 146,29 · 2023 392,78 · 2024 280,49 · 2025 374,05
- **BJBR** (Bank BPD, yield tinggi): 2020 94,02 · 2021 95,74 · 2022 99,11 · 2023 104,55 · 2024 95,05 · 2025 85,25
- **BJTM** (Bank BPD, yield tinggi): 2020 48,20 · 2021 48,85 · 2022 52,11 · 2023 53,09 · 2024 54,39 · 2025 54,71
- **ASII** (Konglomerat, f+i): 2020 f157+i27 · 2021 f87+i45 · 2022 f194+i88 · 2023 f552+i98 · 2024 f421+i98 · 2025 f308+i98
- **TLKM** (Telko, final + **S** TB2019): 2020 f113,04+**S41,03** · 2021 168,01 · 2022 149,97 · 2023 167,59 · 2024 178,50 · 2025 212,46
- **HMSP** (Rokok, final): 2020 119,8 · 2021 72,8 · 2022 63,3 · 2023 54,7 · 2024 69,3 · 2025 56,2
- **GGRM** (Rokok, final; **SKIP 2020 & 2024**): 2021 2600 · 2022 2250 · 2023 1200 · 2025 500
- **INDF** (Konsumer, final): 2020 278 · 2021 278 · 2022 278 · 2023 257 · 2024 267 · 2025 280

Catatan akurasi: `harga_ref`/`yield_pct` banyak yang `null` (tidak dipublikasi per-event; tidak ditebak).
Tanggal corporate-action dari media (Bisnis/Kontan/CNBC/Bareksa/Liputan6) + agregator (stockanalysis/Investing) — belum diverifikasi ke PDF resmi IDX (sebagian 403). Tiap event menyimpan sumber.

## ✅ Aplikasi yang SUDAH dibuat (scaffold lengkap & buildable)
`package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`,
`.gitignore`, `app/globals.css`, `app/layout.tsx`, `app/api/price/route.ts`,
`lib/types.ts`, `lib/format.ts`, `lib/derive.ts`, `lib/data.ts`,
`components/Badges.tsx`, `components/Disclaimer.tsx`, `components/EmitenTable.tsx`,
`components/DividendChart.tsx`, `components/DividendTimeline.tsx`, `components/CalendarView.tsx`,
`app/emiten/[ticker]/page.tsx`, `data/emiten.json` (berisi 16 emiten — **belum termasuk ADRO**).

## ⏳ SISA pekerjaan (saat izin lanjut diberikan)
1. `data/emiten.json` — tambah entri **ADRO** (`special_history: true`).
2. `data/dividends.json` — tulis penuh ±97 event 17 emiten (saat ini masih SEED 2 event). Data di transcript.
3. `app/page.tsx` (dashboard) + `app/kalender/page.tsx` — **belum dibuat** (komponennya sudah ada).
4. `npm install` lalu `npm run build` untuk verifikasi kompilasi.
5. Commit + push ke branch `claude/confident-wright-vdij8p`.
6. Panduan klik-demi-klik deploy ke Vercel untuk user (non-coder).

Catatan: build & commit belum dijalankan; sebagian sub-agen riset sempat kena batas sesi
(reset 12:20 UTC) tetapi seluruh 17 emiten sudah berhasil terkumpul sebelum itu.

## ✅ UPDATE: build & push SELESAI
- `data/emiten.json` (17 emiten, +ADRO) & `data/dividends.json` (97 event) sudah ditulis penuh.
- `app/page.tsx` (dashboard) & `app/kalender/page.tsx` sudah dibuat.
- `npm install` + `npm run build` **sukses** (22 halaman). Next.js dinaikkan ke 14.2.35 (patch keamanan).
- Smoke test: homepage/detail/kalender HTTP 200; `/api/price` mengembalikan harga live (PTBA 2.620, BBRI 2.850).
- README diperbarui. Commit `c53e7c3` di-push ke branch `claude/confident-wright-vdij8p`.

## KEPUTUSAN DEPLOY (user): **merge langsung ke `main`** (izin push ke main diberikan)
Sisa langkah:
1. Merge `claude/confident-wright-vdij8p` → `main` (fast-forward) dan push `main`.
2. Pandu user (non-coder) deploy ke Vercel: buat akun → Import repo → Deploy (tanpa env var).

---

# FASE 2 — Perluasan data (bertahap menuju 50+ emiten)

## Context
Fase 1 LIVE di https://idx-dividend.vercel.app/ dengan 17 emiten. User pilih "seluas mungkin 50+"
secara bertahap. Fase 2 = tambah **Batch 2 (~18 emiten)** sehingga total **±35 emiten**, lalu
Batch 3 berikutnya menuju 50+. Arsitektur/skema TIDAK berubah — hanya menambah entri data.

## Batch 2 (18 emiten high-dividend, lintas sektor)
- **Bank:** BBCA, BBTN
- **Batu bara/energi:** BYAN, ADMR, GEMS, BSSR, PGAS
- **Konsumer:** ICBP, SIDO, UNVR, MYOR, KLBF
- **Logam:** INCO, TINS
- **Telko/menara:** ISAT, TOWR, TBIG
- **Lainnya:** AKRA

## Metodologi (sama seperti Fase 1)
- Riset paralel via agen (general-purpose) per klaster kecil; aturan ketat: hanya data
  terkonfirmasi, **cantumkan URL sumber per event**, jangan menebak (`null` + catatan bila ragu).
- Periode pembayaran 2020–2025. Konvensi `tahun` = tahun pembayaran (konsisten dgn data Fase 1).
- Normalisasi `tipe` → `final|interim|special`. Tandai `dormant`/`special_history`/stock-split.

## File yang diubah (pola sama, tanpa kode baru)
- `data/emiten.json` — tambah 18 entri emiten (ikuti skema entri yang ada).
- `data/dividends.json` — tambah event 2020–2025 per emiten (ikuti skema event yang ada).
- TIDAK ada perubahan komponen/logika — `lib/derive.ts`, halaman, API harga sudah generik.

## Verifikasi
- `npm run build` sukses (jumlah halaman detail bertambah jadi ±35).
- Spot-check beberapa emiten baru (mis. BBCA, BYAN, SIDO, PGAS) di lokal/preview: timeline,
  grafik, yield berjalan, prediksi tampil & cocok dgn sumber.
- Commit + push ke `claude/confident-wright-vdij8p` → merge ke `main` → Vercel auto-redeploy.

## Batch 3 (rencana berikutnya, menuju 50+)
JSMR, SMGR, INTP, AUTO, CPIN, JPFA, AMRT, MEDC, MEGA, BRIS, ULTJ, BDMN, EXCL, MTEL, ELSA, DSSA, NCKL.

---

# ✅ FASE 2 SELESAI & LIVE (commit d4bbc2f, merge ke main)
35 emiten total live di https://idx-dividend.vercel.app/. Batch 2 (18 emiten, ~150 event) tervalidasi.
Build sukses (40 halaman), harga live OK. Keputusan kualitas: as-paid utk stock-split; yield
GEMS/BSSR yg annualized di-null-kan; tahun skip di catatan emiten (bukan baris kosong).

# FASE 3 — Batch 3 (AKTIF): 15 emiten → total 50
**Daftar:** JSMR, SMGR, INTP, AUTO, CPIN, JPFA, AMRT, MEDC, MEGA, BRIS, ULTJ, BDMN, EXCL, MTEL, NCKL
- Sektor: jalan tol (JSMR), semen (SMGR, INTP), Astra/otomotif (AUTO), poultry (CPIN, JPFA),
  ritel (AMRT), energi (MEDC), bank (MEGA, BRIS, BDMN), konsumer (ULTJ), telko (EXCL, MTEL), nikel (NCKL).
- Metodologi SAMA: riset paralel per klaster, sumber per event, jangan menebak, `tahun` = tahun pembayaran,
  tipe final|interim|special, tandai split/skip/special, deklarasi USD untuk MEDC/NCKL bila ada.
- File: tambah 15 entri ke `data/emiten.json` + event 2020–2025 ke `data/dividends.json` (pola sama, tanpa kode baru).
- Verifikasi: `npm run build` (halaman detail → ~50), smoke-test harga live beberapa emiten, commit→push→merge main.
- Catatan emiten yg mungkin SKIP/iregular: BRIS (bank syariah, dividen mulai belakangan), MTEL (IPO Nov 2021),
  NCKL (IPO 2023), AUTO/ULTJ (final tahunan), MEDC (energi, USD), EXCL (telko, dividen tak selalu tiap tahun).

# ✅ FASE 3 SELESAI & LIVE (commit bcb54a7, merge ke main)
50 emiten total live di https://idx-dividend.vercel.app/. Batch 3 (15 emiten, 90 event) → total 364 event.
Build sukses (55 halaman). Cross-check: tiap emiten punya event, tanpa orphan/duplikat, tipe valid.
Smoke-test home/kalender/detail (SMGR/MEDC/AUTO/BRIS/MTEL) HTTP 200; harga live OK. Target 50+ TERCAPAI.

---

# FASE 4 (ARAH BARU per 15 Jun 2026) — Final verify + Handoff docs + deploy

## Context
User kena **limit Claude** dan akan **pindah ke akun Claude baru**. Permintaan baru (menggantikan
refresh-2026-sekarang): **(1)** pastikan versi LIVE sekarang sudah **final-verified**, **(2)** **deploy/merge
versi sekarang apa adanya** (TANPA tambah data 2026), dan **(3)** buat **dokumentasi handoff lengkap** —
seluruh knowledge, history, metodologi, dan skill/plan md — di-commit **ke dalam repo** supaya bisa
dilanjutkan di akun baru. Refresh 2026 (bekas rencana Fase 4 di bawah) **DITUNDA** → jadi "remaining work"
yang didokumentasikan untuk akun baru.

**Fakta penting:** `origin/main` SUDAH di `bcb54a7` (= branch fitur), working tree bersih → versi 50 emiten
**sudah live & ter-merge**. Knowledge selama ini ada di `/root/.claude/plans/…md` (di LUAR repo, tidak ikut
pindah akun) → harus disalin ke repo.

## Yang dikerjakan sekarang
1. **Final verify versi live:** `npm run build` sukses (55 halaman); cek integritas `data/*.json`
   (50 emiten, tiap event ticker valid, tak ada orphan/duplikat, tipe valid); serve lokal → smoke-test
   home/kalender/detail (sampel PTBA/BBRI/SMGR/ADRO) HTTP 200; `/api/price` balikan harga live.
2. **Tulis dokumentasi handoff ke repo (file BARU, tanpa ubah kode app):**
   - `HANDOFF.md` (root) — dokumen master untuk akun baru: ringkasan proyek + URL live; cara run/build/deploy
     (Vercel, tanpa env var); konvensi git/branch; peta file (`app/`, `lib/`, `components/`, `data/`); skema
     data & logika derivasi (`lib/derive.ts`); **metodologi kurasi** (tahun=tahun pembayaran, ex_date utk
     kalender, ≥2 sumber + URL per event, jangan menebak→`null`+catatan, USD-declared as-paid IDR, stock-split
     as-paid); **history Fase 1–3** + ringkasan DPS per emiten; **REMAINING WORK** (refresh 2026 + ide lanjutan)
     lengkap dgn langkahnya; "cara melanjutkan di akun Claude baru".
   - `docs/PLAN-HISTORY.md` — **salinan verbatim** isi plan/knowledge md ini agar tak ada yang hilang.
   - Update `README.md` ringkas → tunjuk ke `HANDOFF.md`.
3. **Deploy:** commit ke `claude/confident-wright-vdij8p` → fast-forward merge ke `main` → push → Vercel
   auto-redeploy (perubahan dok tidak mengubah app; build tetap aman).

## Verifikasi (akhir)
- Build sukses + smoke-test sampel HTTP 200 + `/api/price` live (sama seperti verifikasi rilis sebelumnya).
- `HANDOFF.md` & `docs/PLAN-HISTORY.md` ada di repo dan ter-push ke `main` (cek `git log origin/main`).
- `main` == branch fitur (fast-forward), tidak ada perubahan pada `app/`,`lib/`,`components/`,`data/`.

---

# FASE 5 (DITUNDA — untuk akun baru) — Refresh data ke tahun pembayaran 2026

## Context
Verifikasi live (Juni 2026) lolos: 50 emiten, semua fitur jalan. Tapi history terkurasi **hanya s/d tahun
pembayaran 2025**, padahal sekarang **15 Juni 2026**. Musim RUPS IDX (Mar–Jun) berarti banyak emiten **sudah
mengumumkan/membayar dividen final FY2025 pada Apr–Jul 2026**. Akibat data 2026 belum masuk:
1. **Yield berjalan (TTM) understated** — `ttmDividend()` (`lib/derive.ts:52`) menjumlah event 12 bulan terakhir;
   final 2026 yang sudah ex/bayar (~Mei–Jun 2026) belum terhitung.
2. **Timeline & "dividen terakhir"** di dashboard belum menampilkan pembayaran terbaru.
3. **Tren jumlah** belum memasukkan tahun terbaru.

**Penting (bukan bug):** Prediksi yang menampilkan "~Mei 2027" untuk pembayar tahunan SUDAH BENAR. `predictNext()`
(`lib/derive.ts:154-156`) memakai median bulan/hari lalu memilih kejadian **future berikutnya**; karena Mei 2026
sudah lewat, target berikut memang Mei 2027 — terlepas data 2026 ada/tidak. Jadi refresh ini **TIDAK mengubah kode**
dan **TIDAK** mengubah tanggal prediksi pembayar tahunan; tujuannya akurasi **history + yield TTM + dividen terakhir**.

## Scope
- **50 emiten yang sama.** Riset event **tahun pembayaran 2026** yang SUDAH terjadi/terumumkan per 15 Jun 2026.
- Realistis 0–1 event/emiten: mayoritas **final FY2025** (bayar Apr–Jul 2026). **Interim 2026** umumnya belum
  ada (biasanya Sep–Des) → jangan ditambahkan kecuali benar-benar sudah diumumkan.
- Emiten yang **belum mengumumkan** 2026 → **omit** (jangan ditebak/diisi placeholder).
- Cek juga status dormant: bila ada yang **bangkit** bagi dividen lagi di 2026 (mis. HRUM, GGRM yg sempat skip)
  → tambah event + perbarui `flags.dormant`/`pola_pembayaran` di `emiten.json` bila perlu.

## Metodologi (sama seperti Fase 1–3)
- Riset **paralel via agen** (general-purpose, background) per klaster sektor. Aturan ketat:
  **cross-check ≥2 sumber**, **cantumkan URL sumber per event**, **jangan menebak** (`null` + catatan bila ragu),
  basis **tahun = tahun pembayaran**, tanggal **ISO (YYYY-MM-DD)**.
- Normalisasi `tipe` → `final|interim|special`. `harga_ref`/`yield_pct` `null` bila tak dipublikasi (jangan dihitung sendiri).
- **USD-declared** (ITMG, ADRO/Alamtri, INDY, MEDC, NCKL): pakai nilai **as-paid IDR/lembar** (hasil konversi resmi),
  bukan angka USD; bila hanya estimasi pra-kurs → catat di `notes`.
- **Saham as-paid** (jika ada split/bonus 2026 — tidak diperkirakan, tapi diperiksa).

### Klaster riset (agar agen fan-out)
- Bank: BBRI, BMRI, BBNI, BBCA, BBTN, BJBR, BJTM, BRIS, BDMN, MEGA
- Batu bara/energi: PTBA, ITMG, ADRO, INDY, HRUM, ADMR, GEMS, BSSR, PGAS, MEDC, ELSA*
- Logam/tambang: ANTM, INCO, TINS, NCKL
- Telko/menara: TLKM, ISAT, EXCL, TOWR, TBIG, MTEL
- Konsumer/rokok: HMSP, GGRM, INDF, ICBP, UNVR, MYOR, SIDO, KLBF, ULTJ, AMRT, CPIN, JPFA
- Industri/lainnya: ASII, UNTR, AUTO, SMGR, INTP, JSMR, AKRA
  (*ELSA tidak termasuk 50 emiten — abaikan.)

## File yang diubah (pola sama, tanpa kode baru)
- `data/dividends.json` — **append** ~30–50 event 2026 (skema event identik). TIDAK mengubah event lama.
- `data/emiten.json` — hanya bila ada perubahan `flags.dormant`/`pola_pembayaran` (mis. dormant bangkit). Kalau tidak, tak diubah.
- TIDAK ada perubahan `lib/*`, komponen, atau API — semua sudah generik.

## Verifikasi (akhir Fase 4)
- `python3` cek JSON valid + konsistensi ticker (tetap 50 emiten, tak ada orphan/duplikat).
- `npm run build` sukses (tetap 55 halaman).
- Serve lokal → spot-check beberapa sampel (BBRI, PTBA, SMGR, BMRI):
  timeline memuat **2026**, "dividen terakhir" = 2026, **yield TTM** naik/masuk akal vs sebelumnya.
- `/api/price?tickers=...` tetap kembalikan harga live.
- Catatan ekspektasi: prediksi pembayar tahunan tetap menunjuk tahun depan (benar). Static page → prediksi
  dihitung saat **build/redeploy** (bukan harian); refresh terjadi otomatis tiap deploy.
- Commit → push `claude/confident-wright-vdij8p` → fast-forward `main` → Vercel auto-redeploy.

---

# ✅ FASE 5 SELESAI (2026-06-17) — Refresh data ke tahun pembayaran 2026

Dikerjakan di branch `claude/practical-lovelace-d59jsb`. **46 event tahun pembayaran 2026 ditambahkan** (4 interim:
BBRI Rp137, BMRI Rp100, ADRO Rp145,14, BSSR Rp127,41 — semua dibayar Jan 2026; + 42 final FY2025 dibayar Apr–Jul 2026)
dari **42 emiten** → total **410 event**. Metodologi: 6 agen riset paralel per klaster sektor (Bank, Batu bara, Energi/Logam,
Telko/Semen, Konsumer, Poultry/Astra), ≥2 sumber per event, USD-declared pakai konversi IDR resmi as-paid, jangan menebak (`null`).

**Hasil per emiten (final FY2025, Rp/saham kecuali disebut):** BBRI 209 (+interim 137) · BMRI 376,96 (+interim 100) ·
BBNI 349,41 · BBCA 281 · BJBR 85,54 · BJTM 56,62 · BRIS 32,81 · BDMN 142,19 · MEGA 171,95 · PTBA 114,508 · ITMG 992 ·
ADRO 118,26 (+interim 145,14) · ADMR 50,32 · GEMS 237,95 · BSSR 486,13 (+interim 127,41) · PGAS 125,61 · ANTM 209,99 ·
INCO 78,1 · TINS 88,18 · AKRA 100 · JSMR 156,2 · TLKM 222 · ISAT 111 · TOWR 6,89 · TBIG 47 · SMGR 28,33 · INTP 468 ·
HMSP 56,3 · UNVR 114 · MYOR 60 · SIDO 15 · KLBF 20 · ULTJ 130 · AMRT 41,5 · CPIN 180 · JPFA 140 · ASII 292 · UNTR 1.096 ·
AUTO 170. **`dps_idr=null`** (USD, kurs belum tersedia): INDY (US$0,01024875), BYAN (US$0,015), MEDC (US$0,0018).

**OMIT (8):** BBTN & EXCL (tak bagi dividen FY2025), HRUM (dormant), GGRM/INDF/ICBP/MTEL/NCKL (RUPST 23–30 Jun, belum diumumkan per 17 Jun).
`emiten.json` di-update untuk BBTN (skip 2025), EXCL (skip 2025 rugi), BMRI (interim pertama TB2025 kini dalam rentang).

**Verifikasi:** JSON valid, 0 orphan/duplikat, `npm run build` sukses (55 halaman), smoke-test BBRI/PTBA/BMRI/SMGR/BYAN/BBTN HTTP 200,
timeline & "dividen terakhir" memuat 2026, prediksi jalan. `/api/price` mengembalikan fallback `null` di sandbox (Yahoo diblokir) — normal, berfungsi di Vercel.

**Follow-up (sesi berikutnya):** lihat `HANDOFF.md` §10.A — cek ulang GGRM/INDF/ICBP/MTEL/NCKL setelah RUPST akhir Juni; isi `dps_idr` INDY/BYAN/MEDC saat kurs resmi terbit; interim TB2026 (Sep–Des 2026) saat diumumkan.
