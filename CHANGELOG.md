# Changelog

Catatan perubahan untuk **Dividen IDX**. Tanggal format `YYYY-MM-DD`.

---

## 2026-06-18 — UI/UX overhaul + refresh data dividen (PR #4–#9)

Perombakan tampilan menyeluruh menjadi aplikasi bergaya fintech modern
(mobile-first, *bold modern* indigo, dark/light), plus koreksi & penambahan
data dividen. **Tanpa perubahan skema data.**

### Branding & sistem desain
- Logo mark SVG baru (*ascending bars*, gradient indigo→violet) + favicon (`app/icon.svg`).
- **Design tokens** via CSS variables (light + dark) untuk semua warna; palet **Indigo→Violet** (dari teal).
- Tipografi: **Plus Jakarta Sans** (body) + **Space Grotesk** (display) + `tabular-nums`.
- **Sistem ikon outline** sendiri (`components/ui/icons.tsx`) menggantikan semua emoji.
- Sudut lebih tajam, hairline border, shadow halus + *glow* indigo pada tombol primary.

### Tema (dark/light)
- Toggle Sun/Moon + skrip anti-flash; transisi halus saat ganti tema.
- **Default LIGHT** (dark hanya bila dipilih, tersimpan di `localStorage`).

### Responsive (mobile-first)
- Header *translucent blur*; **bottom navigation** mobile + tombol bantuan **?** ke `/panduan`.
- Dashboard: **tabel → kartu** di mobile; **bottom-sheet "Filter"**.
- Filter bar *sticky*; **kolom Emiten sticky** saat scroll horizontal; lebar konten s/d 1600px.

### Dashboard (data-grid)
- Sort klik header (asc/desc + indikator); **kolom resizable** (lebar tersimpan); *fill-width*.
- **Baris statistik** (5 kartu).
- Filter: cari, **sektor multi-select**, **Yield ≥**, **Div ≥**, **Tren**, **Watchlist**.
- **Active filter chips** + "Reset semua"; **pagination dihapus**; judul kolom dipendekkan.
- Yield **warna berjenjang**; **skeleton** saat harga loading; ticker jelas *clickable*;
  penanda dorman/spesial jadi **ikon** inline; **mini-sparkline DPS** per baris (desktop).
- Status harga di-reword + relokasi.

### Halaman detail emiten
- Dipadatkan (max-w, prediksi + ekspor berdampingan, copy ringkas).
- **Grafik historis toggle DPS (Rp) ↔ Yield (%)**.
- Tombol **watchlist**; badge "keyakinan" hanya untuk prediksi; sumber per tanggal dividen.

### Halaman lain
- **Kalender** dirombak (sel modern, *today* brand, pill historis/prediksi, legenda); judul/intro dibuang.
- Halaman **`/panduan`** terpisah (cara baca tabel + glosarium + **satu** disclaimer terpadu).
- **Footer** animasi (copyright + rotasi akun sosial, warna brand).

### Engagement & data-viz
- **Watchlist/favorit** (`localStorage`) + filter "Hanya watchlist", sinkron antar komponen.
- **Grafik yield-over-time** (DY history) di halaman detail.

### Aksesibilitas & performa
- `aria-sort`, `aria-pressed`/`aria-label`, `focus-visible` ring, `sr-only` h1.
- **Progress bar** tipis saat pindah halaman; semua halaman SSG + Link prefetch.

### Konten
- Hapus **semua em/en dash** dari UI, catatan data, dan file `.ics`.

### Data
- **Koreksi dividen 2025-2026** cross-check Stockbit/KSEI: AKRA, MEDC (cum/ex), ADMR, INCO;
  isi BYAN/MEDC/INDY/UNTR; tambah **BBCA** interim 2026 & **BSSR** interim Nov 2025 → **412 event**.
- **EXCL** & **GGRM** ditandai tidak bagi dividen FY2025 (`dormant`) → prediksi berhenti menebak.

### Fixed
- Overflow kartu emiten di mobile (angka yield kepotong).

---

## Sebelumnya (ringkas)

- **2026-06-17** — Ekspor kalender dividen ke `.ics` + tautan Google Calendar (PR #3).
- **2026-06-17** — Yield berjalan (TTM) *live* + auto-refresh harga (PR #2).
- **2026-06-17** — Refresh data ke tahun pembayaran 2026 (PR #1).
