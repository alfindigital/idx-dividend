# Dividen IDX — History & Kalender

> 📋 **Melanjutkan proyek ini (atau dari akun/sesi Claude baru)?** Baca **[`HANDOFF.md`](HANDOFF.md)** dulu —
> berisi arsitektur, skema data, metodologi kurasi, history Fase 1–4, dan daftar pekerjaan berikutnya.
> Knowledge/plan mentah ada di [`docs/PLAN-HISTORY.md`](docs/PLAN-HISTORY.md).

Webapp interaktif untuk melihat **riwayat dividen ~5 tahun terakhir** emiten IDX berdividen
besar, menilai **konsistensi waktu & jumlah** pembayaran, dan melihat **kalender perkiraan**
kapan dividen berikutnya kemungkinan dibagikan (tanggal saja — bukan estimasi jumlah).

## Fitur
- **Dashboard**: tabel emiten dengan yield berjalan (harga terkini, otomatis), yield terakhir,
  badge konsistensi waktu & tren jumlah, tanggal ex-dividend terakhir, dan perkiraan berikutnya.
  Bisa difilter (sektor, dorman/rapel, cari) dan diurutkan; **preset cepat** + feed **"Akan ex-dividend"**
  (menonjolkan cum-date / "beli sebelum").
- **Detail per-emiten**: ringkasan naratif + **FAQ**, timeline lengkap (tipe, cum/ex date, tanggal bayar,
  Rp/lembar, yield, keyakinan), grafik dividen/tahun, **yield forward & toggle setelah pajak 10%**,
  skor konsistensi & tren, perkiraan jadwal, **tautan sumber per event**, dan tombol **bagikan/bandingkan**.
- **Kalender**: tampilan bulanan + heatmap tahunan; **halaman kalender per bulan** (`/kalender/2026/06`).
- **Lainnya**: `/leaderboard`, `/sektor`, `/banding` (compare), **`/artikel`** (edukasi), **⌘K** cari cepat,
  **PWA** (installable), **`/api/dividends`** ekspor dataset, watchlist yang bisa dibagikan via URL.
- **Transparansi**: badge **"Data diperbarui …"** + ringkasan kualitas sumber per emiten.

## Cakupan data (50 emiten)
50 emiten high-dividend lintas sektor (perbankan, batu bara/energi, logam, telko/menara, konsumer,
rokok, semen, otomotif, poultry, ritel, jalan tol, dll.), 410 event, periode pembayaran 2020–2026.
Daftar lengkap & status per emiten ada di [`HANDOFF.md`](HANDOFF.md) §9.

## Sumber data & disclaimer
Data dirangkum dari sumber publik (IDX, CNBC Indonesia, Bisnis, Kontan, Bareksa, Liputan6,
Investing.com, stockanalysis.com, situs IR perusahaan, dll.), di-cross-check antar sumber, dan
setiap event mencantumkan tautan sumbernya. Data sekunder bisa mengandung kekeliruan —
**bukan saran investasi**. Prediksi tanggal bersifat perkiraan berbasis pola historis.

## Teknologi
Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts. Data riwayat tersimpan sebagai
JSON di `data/` (`emiten.json`, `dividends.json`). Harga/yield berjalan diambil runtime via
`/api/price` (sumber publik, dengan fallback bila gagal). Tanpa database, tanpa env var.

## Menjalankan lokal
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
```

## Deploy ke Vercel (gratis)
1. Buat akun di https://vercel.com (login pakai GitHub).
2. **Add New → Project → Import** repo `alfindigital/idx-dividend`.
3. Vercel auto-deteksi Next.js — klik **Deploy** (tanpa pengaturan tambahan / env var).
4. Setiap `git push` akan otomatis men-deploy ulang. URL live mis. `idx-dividend.vercel.app`.

## Struktur
```
app/                 # halaman (dashboard, /emiten/[ticker], /kalender) + /api/price
components/          # tabel, kalender, grafik, timeline, badge
lib/                 # tipe, util format, logika turunan (yield/konsistensi/prediksi), loader data
data/                # emiten.json, dividends.json  ← sumber kebenaran data riwayat
```

## Memperbarui data
Edit `data/emiten.json` & `data/dividends.json` lalu commit — Vercel akan men-deploy ulang.
**Setelah memperbarui data, bump `DATA_UPDATED` di `lib/dataMeta.ts`** (tanggal kurasi yang tampil
sebagai badge "Data diperbarui"), lalu jalankan `npm run check-data` dan `npm test`.
Skema satu event: `{ ticker, tahun, tipe(final|interim|special), cum_date, ex_date, record_date,
payment_date, dps_idr, harga_ref, yield_pct, confidence, notes, sumber_url[] }`.
