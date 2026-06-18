"use client";

import { useEffect, useRef } from "react";

const SOCIALS = [
  {
    href: "https://x.com/alfindigital",
    label: "X",
    handle: "@alfindigital",
    path: "M18.2 2.2h3.3l-7.2 8.3 8.5 11.3h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.2 2.2H8l4.7 6.2zM17 19.8h1.8L7.1 4.1H5.1z",
  },
  {
    href: "https://www.threads.net/@alfindigitalcom",
    label: "Threads",
    handle: "@alfindigitalcom",
    path: "M12.19 24h-.01c-3.58-.02-6.34-1.2-8.18-3.51C2.35 18.44 1.5 15.59 1.47 12.01v-.02c.03-3.58.88-6.43 2.53-8.48C5.84 1.2 8.6.02 12.18 0h.01c2.75.02 5.04.73 6.83 2.1 1.68 1.29 2.86 3.13 3.51 5.47l-2.04.57c-1.1-3.96-3.9-5.99-8.3-6.02-2.91.02-5.11.94-6.54 2.72C4.31 6.5 3.62 8.91 3.59 12c.03 3.09.72 5.5 2.06 7.16 1.43 1.78 3.63 2.7 6.54 2.72 2.62-.02 4.36-.63 5.8-2.05 1.65-1.61 1.62-3.59 1.09-4.8-.31-.71-.87-1.3-1.63-1.75-.19 1.35-.62 2.45-1.28 3.27-.89 1.1-2.14 1.7-3.73 1.79-1.2.07-2.36-.22-3.26-.8-1.06-.69-1.69-1.74-1.75-2.96-.07-1.19.41-2.29 1.33-3.08.88-.76 2.12-1.21 3.58-1.29 1.07-.06 2.08-.01 3.02.14-.13-.74-.38-1.33-.74-1.76-.5-.59-1.27-.89-2.29-.89h-.03c-.82 0-1.93.22-2.54 1.18l-1.74-1.14c.81-1.25 2.12-1.95 3.69-1.95h.03c3.24.02 5.16 2.02 5.35 5.48.1.05.21.09.32.14 1.49.7 2.58 1.76 3.15 3.07.8 1.82.87 4.79-1.55 7.16-1.85 1.81-4.09 2.63-7.28 2.65zm1.4-9.18c-.32 0-.65.01-.98.03-1.46.08-2.37.75-2.32 1.71.05.99 1.14 1.45 2.19 1.39 1.31-.07 2.5-.59 2.69-2.95a8.5 8.5 0 0 0-1.58-.18z",
  },
  {
    href: "https://youtube.com/@alfindigital",
    label: "YouTube",
    handle: "@alfindigital",
    path: "M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5C.5 9.4.5 12 .5 12s0 2.6.5 4.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.5.5-4.5s0-2.6-.5-4.5zM9.7 15.4V8.6l5.8 3.4z",
  },
  {
    href: "https://t.me/alfidx",
    label: "Telegram",
    handle: "@alfidx",
    path: "M9.8 18.7l.3-4.2 7.7-6.9c.3-.3-.1-.5-.5-.2L7.7 13.3 3.6 12c-.9-.3-.9-.9.2-1.3L19.8 4.5c.7-.3 1.4.2 1.1 1.3l-2.7 12.8c-.2.9-.7 1.1-1.5.7L12.6 16.3l-2 1.9c-.2.2-.4.4-.8.4z",
  },
];

/** Footer animasi: copyright + rotasi akun sosial, glow sesuai warna brand. */
export default function SiteFooter() {
  const rotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rot = rotRef.current;
    const items = rot ? Array.from(rot.querySelectorAll<HTMLElement>(".afd-item")) : [];
    let i = 0;
    let paused = false;

    const id = window.setInterval(() => {
      if (paused || items.length === 0) return;
      items[i].classList.remove("active");
      i = (i + 1) % items.length;
      items[i].classList.add("active");
    }, 2300);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    rot?.addEventListener("mouseenter", onEnter);
    rot?.addEventListener("mouseleave", onLeave);

    let to: number;
    const move = () => {
      if (glowRef.current) {
        glowRef.current.style.left = Math.random() * 120 - 30 + "%";
        glowRef.current.style.top = Math.random() * 60 - 30 + "%";
      }
      to = window.setTimeout(move, 4000 + Math.random() * 4000);
    };
    move();

    return () => {
      window.clearInterval(id);
      window.clearTimeout(to);
      rot?.removeEventListener("mouseenter", onEnter);
      rot?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-line bg-surface pb-24 sm:pb-0">
      <span className="afd-glow" ref={glowRef} aria-hidden="true" />
      <div className="relative z-[1] mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <span className="afd-cr">
          © {year}
          <a
            href="https://alfindigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="afd-brand"
          >
            alfindigital
          </a>
          <span className="afd-caret" aria-hidden="true" />
        </span>
        <div className="afd-rot" ref={rotRef}>
          {SOCIALS.map((s, idx) => (
            <a
              key={s.label}
              className={`afd-item${idx === 0 ? " active" : ""}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
            >
              <span className="afd-ico">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </span>
              <b>{s.handle}</b>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
