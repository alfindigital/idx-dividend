"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, Layers, Trophy, Columns, HelpCircle, BookOpen } from "./ui/icons";

interface EmitenLite {
  ticker: string;
  nama: string;
  sektor: string;
}

const PAGES = [
  { label: "Kalender dividen", href: "/kalender", Icon: CalendarDays },
  { label: "Sektor", href: "/sektor", Icon: Layers },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Bandingkan emiten", href: "/banding", Icon: Columns },
  { label: "Panduan", href: "/panduan", Icon: HelpCircle },
  { label: "Istilah dividen", href: "/istilah", Icon: BookOpen },
  { label: "Artikel", href: "/artikel", Icon: BookOpen },
];

/** Buka command palette dari mana saja: `window.dispatchEvent(new Event("open-search"))`. */
export default function CommandPalette({ items }: { items: EmitenLite[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const emiten = items
      .filter((e) => !term || (e.ticker + " " + e.nama + " " + e.sektor).toLowerCase().includes(term))
      .slice(0, 8)
      .map((e) => ({
        kind: "emiten" as const,
        label: e.ticker,
        sub: e.nama,
        href: `/emiten/${e.ticker}`,
      }));
    const pages = PAGES.filter((p) => !term || p.label.toLowerCase().includes(term)).map((p) => ({
      kind: "page" as const,
      label: p.label,
      sub: p.href,
      href: p.href,
    }));
    return [...emiten, ...pages];
  }, [q, items]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!open) return null;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r.href);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian"
        className="animate-pop-in w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Cari emiten (kode/nama) atau halaman…"
            aria-label="Cari emiten atau halaman"
            aria-controls="cmdk-list"
            className="w-full bg-transparent py-3 text-sm text-fg outline-none placeholder:text-faint"
          />
          <kbd className="hidden rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] text-faint sm:inline">
            Esc
          </kbd>
        </div>
        <ul ref={listRef} id="cmdk-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-faint">Tidak ada hasil.</li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.kind}-${r.href}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                    i === active ? "bg-brand/10 text-fg" : "text-muted hover:bg-surface-2"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        r.kind === "emiten"
                          ? "bg-brand/15 text-brand-strong"
                          : "bg-surface-2 text-faint"
                      }`}
                    >
                      {r.kind === "emiten" ? "Emiten" : "Halaman"}
                    </span>
                    <span className="truncate font-medium text-fg">{r.label}</span>
                  </span>
                  <span className="truncate text-xs text-faint">{r.sub}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
