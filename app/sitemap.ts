import type { MetadataRoute } from "next";
import { allTickers } from "@/lib/data";
import { allSektorSlugs } from "@/lib/slug";
import { getDataMeta } from "@/lib/dataMeta";
import { ARTICLES } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";

export const revalidate = 43200;

const pad = (n: number) => String(n).padStart(2, "0");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/kalender`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/sektor`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/leaderboard`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/banding`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/istilah`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/panduan`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/artikel`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/artikel/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // halaman kalender per bulan (SEO musiman)
  const meta = getDataMeta();
  const minY = meta.minYear ?? now.getFullYear();
  const maxY = (meta.maxYear ?? now.getFullYear()) + 1;
  const monthRoutes: MetadataRoute.Sitemap = [];
  for (let y = minY; y <= maxY; y++) {
    for (let m = 1; m <= 12; m++) {
      monthRoutes.push({
        url: `${SITE_URL}/kalender/${y}/${pad(m)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  const emitenRoutes: MetadataRoute.Sitemap = allTickers().map((ticker) => ({
    url: `${SITE_URL}/emiten/${ticker}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sektorRoutes: MetadataRoute.Sitemap = allSektorSlugs().map(({ slug }) => ({
    url: `${SITE_URL}/sektor/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...emitenRoutes, ...sektorRoutes, ...monthRoutes];
}
