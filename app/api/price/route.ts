import { NextRequest, NextResponse } from "next/server";
import { allTickers } from "@/lib/data";

// Cache hasil 15 menit di edge/CDN; harga saham tidak perlu real-time untuk yield.
export const revalidate = 900;
export const dynamic = "force-dynamic";

// Hanya izinkan ticker yang memang ada di dataset → cegah penyalahgunaan endpoint
// sebagai proxy Yahoo gratis untuk simbol arbitrer.
const KNOWN = new Set(allTickers().map((t) => t.toUpperCase()));

// Cache "last-good" di memori instance (best-effort, hidup selama instance hangat).
// Bila sumber gagal sesaat, kembalikan harga terakhir yang valid + tandai stale.
const lastGood = new Map<string, { price: number; ts: number }>();
const STALE_MAX_MS = 6 * 60 * 60 * 1000; // pakai harga lama maksimal 6 jam

// Rate-limit ringan per-IP (best-effort, per instance).
const hits = new Map<string, { n: number; reset: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 40;

const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

async function fetchFromHost(host: string, sym: string): Promise<number | null> {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DividenIDX/1.0)" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose;
    return typeof price === "number" ? price : null;
  } catch {
    return null;
  }
}

interface PriceResult {
  ticker: string;
  price: number | null;
  ok: boolean;
  stale?: boolean;
}

async function fetchPrice(ticker: string): Promise<PriceResult> {
  const sym = `${ticker}.JK`;
  for (const host of HOSTS) {
    const price = await fetchFromHost(host, sym);
    if (price != null) {
      lastGood.set(ticker, { price, ts: Date.now() });
      return { ticker, price, ok: true };
    }
  }
  // semua sumber gagal → coba last-good yang belum terlalu basi
  const cached = lastGood.get(ticker);
  if (cached && Date.now() - cached.ts < STALE_MAX_MS) {
    return { ticker, price: cached.price, ok: true, stale: true };
  }
  return { ticker, price: null, ok: false };
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export async function GET(req: NextRequest) {
  // rate limit
  const ip = clientIp(req);
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, { n: 1, reset: now + RL_WINDOW_MS });
  } else {
    rec.n += 1;
    if (rec.n > RL_MAX) {
      return NextResponse.json(
        { error: "rate_limited", prices: [], ts: now },
        { status: 429, headers: { "Retry-After": "30" } },
      );
    }
  }

  const param = req.nextUrl.searchParams.get("tickers") ?? "";
  const tickers = param
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => KNOWN.has(t)) // tolak simbol tak dikenal
    .slice(0, 80);

  const prices = await Promise.all(tickers.map((t) => fetchPrice(t)));

  return NextResponse.json(
    { prices, ts: Date.now() },
    { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
  );
}
