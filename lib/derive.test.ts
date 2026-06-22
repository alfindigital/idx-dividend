import { describe, it, expect } from "vitest";
import type { DividendEvent, Emiten } from "./types";
import {
  eventDate,
  annualTotals,
  latestAnnual,
  ttmDividend,
  yearsPaid,
  timingConsistency,
  amountTrend,
  predictNext,
  runningYield,
  indicativeYield,
  afterTaxYield,
  payingStreak,
  dpsCagr,
} from "./derive";

function ev(p: Partial<DividendEvent>): DividendEvent {
  return {
    ticker: "TEST",
    tahun: 2024,
    tipe: "final",
    cum_date: null,
    ex_date: null,
    record_date: null,
    payment_date: null,
    dps_idr: null,
    harga_ref: null,
    yield_pct: null,
    ...p,
  };
}

const emiten = (p: Partial<Emiten> = {}): Emiten => ({
  ticker: "TEST",
  nama: "Test Tbk",
  sektor: "Uji",
  flags: { dormant: false, special_history: false },
  ...p,
});

describe("eventDate", () => {
  it("memprioritaskan ex_date, lalu cum_date, lalu payment_date", () => {
    expect(eventDate(ev({ ex_date: "2024-05-10", cum_date: "2024-05-08" }))).toBe("2024-05-10");
    expect(eventDate(ev({ cum_date: "2024-05-08", payment_date: "2024-06-01" }))).toBe("2024-05-08");
    expect(eventDate(ev({ payment_date: "2024-06-01" }))).toBe("2024-06-01");
    expect(eventDate(ev({}))).toBeNull();
  });
});

describe("annualTotals / latestAnnual", () => {
  it("menjumlah dps per tahun & melewati yang null", () => {
    const evs = [
      ev({ tahun: 2023, dps_idr: 100 }),
      ev({ tahun: 2023, tipe: "interim", dps_idr: 50 }),
      ev({ tahun: 2024, dps_idr: 200 }),
      ev({ tahun: 2024, dps_idr: null }),
    ];
    expect(annualTotals(evs)).toEqual([
      { tahun: 2023, total: 150 },
      { tahun: 2024, total: 200 },
    ]);
    expect(latestAnnual(evs)).toEqual({ tahun: 2024, total: 200 });
  });
});

describe("ttmDividend", () => {
  it("hanya menjumlah dividen dalam 12 bulan terakhir", () => {
    const asOf = new Date("2025-06-01");
    const evs = [
      ev({ ex_date: "2024-08-01", dps_idr: 100 }), // dalam 12 bln
      ev({ ex_date: "2025-03-01", dps_idr: 50 }), // dalam 12 bln
      ev({ ex_date: "2024-01-01", dps_idr: 999 }), // di luar 12 bln
    ];
    expect(ttmDividend(evs, asOf)).toBe(150);
  });
});

describe("timingConsistency — circular month", () => {
  it("menilai pembayar Des/Jan sebagai teratur (bukan tidak teratur)", () => {
    const evs = [
      ev({ tahun: 2022, ex_date: "2021-12-20" }),
      ev({ tahun: 2023, ex_date: "2023-01-05" }),
      ev({ tahun: 2024, ex_date: "2023-12-28" }),
      ev({ tahun: 2025, ex_date: "2025-01-03" }),
    ];
    const res = timingConsistency(evs);
    expect(res === "Sangat teratur" || res === "Cukup teratur").toBe(true);
  });

  it("bulan identik = sangat teratur", () => {
    const evs = [
      ev({ tahun: 2022, ex_date: "2022-05-10" }),
      ev({ tahun: 2023, ex_date: "2023-05-12" }),
      ev({ tahun: 2024, ex_date: "2024-05-09" }),
    ];
    expect(timingConsistency(evs)).toBe("Sangat teratur");
  });

  it("tersebar acak = tidak teratur", () => {
    const evs = [
      ev({ tahun: 2022, ex_date: "2022-02-10" }),
      ev({ tahun: 2023, ex_date: "2023-07-12" }),
      ev({ tahun: 2024, ex_date: "2024-11-09" }),
    ];
    expect(timingConsistency(evs)).toBe("Tidak teratur");
  });
});

describe("amountTrend", () => {
  it("mendeteksi tren naik", () => {
    const evs = [
      ev({ tahun: 2021, dps_idr: 100 }),
      ev({ tahun: 2022, dps_idr: 150 }),
      ev({ tahun: 2023, dps_idr: 220 }),
    ];
    expect(amountTrend(evs)).toBe("Naik");
  });
  it("mendeteksi tren turun", () => {
    const evs = [
      ev({ tahun: 2021, dps_idr: 300 }),
      ev({ tahun: 2022, dps_idr: 200 }),
      ev({ tahun: 2023, dps_idr: 100 }),
    ];
    expect(amountTrend(evs)).toBe("Turun");
  });
});

describe("predictNext", () => {
  it("dormant tidak diprediksi", () => {
    const evs = [ev({ tahun: 2024, ex_date: "2024-05-10" })];
    expect(predictNext(evs, emiten({ flags: { dormant: true, special_history: false } }))).toEqual([]);
  });

  it("memprediksi bulan yang konsisten dan tanggal masa depan", () => {
    const today = new Date("2026-01-15");
    const evs = [
      ev({ tahun: 2023, ex_date: "2023-05-10" }),
      ev({ tahun: 2024, ex_date: "2024-05-12" }),
      ev({ tahun: 2025, ex_date: "2025-05-09" }),
    ];
    const preds = predictNext(evs, emiten(), today);
    expect(preds.length).toBe(1);
    expect(preds[0].perkiraan.slice(0, 7)).toBe("2026-05");
    expect(new Date(preds[0].perkiraan) > today).toBe(true);
  });

  it("tipe special tidak diprediksi", () => {
    const evs = [ev({ tahun: 2024, tipe: "special", ex_date: "2024-05-10" })];
    expect(predictNext(evs, emiten(), new Date("2026-01-01"))).toEqual([]);
  });
});

describe("yield helpers", () => {
  it("runningYield = ttm / harga * 100", () => {
    const asOf = new Date("2025-06-01");
    const evs = [ev({ ex_date: "2025-03-01", dps_idr: 100 })];
    expect(runningYield(evs, 1000, asOf)).toBeCloseTo(10, 5);
    expect(runningYield(evs, 0, asOf)).toBeNull();
  });
  it("indicativeYield pakai total tahun terakhir", () => {
    const evs = [ev({ tahun: 2025, dps_idr: 80 }), ev({ tahun: 2025, tipe: "interim", dps_idr: 20 })];
    expect(indicativeYield(evs, 1000)).toBeCloseTo(10, 5);
  });
  it("afterTaxYield potong 10%", () => {
    expect(afterTaxYield(10)).toBeCloseTo(9, 5);
    expect(afterTaxYield(null)).toBeNull();
  });
});

describe("payingStreak & dpsCagr", () => {
  it("streak dihitung mundur dari tahun terakhir", () => {
    const evs = [
      ev({ tahun: 2022, dps_idr: 10 }),
      ev({ tahun: 2023, dps_idr: 10 }),
      ev({ tahun: 2025, dps_idr: 10 }),
    ];
    // 2025 ada, 2024 tidak → streak = 1
    expect(payingStreak(evs)).toBe(1);
  });
  it("yearsPaid menghitung tahun unik", () => {
    const evs = [
      ev({ tahun: 2023, dps_idr: 10 }),
      ev({ tahun: 2023, tipe: "interim", dps_idr: 5 }),
      ev({ tahun: 2024, dps_idr: 10 }),
    ];
    expect(yearsPaid(evs)).toBe(2);
  });
  it("dpsCagr null bila data kurang", () => {
    expect(dpsCagr([ev({ tahun: 2024, dps_idr: 100 })])).toBeNull();
  });
});
