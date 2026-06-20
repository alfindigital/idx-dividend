import type { MetadataRoute } from "next";
import { allTickers } from "@/lib/data";
import { allSektorSlugs } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";

export const revalidate = 43200;

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
  ];

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

  return [...staticRoutes, ...emitenRoutes, ...sektorRoutes];
}
