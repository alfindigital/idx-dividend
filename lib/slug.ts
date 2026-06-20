import { allSectors, emitenList } from "./data";
import type { Emiten } from "./types";

/**
 * Ubah nama sektor menjadi slug URL yang aman. Contoh:
 * "Batu Bara / Logam" -> "batu-bara-logam", "Perbankan (Syariah)" -> "perbankan-syariah".
 * Tanda kurung dibuang, sisanya dikecilkan dan dirangkai dengan tanda "-".
 */
export function sektorSlug(sektor: string): string {
  return sektor
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let cached: { slug: string; sektor: string }[] | null = null;

/**
 * Pasangan slug <-> sektor untuk semua sektor yang ada. Menjaga konsistensi
 * (di-cache) dan menggagalkan build bila dua sektor menghasilkan slug yang sama,
 * sehingga penambahan data sektor baru tidak diam-diam keliru.
 */
export function allSektorSlugs(): { slug: string; sektor: string }[] {
  if (cached) return cached;
  const seen = new Map<string, string>();
  const pairs: { slug: string; sektor: string }[] = [];
  for (const sektor of allSectors()) {
    const slug = sektorSlug(sektor);
    const prev = seen.get(slug);
    if (prev && prev !== sektor) {
      throw new Error(
        `Slug sektor bentrok: "${prev}" dan "${sektor}" sama-sama menjadi "${slug}". Ganti salah satu nama sektor.`,
      );
    }
    seen.set(slug, sektor);
    pairs.push({ slug, sektor });
  }
  cached = pairs;
  return pairs;
}

/** Cari nama sektor dari slug (pencarian balik; jangan coba "un-slug" karena lossy). */
export function sektorFromSlug(slug: string): string | undefined {
  return allSektorSlugs().find((p) => p.slug === slug)?.sektor;
}

/** Semua emiten pada sebuah sektor. */
export function sektorEmiten(sektor: string): Emiten[] {
  return emitenList.filter((e) => e.sektor === sektor);
}
