export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "cta"; href: string; label: string };

export interface Article {
  slug: string;
  title: string;
  description: string;
  /** Tanggal terbit ISO. */
  date: string;
  /** Estimasi waktu baca (menit). */
  readMin: number;
  body: Block[];
}

/**
 * Artikel evergreen — top-of-funnel & internal linking ke alat.
 * Konten statis, ditulis di repo (aman, tanpa pipeline MDX/dep tambahan).
 */
export const ARTICLES: Article[] = [
  {
    slug: "cum-date-ex-date-dividen",
    title: "Cum-date vs ex-date: kapan harus beli agar dapat dividen",
    description:
      "Penjelasan sederhana cum-date, ex-date, recording date, dan payment date — plus contoh nyata agar tidak ketinggalan dividen.",
    date: "2026-06-18",
    readMin: 4,
    body: [
      {
        type: "p",
        text: "Banyak investor pemula kehilangan dividen hanya karena salah memahami tanggal. Padahal aturannya sederhana: yang menentukan apakah kamu berhak atas dividen adalah apakah kamu memegang saham sampai cum-date.",
      },
      { type: "h2", text: "Empat tanggal penting" },
      {
        type: "ul",
        items: [
          "Cum-date: hari terakhir kamu masih bisa membeli saham dan tetap berhak atas dividen. Inilah tanggal paling actionable.",
          "Ex-date: biasanya satu hari bursa setelah cum-date. Jika kamu baru membeli pada/ sesudah ex-date, kamu TIDAK dapat dividen periode itu.",
          "Recording date: tanggal perusahaan mendata pemegang saham yang berhak.",
          "Payment date: tanggal dividen benar-benar masuk ke rekening (bisa beberapa minggu setelah ex-date).",
        ],
      },
      { type: "h2", text: "Contoh" },
      {
        type: "p",
        text: "Misal sebuah emiten menetapkan cum-date 22 Juni dan ex-date 23 Juni. Untuk dapat dividen, kamu harus sudah memegang saham paling lambat penutupan bursa 22 Juni. Membeli pada 23 Juni berarti melewatkan dividen kali ini. Karena itu, di Dividen IDX kami menonjolkan cum-date dengan label “beli sebelum”.",
      },
      {
        type: "p",
        text: "Perlu diingat, harga saham umumnya turun mendekati besarnya dividen pada ex-date (penyesuaian otomatis). Jadi membeli mepet cum-date hanya untuk “menangkap” dividen belum tentu menguntungkan setelah pajak dan penyesuaian harga.",
      },
      { type: "cta", href: "/kalender", label: "Lihat kalender ex-dividend" },
    ],
  },
  {
    slug: "yield-dividen-cara-hitung",
    title: "Yield dividen: cara menghitung dan membacanya dengan benar",
    description:
      "Apa itu dividend yield, beda yield TTM dan yield forward, serta kenapa yield tinggi belum tentu bagus.",
    date: "2026-06-18",
    readMin: 5,
    body: [
      {
        type: "p",
        text: "Dividend yield adalah dividen per lembar dibagi harga saham, dinyatakan dalam persen. Yield 6% berarti untuk setiap Rp100 yang kamu tanam, sekitar Rp6 kembali sebagai dividen setahun.",
      },
      { type: "h2", text: "Yield berjalan (TTM) vs yield forward" },
      {
        type: "ul",
        items: [
          "Yield TTM (trailing twelve months): total dividen 12 bulan terakhir dibagi harga sekarang. Mencerminkan apa yang sudah dibayar.",
          "Yield forward / indikatif: dividen tahun buku terakhir (run-rate) dibagi harga sekarang. Lebih stabil untuk pembayar tahunan, karena TTM bisa terbaca rendah di celah antar pembayaran.",
        ],
      },
      {
        type: "p",
        text: "Di halaman tiap emiten, Dividen IDX menampilkan keduanya dan ikut bergerak mengikuti harga saham terkini, sehingga kamu tidak perlu menghitung manual.",
      },
      { type: "h2", text: "Kenapa yield tinggi belum tentu bagus" },
      {
        type: "p",
        text: "Yield bisa melonjak hanya karena harga saham jatuh (yield trap), atau karena ada dividen spesial sekali jalan yang tidak akan berulang. Karena itu, baca yield bersama konsistensi waktu, tren jumlah, dan apakah dividennya reguler atau spesial.",
      },
      { type: "cta", href: "/leaderboard", label: "Lihat emiten yield tertinggi" },
    ],
  },
  {
    slug: "pajak-dividen-indonesia",
    title: "Pajak dividen di Indonesia: PPh final 10% dan pengecualiannya",
    description:
      "Ringkasan aturan pajak dividen untuk investor orang pribadi (PP 9/2021), termasuk syarat bebas pajak bila diinvestasikan kembali.",
    date: "2026-06-18",
    readMin: 4,
    body: [
      {
        type: "p",
        text: "Untuk investor orang pribadi dalam negeri, dividen dari emiten Indonesia umumnya dikenai Pajak Penghasilan (PPh) final sebesar 10%. Artinya, dividen yang kamu terima sudah dipotong dan tidak digabung lagi dengan penghasilan lain.",
      },
      { type: "h2", text: "Bisa bebas pajak?" },
      {
        type: "p",
        text: "Berdasarkan UU Cipta Kerja dan PP 9/2021, dividen yang diterima orang pribadi dalam negeri dapat dikecualikan dari PPh sepanjang diinvestasikan kembali di wilayah Indonesia dalam jangka waktu dan dengan syarat tertentu (mis. lewat instrumen yang diatur), serta dilaporkan sesuai ketentuan.",
      },
      {
        type: "p",
        text: "Karena pajak memengaruhi imbal hasil bersih, di tiap emiten kami menyediakan tombol “setelah pajak 10%” untuk memperkirakan yield bersih bila kamu tidak memenuhi syarat reinvestasi.",
      },
      {
        type: "p",
        text: "Catatan: ini ringkasan edukasi, bukan nasihat pajak. Ketentuan bisa berubah dan situasi tiap orang berbeda — konsultasikan dengan konsultan pajak untuk keputusan riil.",
      },
      { type: "cta", href: "/", label: "Lihat yield setelah pajak per emiten" },
    ],
  },
  {
    slug: "memilih-saham-dividen-konsisten",
    title: "Cara memilih saham dividen yang konsisten (bukan sekadar yield tinggi)",
    description:
      "Kerangka sederhana menilai saham dividen: konsistensi waktu, tren jumlah, beruntun membagikan, dan kualitas sumber data.",
    date: "2026-06-18",
    readMin: 5,
    body: [
      {
        type: "p",
        text: "Dividen yang baik bukan yang paling besar sekali jalan, tapi yang bisa diandalkan dari tahun ke tahun. Berikut beberapa hal yang kami soroti di Dividen IDX.",
      },
      { type: "h2", text: "1. Konsistensi waktu" },
      {
        type: "p",
        text: "Emiten yang ex-date-nya jatuh di bulan yang relatif sama tiap tahun lebih mudah direncanakan. Kami menilainya dengan statistik bulan melingkar (sehingga pembayar Desember–Januari tidak salah dinilai “tidak teratur”).",
      },
      { type: "h2", text: "2. Tren & pertumbuhan jumlah" },
      {
        type: "p",
        text: "Dividen per lembar yang stabil atau naik (CAGR positif) lebih menarik daripada yang turun. Lihat grafik DPS per tahun di halaman emiten.",
      },
      { type: "h2", text: "3. Beruntun membagikan" },
      {
        type: "p",
        text: "Berapa tahun berturut-turut emiten membagikan dividen? Streak panjang menandakan kebijakan dividen yang konsisten, meski bukan jaminan masa depan.",
      },
      { type: "h2", text: "4. Kualitas data & status khusus" },
      {
        type: "ul",
        items: [
          "Perhatikan tanda dorman (berhenti membagi) atau special (dividen jumbo sekali jalan).",
          "Cek apakah event punya minimal dua sumber tercatat — kami tampilkan rasionya di tiap emiten.",
        ],
      },
      { type: "cta", href: "/leaderboard", label: "Bandingkan lewat leaderboard" },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
