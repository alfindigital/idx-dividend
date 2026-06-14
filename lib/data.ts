import emitenJson from "@/data/emiten.json";
import dividendsJson from "@/data/dividends.json";
import type { DividendEvent, Emiten } from "./types";

export const emitenList: Emiten[] = emitenJson as Emiten[];
export const dividendList: DividendEvent[] = dividendsJson as DividendEvent[];

export function getEmiten(ticker: string): Emiten | undefined {
  return emitenList.find((e) => e.ticker.toUpperCase() === ticker.toUpperCase());
}

export function getDividends(ticker: string): DividendEvent[] {
  return dividendList.filter((d) => d.ticker.toUpperCase() === ticker.toUpperCase());
}

export function allTickers(): string[] {
  return emitenList.map((e) => e.ticker);
}

export function allSectors(): string[] {
  return Array.from(new Set(emitenList.map((e) => e.sektor))).sort();
}
