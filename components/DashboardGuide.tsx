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

/** Legenda + glosarium singkat untuk pembaca awam (collapsible, default tertutup). */
export default function DashboardGuide() {
  return (
    <details className="group rounded-xl border border-line bg-surface p-4 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-fg">
        <span className="inline-flex items-center gap-2">
          <BookOpen size={17} className="text-brand" />
          Panduan singkat: cara membaca tabel
        </span>
        <ChevronDown size={18} className="text-faint transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <Row title="Yield berjalan">
          Total dividen 12 bulan terakhir ÷ harga saham sekarang, dalam persen. Angka{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">hijau</span> = ≥ 6%
          (relatif tinggi). Yield tinggi belum tentu bagus — cek keberlanjutannya.
        </Row>
        <Row title="Div. terakhir">
          Total dividen per lembar (Rp) pada tahun pembayaran terakhir yang tercatat.
        </Row>
        <Row
          title={
            <>
              Konsistensi: <ConsistencyBadge value="Sangat teratur" />
              <ConsistencyBadge value="Cukup teratur" />
              <ConsistencyBadge value="Tidak teratur" />
            </>
          }
        >
          Seberapa teratur emiten membagikan dividen pada periode yang mirip tiap tahun.
        </Row>
        <Row
          title={
            <>
              Tren jumlah: <TrendBadge value="Naik" />
              <TrendBadge value="Stabil" />
              <TrendBadge value="Turun" />
            </>
          }
        >
          Arah besaran dividen per lembar dari tahun ke tahun.
        </Row>
        <Row
          title={
            <>
              Penanda: <FlagBadge dormant={true} special={true} />
            </>
          }
        >
          <strong>Dorman/rapel</strong> = jarang atau tak teratur membagikan belakangan ini.{" "}
          <strong>Pernah spesial</strong> = pernah ada dividen tidak rutin (bonus).
        </Row>
        <Row title="Perkiraan berikutnya">
          Tebakan bulan ex-date berikutnya berdasarkan pola historis — <strong>bukan kepastian</strong>,
          dan jumlahnya tidak diprediksi.
        </Row>
      </div>
      <p className="mt-3 border-t border-line pt-2 text-xs text-faint">
        Istilah penting: <strong>cum-date</strong> = batas terakhir beli agar dapat dividen;{" "}
        <strong>ex-date</strong> = mulai tanggal ini pembeli baru tidak lagi dapat dividen.
      </p>
    </details>
  );
}
