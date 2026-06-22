# HANDOFF — Dividen IDX (History & Kalender)

> Dokumen serah-terima lengkap supaya pengerjaan proyek ini bisa **dilanjutkan di akun/sesi
> Claude yang baru**. Seluruh "knowledge", konvensi, history, dan metodologi yang sebelumnya
> hanya tersimpan di luar repo (file plan internal Claude) kini dipindahkan ke repo ini.
>
> - **Live:** https://idx-dividend.vercel.app/
> - **Repo:** `alfindigital/idx-dividend`
> - **Branch kerja:** `claude/confident-wright-vdij8p` → di-merge fast-forward ke `main`
> - **Status (diverifikasi 2026-06-17):** 50 emiten, **410 event** dividen (tahun pembayaran **2020–2026**),
>   `npm run build` sukses (55 halaman), smoke-test halaman OK. **FASE 5 (refresh 2026) SELESAI** — lihat §10.A.
>   (Status sebelumnya 2026-06-15: 364 event s/d 2025.)
> - **Knowledge/history mentah (verbatim):** lihat [`docs/PLAN-HISTORY.md`](docs/PLAN-HISTORY.md).

---

## 0. Untuk Claude di akun/sesi BARU — baca ini dulu

Kalau kamu Claude yang baru melanjutkan proyek ini, lakukan urutan ini:

1. Baca file ini (`HANDOFF.md`) sampai habis, lalu `docs/PLAN-HISTORY.md` untuk konteks penuh Fase 1–4.
2. Jalankan `npm install` → `npm run build` untuk memastikan repo sehat.
3. Tugas yang paling mungkin diminta user berikutnya = **Refresh data ke tahun pembayaran 2026**
   (lihat bagian **§10 Remaining Work**). Metodologinya identik dengan batch-batch sebelumnya.
4. **PEGANG TEGUH konvensi data di §7** — terutama: `tahun` = tahun **pembayaran**, **≥2 sumber +
   URL per event**, dan **jangan pernah menebak angka** (pakai `null` + catatan di `notes`).
5. Hanya menambah/mengubah **data** (`data/*.json`) untuk pekerjaan rutin — kode app (`lib/`,
   `components/`, `app/`) sudah generik dan **tidak perlu** diubah untuk menambah emiten/event.
6. **Setiap kali data berubah, bump `DATA_UPDATED` di `lib/dataMeta.ts`** (tanggal yang tampil sebagai
   badge "Data diperbarui"), lalu jalankan `npm run check-data` + `npm test`. Watchdog terjadwal
   (`.github/workflows/data-watchdog.yml`) akan mengingatkan via issue bila data terindikasi basi.
7. **Update 2026-06-22 (audit 360°):** ditambah feed "Akan ex-dividend", FAQ/narasi per emiten,
   halaman kalender per bulan (`app/kalender/[year]/[month]`), `/artikel`, ⌘K, PWA install,
   yield forward + toggle pajak, `/api/dividends`, fallback harga + rate-limit, analytics, CI + tes.
   Logika `timingConsistency`/`predictNext` kini memakai **statistik bulan melingkar** (lihat
   `lib/derive.ts` + `lib/derive.test.ts`). Lihat `CHANGELOG.md` 2026-06-22 untuk rincian.

User adalah **non-coder** berbahasa Indonesia. Jelaskan langkah deploy secara klik-demi-klik bila perlu,
dan tulis commit/PR dalam bahasa Indonesia (gaya commit yang sudah ada).

---

## 1. Apa ini

Webapp interaktif untuk emiten IDX berdividen besar:
1. **History dividen ~5 tahun** (jumlah & tanggal corporate action).
2. **Penilaian konsistensi** waktu (sebaran bulan ex-date) & tren jumlah (naik/stabil/turun).
3. **Kalender perkiraan** tanggal dividen berikutnya — **tanggal saja, bukan estimasi jumlah**.
4. **Yield berjalan (TTM)** otomatis dari harga saham terkini.

Bukan saran investasi; data sekunder dengan sumber dicantumkan; prediksi = heuristik pola musiman.

---

## 2. Stack & cara menjalankan

- **Next.js 14 (App Router) + TypeScript + Tailwind + Recharts.** Tanpa database, **tanpa env var**.
- Data history = file JSON ter-commit di `data/`. Harga live = API route runtime (Yahoo Finance, keyless).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi (saat ini menghasilkan 55 halaman)
npm start        # menjalankan hasil build
```

### Deploy ke Vercel (gratis, untuk non-coder)
1. Buat akun di https://vercel.com (login pakai GitHub).
2. **Add New → Project → Import** repo `alfindigital/idx-dividend`.
3. Vercel auto-deteksi Next.js → klik **Deploy** (tanpa pengaturan / env var).
4. Tiap `git push` ke `main` → Vercel **auto-redeploy**. URL: `idx-dividend.vercel.app`.

> Catatan: halaman emiten = static (SSG), dihitung saat **build/redeploy**. Yield berjalan & prediksi
> tanggal ikut ter-refresh setiap kali Vercel build ulang (bukan harian otomatis).

---

## 3. Konvensi Git

- Kembangkan di branch `claude/confident-wright-vdij8p`. **Jangan** push ke branch lain tanpa izin.
- Selesai → commit deskriptif (bahasa Indonesia) → `git push -u origin <branch>` → **fast-forward merge ke
  `main`** → push `main` (user sudah memberi izin merge langsung ke `main` untuk proyek ini).
- Jangan buat Pull Request kecuali user memintanya.

---

## 4. Peta file

```
app/
  layout.tsx                # shell + metadata + disclaimer global
  page.tsx                  # Dashboard (tabel emiten, filter, sort) — static
  kalender/page.tsx         # Kalender bulanan (event historis + perkiraan) — static
  emiten/[ticker]/page.tsx  # Detail per-emiten (SSG, 1 halaman per ticker)
  api/price/route.ts        # Harga live (Yahoo Finance .JK), cache 15 mnt, fallback null
  globals.css
components/
  EmitenTable.tsx           # tabel dashboard + yield live (fetch /api/price)
  CalendarView.tsx          # grid bulanan
  DividendChart.tsx         # grafik DPS/tahun (Recharts)
  DividendTimeline.tsx      # timeline event per emiten
  Badges.tsx                # badge konsistensi/tren/flag
  Disclaimer.tsx
lib/
  types.ts                  # tipe Emiten, DividendEvent, LivePrice (lihat §6)
  data.ts                   # loader: emitenList, dividendList, getEmiten, getDividends, allSectors...
  derive.ts                 # SEMUA logika turunan (lihat §5)
  format.ts                 # util format Rupiah/tanggal/bulan
data/
  emiten.json               # daftar emiten (50)            ← sumber kebenaran
  dividends.json            # event dividen (364)           ← sumber kebenaran
docs/PLAN-HISTORY.md        # salinan verbatim plan/knowledge Fase 1–4
```

---

## 5. Logika turunan — `lib/derive.ts` (PENTING saat menambah data)

Semua dihitung dari `data/*.json`, tidak disimpan:
- **`eventDate(e)`** = `ex_date ?? cum_date ?? payment_date`. Inilah tanggal acuan untuk sort & kalender.
- **`annualTotals` / `latestAnnual`** = Σ `dps_idr` per `tahun` (event dengan `dps_idr === null` di-skip).
- **`ttmDividend(events, asOf)`** = Σ dividen yang `eventDate`-nya dalam 12 bulan terakhir → dasar **yield berjalan**.
- **`timingConsistency`** = stddev bulan ex-date final (≤0.8 "Sangat teratur", ≤1.8 "Cukup", else "Tidak teratur").
- **`amountTrend`** = regresi linear total/tahun → Naik/Stabil/Turun.
- **`predictNext(events, emiten, today)`** = ambil **median bulan & tanggal** event 5 tahun terakhir per
  `tipe`, lalu pilih **kejadian future berikutnya**. Emiten `dormant` & tipe `special` **tidak** diprediksi.

> ⚠️ **Perilaku prediksi yang sering disalahpahami (BUKAN bug):** untuk pembayar tahunan (mis. final
> ~Mei), bila bulan itu sudah lewat tahun ini, prediksi menunjuk **tahun depan** — itu memang benar
> (kejadian future berikutnya). Menambah data tahun berjalan **tidak** memajukan tanggal ke masa lalu.
> Nilai dari me-refresh data tahun berjalan = akurasi **yield TTM**, **timeline**, & **"dividen terakhir"** —
> bukan mengubah tanggal prediksi pembayar tahunan.

---

## 6. Skema data (dari `lib/types.ts`)

**Emiten** (`data/emiten.json`):
```jsonc
{
  "ticker": "PTBA",
  "nama": "Bukit Asam Tbk",
  "sektor": "Batu Bara",
  "papan": "Utama",                 // opsional
  "flags": { "dormant": false, "special_history": false },
  "pola_pembayaran": "Dividen final tahunan; ex-date Apr–Jun ...",  // opsional, ringkasan bulan
  "sumber": ["https://...", "https://..."]                          // URL tingkat emiten
}
```

**DividendEvent** (`data/dividends.json`) — emiten bisa punya >1 event/tahun (interim + final):
```jsonc
{
  "ticker": "PTBA",
  "tahun": 2020,                    // TAHUN PEMBAYARAN (bukan tahun buku)
  "tipe": "final",                  // "final" | "interim" | "special"
  "cum_date": "2020-06-18",         // ISO; boleh null
  "ex_date": "2020-06-19",          // ISO; boleh null  (dipakai kalender & prediksi)
  "record_date": "2020-06-22",      // opsional; boleh null
  "payment_date": "2020-07-10",     // ISO; boleh null
  "dps_idr": 326.46,                // Rupiah/lembar (as-paid); null bila tak diketahui
  "harga_ref": null,                // harga acuan; null bila tak dipublikasi
  "yield_pct": 13.33,               // null bila tak dipublikasi (JANGAN dihitung sendiri)
  "confidence": "tinggi",           // "tinggi" | "sedang" | "rendah"
  "notes": "Tahun buku 2019, payout 90%.",
  "sumber_url": ["https://...", "https://..."]   // WAJIB, ≥2 sumber cross-check
}
```

---

## 7. Metodologi & konvensi kurasi data (WAJIB diikuti)

Ini inti "knowledge" proyek — patuhi persis agar dataset tetap konsisten:

1. **`tahun` = tahun PEMBAYARAN** (payment year), bukan tahun buku. Konsisten sejak Fase 1.
2. **≥2 sumber + cantumkan URL per event** (`sumber_url`). Cross-check antar sumber.
3. **Jangan pernah menebak.** Bila ragu/angka tak terkonfirmasi → `null` + jelaskan di `notes`
   (mis. "166,69 = angka final Investing; 158,9 hanya estimasi pra-kurs").
4. **Kalender pakai `ex_date`** (fallback cum/payment). Selalu format **ISO `YYYY-MM-DD`**.
5. **`dps_idr` = as-paid IDR/lembar** pada saat itu. Untuk emiten dengan **stock-split** (BMRI 1:2 Apr 2023,
   BBNI 1:2 Okt 2023, HRUM 1:5 Jun 2022) → pakai nilai sebagaimana dibayar saat itu, catat split di `notes`/`pola_pembayaran`.
6. **Deklarasi USD** (ITMG, ADRO/Alamtri, INDY, MEDC, NCKL) → pakai **nilai konversi IDR resmi** (as-paid),
   bukan angka USD. Bila baru estimasi pra-kurs → tandai di `notes`.
7. **`harga_ref`/`yield_pct` = `null`** bila tidak dipublikasikan sumber — jangan hitung sendiri
   (yield berjalan sudah dihitung app dari harga live).
8. **Tahun yang di-skip** (mis. GGRM skip 2020 & 2024, INDY skip 2021) → **tidak** dibuat baris kosong;
   cukup dicatat di `pola_pembayaran`/`notes` emiten.
9. **Flags:** `dormant: true` bila berhenti membagi beberapa tahun terakhir (mis. **HRUM** pivot nikel,
   absen 2024–2025). `special_history: true` bila pernah special/jumbo (mis. ADRO S-1358,18 Des 2024; TLKM; BYAN; ISAT; EXCL; BDMN; MTEL).
10. **Sumber yang dipakai sejauh ini:** IDX (PDF kadang 403), KSEI, stockanalysis.com, Investing.com,
    CNBC Indonesia, Bisnis.com, Kontan, Bareksa, Liputan6, situs IR emiten. Tanggal corporate-action
    idealnya diverifikasi ke pengumuman resmi IDX/KSEI bila bisa diakses.
11. **Proses riset:** untuk batch besar, sebar **agen riset paralel per klaster sektor**, kumpulkan event +
    sumber, lalu transkripsi ke JSON. Tetap satu-satunya file yang berubah = `data/*.json` (tanpa kode baru).

---

## 8. Sumber harga live — `app/api/price/route.ts`

- Endpoint: `GET /api/price?tickers=PTBA,BBRI,...` → `{ prices: [{ticker, price, ok}], ts }`.
- Sumber: Yahoo Finance `query1.finance.yahoo.com/v8/finance/chart/{TICKER}.JK` (keyless), cache `s-maxage=900`.
- **Fallback:** bila sumber gagal → `price: null` (UI menampilkan "yield saat dividen terakhir" dari history).
- Bila Yahoo diblokir di masa depan, ganti `fetchPrice()` ke sumber publik lain — kontrak respons tetap.

---

## 9. Cakupan data saat ini — 50 emiten, 364 event (2020–2025)

| Sektor | Ticker | #ev | Tahun | Tipe | Flags |
|---|---|---|---|---|---|
| Alat Berat | UNTR | 12 | 2020–2025 | final+interim | — |
| Batu Bara | PTBA | 6 | 2020–2025 | final | — |
| Batu Bara | ITMG | 12 | 2020–2025 | final+interim | — |
| Batu Bara | BYAN | 9 | 2020–2025 | final+interim+special | special |
| Batu Bara | GEMS | 16 | 2021–2025 | final+interim | — |
| Batu Bara | BSSR | 14 | 2020–2025 | final+interim | — |
| Batu Bara/Energi | ADRO (Alamtri) | 12 | 2020–2025 | final+interim+special | special |
| Batu Bara/Energi | INDY | 5 | 2020–2025 | final+interim | — (skip 2021) |
| Batu Bara/Logam | ADMR | 1 | 2025 | final | — (baru mulai) |
| Batu Bara/Nikel | HRUM | 3 | 2021–2023 | final+interim | **DORMANT** |
| Energi/Gas | PGAS | 5 | 2020–2025 | final | — |
| Energi/Migas | MEDC | 8 | 2022–2025 | final+interim | — |
| Energi/Distribusi | AKRA | 13 | 2020–2025 | final+interim | — |
| Jalan Tol | JSMR | 4 | 2020–2025 | final | — |
| Semen | SMGR | 6 | 2020–2025 | final | — |
| Semen | INTP | 6 | 2020–2025 | final+interim | — |
| Tambang Logam | ANTM | 6 | 2020–2025 | final | — |
| Logam/Nikel | INCO | 3 | 2021–2025 | final | — |
| Logam/Nikel | NCKL | 3 | 2023–2025 | final | — |
| Logam/Timah | TINS | 3 | 2022–2025 | final | — |
| Konglomerat | ASII | 12 | 2020–2025 | final+interim | — |
| Otomotif | AUTO | 11 | 2020–2025 | final+interim | — |
| Telekomunikasi | TLKM | 7 | 2020–2025 | final+special | special |
| Telekomunikasi | ISAT | 6 | 2021–2025 | final+interim | special |
| Telekomunikasi | EXCL (XLSMART) | 7 | 2020–2025 | final+special | special |
| Infrastruktur/Menara | TOWR | 12 | 2020–2025 | final+interim | — |
| Infrastruktur/Menara | TBIG | 8 | 2020–2025 | final+interim | — |
| Infrastruktur/Menara | MTEL | 4 | 2022–2025 | final | special |
| Perbankan | BBRI | 9 | 2020–2025 | final+interim | — |
| Perbankan | BMRI | 6 | 2020–2025 | final | — (split 1:2 2023) |
| Perbankan | BBNI | 6 | 2020–2025 | final | — (split 1:2 2023) |
| Perbankan | BBCA | 12 | 2020–2025 | final+interim | — |
| Perbankan | BBTN | 5 | 2020–2025 | final | — |
| Perbankan | BJBR | 6 | 2020–2025 | final | — |
| Perbankan | BJTM | 6 | 2020–2025 | final | — |
| Perbankan | BDMN | 6 | 2020–2025 | final | special |
| Perbankan | MEGA | 6 | 2020–2025 | final | — |
| Perbankan (Syariah) | BRIS | 4 | 2022–2025 | final | — (mulai belakangan) |
| Konsumer | INDF | 6 | 2020–2025 | final | — |
| Konsumer | ICBP | 6 | 2020–2025 | final | — |
| Konsumer | UNVR | 12 | 2020–2025 | final+interim | — |
| Konsumer | MYOR | 6 | 2020–2025 | final | — |
| Konsumer | SIDO | 12 | 2020–2025 | final+interim | — |
| Konsumer | KLBF | 7 | 2020–2025 | final+interim | — |
| Konsumer | ULTJ | 6 | 2020–2025 | final | — |
| Konsumer (Rokok) | HMSP | 6 | 2020–2025 | final | — |
| Konsumer (Rokok) | GGRM | 4 | 2021–2025 | final | — (skip 2020 & 2024) |
| Poultry | CPIN | 6 | 2020–2025 | final+interim | — |
| Poultry | JPFA | 6 | 2020–2025 | final+interim | — |
| Ritel | AMRT | 7 | 2020–2025 | final+interim | — |

> Ringkasan DPS per tahun untuk 17 emiten inti (PTBA, ITMG, UNTR, ANTM, ADRO, HRUM, INDY, BBRI, BMRI,
> BBNI, BJBR, BJTM, ASII, TLKM, HMSP, GGRM, INDF) ada di `docs/PLAN-HISTORY.md` §"STATUS EKSEKUSI FASE 1".

---

## 10. Remaining work / roadmap

### A. Refresh data ke tahun pembayaran 2026 — ✅ SELESAI (2026-06-17, commit refresh-2026)
**46 event 2026 ditambahkan** (4 interim: BBRI, BMRI, ADRO, BSSR; 42 final) dari **42 emiten** → total 410 event.
Riset via 6 agen paralel per klaster sektor + verifikasi silang (≥2 sumber/event, jangan menebak).

**8 emiten sengaja di-OMIT (belum/tidak ada dividen yang dibayar 2026 per 17 Jun):**
- **Tidak bagi dividen FY2025:** `BBTN` (payout 0%, RUPST 23 Apr 2026), `EXCL` (rugi bersih pasca-merger XLSMART).
- **Masih dormant:** `HRUM` (RUPST 3 Jun 2026 putuskan tak bagi, pivot nikel).
- **Belum RUPS/diumumkan per 17 Jun (RUPST akhir Juni):** `GGRM` (RUPST 23 Jun), `INDF` & `ICBP` (RUPST 26 Jun),
  `MTEL` (RUPST ditunda ke 30 Jun), `NCKL` (audit FY2025 ditunda ke OJK).

**3 event dengan `dps_idr = null` (deklarasi USD, kurs konversi as-paid belum tersedia per 17 Jun):**
`INDY` (US$0,01024875/saham), `BYAN` (US$0,015/saham, kurs ditetapkan di record date 23 Jun), `MEDC` (US$0,0018/saham, record date 18 Jun).

**Follow-up untuk sesi berikutnya (setelah akhir Juni 2026):**
1. Cek ulang `GGRM`, `INDF`, `ICBP`, `MTEL`, `NCKL` setelah RUPST masing-masing (23–30 Jun) → append bila sudah umumkan.
2. Isi `dps_idr` untuk `INDY`/`BYAN`/`MEDC` begitu nilai konversi IDR resmi (as-paid) dipublikasikan.
3. Interim TB2026 (umumnya dibayar Sep–Des 2026) belum ada per 17 Jun — tambahkan saat sudah diumumkan.
4. (Catatan akurasi) Beberapa interim TB2025 yang dibayar di **2025** (mis. BSSR interim US$35jt 21 Nov 2025) berada di luar scope refresh ini dan belum tentu ada di dataset 2025 — bisa dilengkapi terpisah bila diinginkan.

#### (Arsip) Instruksi asli refresh 2026
Karena sekarang sudah pertengahan 2026, banyak emiten **sudah membayar final FY2025 (Apr–Jul 2026)**.
Tambahkan event **tahun pembayaran 2026** yang sudah terjadi/terumumkan.
- **Hanya ubah `data/dividends.json`** (append) — kecuali ada dormant yang bangkit / pola berubah (lalu update `emiten.json`).
- Interim 2026 umumnya belum ada (biasanya Sep–Des) → jangan ditambahkan kalau belum diumumkan.
- Emiten yang belum mengumumkan → **omit** (jangan placeholder).
- Klaster riset (untuk fan-out agen): **Bank** (BBRI, BMRI, BBNI, BBCA, BBTN, BJBR, BJTM, BRIS, BDMN, MEGA);
  **Batu bara/energi** (PTBA, ITMG, ADRO, INDY, HRUM, ADMR, GEMS, BSSR, PGAS, MEDC);
  **Logam** (ANTM, INCO, TINS, NCKL); **Telko/menara** (TLKM, ISAT, EXCL, TOWR, TBIG, MTEL);
  **Konsumer/rokok** (HMSP, GGRM, INDF, ICBP, UNVR, MYOR, SIDO, KLBF, ULTJ, AMRT, CPIN, JPFA);
  **Industri/lainnya** (ASII, UNTR, AUTO, SMGR, INTP, JSMR, AKRA).
- Verifikasi: build sukses; spot-check sampel (BBRI/PTBA/SMGR/BMRI) → timeline memuat 2026, "dividen
  terakhir" = 2026, yield TTM masuk akal. Detail lengkap: `docs/PLAN-HISTORY.md` §"FASE 5".

### B. Ide pengembangan lanjutan (opsional)
- Verifikasi tanggal corporate-action ke PDF/pengumuman resmi IDX/KSEI (naikkan `confidence` ke "tinggi").
- Tambah emiten baru menuju >50 (ikuti kriteria "dividen besar": yield ≥~6% di salah satu dari 5 tahun, atau dormant yang dulu rutin besar).
- Ekspor kalender ke `.ics` / notifikasi (sempat di-skip di rilis awal).
- Cache harga harian (mis. revalidate harian) atau ganti sumber bila Yahoo diblokir.

---

## 11. Disclaimer & catatan akurasi

Data sekunder, di-cross-check & bersumber, tapi bisa keliru — **bukan saran investasi**. Banyak
`harga_ref`/`yield_pct` sengaja `null` (tak dipublikasi per-event). Sebagian tanggal dari media/agregator,
belum semua diverifikasi ke dokumen resmi IDX. Prediksi tanggal = heuristik pola musiman, bukan kepastian.
