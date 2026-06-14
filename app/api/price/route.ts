import { NextRequest, NextResponse } from "next/server";

// Cache hasil 15 menit di edge/CDN; harga saham tidak perlu real-time untuk yield.
export const revalidate = 900;
export const dynamic = "force-dynamic";

async function fetchPrice(ticker: string): Promise<number | null> {
  const sym = `${ticker}.JK`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    sym,
  )}?range=1d&interval=1d`;
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

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("tickers") ?? "";
  const tickers = param
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 80);

  const prices = await Promise.all(
    tickers.map(async (t) => ({ ticker: t, price: await fetchPrice(t), ok: true })),
  );

  return NextResponse.json(
    { prices, ts: Date.now() },
    { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
  );
}
