import { ConsistencyBadge, TrendBadge, FlagBadge } from "./Badges";
import { BookOpen, ChevronDown } from "./ui/icons";

function Row({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-center gap-1.5 font-medium text-fg">{title}</div>
      <p className="text-muted">{children}</p>
    </div>
  );
}

/** Legenda + glosarium singkat untuk pembaca awam (collapsible). */
export default function DashboardGuide({ open = false }: { open?: boolean }) {
  return (
    <details open={open} className="group rounded-xl border border-line bg-surface p-4 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-fg">
        <span className="inline-flex items-center gap-2">
          <BookOpen size={17} className="text-brand" />
          Cara membaca tabel
        </span>
        <ChevronDown size={18} className="text-faint transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <Row title="Yield berjalan">
          Dividen 12 bln terakhir ÷ harga sekarang. Angka{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">hijau</span> = ≥ 6%.
          Yield tinggi belum tentu bagus.
        </Row>
        <Row title="Div. terakhir">Total dividen per lembar (Rp) tahun pembayaran terakhir.</Row>
        <Row
          title={
            <>
              Konsistensi: <ConsistencyBadge value="Sangat teratur" />
              <ConsistencyBadge value="Tidak teratur" />
            </>
          }
        >
          Keteraturan waktu pembagian dividen tiap tahun.
        </Row>
        <Row
          title={
            <>
              Tren: <TrendBadge value="Naik" />
              <TrendBadge value="Turun" />
            </>
          }
        >
          Arah besaran dividen per lembar antar tahun.
        </Row>
        <Row
          title={
            <>
              Penanda: <FlagBadge dormant={true} special={true} />
            </>
          }
        >
          <strong>Dorman</strong> = jarang/tak teratur membagikan. <strong>Spesial</strong> = pernah
          dividen tidak rutin.
        </Row>
        <Row title="Perkiraan berikutnya">
          Tebakan bulan ex-date dari pola historis. Bukan kepastian; jumlah tidak diprediksi.
        </Row>
      </div>
      <p className="mt-3 border-t border-line pt-2 text-xs text-faint">
        <strong>cum-date</strong> = batas terakhir beli agar dapat dividen; <strong>ex-date</strong> ={" "}
        mulai tanggal ini pembeli baru tidak lagi dapat dividen.
      </p>
    </details>
  );
}
