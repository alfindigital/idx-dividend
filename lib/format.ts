export const BULAN_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const BULAN_ID_SINGKAT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const HARI_ID_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function bulanID(m: number): string {
  return BULAN_ID[m] ?? "";
}

export function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTanggal(iso: string | null | undefined): string {
  const d = parseDate(iso);
  if (!d) return "-";
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalSingkat(iso: string | null | undefined): string {
  const d = parseDate(iso);
  if (!d) return "-";
  return `${d.getDate()} ${BULAN_ID_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRupiah(n: number | null | undefined, maxDesimal = 2): string {
  if (n == null) return "-";
  return (
    "Rp " +
    n.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDesimal,
    })
  );
}

export function formatAngka(n: number | null | undefined, maxDesimal = 2): string {
  if (n == null) return "-";
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDesimal,
  });
}

export function formatPersen(n: number | null | undefined): string {
  if (n == null) return "-";
  return (
    n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + "%"
  );
}

export function labelTipe(tipe: string): string {
  switch (tipe) {
    case "final":
      return "Final";
    case "interim":
      return "Interim";
    case "special":
      return "Spesial";
    default:
      return tipe;
  }
}
