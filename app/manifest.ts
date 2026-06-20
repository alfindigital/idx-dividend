import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dividen IDX",
    short_name: "DividenIDX",
    description:
      "Riwayat dividen, yield berjalan, konsistensi, dan perkiraan jadwal dividen saham IDX.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "id-ID",
    dir: "ltr",
    categories: ["finance"],
    background_color: "#fbfbfd",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
