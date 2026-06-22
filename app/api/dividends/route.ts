import { NextRequest, NextResponse } from "next/server";
import { emitenList, dividendList } from "@/lib/data";
import { getDataMeta } from "@/lib/dataMeta";

export const revalidate = 43200;

/**
 * Ekspor dataset publik (read-only) untuk developer/blogger.
 * GET /api/dividends            → semua emiten + event
 * GET /api/dividends?ticker=PTBA → hanya satu emiten
 */
export function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker")?.toUpperCase();
  const meta = getDataMeta();

  const emiten = ticker ? emitenList.filter((e) => e.ticker === ticker) : emitenList;
  const dividends = ticker ? dividendList.filter((d) => d.ticker === ticker) : dividendList;

  return NextResponse.json(
    {
      meta: {
        updated: meta.updated,
        coverage: { from: meta.minYear, to: meta.maxYear },
        emiten: emiten.length,
        events: dividends.length,
        license: "Data sekunder, bersumber. Bukan saran investasi. Cantumkan atribusi ke Dividen IDX.",
        source: "https://idx-dividend.vercel.app",
      },
      emiten,
      dividends,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
