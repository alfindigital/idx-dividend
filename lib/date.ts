/**
 * Util tanggal yang aman timezone.
 *
 * Masalah yang dihindari: `new Date("2026-05-20")` di-parse sebagai UTC tengah
 * malam, lalu getter lokal (`getMonth`, `getDate`, `getDay`) bisa menggeser
 * tanggal/bulan di timezone tertentu. Helper di sini mem-parse string ISO
 * `YYYY-MM-DD` sebagai tanggal LOKAL sehingga konsisten di mana pun.
 */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Parse "YYYY-MM-DD" sebagai tengah malam waktu lokal (bukan UTC). */
export function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = ISO_RE.exec(iso);
  if (!m) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const d = new Date(y, mo, da);
  return isNaN(d.getTime()) ? null : d;
}

/** Tanggal hari ini (lokal) dalam format ISO "YYYY-MM-DD". */
export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** Format sebuah Date menjadi "YYYY-MM-DD" berdasarkan komponen lokalnya. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

/** Selisih hari (bulat ke bawah) dari `from` ke `to`, berbasis tanggal lokal. */
export function daysBetween(fromIso: string, toIso: string): number | null {
  const a = parseISODate(fromIso);
  const b = parseISODate(toIso);
  if (!a || !b) return null;
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS);
}

/**
 * Perkiraan jumlah bulan dari hari ini ke `iso` (dibulatkan).
 * Dipakai untuk label "≈ N bulan lagi" pada perkiraan jadwal.
 */
export function monthsFromToday(iso: string, now: Date = new Date()): number | null {
  const target = parseISODate(iso);
  if (!target) return null;
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth()) +
    (target.getDate() - now.getDate()) / 30;
  return Math.max(0, Math.round(months));
}

/** Label relatif manusiawi: "hari ini", "besok", "3 hari lagi", "≈2 bulan lagi". */
export function relativeLabel(iso: string, now: Date = new Date()): string {
  const days = daysBetween(toISODate(now), iso);
  if (days == null) return "";
  if (days < 0) return `${Math.abs(days)} hari lalu`;
  if (days === 0) return "hari ini";
  if (days === 1) return "besok";
  if (days <= 21) return `${days} hari lagi`;
  const months = monthsFromToday(iso, now);
  return months && months >= 1 ? `≈${months} bulan lagi` : `${days} hari lagi`;
}
