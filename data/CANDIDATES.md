# Kandidat penambahan cakupan emiten ("data nyusul")

Daftar emiten IDX pembagi dividen yang **belum** ada di `data/emiten.json` (per 50 emiten saat ini),
untuk ditambahkan kelak. Ini hanya **kerangka riset** — kolom angka (DPS, tanggal, yield) sengaja
dikosongkan dan **harus diisi dari sumber terverifikasi**, bukan dari ingatan.

## Aturan pengisian (wajib)
- Minimal **2 sumber independen** per event dividen (`sumber_url[]`).
- Jika sebuah angka/tanggal tidak bisa dipastikan, isi `null` dan jelaskan di `notes`. **Jangan mengarang.**
- Set `confidence`: `tinggi` (2+ sumber cocok), `sedang` (1 sumber jelas), `rendah` (perkiraan).
- Catat aksi korporasi penting di `pola_pembayaran` (stock split, saham bonus, deklarasi USD, tahun skip).
- Setelah menambah data, jalankan `npm run check-data` (harus 0 error) lalu `npm run build`.
- Sektor baru otomatis membuat slug halaman `/sektor/<slug>`; pemeriksa slug menggagalkan build bila bentrok.

## Sumber rujukan (cek silang minimal dua)
- Riwayat per-event: `https://stockanalysis.com/quote/idx/<TICKER>/dividend/`
- `https://www.investing.com/equities/<slug-perusahaan>-dividends`
- Halaman Hubungan Investor (IR) resmi perusahaan
- Pengumuman resmi IDX / KSEI, dan media keuangan (Kontan, Bisnis, CNBC Indonesia)

## Kandidat (ticker -> nama -> usulan sektor)
> Sektor mengikuti taksonomi yang ada bila cocok; yang bertanda (baru) akan menambah halaman sektor baru.

| Ticker | Nama (untuk diverifikasi) | Usulan sektor | Catatan riset |
| --- | --- | --- | --- |
| SMSM | Selamat Sempurna | Otomotif | Pembagi rutin, payout tinggi; interim + final |
| TURI | Tunas Ridean | Otomotif | Yield relatif tinggi |
| AALI | Astra Agro Lestari | Perkebunan / Sawit (baru) | Grup Astra; final tahunan, kadang interim |
| LSIP | PP London Sumatra Indonesia | Perkebunan / Sawit (baru) | Grup IndoAgri |
| TAPG | Triputra Agro Persada | Perkebunan / Sawit (baru) | IPO 2021; yield naik |
| DSNG | Dharma Satya Nusantara | Perkebunan / Sawit (baru) | Sawit + kayu |
| BNGA | Bank CIMB Niaga | Perbankan | Final tahunan |
| BFIN | BFI Finance Indonesia | Pembiayaan (baru) | Multifinance; pernah saham bonus |
| TSPC | Tempo Scan Pacific | Konsumer | Farmasi + konsumer |
| MERK | Merck | Kesehatan (baru) | Yield tinggi; riwayat dividen spesial |
| MIKA | Mitra Keluarga Karyasehat | Kesehatan / Rumah Sakit (baru) | Jaringan rumah sakit |
| AVIA | Avia Avian | Konsumer | Cat; dividen sejak IPO 2022 |
| ACES | Aspirasi Hidup Indonesia (Ace Hardware) | Ritel | Pembagi rutin |
| EPMT | Enseval Putera Megatrading | Konsumer | Distributor (grup Kalbe) |
| CMRY | Cisarua Mountain Dairy | Konsumer | IPO 2021 |
| PWON | Pakuwon Jati | Properti (baru) | Properti pembagi dividen paling konsisten |
| ELSA | Elnusa | Energi / Migas | Jasa hulu migas |

Catatan: verifikasi ulang nama resmi & sektor tiap emiten saat riset (nama dapat berubah karena
aksi korporasi / merger). Tambahkan hanya emiten yang benar-benar punya riwayat dividen yang bisa
disumberkan.
